export interface Result {
  readonly version: string;
  readonly buildDir: string;
  readonly releaseDir: string;
  readonly installScript: string;
  readonly golangBuild: string;
  readonly runComposer: boolean;
}
