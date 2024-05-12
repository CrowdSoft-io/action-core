import { Inject, Injectable } from "@tsed/di";
import { FileSystem } from "../fs";

@Injectable()
export class DotEnv {
  constructor(@Inject() private readonly fileSystem: FileSystem) {}

  write(environment: Record<string, string>, path = ".env"): void {
    const lines: Array<string> = [];

    for (const name in environment) {
      lines.push(`${name}=${environment[name]}`);
    }

    this.fileSystem.writeFile(path, lines.join("\n") + "\n");
  }
}
