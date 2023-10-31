export interface ScriptsConfigStageItem {
  readonly name: string;
  readonly run: string;
}

export interface ScriptsConfig {
  readonly pre_release?: Array<ScriptsConfigStageItem>;
  readonly post_release?: Array<ScriptsConfigStageItem>;
}
