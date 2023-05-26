export interface PackageManagerInstallOptions {
  readonly frozenLockfile?: boolean;
  readonly ignoreScripts?: boolean;
  readonly production?: boolean;
}
