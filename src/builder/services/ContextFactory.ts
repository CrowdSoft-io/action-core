import { Context as GithubContext } from "@actions/github/lib/context";
import { Injectable } from "@tsed/di";
import { Context } from "../../models";
import { BuilderOptions } from "../BuilderOptions";

const runNumberMax = 1000000;

@Injectable()
export class ContextFactory {
  createContext(githubContext: GithubContext, options: BuilderOptions): Context {
    const repository = githubContext.payload.repository?.name;
    if (!repository) {
      throw new Error("Repository not set");
    }

    const version = (githubContext.runNumber + runNumberMax).toString().substring(1) + "-" + Date.now();
    const localBuildDir = `build-${version}`;
    const remoteHomeDir = `/home/${options.user}`;
    const remoteWwwRoot = `${remoteHomeDir}/www`;
    const remoteReleasesRoot = `${remoteHomeDir}/releases`;
    const remoteBuildDir = `${remoteReleasesRoot}/build-${version}`;

    return {
      repositoryName: repository,
      projectName: repository.replace(/^(\w+)-.*$/g, "$1"),
      serviceName: repository.replace(/-/g, "_"),
      version,
      branch: githubContext.ref.split("/").reverse()[0],
      infrastructureDir: options.infrastructureDir,
      local: {
        buildDir: localBuildDir,
        buildBinDir: `${localBuildDir}/bin`
      },
      remote: {
        user: options.user,
        configsRoot: `${remoteHomeDir}/configs/${repository}`,
        storageRoot: `${remoteHomeDir}/storage/${repository}`,
        wwwRoot: remoteWwwRoot,
        projectRoot: `${remoteWwwRoot}/${repository}`,
        releasesRoot: remoteReleasesRoot,
        releaseDir: `${remoteReleasesRoot}/${version}`,
        logsDir: `${remoteHomeDir}/logs/${repository}`,
        buildDir: remoteBuildDir,
        buildBinDir: `${remoteBuildDir}/bin`,
        nginxDir: `${remoteHomeDir}/nginx`,
        supervisorDir: `${remoteHomeDir}/supervisor`,
        maxReleases: options.maxReleases
      },
      github: githubContext
    };
  }
}
