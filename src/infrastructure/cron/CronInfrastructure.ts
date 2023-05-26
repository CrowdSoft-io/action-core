import { Injectable } from "@tsed/di";
import { InfrastructureBuildResult } from "../InfrastructureBuildResult";
import { InfrastructureInterface } from "../InfrastructureInterface";

@Injectable()
export class CronInfrastructure implements InfrastructureInterface {
  async build(): Promise<InfrastructureBuildResult> {
    return {
      preRelease: [],
      postRelease: []
    };
  }
}
