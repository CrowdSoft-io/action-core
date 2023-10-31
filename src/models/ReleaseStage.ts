export interface ReleaseStage {
  readonly name: string;
  readonly actions: Array<string>;
  readonly priority?: number;
}
