export type CronConfig = Array<{
  readonly name: string;
  readonly expression: string;
  readonly command: string;
}>;
