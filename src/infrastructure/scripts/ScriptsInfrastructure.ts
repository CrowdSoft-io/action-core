import { Inject, Injectable } from "@tsed/di";
import { Context } from "../../models";
import { Templating } from "../../utils/templating";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";
import { ScriptsConfig } from "./ScriptsConfig";

@Injectable()
export class ScriptsInfrastructure implements InfrastructureInterface {
  constructor(@Inject() private readonly templating: Templating) {}

  async build(context: Context, config: ScriptsConfig): Promise<InfrastructureBuildResult> {
    return {
      preRelease:
        config.pre_release?.map(({ name, run }, index) => ({
          name: `Pre-release scripts - ${name}`,
          actions: [this.templating.render(context, run)],
          priority: 199 - index
        })) ?? [],
      postRelease:
        config.post_release?.map(({ name, run }, index) => ({
          name: `Post-release scripts - ${name}`,
          actions: [this.templating.render(context, run)],
          priority: 199 - index
        })) ?? []
    };
  }
}
