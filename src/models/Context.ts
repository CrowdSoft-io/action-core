import { Context as GithubContext } from "@actions/github/lib/context";

export interface Context {
  readonly repositoryName: string;
  readonly projectName: string;
  readonly serviceName: string;
  readonly version: string;
  readonly branch: string;
  readonly infrastructureDir: string;
  readonly local: {
    readonly buildDir: string;
    readonly buildBinDir: string;
  };
  readonly remote: {
    readonly user: string;
    readonly configsRoot: string;
    readonly storageRoot: string;
    readonly wwwRoot: string;
    readonly projectRoot: string;
    readonly releasesRoot: string;
    readonly releaseDir: string;
    readonly logsDir: string;
    readonly buildDir: string;
    readonly buildBinDir: string;
    readonly cronDir: string;
    readonly nginxDir: string;
    readonly supervisorDir: string;
    readonly maxReleases: number;
  };
  readonly github: GithubContext;
}
