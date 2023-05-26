import { Inject, Injectable, InjectorService, TokenProvider } from "@tsed/di";
import fs from "fs";
import { NpmPackageManager } from "./npm";
import { PackageManagerInterface } from "./PackageManagerInterface";
import { PackageManagerName } from "./PackageManagerName";
import { YarnPackageManager } from "./yarn";

const dictionary: Record<PackageManagerName, TokenProvider<PackageManagerInterface>> = {
  [PackageManagerName.Npm]: NpmPackageManager,
  [PackageManagerName.Yarn]: YarnPackageManager
};

@Injectable()
export class PackageManagerResolver {
  constructor(@Inject() private readonly injectorService: InjectorService) {}

  resolve(name?: PackageManagerName): PackageManagerInterface {
    name ??= fs.existsSync("yarn.lock") ? PackageManagerName.Yarn : PackageManagerName.Npm;
    const service = this.injectorService.get<PackageManagerInterface>(dictionary[name]);
    if (!service) {
      throw new Error(`Unknown package manager "${name}"`);
    }
    return service;
  }
}
