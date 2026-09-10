# Peilige（培黎阁）

北京培黎职业学院 Peili 系列网站的统一导航入口。

## 项目简介

Peilige 是一个纯静态导航页，汇总 Peili 系列已上线网站的入口。当前收录：

- **Peiligo** — 校园资源搜索
- **Peilike** — 课程表

技术栈：HTML + CSS + Vanilla JavaScript。无 npm 依赖，无构建步骤，无后端。

## 相关项目

- Peiligo 项目仓库：<https://github.com/luehunnie/peiligo>
- Peilike 项目仓库：<https://github.com/luehunnie/peilike>

## 快速开始

### 方法一：直接打开

双击 `index.html`，即可在浏览器中浏览。

不需要 npm，不需要安装任何前端依赖。

### 方法二：本地 HTTP 预览

如果本机已有 Python，可在仓库根目录运行：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。按 `Ctrl+C` 停止。

## 新增 / 修改网站

所有导航卡片由 `js/sites.js` 驱动。新增已上线网站时，只需在 `window.PEILIGE_SITES` 数组中追加一项，无需修改 HTML。

每个网站的最小字段：

```js
{
  name: "Peiligo",                // 卡片名称
  title: "校园资源搜索",           // 一句话定位
  description: "……",              // 卡片上的简介
  detail: "……",                   // 详情弹窗中的详细介绍
  features: ["功能一", "功能二"],  // 详情弹窗中的功能列表
  url: "https://…"                // 点击卡片打开的链接
}
```

数组顺序即页面展示顺序：想调整展示顺序，调整数组元素的位置即可。

## Logo 资产

学校 Logo 位于 `assets/logo/bjpl-logo.png`，是本项目的本地资产（不热链学校官网）。

## 生产部署（Docker Compose）

在仓库根目录运行：

```bash
# 构建并后台启动，默认使用 8080 端口
docker compose -f deploy/docker-compose.yml up -d --build
```

- 页面：<http://localhost:8080>
- 健康检查：<http://localhost:8080/healthz>

停止：

```bash
docker compose -f deploy/docker-compose.yml down
```

### 修改端口

默认主机端口为 `8080`，可通过 `PEILIGE_PORT` 覆盖。

临时覆盖（单次启动）：

```bash
PEILIGE_PORT=18080 docker compose -f deploy/docker-compose.yml up -d --build
```

或使用配置文件：复制 `deploy/.env.example` 为 `deploy/.env`，修改其中的 `PEILIGE_PORT=...`，之后正常执行上面的启动命令即可。

## 部署状态

| 项目 | 状态 |
| --- | --- |
| 应用开发 | ✅ 完成 |
| Docker / Caddy 部署封装 | ✅ 完成 |
| 本地容器构建与运行验证 | ✅ 完成 |
| 测试生产环境部署 | ⏳ 待部署负责人执行 |
| 正式生产环境部署 | ⏳ 待部署负责人执行 |

应用级 Docker/Caddy 部署封装已完成，并已通过本地构建和运行验证。测试生产环境与正式生产环境的基础设施架设及实际部署，由后续部署负责人完成，目前不属于本仓库开发完成状态。

## 工程结构

```text
peilige/
├── index.html          # 页面入口
├── assets/logo/        # 学校 Logo
├── css/                # 样式
├── js/                 # sites.js（网站数据）、main.js（页面逻辑）
├── docs/product/       # 产品需求文档（PRD）
├── deploy/             # Dockerfile、docker-compose.yml、Caddyfile、.env.example
└── .github/workflows/  # CI
```

`docs/ai/` 为本地 AI 开发证据目录，不上传仓库。

## 开发说明

- Vanilla HTML/CSS/JS，无 npm 必需依赖，无 SPA 框架
- 页面数据全部来自 `js/sites.js` 单一配置源
- 生产使用 Caddy 提供静态服务（gzip / zstd 压缩、静态资源缓存）
- `/healthz` 返回 200，用于健康检查

## CI

推送到 `main` 或向 `main` 发起 Pull Request 时，GitHub Actions 会自动验证：

- 关键文件齐全
- JS 语法（`node --check`）
- 静态页面可通过 HTTP 正常访问（含 Logo）
- Docker 镜像可以构建
- 容器内 `/`、`/healthz`、Logo 均返回 200
- `docker compose` 配置有效
