# Cloudflare Workers 静态资源 — Staging 部署

Peilige 的**可选 staging 通道**：把纯静态站点发布到一个 `*.workers.dev` 上的
Cloudflare Workers Static Assets 站点，用于上线前验证。

- **生产部署不受影响**：生产路径仍是 `deploy/Dockerfile` + `deploy/Caddyfile`
  + `deploy/docker-compose.yml`（见 README「生产部署」），本目录其余文件未改动。
- **纯静态，无 Worker 代码**：`wrangler.jsonc` 没有 `main` 入口，Cloudflare
  不运行任何 Worker 脚本，请求直接命中静态资源。
- **无任何付费能力**：不配置 D1 / R2 / KV / Queues / AI / Cron 等绑定；
  不绑定自定义域名、不配置路由、不改 DNS。

## 免费额度边界（官方口径，2026-09 核对）

| 项目 | 说明 |
| --- | --- |
| 静态资源请求 | **免费且不计数**。Workers 官方定价页原文："Requests to static assets are free and unlimited." |
| Workers 请求额度 | 免费档 100,000 次/天。本配置不运行 Worker 代码，**不消耗**该额度 |
| 资源存储 | "There is no additional cost for storing Assets." |
| 计费前提 | 该方案仅使用 Workers **Free** 计划能力；不升级、不订阅（Paid 计划才有 $5/月起），不会产生费用 |
| 需要避免的操作 | 不要给该 Worker 开启 `run_worker_first` 或 Workers Cache 计费类特性：前者会把请求计入每日额度，超出返回 429 |

依据：<https://developers.cloudflare.com/workers/platform/pricing/> 与
<https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>。

## 前置条件

1. Node.js（本机已有）+ 仓库内 `npm install`（安装 `wrangler` devDependency）。
2. Cloudflare 账号登录（交互式 OAuth，仅需执行一次）：

   ```bash
   npx wrangler login
   ```

   登录状态可用 `npx wrangler whoami` 查看。不要把 token / 账号信息写入仓库。

## 常用命令

```bash
npm install                # 安装 wrangler（仅 devDependency，站点本身零依赖）
npm run build              # 白名单复制站点文件 → dist-workers/（纯复制，无构建）
npm run dry-run            # 构建 + wrangler deploy --dry-run（本地校验，不上传）
npm run dev:staging        # 本地起 wrangler dev，预览 dist-workers/ 的实际服务行为
npm run deploy:staging     # 构建 + 发布 staging Worker（peilige-static-staging）
```

发布成功后访问 Wrangler 输出的 `https://peilige-static-staging.<子域>.workers.dev`。

## 回滚 / 移除

```bash
# 回滚到上一个版本（Version ID 见 npx wrangler versions list）
npx wrangler rollback

# 彻底移除 staging 站点（会要求确认；只删 Worker，不影响账号其他资源）
npx wrangler delete --name peilige-static-staging
```

移除后 `dist-workers/` 为本地产物，可随时 `rm -rf dist-workers` 重建。

## 发布内容（发布面白名单）

`npm run build` 只复制运行时文件到 `dist-workers/`，与生产 Dockerfile 的
COPY 白名单一致，另加 Workers 专属文件：

```
index.html  404.html  _headers  css/  js/  assets/
```

README、docs、deploy、仓库元数据**不会**被发布。`_headers`（安全响应头，
内容与生产 Caddyfile 完全一致）与 `404.html` 由 Workers 解析/按需返回，
不会作为普通文件暴露。

## 与生产 Caddy 的行为差异

- HTML 页面默认 `Cache-Control: public, max-age=0, must-revalidate`（本地
  `wrangler dev` 实测），效果与生产 Caddyfile 的 `no-cache` 等同：更新立即生效；
  `/css/*`、`/js/*`、`/assets/*` 的 24h 缓存策略已通过 `_headers` 显式对齐。
- 压缩由 Cloudflare 边缘自动处理；`/healthz` 端点为 Caddy 专属，staging 不提供。
