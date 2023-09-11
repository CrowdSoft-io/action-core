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

  rename(oldPath: string, newPath: string): void {
    fs.renameSync(oldPath, newPath);
  }

  readDir(path: string): Array<string> {
    return fs.readdirSync(path);
  }

  readFile(path: string): string {
    return fs.readFileSync(path).toString();
  }

  writeFile(path: string, content: string, overwrite = false): void {
    if (!overwrite && fs.existsSync(path)) {
      throw new Error(`File "${path}" already exists`);
    }
    fs.writeFileSync(path, content);
  }
}
