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
      process.env[name] = environment[name];
      lines.push(`${name}='${environment[name]}'`);
    }

    this.fileSystem.writeFile(".env.local", lines.join("\n"));

    return {
      files: ["bin", "config", "migrations", "public", "src", ".env.local", "composer.json"],
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
