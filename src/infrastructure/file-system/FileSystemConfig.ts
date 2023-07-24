export interface FileSystemConfig {
  readonly symlinks?: Array<{
    readonly from: string;
    readonly to: string;
  }>;
}
