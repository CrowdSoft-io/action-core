import { Injectable } from "@tsed/di";
import fs from "fs";

@Injectable()
export class FileSystem {
  mkdir(path: string): void {
    fs.mkdirSync(path, 0o755);
  }

  writeFile(path: string, content: string): void {
    fs.writeFileSync(path, content);
  }
}
