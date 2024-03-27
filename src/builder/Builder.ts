import { Context as GithubContext } from "@actions/github/lib/context";
import { Inject, Injectable } from "@tsed/di";
import { InfrastructureManager } from "../infrastructure";
import { Result } from "../models";
import { PlatformName, PlatformResolver } from "../platforms";
import { FileSystem } from "../utils/fs";
import { Runner } from "../utils/shell";
import { BuilderOptions } from "./BuilderOptions";
import { ContextFactory, InstallScriptBuilder } from "./services";

@Injectable()
export class Builder {
  constructor(
    @Inject() private readonly contextFactory: ContextFactory,
    @Inject() private readonly infrastructureManager: InfrastructureManager,
    @Inject() private readonly platformResolver: PlatformResolver,
    @Inject() private readonly fileSystem: FileSystem,
    @Inject() private readonly runner: Runner
  ) {}

  async build(githubContext: GithubContext, options: BuilderOptions): Promise<Result> {
    const context = this.contextFactory.createContext(githubContext, options);

    this.fileSystem.mkdir(context.local.buildDir);
    this.fileSystem.mkdir(context.local.buildBinDir);

    const infrastructureResult = await this.infrastructureManager.build(context);

    const platform = this.platformResolver.resolve(options.platform as PlatformName);
    const platformResult = await platform.build(context, infrastructureResult.environment);

    await this.runner.run("tar", "-cf", `${context.local.buildDir}/release.tar`, ...platformResult.files, ...infrastructureResult.files);

    await new InstallScriptBuilder(context, this.fileSystem)
      .createDirectories()
      .extractReleaseArchive()
      .addStages(...infrastructureResult.preRelease)
      .addStages(...(platformResult.preRelease ?? []))
      .switchReleases()
      .addStages(...(platformResult.postRelease ?? []))
      .addStages(...infrastructureResult.postRelease)
      .removeOldReleases()
      .removeBuildArtifacts()
      .build();

    return {
      version: context.version,
      buildDir: context.local.buildDir,
      releaseDir: context.remote.buildDir,
      installScript: `${context.remote.buildBinDir}/install.sh`,
      runComposer: !!platformResult.postBuild?.runComposer
    };
  }
}
