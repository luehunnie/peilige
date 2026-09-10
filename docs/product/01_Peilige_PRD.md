# Peilige 产品需求文档（PRD）

**版本**：V1.0 Final  
**状态**：需求封口 / 可进入实现  
**日期**：2026-09-10  
**仓库**：`/Users/chenjunxian/vscode_projects/peilige`  
**GitHub**：`https://github.com/luehunnie/peilige.git`  
**主要开发责任**：由当前项目负责人继续开发  

---

## 1. 产品定位

Peilige 是 Peili 系列网站的**统一入口导航页**。它像“章鱼的大脑”：负责告诉用户有哪些已经上线的功能网站，并把用户导向这些独立子站；各子站仍可被直接访问，不依赖 Peilige 才能运行。

当前 V1 仅链接：

- Peiligo：校园信息与资源搜索站；
- Peilike：课程表与个人时间安排工具。

未来新增功能网站时，仅需在一个简单配置文件中补充一条网站信息，即可自动生成新的导航卡片。

### 1.1 核心原则

1. **功能优先**：Peilige 首先是一个清晰、快速、稳定的网站导航页。
2. **最小实现**：不建设“应用中心”、应用注册平台、后台 CMS、数据库、账号体系、跨站通信。
3. **独立部署**：Peilige 自身可单独开发、测试、封装、上线；不依赖 Peiligo 或 Peilike 的运行环境。
4. **视觉克制**：明亮、青春、活力、清爽；背景仅少量静态几何装饰，不喧宾夺主。
5. **学校归属清楚但不抢主视觉**：使用北京培黎职业学院官方 Logo 作为学校归属锚点，但 Peilige 自身仍是页面主角。

---

## 2. V1 目标

V1 必须完成：

- 展示北京培黎职业学院官方 Logo；
- 展示 Peilige 名称和一句简短说明；
- 展示所有已经上线的网站导航卡片；
- 整张卡片可点击，并在**新标签页**打开目标网站；
- 卡片提供“了解更多”按钮；
- “了解更多”打开统一 Modal 展示更完整的网站说明；
- 网站信息只维护在 `sites.js` 一个地方；
- 页面根据 `sites.js` 自动生成卡片与 Modal 内容；
- 响应式布局，手机端保持易读易点；
- 轻量 hover / press / Modal 动效；
- 基础 CI；
- 以与 Peiligo 相近的工程封装形式支持正式生产部署。

---

## 3. 明确非目标

V1 **不做**：

- 轮播图；
- 搜索；
- 分类或筛选；
- “Coming Soon / 建设中”卡片；
- 用户系统；
- 后台管理系统；
- 数据库；
- 跨站登录；
- 子站状态同步；
- 统一消息中心；
- 复杂动效、粒子、视差、背景漂浮；
- 图标体系；
- 不同子站使用不同卡片颜色；
- React / Vue / Vite / Webpack 等前端框架或构建链。

未来真的出现相应需求时再增量增加，不预先建设。

---

## 4. 网站结构关系

```text
                    Peilige
                 统一导航入口
                     /   \
                    /     \
                   ▼       ▼
              Peiligo    Peilike
              信息搜索     课程表

同时允许：
用户 ─────────────→ Peiligo
用户 ─────────────→ Peilike
```

Peilige 只负责“入口”，子站不要求反向链接 Peilige，也不要求知道其他子站的存在。

---

## 5. 首页信息架构

建议页面顺序：

1. Header / 品牌区
   - 北京培黎职业学院官方 Logo（小尺寸）；
   - `Peilige` 字标；
2. Intro
   - 简短标题；
   - 一句说明，例如“校园功能网站统一入口”；
3. Site Grid
   - Peiligo 卡片；
   - Peilike 卡片；
   - 未来已上线网站卡片；
4. Footer
   - 简短项目归属 / 版权信息；
5. 全局 Modal
   - 默认隐藏；
   - 点击任一卡片的“了解更多”后复用。

不做大面积校园实景照片，不做复杂 Hero。

---

## 6. 导航卡片需求

### 6.1 卡片显示信息

每张卡片仅显示：

- 网站名；
- 功能名称；
- 一句简短说明；
- “了解更多”；
- 轻量“进入 →”视觉提示。

卡片不直接列主要功能清单，避免和 Modal 重复。

### 6.2 点击行为

- 点击卡片主体：新标签页打开目标网站；
- 点击“了解更多”：阻止卡片跳转，打开 Modal；
- Modal 中“进入网站”：同样新标签页打开；
- 外部打开统一使用 `target="_blank" rel="noopener noreferrer"`。

---

## 7. 详情 Modal

### 7.1 内容

Modal 展示：

- 网站名称；
- 功能定位；
- 完整说明；
- 主要功能列表；
- “进入网站”按钮。

### 7.2 关闭方式

必须支持：

- 右上角关闭按钮；
- 点击遮罩关闭；
- `Esc` 键关闭。

### 7.3 可访问性

实现应包括基础语义：

- `role="dialog"`；
- `aria-modal="true"`；
- 合理的标题关联；
- 打开时将焦点移动到 Modal；
- 关闭后尽量恢复到触发“了解更多”的按钮。

无需引入 UI 框架。

---

## 8. `sites.js` 单一配置源

使用独立的 `js/sites.js` 维护网站信息，不使用 `fetch()` 读取 JSON，不建设后台。

推荐最小结构：

```js
window.PEILIGE_SITES = [
  {
    name: "Peiligo",
    title: "校园资源搜索",
    description: "查找校园资料、活动与实用信息。",
    detail: "Peiligo 是面向校内信息与资源的搜索和浏览网站……",
    features: [
      "搜索校园资源",
      "浏览校园活动与学习资料",
      "访问软件工具和校园指南"
    ],
    url: "https://example.invalid"
  },
  {
    name: "Peilike",
    title: "课程表",
    description: "查看学校课表并安排个人时间。",
    detail: "Peilike 是面向学生的课程表和个人时间安排工具……",
    features: [
      "查看学校官方课表",
      "添加个人安排",
      "打印或保存课表"
    ],
    url: "https://example.invalid"
  }
];
```

### 8.1 明确不需要的字段

V1 不加入：

- `status`；
- `icon`；
- `category`；
- `tags`；
- `color`；
- `sort_group`；
- 复杂权限字段。

数组顺序即展示顺序。

---

## 9. 响应式布局

卡片使用简单 CSS Grid：

```css
.site-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
```

目标行为：

- 宽屏：自然 2～3 列；
- 中等宽度：约 2 列；
- 手机：1 列；
- 不因新增第三、第四个网站而修改网格代码。

桌面效果图以约 1440px viewport 为视觉参考，手机效果以约 390px 为参考，但实现本身不应锁定固定设备宽度。

---

## 10. 视觉规范

### 10.1 关键词

- 青春；
- 明亮；
- 活力；
- 清爽；
- 现代；
- 友好；
- 功能导向。

### 10.2 页面主次

Peilige 自己的产品视觉是主角；北京培黎职业学院 Logo 只承担“这是学校科技社项目”的归属识别。

禁止做成学校官网翻版。

### 10.3 背景

允许：

- 浅色背景；
- 少量几何块；
- 彩条；
- 圆点、细线、柔和渐变。

不使用大面积校园实景照片作为主视觉。

### 10.4 卡片

所有网站卡片统一视觉，不按 Peiligo / Peilike 单独配色。

统一的是设计原则，不要求与 Peiligo 的圆角、阴影数值完全相同。

---

## 11. 动效规范

背景装饰保持静态。

仅对真实交互增加轻量动效：

- 卡片 hover：轻微上移 / 边框或阴影变化；
- 卡片 active：轻微按压反馈；
- 按钮 hover / focus / active 状态；
- Modal 与遮罩轻微淡入淡出。

禁止：

- 循环漂浮背景；
- 粒子；
- 视差；
- 页面逐块飞入；
- 大幅缩放。

应尊重 `prefers-reduced-motion`。

---

## 12. 字体

使用系统字体栈，不依赖在线字体 CDN，不要求服务器安装字体文件。

示例：

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Microsoft YaHei",
  "PingFang SC",
  Arial,
  sans-serif;
```

---

## 13. 学校 Logo 资产

- 使用北京培黎职业学院官方 Logo；
- 从学校官方渠道获取原始素材；
- 下载后保存在 Peilige 自己的 `assets/` 中；
- 不运行时热链学校官网；
- 不依赖 Peiligo / Peilike 仓库里的 Logo；
- Logo 作为小尺寸身份锚点，不成为页面最大视觉元素。

---

## 14. 技术栈

- HTML5；
- CSS3；
- Vanilla JavaScript；
- 本地静态资产；
- 不使用 npm 依赖作为 V1 必需项；
- 不使用 SPA 框架。

双击 `index.html` 能工作可以作为便利能力保留，但**不是生产架构目标**。正式交付以 Web Server / Docker 生产部署为准。

---

## 15. 推荐工程结构

```text
peilige/
├── index.html
├── README.md
├── .env.example
├── assets/
│   └── logo/
│       └── bjpl-logo.*
├── css/
│   └── style.css
├── js/
│   ├── sites.js
│   └── main.js
├── deploy/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── Caddyfile
└── .github/
    └── workflows/
        └── ci.yml
```

如实现中无环境变量需求，`.env.example` 可只保留未来部署所需的域名/端口类变量，不要制造虚假的配置项。

---

## 16. 生产封装

目标是与 Peiligo 保持**工程形式相近**，而不是机械复制其所有服务。

Peilige 只需要静态 Web Server：

```text
Browser
   ↓
Caddy / Static Web Container
   ↓
HTML + CSS + JS + assets
```

### 16.1 要求

- 独立 `Dockerfile`；
- 独立 `docker-compose.yml`；
- Caddy 或同级轻量静态服务器；
- `/healthz` 可返回 200；
- 静态文件正确缓存；
- gzip / zstd 可按服务器能力启用；
- 域名不写死在前端代码；
- 站点可独立部署；
- 当前不建设三个站的总编排仓库。

最终域名、子域名或路径结构暂不冻结。

---

## 17. CI

Peilige 也需要基础 CI，但不能为了 CI 引入复杂构建链。

最低建议：

1. 检查关键文件存在；
2. 通过简单静态服务器启动站点；
3. 请求 `/` 成功返回；
4. 对 `sites.js` 做基本语法检查；
5. 可选地做 HTML 基础校验；
6. 不要求引入 React/Vite/npm 工具链。

---

## 18. AI 辅助开发 Skill 约束

本项目仍由当前负责人开发，可使用现有本地 Skill 辅助。

### UI 设计 / 视觉实现阶段

**REQUIRED**：

- `frontend-design`

### 代码定位困难时

**OPTIONAL**：

- `code-observer`

### 浏览器验收阶段

**OPTIONAL / 推荐**：

- `playwright-cli`

### 默认禁止

除非另行明确授权，不使用：

- `superpowers`；
- `orchestration`；
- `find-skills`；
- 以及其他与当前任务无关的 Skill。

Skill Budget 默认应保持最小。

---

## 19. 验收标准

### 功能

- [ ] 首页显示学校官方 Logo、Peilige 名称与说明；
- [ ] Peiligo 和 Peilike 两张卡片正确显示；
- [ ] 点击卡片主体新标签打开目标网站；
- [ ] “了解更多”不触发卡片跳转；
- [ ] Modal 正确展示当前网站详情；
- [ ] Modal 可以按钮、遮罩、Esc 关闭；
- [ ] 新增一条 `sites.js` 配置后无需改 HTML 即出现新卡片；
- [ ] 只展示已上线网站；
- [ ] 不存在搜索、分类、状态管理等超范围功能。

### 响应式

- [ ] 约 390px 手机宽度为单列卡片；
- [ ] 中等屏幕自然两列；
- [ ] 宽屏自然 2～3 列；
- [ ] 无横向滚动；
- [ ] Modal 手机端不超出视口。

### 视觉

- [ ] 明亮、青春、清爽；
- [ ] 学校 Logo 不喧宾夺主；
- [ ] 无大面积校园照片；
- [ ] 无复杂背景动画；
- [ ] 交互反馈清楚但克制。

### 工程

- [ ] README 写清楚本地预览和生产启动；
- [ ] CI 通过；
- [ ] Docker / Compose 可独立启动；
- [ ] `/healthz` 正常；
- [ ] 不依赖其他两个仓库即可运行。

---

## 20. 后续可选演进

仅在真实需求出现后考虑：

- 网站图标；
- 网站分类；
- 搜索；
- “建设中”状态；
- 更复杂的门户信息；
- 统一部署编排。

这些均不属于 V1。
