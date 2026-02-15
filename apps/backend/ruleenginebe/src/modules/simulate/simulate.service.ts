import { ZenEngine } from "@gorules/zen-engine";
import { BlobService } from "../vcs-engine/blob.service.js";
import { BranchService } from "../vcs-engine/branch.service.js";
import { CommitService } from "../vcs-engine/commit.service.js";
import { TreeService } from "../vcs-engine/tree.service.js";

export type SimulateInput = {
  /** Main JDM graph (nodes + edges) */
  content: unknown;
  /** Input context for the decision */
  context: unknown;
  /** If provided, sub-decisions (Decision node keys) are loaded from this repo/branch */
  repositoryId?: string;
  branch?: string;
  /** If provided, map of decision key (path) -> JDM content for sub-decisions (overrides repo loading for that key) */
  decisions?: Record<string, unknown>;
};

export type SimulateOutput = {
  result: unknown;
  trace: Record<string, TraceEntry>;
  performance: string;
};

export type TraceEntry = {
  id: string;
  name: string;
  input: unknown;
  output: unknown;
  performance: string | null;
  traceData: unknown;
  order?: number;
};

export class SimulateService {
  constructor(
    private blobService: BlobService,
    private branchService: BranchService,
    private commitService: CommitService,
    private treeService: TreeService
  ) {}

  /**
   * Get blob content by path in a branch (e.g. "folder/file.json").
   * Returns null if path not found.
   */
  async getContentByPath(
    repositoryId: string,
    branchName: string,
    path: string
  ): Promise<unknown | null> {
    const branch = await this.branchService.findByName(repositoryId, branchName);
    if (!branch?.headCommitId) return null;
    const commit = await this.commitService.findById(branch.headCommitId);
    if (!commit) return null;
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    const content = await this.getContentFromTree(commit.treeId, segments);
    return content;
  }

  private async getContentFromTree(
    treeId: string,
    segments: string[]
  ): Promise<unknown | null> {
    const tree = await this.treeService.findById(treeId);
    if (!tree) return null;
    const name = segments[0];
    const entry = tree.entries.find((e) => e.name === name);
    if (!entry) return null;
    if (segments.length === 1) {
      if (entry.type !== "BLOB" || !entry.blobId) return null;
      const blob = await this.blobService.findById(entry.blobId);
      return blob?.content ?? null;
    }
    if (entry.type !== "TREE" || !entry.childTreeId) return null;
    return this.getContentFromTree(entry.childTreeId, segments.slice(1));
  }

  /**
   * Run simulation: evaluate the main JDM graph with context, resolving Decision nodes via loader when repo/branch or decisions map is provided.
   */
  async simulate(input: SimulateInput): Promise<SimulateOutput> {
    const { content, context, repositoryId, branch, decisions = {} } = input;

    const loader =
      repositoryId && branch
        ? async (key: string): Promise<Buffer> => {
            const fromMap = decisions[key];
            if (fromMap !== undefined)
              return Buffer.from(
                typeof fromMap === "string" ? fromMap : JSON.stringify(fromMap),
                "utf-8"
              );
            const fromRepo = await this.getContentByPath(
              repositoryId,
              branch,
              key
            );
            if (fromRepo == null)
              throw new Error(`Decision not found: ${key}`);
            return Buffer.from(
              typeof fromRepo === "string" ? fromRepo : JSON.stringify(fromRepo),
              "utf-8"
            );
          }
        : Object.keys(decisions).length > 0
          ? async (key: string): Promise<Buffer> => {
              const c = decisions[key];
              if (c === undefined)
                throw new Error(`Decision not found: ${key}`);
              return Buffer.from(
                typeof c === "string" ? c : JSON.stringify(c),
                "utf-8"
              );
            }
          : undefined;

    const engine = new ZenEngine(loader ? { loader } : undefined);
    const contentBuffer =
      typeof content === "string"
        ? Buffer.from(content, "utf-8")
        : Buffer.from(JSON.stringify(content), "utf-8");
    const decision = engine.createDecision(contentBuffer);

    const start = performance.now();
    const response = await decision.evaluate(context as Record<string, unknown>, {
      trace: true,
    });
    const elapsed = performance.now() - start;

    const result = response?.result ?? response;
    const trace =
      response && typeof response === "object" && "trace" in response && response.trace && typeof response.trace === "object"
        ? (response.trace as Record<string, TraceEntry>)
        : {};
    const performanceMs = `${Math.round(elapsed)}ms`;

    return {
      result: result ?? null,
      trace,
      performance: (response && typeof response === "object" && "performance" in response && typeof (response as { performance?: string }).performance === "string")
        ? (response as { performance: string }).performance
        : performanceMs,
    };
  }

  /**
   * Execute index.json from a repository branch (default main). Loads the decision graph from index.json,
   * resolves sub-decisions (Decision nodes) from the same repo/branch, and evaluates with the given context.
   */
  async executeIndex(
    repositoryId: string,
    context: unknown,
    branch: string = "main"
  ): Promise<{ result: unknown; performance: string }> {
    const content = await this.getContentByPath(repositoryId, branch, "index.json");
    if (content == null) {
      throw new Error(`index.json not found in repository ${repositoryId} on branch ${branch}`);
    }
    const output = await this.simulate({
      content,
      context: context ?? {},
      repositoryId,
      branch,
    });
    return {
      result: output.result,
      performance: output.performance,
    };
  }
}
