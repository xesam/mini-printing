# mini-printing

微信原生小程序，统一管理飞鹅、芯烨、商鹏三家云打印厂商的账号、设备和打印操作。

## 项目边界

- 微信开发者工具项目根目录是仓库根目录；`project.config.json` 的 `miniprogramRoot` 为 `miniprogram/`。
- 小程序源码、页面和配置位于 `miniprogram/`；领域模块位于 `miniprogram/modules/`；页面位于 `miniprogram/pages/`。
- 厂商账号会包含 appid、secret 等敏感信息。真实 appid 和开发者工具本地设置只放在被忽略的 `project.private.config.json`，不要写入 `project.config.json` 或提交到仓库。
- `README.md`、`docs/` 和本文件中的路径说明必须与仓库实际目录保持一致；修改目录或入口后应同步更新文档。

## 安装与运行

依赖只在 `miniprogram/` 下管理，不要在仓库根目录安装 npm 依赖：

```sh
cd miniprogram
npm install
```

安装后在微信开发者工具中执行“工具 → 构建 npm”，生成 `miniprogram/miniprogram_npm/`。`node_modules/` 和 `miniprogram/miniprogram_npm/` 均不纳入版本控制；缺少构建产物时，`@mini-dev/*`、`@xesam/*` 等 npm 导入无法在开发者工具中编译。

仓库没有可用的命令行测试、lint、构建脚本或 CI。代码改动后的验证方式是：

1. 在微信开发者工具中编译项目，检查编译错误和控制台异常。
2. 使用模拟器覆盖受影响的页面流程。
3. 必要时使用开发者工具预览或真机验证网络请求、存储和厂商接口行为。

## 页面注册与路由

- 新增页面时创建 `miniprogram/pages/<module>/<name>/index.js`、`.json`、`.wxml`、`.wxss`，并在 `miniprogram/app.json` 的 `pages` 数组中注册页面路径。
- 页面必须从 `miniprogram/app/hook/index.js` 导入 `_Page`（通常写成 `import {_Page as Page} ...`），不要直接调用全局 `Page()`。该入口基于 `@mini-dev/hook` 注册全局页面钩子；当前钩子会在页面 `onLoad` 前输出路由日志。
- 如果新增 App 或组件注册，使用同一入口导出的 `_App` / `_Component`，不要直接调用全局 `App()` / `Component()`。
- 新增共享组件放在 `miniprogram/components/<name>/`（`index.js`、`.json`、`.wxml`、`.wxss`），并在 `miniprogram/app.json` 的全局 `usingComponents` 中注册路径 `/components/<name>/index`；组件内部引用其他组件使用相对路径。
- 路由使用 `@mini-dev/router`。App 级路由在 `miniprogram/app/router/index.js` 组装并挂载模块：`main` → `/pages`、`device` → `/pages/device`、`account` → `/pages/account`。帮助路由挂载在 `main` 下，页面名为 `help`，实际路径是 `pages/help/index/index`。
- 模块内跳转时导入对应的 `miniprogram/pages/<module>/router.js`，调用 `router.navigateTo({name, params})` 或 `router.navigateBack()`。
- 跨模块跳转时使用 `getApp().$router.navigateTo({name: ['<module>', '<page>'], params})`。新增模块必须创建路由文件，并在 `miniprogram/app/router/index.js` 中调用 `.use('<module>', router.basePath('/pages/<module>'))`。

## 领域与数据层

- `miniprogram/app/account/index.js` 是账号会话和云厂商客户端入口，负责当前账号切换、读取当前账号以及按厂商创建云客户端。页面和模块应调用 `accountSession.getCurrentCloud()`，不要直接实例化厂商适配器。
- `miniprogram/modules/account/` 负责账号业务和存储；`miniprogram/modules/account/cloud-brand.js` 定义厂商标识。当前厂商适配器依赖为 `@xesam/cloud-vendor-feie`、`@xesam/cloud-vendor-xpyun`、`@xesam/cloud-vendor-spyun`。
- `miniprogram/modules/device/` 负责设备查询、常用设备和打印相关业务；页面通过该模块调用设备能力，不要在页面中重复实现厂商请求或存储逻辑。
- `@xesam/cloud-core` 提供云模型和客户端；`@mini-dev/request-wx` 将请求接到微信网络 API；签名和请求适配集中在 `miniprogram/app/account/index.js`。
- 账号数据通过 `@mini-dev/storage-wx` 保存：账号列表命名空间为 `app.accounts`，当前账号命名空间为 `app.account`，当前值保存为 `{id: account._id}`。修改账号字段或存储格式时必须兼容已有本地数据。

## 文件与代码风格

- 项目现有代码混用 `import` 和 `require()`，不要为了统一格式进行无关改写。
- JavaScript 和 WXSS 使用 4 个空格缩进；保持现有文件的引号、分号和命名风格。
- 共享 WXSS 目前位于 `miniprogram/assets/help.wxss`；页面如需引入，先确认实际文件位置。页面级样式放在对应页面的 `.wxss` 文件中，应用级样式放在 `miniprogram/app.wxss`。
- 不要把临时文件、真实凭据、`node_modules/` 或 `miniprogram/miniprogram_npm/` 加入提交。

## 提交

提交信息使用 `<type>: 中文描述`，例如：

```text
feat: 完善账号切换流程
fix: 修正设备详情页路由
docs: 更新开发说明
```
