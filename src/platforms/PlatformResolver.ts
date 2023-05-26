import { Inject, Injectable, InjectorService, TokenProvider } from "@tsed/di";
import { LaravelPlatform } from "./laravel";
import { NextPlatform } from "./next";
import { PlatformInterface } from "./PlatformInterface";
import { PlatformName } from "./PlatformName";

const dictionary: Record<PlatformName, TokenProvider<PlatformInterface>> = {
  [PlatformName.Laravel]: LaravelPlatform,
  [PlatformName.Next]: NextPlatform
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
