import { PackageManagerInstallOptions } from "./PackageManagerInstallOptions";

export interface PackageManagerInterface {
  install(options?: PackageManagerInstallOptions): Promise<void>;
  run(...args: Array<string>): Promise<void>;
}
