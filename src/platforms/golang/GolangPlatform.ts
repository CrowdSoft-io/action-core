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

    const rootFiles = this.fileSystem.glob("app/cmd/*/main.go");
    if (rootFiles.length > 0) {
      commands.push("go get ./...");
      for (const file of rootFiles) {
        const matches = file.match(/\/(\w+)\/main\.go$/);
        if (!matches) {
          throw new Error(`Invalid command "${file}"`);
        }
        commands.push(`go build -o bin/${matches[1]} ${file}`);
      }
    }

    const submodules = await this.subModule.read();
    for (const submodule of submodules) {
      const submoduleFiles = this.fileSystem.glob(`${submodule}/app/cmd/*/main.go`);
      if (submoduleFiles.length > 0) {
        commands.push(`cd ${submodule}`);
        commands.push("go get ./...");
        for (const file of rootFiles) {
          const matches = file.match(/\/(\w+)\/main\.go$/);
          if (!matches) {
            throw new Error(`Invalid command "${file}"`);
          }
          commands.push(`go build -o ../bin/${matches[1]} ${file.replace(submodule + "/", "")}`);
        }
        commands.push("cd ..");
      }
    }

    console.log({ submodules, commands });

    return {
      files: ["bin", ".env"],
      postBuild: {
        golangBuild: commands.join(" && \\\n")
      }
    };
  }
}
