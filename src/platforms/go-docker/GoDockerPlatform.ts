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
      lines.push(`${name}=${environment[name]}`);
    }
    this.fileSystem.writeFile(".env", lines.join("\n") + "\n");

    await this.runner.run("git", "submodule", "init");
    await this.runner.run("git", "submodule", "update");

    const gitmodules = this.fileSystem.readFile(".gitmodules");
    const matches = /\[submodule "([\w-]+)"]/.exec(gitmodules);
    const submodule = matches?.[1];
    if (!submodule) {
      throw new Error("Submodule is not detected");
    }

    return {
      files: [submodule, ".env", "Dockerfile"],
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
