import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { DotEnv } from "../../utils/dotenv";
import { FileSystem } from "../../utils/fs";
import { SubModule } from "../../utils/submodule";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class GolangPlatform implements PlatformInterface {
  constructor(
    @Inject() private readonly dotEnv: DotEnv,
    @Inject() private readonly subModule: SubModule,
    @Inject() private readonly fileSystem: FileSystem
  ) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    if (!this.fileSystem.exists("bin")) {
      this.fileSystem.mkdir("bin");
    }

    this.dotEnv.write(environment);

    const commands: Array<string> = [];

    if (this.fileSystem.exists("app/main.go")) {
      commands.push(`go build -o bin/main app/main.go`);
    }

    const files = this.fileSystem.glob("app/cmd/*/main.go");
    if (files.length > 0) {
      commands.push("go get ./...");
      for (const file of files) {
        const matches = file.match(/\/(\w+)\/main\.go$/);
        if (!matches) {
          throw new Error(`Invalid command "${file}"`);
        }
        commands.push(`go build -o bin/${matches[1]} ${file}`);
      }
    }

    const submodules = await this.subModule.read();
    for (const submodule of submodules) {
      if (this.fileSystem.exists(`${submodule}/app/main.go`)) {
        commands.push(`cd ${submodule}`);
        commands.push("go get ./...");
        commands.push(`go build -o ../bin/main app/main.go`);
        commands.push("cd ..");
      }

      const files = this.fileSystem.glob(`${submodule}/app/cmd/*/main.go`);
      if (files.length > 0) {
        commands.push(`cd ${submodule}`);
        commands.push("go get ./...");
        for (const file of files) {
          const matches = file.match(/\/(\w+)\/main\.go$/);
          if (!matches) {
            throw new Error(`Invalid command "${file}"`);
          }
          commands.push(`go build -o ../bin/${matches[1]} ${file.replace(submodule + "/", "")}`);
        }
        commands.push("cd ..");
      }
    }

    return {
      files: ["bin", ".env"],
      postBuild: {
        golangBuild: commands.join(" && \\\n")
      },
      onInit: [
        {
          name: "Golang - Copy config",
          actions: [
            `if [[ -f '${context.remote.configsRoot}/.env' ]]; then cat '${context.remote.configsRoot}/.env' >> '${context.remote.releaseDir}/.env'; fi`
          ]
        }
      ]
    };
  }
}
