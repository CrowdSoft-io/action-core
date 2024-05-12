import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { DotEnv } from "../../utils/dotenv";
import { FileSystem } from "../../utils/fs";
import { Runner } from "../../utils/shell";
import { SubModule } from "../../utils/submodule";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class GolangPlatform implements PlatformInterface {
  constructor(
    @Inject() private readonly dotEnv: DotEnv,
    @Inject() private readonly subModule: SubModule,
    @Inject() private readonly fileSystem: FileSystem,
    @Inject() private readonly runner: Runner
  ) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    if (!this.fileSystem.exists("bin")) {
      this.fileSystem.mkdir("bin");
    }

    this.dotEnv.write(environment);
    const submodules = await this.subModule.read();

    const commandDirs: Array<string> = [...this.fileSystem.glob("app/cmd/*")];
    for (const submodule in submodules) {
      commandDirs.push(...this.fileSystem.glob(`${submodule}/app/cmd/*`));
    }

    const commands: Array<string> = [];
    for (const dir of commandDirs) {
      const matches = dir.match(/\/(\w+)$/);
      if (!matches) {
        throw new Error(`Invalid command "${dir}"`);
      }
      commands.push(`go build -o bin/${matches[1]} ${dir}/main.go`);
    }

    console.log({ submodules, commandFiles: commandDirs, commands });

    return {
      files: ["bin", ".env"],
      postBuild: {
        golangBuild: commands.join(" && \\\n")
      }
    };
  }
}
