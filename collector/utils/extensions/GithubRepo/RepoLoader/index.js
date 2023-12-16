class RepoLoader {
  constructor(args = {}) {
    this.ready = false;
    this.repo = args?.repo;
    this.branch = args?.branch;

    this.author = null;
    this.project = null;
    this.branches = [];
  }

  #validGithubUrl() {
    const UrlPattern = require("url-pattern");
    const pattern = new UrlPattern("https\\://github.com/(:author)/(:project)");
    const match = pattern.match(this.repo);
    if (!match) return false;

    this.author = match.author;
    this.project = match.project;
    return true;
  }

  // Ensure the branch provided actually exists
  // and if it does not or has not been set auto-assign to primary branch.
  async #validBranch() {
    await this.getRepoBranches();
    if (!!this.branch && this.branches.includes(this.branch)) return;

    console.log("Branch not set! Auto-assigning to a default branch.");
    this.branch = this.branches.includes("main") ? "main" : "master";
    console.log(`Branch auto-assigned to ${this.branch}.`);
    return;
  }

  async init() {
    if (!this.#validGithubUrl()) return;
    await this.#validBranch();
    this.ready = true;
    return this;
  }

  async recursiveLoader() {
    if (!this.ready) throw new Error("RepoLoader is not in ready state!");
    const {
      GithubRepoLoader: LCGithubLoader,
    } = require("langchain/document_loaders/web/github");

    const loader = new LCGithubLoader(this.repo, {
      branch: this.branch,
      recursive: false,
      maxConcurrency: 5,
      unknown: "ignore",
    });

    const docs = [];
    for await (const doc of loader.loadAsStream()) docs.push(doc);
    return docs;
  }

  // Get all branches for a given repo.
  async getRepoBranches() {
    if (!this.#validGithubUrl() || !this.author || !this.project) return [];
    await fetch(
      `https://api.github.com/repos/${this.author}/${this.project}/branches`
    )
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(`Invalid request to Github API: ${res.statusText}`);
      })
      .then((branchObjects) => {
        this.branches = branchObjects.map((branch) => branch.name);
        return this.branches;
      })
      .catch((err) => {
        console.log(`RepoLoader.branches`, err);
        return [];
      });
    return this.branches;
  }
}

module.exports = RepoLoader;
