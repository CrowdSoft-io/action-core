import { Injectable } from "@tsed/di";
import fs from "fs";

@Injectable()
export class FileSystem {
  exists(path: string): boolean {
    return fs.existsSync(path);
  }

  mkdir(path: string): void {
    fs.mkdirSync(path, 0o755);
  }

  writeFile(path: string, content: string): void {
    if (fs.existsSync(path)) {
      throw new Error(`File "${path}" already exists`);
    }
    fs.writeFileSync(path, content);
  }
}
