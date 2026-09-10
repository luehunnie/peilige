# Peilige Security

## Application Scope

Peilige 是纯静态导航门户：HTML + CSS + Vanilla JS，由 Caddy 提供静态服务。

没有：用户登录、Cookie Session、用户数据库、Server API、文件上传、表单提交、管理后台、SSR、npm runtime、第三方 JS SDK。

因此安全策略是：减少真实攻击面，而不是搭建企业级安全平台。

## Application Security（本仓库已提供）

- **CSP**：`default-src 'none'` 起步的最小策略（见 `deploy/Caddyfile`），无 `unsafe-eval` / `unsafe-inline`
- **安全响应头**：`X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`X-Frame-Options: DENY`、`Permissions-Policy`（camera/microphone/geolocation/payment/usb 全部关闭）
- **点击劫持防护**：`X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` 双重生效
- **浏览器权限限制**：站点不使用任何敏感浏览器能力，全部显式拒绝
- **外链 scheme 校验**：`js/main.js` 只放行 `https:` 链接，`javascript:` / `data:` / `file:` 等即使被错误写入 `js/sites.js` 也不会成为可点击 URL
- **新窗口链接**：全部 `target="_blank"` + `rel="noopener noreferrer"`
- **Docker 最小权限**：容器以专用非 root 用户（uid 10001）运行，内部端口 8080（无特权端口需求），compose 层 `cap_drop: ALL` + `no-new-privileges` + 只读根文件系统（`/config`、`/data` 为 tmpfs）
- **镜像内容隔离**：Dockerfile 仅 COPY 运行时文件（index.html / css / js / assets），`.dockerignore` 排除 `.git`、`docs/`、`.playwright-cli`、`deploy/.env`；生产镜像不含 secrets
- **CI 安全回归**：GitHub Actions 在 Docker smoke 中断言安全响应头、Server 头隐藏、`/healthz` no-store、非 root 运行；workflow 权限 `contents: read`
- **依赖更新**：Dependabot 仅跟踪 Docker base image 与 GitHub Actions（weekly，每生态 open PR 上限 2）

## Infrastructure Responsibilities（部署负责人）

以下属于基础设施层，**不属于本仓库**，由部署负责人配置：

- HTTPS / TLS 终结（真实公网入口）
- **HSTS 启用**
- Domain / DNS
- 公网 Docker Host、宿主机与 Docker daemon/socket 安全、宿主机补丁
- 外部 Reverse Proxy / Load Balancer / CDN
- WAF / DDoS 策略
- Firewall / 公网网络策略
- 访问日志 / Monitoring / Alerting
- Backup / Rollback
- 生产环境资源限制（memory / cpu / pids）最终策略

## HSTS

**当前容器是 HTTP 应用容器，未配置 TLS，本仓库不设置 `Strict-Transport-Security`。**

HSTS 必须由真实 HTTPS 公网入口在确认 Domain / TLS ownership 之后启用；届时由部署负责人在 TLS 终结层（而非本应用容器）配置，`includeSubDomains` 与 `preload` 也需在同一决策中确认。

## Production Checklist（部署负责人）

- [ ] 域名与 DNS 就绪，TLS 证书签发
- [ ] HTTPS 入口（reverse proxy / LB）配置，HTTP → HTTPS 跳转
- [ ] 在 HTTPS 入口启用 HSTS（确认域名归属后；决定是否 `includeSubDomains` / `preload`）
- [ ] 防火墙仅放行必要端口（应用容器只暴露一个 HTTP 端口）
- [ ] Docker Host 补丁策略与 daemon 安全（确认 Docker socket 不对外暴露）
- [ ] 日志 / 监控 / 告警接入
- [ ] 备份与回滚方案确认
- [ ] `docker compose -f deploy/docker-compose.yml up -d --build` 后验证 `/` 与 `/healthz`

## Reporting

如发现安全问题，请通过 GitHub Issues / 仓库所有者联系渠道私密报告，请勿公开披露细节。
