import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { PackageManagerResolver } from "../../utils/nodejs";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class VueJsPlatform implements PlatformInterface {
  constructor(
    @Inject() private readonly packageManagerResolver: PackageManagerResolver,
    @Inject() private readonly fileSystem: FileSystem
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

    return {
      files: ["dist"]
    };
  }
}
