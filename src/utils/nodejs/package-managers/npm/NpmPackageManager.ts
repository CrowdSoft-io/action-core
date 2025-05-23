import { Inject, Injectable } from "@tsed/di";
import { Runner } from "../../../shell";
import { PackageManagerInstallOptions } from "../PackageManagerInstallOptions";
import { PackageManagerInterface } from "../PackageManagerInterface";

@Injectable()
export class NpmPackageManager implements PackageManagerInterface {
  constructor(@Inject() private readonly runner: Runner) {}

  async install(options?: PackageManagerInstallOptions): Promise<void> {
    const args: Array<string> = [];
    if (options?.production) {
      args.push("--omit=dev");
    } else {
      args.push("--include=dev");
    }
    if (options?.ignoreScripts) {
      args.push("--ignore-scripts");
    }
    if (options?.frozenLockfile) {
      args.push("--package-lock");
    }

    await this.runner.run("npm", "i", ...args);
  }

  async run(command: string, ...args: Array<string>): Promise<void> {
    await this.runner.run("npm", "run", command, ...args);
  }
}
