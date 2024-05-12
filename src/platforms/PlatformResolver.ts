import { Inject, Injectable, InjectorService, TokenProvider } from "@tsed/di";
import { DockerPlatform } from "./docker";
import { GoDockerPlatform } from "./go-docker";
import { GolangPlatform } from "./golang";
import { LaravelPlatform } from "./laravel";
import { NextPlatform } from "./next";
import { PlatformInterface } from "./PlatformInterface";
import { PlatformName } from "./PlatformName";
import { ReactPlatform } from "./react";
import { SymfonyPlatform } from "./symfony";
import { TsedPlatform } from "./tsed";
import { VueJsPlatform } from "./vue-js";

const dictionary: Record<PlatformName, TokenProvider<PlatformInterface>> = {
  [PlatformName.Docker]: DockerPlatform,
  [PlatformName.GoDocker]: GoDockerPlatform,
  [PlatformName.Golang]: GolangPlatform,
  [PlatformName.Laravel]: LaravelPlatform,
  [PlatformName.Next]: NextPlatform,
  [PlatformName.React]: ReactPlatform,
  [PlatformName.Symfony]: SymfonyPlatform,
  [PlatformName.Tsed]: TsedPlatform,
  [PlatformName.VueJs]: VueJsPlatform
};

@Injectable()
export class PlatformResolver {
  constructor(@Inject() private readonly injectorService: InjectorService) {}

  resolve(name: PlatformName): PlatformInterface {
    const service = this.injectorService.get<PlatformInterface>(dictionary[name]);
    if (!service) {
      throw new Error(`Unknown platform "${name}"`);
    }
    return service;
  }
}
