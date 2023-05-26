import { Inject, Injectable } from "@tsed/di";
import { Runner } from "../../../shell";
import { PackageManagerInstallOptions } from "../PackageManagerInstallOptions";
import { PackageManagerInterface } from "../PackageManagerInterface";

@Injectable()
export class YarnPackageManager implements PackageManagerInterface {
  constructor(@Inject() private readonly runner: Runner) {}

  async install(options?: PackageManagerInstallOptions): Promise<void> {
    const args: Array<string> = [];
    if (options?.production) {
      args.push("--only=production");
    }
    if (options?.ignoreScripts) {
      args.push("--ignore-scripts");
    }
    if (options?.frozenLockfile) {
      args.push("--frozen-lockfile");
    }

    await this.runner.run("yarn", "install", ...args);
  }

  async run(command: string, ...args: Array<string>): Promise<void> {
    await this.runner.run("yarn", command, ...args);
  }
}
