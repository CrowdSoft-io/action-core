import { Context } from "@actions/github/lib/context";
import { InjectorService } from "@tsed/di";
import { Builder, BuilderOptions } from "../../src/builder";
import { FileSystem } from "../../src/utils/fs";
import { Runner } from "../../src/utils/shell";

jest.mock("../../src/utils/fs");
jest.mock("../../src/utils/shell");

describe("Build e2e", () => {
  const githubContext: Context = {
    action: "",
    actor: "",
    apiUrl: "",
    eventName: "",
    graphqlUrl: "",
    job: "",
    payload: {
      repository: {
        name: "test-repo",
        owner: {
          login: "test"
        }
      }
    },
    ref: "test",
    runId: 123,
    runNumber: 10,
    serverUrl: "",
    sha: "",
    workflow: "",
    get issue(): { owner: string; repo: string; number: number } {
      return { number: 0, owner: "", repo: "" };
    },
    get repo(): { owner: string; repo: string } {
      return { owner: "", repo: "" };
    }
  };
  const options: BuilderOptions = {
    platform: "next",
    user: "tester",
    maxReleases: 5,
    infrastructureDir: "tests/mock/infrastructure"
  };

  let injector: InjectorService;
  let builder: Builder;

  beforeAll(async () => {
    (FileSystem as any).mockImplementation(() => ({
      exists: (path: string) => false,
      mkdir: (path: string) => console.log(["[MKDIR]", path, options]),
      writeFile: (path: string, content: string) => console.log(["[WRITE]", path, content])
    }));

    (Runner as any).mockImplementation(() => ({
      run: async (command: string, ...args: Array<string>) => {
        console.log(`[RUN] ${command} ${args.join(" ")}`);
        return "";
      }
    }));

    injector = new InjectorService();
    await injector.load();
  });

  afterAll(async () => {
    await injector.destroy();
  });

  beforeEach(() => {
    builder = injector.get(Builder) as any;
  });

  it("should be defined correctly", () => {
    expect(builder).toBeDefined();
    expect(builder).toBeInstanceOf(Builder);
  });

  it("action build works", async () => {
    const result = await builder.build(githubContext, options);
    expect(result.version).toMatch(/[0-9]{6}-[0-9]+$/);
  });
});
