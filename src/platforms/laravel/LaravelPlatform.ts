import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class LaravelPlatform implements PlatformInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem) {}

  async build(context: Context): Promise<PlatformBuildResult> {
    const storageAppPath = `${context.remote.storageRoot}/app`;
    const paths = [storageAppPath];

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
          name: "Laravel - Create directories",
          actions: paths.map((path) => `[[ ! -d '${path}' ]] && mkdir -p '${path}' || echo '${path} already created'`)
        },
        {
          name: "Laravel - Configure project",
          actions: [
            `ln -s '${storageAppPath}' '${context.remote.releaseDir}/storage/app'`,
            `cp '${context.remote.configsRoot}/.env' '${context.remote.releaseDir}/'`
          ]
        },
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
