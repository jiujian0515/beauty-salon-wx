# 美容院轻量 SaaS · 顾客端（beauty-salon-wx）

> 基于 **Taro 4 + React 18 + TypeScript** 的顾客端应用，一套代码同时构建「微信小程序」与「移动 H5」。
> 关联文档：[产品需求文档](./README-PRD.md) · [项目技术文档](./README-PTD.md)

## 1. 项目简介

顾客通过微信小程序 / 移动 H5 自助完成「选服务 → 选时段 → 付定金 → 锁定时段」的预约闭环，并在「我的预约」中查看、取消预约。

当前仓库已搭建完整工程架构，并已完成**登录页**（手机号 + 密码登录、微信手机号快捷登录）；其余页面仍为占位骨架（`PagePlaceholder`），后续按 PRD 逐页接入。

## 2. 技术栈

| 分类 | 选型 | 版本 | 说明 |
|---|---|---|---|
| 跨端框架 | Taro | 4.3.3 | 微信小程序 + H5 同构 |
| UI 框架 | React | 18.3.x | — |
| 语言 | TypeScript | 5.5.x | 已开启 `skipLibCheck`（Taro 自带类型存在跨端冗余声明） |
| 构建工具 | Webpack 5 | 5.91.0 | Taro Webpack5 Runner |
| 样式 | Sass + CSS 自定义属性 | 1.77.x | 设计令牌以 `--bs-*` CSS 变量提供 |
| 状态管理 | Zustand | 5.x | 轻量、无需 Provider，适配小程序 |
| 请求 | Taro.request 封装 | — | 统一响应解析、鉴权注入、401 兜底 |
| 代码规范 | ESLint + Stylelint + Prettier | — | 继承 `eslint-config-taro` |

**React 版本说明**：PTD 中规划 React 19，但 Taro 4.3.3 的 `@tarojs/react` 与 React Refresh 相关依赖仍声明 `react ^18`，因此本期使用 React 18，待 Taro 官方支持后再统一升级。

## 3. 目录结构

```text
beauty-salon-wx
├── config
│   ├── index.ts               # 基础构建配置（designWidth 750、别名、压缩等）
│   ├── dev.ts                 # 开发环境：H5 devServer 端口与 /api 代理
│   └── prod.ts                # 生产环境：静态资源 publicPath
├── types
│   └── global.d.ts            # 资源模块声明、TARO_APP_* 环境变量类型
├── src
│   ├── app.tsx                # 应用入口：冷启动恢复登录态
│   ├── app.config.ts          # 页面注册、窗口样式、TabBar
│   ├── app.scss               # 全局样式入口（tokens + base）
│   ├── index.html             # H5 模板
│   ├── assets/                # 静态资源（图片、字体等）
│   ├── components/            # 通用组件
│   │   ├── index.ts           # 组件统一出口
│   │   └── PagePlaceholder/   # 页面占位骨架（接入业务后删除）
│   ├── constants/
│   │   ├── index.ts           # 接口地址、超时、存储 key 等全局常量
│   │   └── routes.ts          # 页面路径常量与 AppRoute 类型
│   ├── hooks/                 # 自定义 Hooks
│   ├── pages/                 # 页面（每个目录含 index.tsx / index.config.ts / index.scss）
│   │   ├── index/             # 服务列表（首页，Tab）
│   │   ├── service/detail/    # 服务详情
│   │   ├── booking/           # 选择时段并提交预约
│   │   ├── payment/           # 支付定金
│   │   ├── order/list/        # 我的预约（Tab）
│   │   ├── order/detail/      # 预约详情 / 取消
│   │   ├── mine/              # 个人中心（Tab）
│   │   └── login/             # 登录（密码 / 微信手机号快捷登录）
│   ├── services/
│   │   ├── request.ts         # 请求层：统一响应、鉴权、错误封装
│   │   └── api/               # 按业务域拆分的接口定义
│   │       ├── index.ts       # 接口统一出口
│   │       └── auth.ts        # 顾客登录 / 当前顾客接口
│   ├── store/
│   │   ├── index.ts           # store 统一出口
│   │   └── auth.ts            # 登录态（token / user）
│   ├── styles/
│   │   ├── tokens.scss        # 设计令牌（颜色、间距、圆角、字号）
│   │   ├── mixins.scss        # 布局与文本混入
│   │   └── index.scss         # 全局基础样式
│   ├── types/
│   │   ├── api.ts             # 统一响应、分页等通用类型
│   │   └── auth.ts            # 顾客登录相关类型
│   └── utils/
│       └── price.ts           # 金额工具（分 ↔ 展示）
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── .eslintrc / .stylelintrc.json / .prettierrc.json
├── babel.config.js
├── project.config.json        # 微信开发者工具项目配置（指向 dist）
├── tsconfig.json
└── package.json
```

## 4. 环境要求

| 依赖 | 版本 |
|---|---|
| Node.js | >= 18.18.0（建议 20 LTS） |
| npm | >= 9 |
| 微信开发者工具 | 稳定版（仅小程序调试需要） |

## 5. 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动微信小程序（产物输出到 dist/，监听文件变化）
npm run dev:weapp
# 然后用微信开发者工具「导入项目」，目录选择本仓库根目录（读取 project.config.json，小程序目录为 dist/）

# 3. 启动 H5（默认 http://localhost:10086）
npm run dev:h5
```

注意事项：

- `project.config.json` 中 `appid` 为 `touristappid`（游客模式），接入真实小程序时替换为自己的 AppID。
- 小程序真机调试 / 支付联调需要 HTTPS 域名，并在微信公众平台配置 request 合法域名；本地开发可在开发者工具中勾选「不校验合法域名」。
- H5 开发环境通过 devServer 将 `/api` 代理到后端（默认 `http://127.0.0.1:8080`，可用 `TARO_APP_API_TARGET` 覆盖）。

## 6. 可用脚本

| 脚本 | 说明 |
|---|---|
| `npm run dev:weapp` | 开发模式构建微信小程序并监听 |
| `npm run build:weapp` | 生产构建微信小程序（产物 `dist/`） |
| `npm run dev:h5` | 启动 H5 开发服务（端口 10086） |
| `npm run build:h5` | 生产构建 H5 静态资源（产物 `dist/`） |
| `npm run typecheck` | TypeScript 类型检查（`tsc --noEmit`） |
| `npm run lint` | ESLint 检查 `src`、`config`、`types` |
| `npm run lint:style` | Stylelint 检查 SCSS |
| `npm run format` | Prettier 格式化源码 |

> 注意：`build:weapp` 与 `build:h5` 共用 `dist/` 目录，切换构建目标前建议先清理。

## 7. 环境变量

Taro 只会把 **`TARO_APP_` 前缀**的变量注入到客户端代码，切勿在其中存放密钥。

| 变量 | 作用域 | 说明 |
|---|---|---|
| `TARO_APP_API_BASE_URL` | 客户端 | 接口基础地址。留空表示与页面同源，即请求 `/api/v1/...`；H5 生产环境由 Nginx 反向代理 |
| `TARO_APP_API_TARGET` | 仅 devServer | H5 开发环境 `/api` 代理目标，不注入客户端 |
| `TARO_APP_ID` | 构建期 | 可选，按环境切换小程序 AppID |

## 8. 页面与路由

路由常量统一维护在 [routes.ts](./src/constants/routes.ts)，页面注册见 [app.config.ts](./src/app.config.ts)。

| 页面 | 路径 | 说明 | Tab |
|---|---|---|---|
| 服务列表 | `/pages/index/index` | 浏览可预约服务项目 | ✅ 服务 |
| 服务详情 | `/pages/service/detail/index` | 服务说明、时长、价格、定金 | — |
| 选择时段 | `/pages/booking/index` | 按日期选择可售时段并提交预约 | — |
| 支付定金 | `/pages/payment/index` | 展示待支付预约单并支付 | — |
| 我的预约 | `/pages/order/list/index` | 预约单列表 | ✅ 我的预约 |
| 预约详情 | `/pages/order/detail/index` | 预约单详情与取消 | — |
| 个人中心 | `/pages/mine/index` | 账号信息、退出登录 | ✅ 我的 |
| 登录 | `/pages/login/index` | 手机号 + 密码登录、微信手机号快捷登录 | — |

### 新增页面步骤

1. 在 `src/pages/` 下新建目录，包含 `index.tsx`、`index.config.ts`、`index.scss`；
2. 在 `src/app.config.ts` 的 `pages` 中注册（需要 Tab 时同时补充 `tabBar.list`）；
3. 在 `src/constants/routes.ts` 增加路径常量，页面间跳转统一使用 `ROUTES.*`。

### 登录流程

登录页提供两种登录方式，接口定义见 [auth.ts](./src/services/api/auth.ts)：

1. **手机号 + 密码**：`POST /api/v1/customer/auth/login` 校验通过后返回 `token`；
2. **微信手机号快捷登录**：`<Button open-type="getPhoneNumber">` 获取 `phoneCode`，配合 `Taro.login()` 返回的 `loginCode` 调用 `POST /api/v1/customer/auth/wechat/login`，未注册的手机号由后端自动创建账号（无密码）；
3. 拿到 `token` 后立即调用 `GET /api/v1/customer/auth/me` 拉取顾客资料并写入 `useAuthStore`（后端登录接口只返回 token，顾客信息统一以 `/me` 为准）；
4. H5 端不支持 `getPhoneNumber`，页面会自动提示改用微信小程序。

> 快捷登录依赖后端 `app.wechat` 的 AppID / AppSecret 配置；未配置时后端返回「微信登录未配置，请联系管理员」。

## 9. 工程约定

- **接口契约**：后端统一返回 `{ code, message, data }`，成功 `code` 为 `0` 或 `200`（见 `API_SUCCESS_CODES`）；其余情况由请求层抛出 `ApiError(code, message)`。
- **鉴权**：请求层自动注入 `Authorization: Bearer <token>`（`skipAuth` 可关闭）；收到 401 时清空登录态并 `reLaunch` 到登录页。
- **金额**：全链路以「分」为整数传输与存储，展示统一走 `utils/price.ts`，不做浮点运算。
- **时间**：统一按 `Asia/Shanghai` 时区处理，接口时间以字符串传输。
- **路径别名**：`@/` 指向 `src/`，TS 与 Webpack 均已配置。
- **样式**：设计令牌为 CSS 变量 `--bs-*`（见 `styles/tokens.scss`），跨端通用并支持运行时换肤；尺寸直接写 `px`，构建期按 `designWidth: 750` 自动换算为 `rpx`。令牌同时定义在 `page`（小程序）与 `html`（H5）上，**不要改用 `:root`**——WXSS 不支持该选择器，会被编译成空选择器导致整条变量规则失效。
- **状态管理**：全局状态使用 Zustand（`src/store/`）；页面内局部状态优先用 React Hooks。
- **本地存储**：key 统一以 `bs:` 为前缀（见 `STORAGE_KEYS`），避免与宿主环境冲突。
- **类型**：接口入参/出参类型放在 `src/types/`，业务接口函数放在 `src/services/api/`。

## 10. 构建与部署

### 微信小程序

```bash
npm run build:weapp
```

产物位于 `dist/`，使用微信开发者工具导入后上传发布。

### H5

```bash
npm run build:h5
```

将 `dist/` 静态资源交由 Nginx 托管，并把 `/api` 反向代理到后端（与 PTD 部署方案一致）：

```nginx
server {
    listen 80;
    server_name wx.example.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://app:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 11. 质量校验

提交前建议执行：

```bash
npm run typecheck && npm run lint && npm run lint:style && npm run build:weapp && npm run build:h5
```

## 12. 后续计划

- [ ] 接口层：按 PRD 补充登录、服务列表、可售时段、预约、支付、取消等接口定义
- [ ] 服务列表 / 详情页接入真实数据
- [ ] 时段选择与库存余量展示，对接预约创建
- [ ] 模拟支付 + 支付结果轮询
- [ ] 我的预约列表 / 详情 / 取消（含 24 小时规则提示）
- [ ] TabBar 图标与品牌视觉资源
- [ ] 多端适配回归（微信小程序、移动 H5）

## 13. 相关文档

- [README-PRD.md](./README-PRD.md)：产品需求文档（角色、流程、业务规则、验收标准）
- [README-PTD.md](./README-PTD.md)：项目技术文档（整体架构、数据模型、API 契约、部署方案）
