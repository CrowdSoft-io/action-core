import { Inject, Injectable } from "@tsed/di";
import parser from "cron-parser";
import { Context } from "../../models";
import { FileSystem } from "../../utils/fs";
import { Templating } from "../../utils/templating";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";
import { CronConfig } from "./CronConfig";

@Injectable()
export class CronInfrastructure implements InfrastructureInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem, @Inject() private readonly templating: Templating) {}

  async build(context: Context, config: CronConfig): Promise<InfrastructureBuildResult> {
    const localDir = `${context.local.buildDir}/cron`;
    const localConfig = `${localDir}/${context.repositoryName}.crontab`;
    const configSrc = `${context.remote.buildDir}/cron/${context.repositoryName}.crontab`;
    const configDist = `${context.remote.cronDir}/${context.repositoryName}.crontab`;

    this.fileSystem.mkdir(localDir);
    this.fileSystem.writeFile(localConfig, this.renderConfig(context, config));

    return {
      preRelease: [
        {
          name: "Setup cron jobs",
          actions: [`cat '${configSrc}' > '${configDist}'`]
        }
      ],
      postRelease: [
        {
          name: "Update crontab",
          actions: [
            `cat > ${context.remote.cronDir}/*.crontab /tmp/crontab-config`,
            `crontab /tmp/crontab-config`,
            `rm /tmp/crontab-config`
          ]
        }
      ]
    };
  }

  private renderConfig(context: Context, config: CronConfig): string {
    if (!config?.length) {
      return "";
    }

    const lines: Array<string> = [];

    lines.push(`# ${context.serviceName}`);

    for (const item of config) {
      // Check expression
      parser.parseExpression(item.expression);

      const command = this.templating.render(context, item.command);
      const stdoutLog = `${context.remote.logsDir}/cron.${item.name}.stdout.log`;
      const stderrLog = `${context.remote.logsDir}/cron.${item.name}.stderr.log`;

      lines.push(`${item.expression} ${command} 1> ${stdoutLog} 2> ${stderrLog}`);
    }

    lines.push(`# END ${context.serviceName}`);
    lines.push("");

    return lines.join("\n");
  }
}
