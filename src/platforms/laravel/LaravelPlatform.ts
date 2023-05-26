import { Injectable } from "@tsed/di";
import { Context } from "../../models";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class LaravelPlatform implements PlatformInterface {
  async build(context: Context): Promise<PlatformBuildResult> {
    const storageAppPath = `${context.remote.storageRoot}/app`;
    const paths = [storageAppPath];

    return {
      files: [
        "app",
        "bootstrap",
        "config",
        "database",
        "lang",
        "public",
        "resources",
        "routes",
        "storage/framework",
        "storage/logs",
        "artisan",
        "composer.json"
      ],
      postBuild: {
        runComposer: true
      },
      preRelease: [
        {
          name: "Create directories",
          actions: paths.map((path) => `[[ ! -d '${path}' ]] && mkdir -p '${path}' || echo '${path} already created'`)
        },
        {
          name: "Configure project",
          actions: [
            `ln -s '${storageAppPath}' '${context.remote.releaseDir}/storage/app'`,
            `cp '${context.remote.configsRoot}/.env' '${context.remote.releaseDir}/'`
          ]
        },
        {
          name: "Run migrations",
          actions: [
            `php ${context.remote.releaseDir}/artisan migrate`,
            `php ${context.remote.releaseDir}/artisan l5-swagger:generate || echo "l5-swagger not installed"`
          ]
        },
        {
          name: "Clear cache",
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
