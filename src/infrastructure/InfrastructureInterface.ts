import { Context } from "../models";
import { InfrastructureBuildResult } from "./InfrastructureBuildResult";

export interface InfrastructureInterface {
  build(context: Context, config: Record<string, any>, parameters: Record<string, any>): Promise<InfrastructureBuildResult>;
}
