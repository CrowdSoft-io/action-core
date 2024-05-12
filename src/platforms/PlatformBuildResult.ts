import { ReleaseStage } from "../models";

export interface PlatformBuildResult {
  readonly files: Array<string>;
  readonly postBuild?: {
    readonly runComposer?: boolean;
    readonly golangBuild?: string;
  };
  readonly preRelease?: Array<ReleaseStage>;
  readonly postRelease?: Array<ReleaseStage>;
}
