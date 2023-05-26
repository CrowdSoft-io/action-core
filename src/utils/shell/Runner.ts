import { Injectable } from "@tsed/di";
import { spawn } from "child_process";

@Injectable()
export class Runner {
  run(command: string, ...args: Array<string>): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      console.log(`$ ${command} ${args.join(" ")}`);

      let data = "";
      let error = "";

      const handler = spawn(command, args);
      handler.stdout.on("data", (chunk) => {
        data += chunk;
        console.log(chunk.toString());
      });
      handler.stderr.on("data", (chunk) => {
        error += chunk;
        console.error(chunk.toString());
      });
      handler.on("close", (code) =>
        code === 0 ? resolve(data.toString()) : reject(error ? error.toString() : `${command} process exited with code ${code}`)
      );
    });
  }
}
