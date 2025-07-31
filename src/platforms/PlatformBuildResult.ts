import { ReleaseStage } from "../models";

export interface PlatformBuildResult {
  readonly files: Array<string>;
  readonly postBuild?: {
    readonly golangBuild?: string;
    readonly composerBefore?: string;
    readonly runComposer?: boolean;
    readonly composerAfter?: string;
  };
  readonly preRelease?: Array<ReleaseStage>;
  readonly postRelease?: Array<ReleaseStage>;
}
