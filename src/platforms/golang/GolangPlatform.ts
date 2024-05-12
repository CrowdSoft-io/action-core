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
    this.dotEnv.write(environment);
    const submodules = await this.subModule.read();

    const commandFiles: Array<string> = [...this.fileSystem.glob("app/cmd/*/main.go")];
    for (const submodule in submodules) {
      commandFiles.push(...this.fileSystem.glob(`${submodule}/app/cmd/*/main.go`));
    }

    const commands: Array<string> = [];
    for (const file of commandFiles) {
      const matches = file.match(/\/(\w+)\/main\.go$/);
      if (!matches) {
        throw new Error(`Invalid command "${file}"`);
      }
      commands.push(`go build -o bin/${matches[1]} ${file}`);
    }

    return {
      files: [...submodules, ".env"],
      postBuild: {
        golangBuild: commands.join(" && \\\n")
      },
      preRelease: [
        {
          name: "GoDocker - Build docker container",
          actions: [`docker build -t ${context.serviceName} ${context.remote.releaseDir}`]
        }
      ],
      postRelease: [
        {
          name: "GoDocker - Remove old images",
          actions: ["docker image prune -f"]
        }
      ]
    };
  }
}
