export interface SupervisorConfig {
  readonly programs: Array<{
    readonly name: string;
    readonly command: string;
  }>;
}
