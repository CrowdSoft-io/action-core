import { Inject, Injectable } from "@tsed/di";
import { FileSystem } from "../fs";
import { Runner } from "../shell";

@Injectable()
export class SubModule {
  constructor(@Inject() private readonly fileSystem: FileSystem, @Inject() private readonly runner: Runner) {}

  async read(): Promise<Array<string>> {
    const submodules: Array<string> = [];

    if (!this.fileSystem.exists(".gitmodules")) {
      return submodules;
    }

    await this.runner.run("git", "submodule", "init");
    await this.runner.run("git", "submodule", "update");

    const config = this.fileSystem.readFile(".gitmodules");
    const matches = config.matchAll(/\[submodule "([\w-]+)"]/);
    for (const match of matches) {
      submodules.push(match[1]);
    }

    return submodules;
  }
}
