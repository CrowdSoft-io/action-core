import * as core from "@actions/core";
import * as github from "@actions/github";
import { InjectorService } from "@tsed/di";
import { Builder } from "./builder";

async function main(): Promise<void> {
  const injector = new InjectorService();
  await injector.load();

  const builder = injector.get<Builder>(Builder);
  if (!builder) {
    throw new Error("Builder not configured");
  }

  const platform = core.getInput("platform");
  const user = core.getInput("user");
  const maxReleases = +core.getInput("max_releases");
  const infrastructureDir = core.getInput("infrastructure_dir");

  console.log(`Building "${platform}" started.`);

  const result = await builder.build(github.context, { platform, user, maxReleases, infrastructureDir });

  core.setOutput("version", result.version);
  core.setOutput("build_dir", result.buildDir);
  core.setOutput("release_dir", result.releaseDir);
  core.setOutput("install_script", result.installScript);
  core.setOutput("run_composer", result.runComposer);

  console.log(`Building "${platform}" version "${result.version}" finished.`);

  await injector.destroy();
}

main().catch((error) => core.setFailed(error?.message || "Build failed"));
