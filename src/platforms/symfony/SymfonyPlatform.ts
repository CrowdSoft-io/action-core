import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class SymfonyPlatform implements PlatformInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    const lines: Array<string> = [];
    for (const name in environment) {
      if (environment[name] === null || environment[name] === "null") {
        lines.push(`${name}=`);
      } else if (typeof environment[name] === "string" && environment[name].includes("\n")) {
        lines.push(`${name}='${environment[name]}'`);
      } else {
        lines.push(`${name}=${environment[name]}`);
      }
    }
    this.fileSystem.writeFile(".env", lines.join("\n") + "\n", true);

    const files = ["bin", "config", "public", "src", ".env", "composer.json"];
    if (this.fileSystem.exists("migrations")) {
      files.push("migrations");
    }
    if (this.fileSystem.exists("templates")) {
      files.push("templates");
    }

    return {
      files,
      postBuild: {
        runComposer: true
      },
      preRelease: [
        {
          name: "Symfony - Clear cache",
          actions: [`php ${context.remote.releaseDir}/bin/console ca:cl`]
        },
        {
          name: "Symfony - Run migrations",
          actions: [`php ${context.remote.releaseDir}/bin/console do:mi:mi --no-interaction`]
        }
      ]
    };
  }
}
