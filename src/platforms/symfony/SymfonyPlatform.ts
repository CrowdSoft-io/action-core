import { Injectable } from "@tsed/di";
import { Context } from "../../models";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class SymfonyPlatform implements PlatformInterface {
  async build(context: Context): Promise<PlatformBuildResult> {
    return {
      files: ["bin", "config", "migrations", "public", "src", "composer.json"],
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
