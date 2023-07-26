import { Injectable } from "@tsed/di";
import { Context } from "../../models";

@Injectable()
export class Templating {
  render(context: Context, template: string): string {
    const params = this.createParams(context);
    return template.replace(/%(\w+)%/g, (str, name) => {
      if (!params[name]) {
        throw new Error(`Params "${name}" not set`);
      }
      return params[name];
    });
  }

  private createParams(context: Context): Record<string, string> {
    return {
      project_root: context.remote.projectRoot,
      storage_root: context.remote.storageRoot,
      release_dir: context.remote.releaseDir
    };
  }
}
