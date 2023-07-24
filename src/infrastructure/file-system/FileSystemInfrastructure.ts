import { Injectable } from "@tsed/di";
import { Context, ReleaseStage } from "../../models";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";
import { FileSystemConfig } from "./FileSystemConfig";

@Injectable()
export class FileSystemInfrastructure implements InfrastructureInterface {
  async build(context: Context, config: FileSystemConfig): Promise<InfrastructureBuildResult> {
    const templateParams = {
      storage_root: context.remote.storageRoot,
      release_dir: context.remote.releaseDir
    };

    const preRelease: Array<ReleaseStage> = [];

    if (config.directories?.length) {
      preRelease.push({
        name: "File system - Create directories",
        actions: config.directories
          .map((path) => this.render(path, templateParams))
          .map((path) => `[[ ! -d '${path}' ]] && mkdir -p '${path}' || echo '${path} already created'`)
      });
    }

    if (config.symlinks?.length) {
      preRelease.push({
        name: "File system - Create symlinks",
        actions: config.symlinks
          .map((symlink) => ({
            from: this.render(symlink.from, templateParams),
            to: this.render(symlink.to, templateParams)
          }))
          .map((symlink) => `ln -s '${symlink.from}' '${symlink.to}'`)
      });
    }

    return {
      preRelease,
      postRelease: []
    };
  }

  private render(template: string, params: Record<string, string>): string {
    return template.replace(/%(\w+)%/g, (str, name) => {
      if (!params[name]) {
        throw new Error(`Params "${name}" not set`);
      }
      return params[name];
    });
  }
}
