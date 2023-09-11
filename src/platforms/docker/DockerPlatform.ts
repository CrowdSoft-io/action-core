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

    return {
      files: [".env", "Dockerfile"],
      preRelease: [
        {
          name: "Docker - Build container",
          actions: [`docker build -t ${context.serviceName} ${context.remote.releaseDir}`]
        }
      ]
    };
  }
}
