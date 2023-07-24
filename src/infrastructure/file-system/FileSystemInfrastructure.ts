import { Context, ReleaseStage } from "../../models";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";
import { FileSystemConfig } from "./FileSystemConfig";

export class FileSystemInfrastructure implements InfrastructureInterface {
  async build(context: Context, config: FileSystemConfig): Promise<InfrastructureBuildResult> {
    const preRelease: Array<ReleaseStage> = [];
    if (config.symlinks?.length) {
      preRelease.push({ name: "Create symlinks", actions: config.symlinks.map((symlink) => `ln -s '${symlink.from}' '${symlink.to}'`) });
    }

    return {
      preRelease,
      postRelease: []
    };
  }
}
