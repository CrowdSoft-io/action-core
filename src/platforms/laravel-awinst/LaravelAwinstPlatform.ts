import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { Runner } from "../../utils/shell";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class LaravelAwinstPlatform implements PlatformInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem, @Inject() private readonly runner: Runner) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    const lines: Array<string> = [];
    for (const name in environment) {
      lines.push(`${name}=${environment[name] ?? ""}`);
    }
    lines.sort();
    this.fileSystem.writeFile("core/.env", lines.join("\n") + "\n");

    await this.runner.run("rm", "-rf", "assets/images/frontend", "assets/images/seo", "assets/images/user/profile");

    await this.runner.run("rm", "robots.txt");
    await this.runner.run("cp", ".ci-cd/robots/robots.prod.txt", "robots.txt");

    const files: Array<string> = ["assets", "core", "richtexteditor", "index.php", "robots.txt"];

    return {
      files,
      postBuild: {
        phpBuild: [
          "cd core",
          "APP_ENV=prod APP_DEBUG=0 composer install -n --no-dev --no-scripts",
          "cd ..",
          `tar -rf ${context.local.buildDir}/release.tar core/vendor`
        ].join(" && \\\n")
      },
      preRelease: [
        {
          name: "Copy config",
          actions: [
            `if [[ -f '${context.remote.configsRoot}/.env' ]]; then cat '${context.remote.configsRoot}/.env' >> '${context.remote.releaseDir}/core/.env'; fi`
          ]
        },
        {
          name: "Laravel - Run migrations",
          actions: [`php7.4 ${context.remote.releaseDir}/core/artisan migrate --force --no-interaction`]
        },
        {
          name: "Laravel - Run migration actions",
          actions: [`php7.4 ${context.remote.releaseDir}/core/artisan migrate:actions --force --no-interaction`]
        },
        {
          name: "Laravel - Clear cache",
          actions: [`php7.4 ${context.remote.releaseDir}/core/artisan cache:clear`]
        }
      ]
    };
  }
}
