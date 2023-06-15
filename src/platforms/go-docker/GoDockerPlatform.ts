import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { Runner } from "../../utils/shell";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class GoDockerPlatform implements PlatformInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem, @Inject() private readonly runner: Runner) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    const lines: Array<string> = [];
    for (const name in environment) {
      process.env[name] = environment[name];
      lines.push(`${name}='${environment[name]}'`);
    }

    this.fileSystem.writeFile(".env", lines.join("\n"));

    return {
      files: [".", ".env"],
      preRelease: [
        {
          name: "GoDocker - Build docker container",
          actions: [`docker build -t ${context.serviceName}_api ${context.remote.releaseDir}`]
        }
      ]
    };
  }
}
