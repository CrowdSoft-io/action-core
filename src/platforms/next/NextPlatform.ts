import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { PackageManagerResolver } from "../../utils/nodejs";
import { Runner } from "../../utils/shell";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class NextPlatform implements PlatformInterface {
  constructor(
    @Inject() private readonly packageManagerResolver: PackageManagerResolver,
    @Inject() private readonly fileSystem: FileSystem,
    @Inject() private readonly runner: Runner
  ) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    const packageManager = this.packageManagerResolver.resolve();

    process.env.CI = "true";

    const lines: Array<string> = [];
    for (const name in environment) {
      process.env[name] = environment[name];
      lines.push(`${name}='${environment[name]}'`);
    }
    this.fileSystem.writeFile(".env", lines.join("\n") + "\n", true);

    await packageManager.install({ frozenLockfile: true });
    await packageManager.run("build");
    await this.runner.run("rm", "-rf", "node_modules");
    await packageManager.install({ production: true, ignoreScripts: true, frozenLockfile: true });

    const files: Array<string> = [".next", "node_modules", "public", ".env", "package.json"];
    if (this.fileSystem.exists("app")) {
      files.push("app");
    }
    if (this.fileSystem.exists("messages")) {
      files.push("messages");
    }
    if (this.fileSystem.exists("next.config.js")) {
      files.push("next.config.js");
    }

    return {
      files,
      preRelease: [
        {
          name: "Copy config",
          actions: [
            `if [[ -f '${context.remote.configsRoot}/.env' ]]; then cat '${context.remote.configsRoot}/.env' >> '${context.remote.releaseDir}/.env'; fi`
          ]
        }
      ]
    };
  }
}
