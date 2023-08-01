import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class LaravelPlatform implements PlatformInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    const lines: Array<string> = [];
    for (const name in environment) {
      lines.push(`${name}=${environment[name] ?? ""}`);
    }
    lines.sort();
    this.fileSystem.writeFile(".env", lines.join("\n"));

    const files: Array<string> = [
      "app",
      "bootstrap",
      "config",
      "database",
      "public",
      "resources",
      "routes",
      "storage/framework",
      "storage/logs",
      ".env",
      "artisan",
      "composer.json"
    ];

    if (this.fileSystem.exists("lang")) {
      files.push("lang");
    }

    return {
      files,
      postBuild: {
        runComposer: true
      },
      preRelease: [
        {
          name: "Laravel - Run migrations",
          actions: [`php ${context.remote.releaseDir}/artisan migrate --force --no-interaction`]
        },
        {
          name: "Laravel - Clear cache",
          actions: [
            `php ${context.remote.releaseDir}/artisan cache:clear`,
            `php ${context.remote.releaseDir}/artisan config:clear`,
            `php ${context.remote.releaseDir}/artisan storage:link`
          ]
        }
      ]
    };
  }
}
