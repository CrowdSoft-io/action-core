export interface FileSystemConfig {
  readonly directories?: Array<string>;
  readonly symlinks?: Array<{
    readonly from: string;
    readonly to: string;
  }>;
}
