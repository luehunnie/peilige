// Peilige — 组装 Cloudflare Workers Static Assets 目录（dist-workers/）。
//
// 白名单与 deploy/Dockerfile 的 COPY 列表一一对应（仅运行时文件），另加
// Workers 专属的 404.html 与 _headers。纯文件复制：站点保持无构建步骤、
// 无转译、无打包，与 CI 的"no build toolchain"承诺一致。
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist-workers");

// 与 deploy/Dockerfile COPY 白名单对齐；Workers 专属文件单列。
const files = ["index.html", "404.html", "_headers"];
const dirs = ["css", "js", "assets"];

for (const f of [...files, ...dirs]) {
  if (!existsSync(join(root, f))) {
    console.error(`build-workers-assets: missing source: ${f}`);
    process.exit(1);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const f of files) cpSync(join(root, f), join(out, f));
for (const d of dirs) cpSync(join(root, d), join(out, d), { recursive: true });

// 输出清单便于人工/CI 核对发布面。
const listed = readdirSync(out, { withFileTypes: true }).map((e) =>
  e.isDirectory() ? `${e.name}/` : e.name,
);
console.log(`dist-workers/ ready: ${listed.join("  ")}`);
