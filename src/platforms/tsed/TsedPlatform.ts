import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { PackageManagerResolver } from "../../utils/nodejs";
import { Runner } from "../../utils/shell";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class TsedPlatform implements PlatformInterface {
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
      if (environment[name] === null || environment[name] === "null") {
        lines.push(`${name}=`);
      } else if (typeof environment[name] === "string" && environment[name].includes("\n")) {
        lines.push(`${name}='${environment[name]}'`);
      } else {
        lines.push(`${name}=${environment[name]}`);
      }
    }
    this.fileSystem.writeFile(".env.local", lines.join("\n") + "\n");

    await packageManager.install({ frozenLockfile: true });
    await packageManager.run("build");
    await this.runner.run("rm", "-rf", "node_modules");
    await packageManager.install({ production: true, ignoreScripts: true, frozenLockfile: true });

    const files: Array<string> = ["dist", "node_modules", ".env.local", "package.json"];
    if (this.fileSystem.exists("assets")) {
      files.push("assets");
    }
    if (this.fileSystem.exists("spec")) {
      files.push("spec");
    }
    if (this.fileSystem.exists("templates")) {
      files.push("templates");
    }
    if (this.fileSystem.exists("resources")) {
      files.push("resources");
    }
    if (this.fileSystem.exists("views")) {
      files.push("views");
    }

    return {
      files,
      onInit: [
        {
          name: "Tsed - Copy config",
          actions: [
            `if [[ -f '${context.remote.configsRoot}/.env.local' ]]; then cat '${context.remote.configsRoot}/.env.local' >> '${context.remote.releaseDir}/.env.local'; fi`
          ]
        }
      ]
    };
  }
}
