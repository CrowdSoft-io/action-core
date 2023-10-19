import { Inject, Injectable } from "@tsed/di";
import { Context, ReleaseStage } from "../../models";
import { FileSystem } from "../../utils/fs";
import { Templating } from "../../utils/templating";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";
import { SupervisorConfig } from "./SupervisorConfig";

@Injectable()
export class SupervisorInfrastructure implements InfrastructureInterface {
  constructor(@Inject() private readonly fileSystem: FileSystem, @Inject() private readonly templating: Templating) {}

  async build(context: Context, config: SupervisorConfig, parameters: Record<string, any>): Promise<InfrastructureBuildResult> {
    const localDir = `${context.local.buildDir}/supervisor`;

    this.fileSystem.mkdir(localDir);
    this.fileSystem.writeFile(`${localDir}/${context.repositoryName}.conf`, this.renderConfig(context, config, parameters));

    return {
      preRelease: this.preRelease(context, parameters),
      postRelease: this.postRelease(context, parameters)
    };
  }

  private renderConfig(context: Context, config: SupervisorConfig, parameters: Record<string, any>): string {
    const prefix = parameters.supervisor_prefix ?? "";

    const lines: Array<string> = [
      `[group:${prefix}${context.serviceName}]`,
      `programs=${config.programs.map((program) => `${prefix}${context.serviceName}_${program.name}`).join(",")}`,
      ""
    ];

    for (const program of config.programs) {
      const command = this.templating.render(context, program.command);

      lines.push(`[program:${prefix}${context.serviceName}_${program.name}]`);
      lines.push(`command=${command}`);
      lines.push(`directory=${context.remote.projectRoot}`);
      lines.push("autostart=true");
      lines.push("autorestart=true");
      lines.push("stopsignal=INT");
      lines.push("stopasgroup=true");
      lines.push("killasgroup=true");
      lines.push(`stdout_logfile=${context.remote.logsDir}/supervisor.${program.name}.stdout.log`);
      lines.push(`stderr_logfile=${context.remote.logsDir}/supervisor.${program.name}.stderr.log`);
      lines.push(`user=${context.remote.user}`);
      lines.push(`group=${context.remote.user}`);
      lines.push(`process_name=${context.serviceName}_${program.name}_%(process_num)s`);
      lines.push(`numprocs=${program.replicas || 1}`);
      lines.push("");
    }

    return lines.join("\n");
  }

  private preRelease(context: Context, parameters: Record<string, any>): Array<ReleaseStage> {
    const configSrc = `${context.remote.buildDir}/supervisor/${context.repositoryName}.conf`;
    const configDist = `${context.remote.supervisorDir}/${context.repositoryName}.conf`;
    const prefix = parameters.supervisor_prefix ?? "";

    return [
      {
        name: "Supervisor stop",
        actions: [`sudo supervisorctl stop ${prefix}${context.serviceName}:* || echo "Not installed"`]
      },
      {
        name: "Supervisor config update",
        actions: [
          `if [[ ! -f '${configDist}' || \`diff '${configSrc}' '${configDist}'\` ]]`,
          "then",
          `    cat '${configSrc}' > '${configDist}' \\`,
          "        && sudo service supervisor reload \\",
          "        && echo 'Supervisor config updated'",
          "fi"
        ]
      }
    ];
  }

  private postRelease(context: Context, parameters: Record<string, any>): Array<ReleaseStage> {
    const prefix = parameters.supervisor_prefix ?? "";

    return [
      {
        name: "Supervisor start",
        actions: [`sudo supervisorctl start ${prefix}${context.serviceName}:*`]
      }
    ];
  }
}
