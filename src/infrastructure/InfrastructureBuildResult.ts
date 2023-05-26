import { ReleaseStage } from "../models";

export interface InfrastructureBuildResult {
  readonly preRelease: Array<ReleaseStage>;
  readonly postRelease: Array<ReleaseStage>;
}
