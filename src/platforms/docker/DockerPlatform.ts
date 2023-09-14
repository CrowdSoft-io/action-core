import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class DockerPlatform implements PlatformInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    const lines: Array<string> = [];
    for (const name in environment) {
      lines.push(`${name}=${environment[name]}`);
    }
    this.fileSystem.writeFile(".env", lines.join("\n"));

    const files: Array<string> = this.fileSystem.readDir(".");

    if (this.fileSystem.exists(".dockerignore")) {
      const exclude = this.fileSystem
        .readFile(".dockerignore")
        .split("\n")
        .map((file) => file.replace(/^\s+|\s+$/g, ""))
        .filter(Boolean);
      for (const file of exclude) {
        const index = files.indexOf(file);
        if (index > -1) {
          files.splice(index, 1);
        }
      }
    }

    return {
      files,
      preRelease: [
        {
          name: "Docker - Build container",
          actions: [`docker build -t ${context.serviceName} ${context.remote.releaseDir}`]
        }
      ],
      postRelease: [
        {
          name: "Docker - Remove old images",
          actions: ["docker image prune -f"]
        }
      ]
    };
  }
}
