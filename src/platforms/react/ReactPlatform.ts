import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { PackageManagerResolver } from "../../utils/nodejs";
import { PlatformBuildResult } from "../PlatformBuildResult";
import { PlatformInterface } from "../PlatformInterface";

@Injectable()
export class ReactPlatform implements PlatformInterface {
  constructor(@Inject() private readonly packageManagerResolver: PackageManagerResolver) {}

  async build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult> {
    const packageManager = this.packageManagerResolver.resolve();

    process.env.CI = "true";

    for (const name in environment) {
      process.env[name] = environment[name];
    }

    await packageManager.install({ frozenLockfile: true });
    await packageManager.run("build");

    return {
      files: ["dist"]
    };
  }
}
