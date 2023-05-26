import { Context } from "../models";
import { PlatformBuildResult } from "./PlatformBuildResult";

export interface PlatformInterface {
  build(context: Context, environment: Record<string, string>): Promise<PlatformBuildResult>;
}
