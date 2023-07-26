import { Inject, Injectable } from "@tsed/di";
import { Context, ReleaseStage } from "../../models";
import { Templating } from "../../utils/templating";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";
import { FileSystemConfig } from "./FileSystemConfig";

@Injectable()
export class FileSystemInfrastructure implements InfrastructureInterface {
  constructor(@Inject() private readonly templating: Templating) {}

  async build(context: Context, config: FileSystemConfig): Promise<InfrastructureBuildResult> {
    const preRelease: Array<ReleaseStage> = [];

    if (config.directories?.length) {
      preRelease.push({
        name: "File system - Create directories",
        actions: config.directories
          .map((path) => this.templating.render(context, path))
          .map((path) => `[[ ! -d '${path}' ]] && mkdir -p '${path}' || echo '${path} already created'`)
      });
    }

    if (config.symlinks?.length) {
      preRelease.push({
        name: "File system - Create symlinks",
        actions: config.symlinks
          .map((symlink) => ({
            from: this.templating.render(context, symlink.from),
            to: this.templating.render(context, symlink.to)
          }))
          .map((symlink) => `ln -s '${symlink.from}' '${symlink.to}'`)
      });
    }

    return {
      preRelease,
      postRelease: []
    };
  }
}
