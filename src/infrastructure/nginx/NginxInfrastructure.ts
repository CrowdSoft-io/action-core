import { Inject, Injectable } from "@tsed/di";
import { Context, ReleaseStage } from "../../models";
import { FileSystem } from "../../utils/fs";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";
import { NginxConfig, NginxPhpService } from "./NginxConfig";
import { NginxConfigRenderer } from "./NginxConfigRenderer";

@Injectable()
export class NginxInfrastructure implements InfrastructureInterface {
  constructor(@Inject() private readonly renderer: NginxConfigRenderer, @Inject() private readonly fileSystem: FileSystem) {}

  async build(context: Context, config: NginxConfig, parameters: Record<string, any>): Promise<InfrastructureBuildResult> {
    const localDir = `${context.local.buildDir}/nginx`;

    this.fileSystem.mkdir(localDir);

    if (config.external) {
      this.fileSystem.writeFile(
        `${localDir}/${context.repositoryName}.external`,
        this.renderer.renderServer(context, config.external, parameters.domain, true, !!config.external.with_www)
      );
    }

    if (config.internal) {
      this.fileSystem.writeFile(
        `${localDir}/${context.repositoryName}.internal`,
        this.renderer.renderServer(context, config.internal, `${context.repositoryName}.internal`)
      );
    }

    return {
      preRelease: this.preRelease(context, config),
      postRelease: this.postRelease(config)
    };
  }

  private preRelease(context: Context, config: NginxConfig): Array<ReleaseStage> {
    const stages: Array<ReleaseStage> = [];

    if (config.external) {
      const configSrc = `${context.remote.buildDir}/nginx/${context.repositoryName}.external`;
      const configDist = `${context.remote.nginxDir}/${context.repositoryName}.external`;
      stages.push({
        name: `Nginx "${context.repositoryName}.external" config update`,
        actions: [`cat '${configSrc}' > '${configDist}'`]
      });
    }

    if (config.internal) {
      const configSrc = `${context.remote.buildDir}/nginx/${context.repositoryName}.internal`;
      const configDist = `${context.remote.nginxDir}/${context.repositoryName}.internal`;
      stages.push({
        name: `Nginx "${context.repositoryName}.internal" config update`,
        actions: [`cat '${configSrc}' > '${configDist}'`]
      });
    }

    return stages;
  }

  private postRelease(config: NginxConfig): Array<ReleaseStage> {
    const stages: Array<ReleaseStage> = [];

    const location =
      config.external?.locations.find((location) => location.service.type === "php") ||
      config.internal?.locations.find((location) => location.service.type === "php");
    if (location) {
      const service = location.service as NginxPhpService;
      stages.push({
        name: "Php-fpm reload",
        actions: [`sudo service php${service.options.version}-fpm reload`]
      });
    }

    stages.push({
      name: "Nginx reload",
      actions: ["sudo service nginx reload"]
    });

    return stages;
  }
}
