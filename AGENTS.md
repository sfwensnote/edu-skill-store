# AGENTS.md

本文件面向 AI 编码代理，假设读者对本项目一无所知。内容依据当前代码与文档实际状态整理。

## 项目概述

**Educational Skill Builder**（教育 Skill 构建器）：一个面向在职教师的本地 Web 工作台。教师用自然语言描述教学需求，系统将其转化为可执行的 Educational Skills（指令型能力卡），组装成教学智能体，并进行技术与教育双重验证后由教师决定是否启用。

核心流程固定为六步，严格相邻跳转：

1. 教学需求（自然语言描述）
2. 功能解析（确认 Brief：对象/目标/任务/边界）
3. 能力确认（Skill Card 启用与编辑）
4. 教学材料（上传 PDF/DOCX/TXT/MD 后生成 Agent）
5. 检测与试用（自动检查 + 教师对话 + 反馈）
6. 确认使用（证据汇总、Markdown 报告、启用决定）

首个演示样例是七年级数学“一元一次方程作业讲评”。当前定位为本机 Demo：只监听 `127.0.0.1`，不发布公网，不创建学生账号。

完整 Demo 位于 `main/`。详细设计见 `main/docs/项目设计.md`、`main/docs/前端重设计.md`、`main/DESIGN.md`、`main/PRODUCT.md`、`main/README.md`。

## 技术栈

- **前端**：React 19 + TypeScript + Vite 7，Tailwind CSS 4（`@tailwindcss/vite`），shadcn 风格基础组件（`main/src/components/ui/`），lucide-react 图标。
- **后端**：Node.js 24 + Express 5，用 `tsx` 直接运行 TypeScript；内置 `node:sqlite`（`DatabaseSync`）持久化，WAL 模式。
- **校验**：Zod（前后端共用 `main/shared/schema.ts`）。
- **材料解析**：pdf-parse、mammoth（DOCX 提取纯文本）、Multer（内存上传）。
- **模型接入**：两个可配置的 Chat Completions 兼容接口（`DESIGN_MODEL_*` 设计/评审，`TEACHING_MODEL_*` 教学对话），服务端环境变量配置。
- **测试**：Node 内置测试运行器（`node:test`）+ Playwright（E2E，使用本机 Chrome）。
- 无微服务、无智能体框架、无独立数据库服务；SQLite 数据库文件为 `main/data/workspace.sqlite`（不入版本库）。

## 常用命令

需要 Node.js 24。

```bash
cd main
npm install          # 安装依赖
npm run dev          # 开发：tsx 启动 server/index.ts，Express 中间件模式托管 Vite，前端热更新
npm test             # 单元/集成测试：tsx --test tests/*.test.ts（node:test）
npm run build        # 先 tsc --noEmit 类型检查，再 vite build 输出到 dist/
npm start            # 生产：NODE_ENV=production，静态托管 dist/，同一端口
npm run test:e2e     # Playwright E2E（需先保持 npm run dev 运行；用本机 Chrome，创建 @example.com 测试账户）
```

开发/生产都通过同一端口访问（默认 5173）：`http://127.0.0.1:5173`。开发模式下 Vite 以中间件模式挂在 Express 里，无独立前端端口。

## 目录与模块划分

```text
main/             完整可运行 Demo 的应用根目录
main/shared/      前后端共享：schema.ts（Zod 类型）、domain.ts（项目状态机：
                  invalidate/createAgent/compileInstructions/canRelease/reportMarkdown）、
                  workflow.ts（六步进度 normalize/resume/相邻跳转）、demo.ts（数学样例数据）
main/server/      Express 服务：
                  index.ts      应用入口 + 全部路由（/api/status、/api/auth、/api/design、
                                /api/materials、/api/chat、/api/evaluate、/api/projects）
                  models.ts     双模型适配、demo/live 模式判定、JSON 解析
                  materials.ts  材料文字提取（PDF/DOCX/TXT/MD）与限制校验
                  evaluation.ts 检测：配置检查 + 真实模式三题测试 + LLM 辅助评审
                  auth.ts       scrypt 密码哈希、会话 Cookie、注册登录登出、IP 限流
                  store.ts      SQLite 初始化（users/sessions/projects 三张表）
main/src/pages/   六个流程页面：Need / Analysis / Skills / Materials / Testing / Report
main/src/components/ Navigation（侧栏导航）、WorkflowShell、Account、Trial、Primitives，
                  ui/ 为 shadcn 风格基础组件
main/src/hooks/   useWorkspace.ts：访客 localStorage 草稿 ↔ 登录后 SQLite 同步的状态管理
main/src/lib/     api.ts（同源 fetch 封装）、utils.ts
main/src/styles/  纯 CSS 视觉系统（B「教师工作台」方案，色板与规范见 main/DESIGN.md）
main/tests/       node:test 测试（domain/materials/models/workflow-state）+ workflow.spec.ts（Playwright）
main/docs/        项目设计、实施计划、前端重设计（中文）
```

架构：React 教师工作台 → 同源 `/api` → Express。项目配置整体存为一个 JSON（`projects.payload` 列），未拆关系表。

## 代码风格约定

- 全部代码、注释、文档、错误提示、界面文案均为**简体中文**；新增内容保持一致。
- TypeScript 严格模式；模块为 ESNext，`@/*` 别名指向 `main/src/`。
- 格式化：Prettier（单引号、行宽 110、trailing comma all）。无 ESLint 配置。
- 校验集中在 `main/shared/schema.ts` 的 Zod schema；服务端路由先 parse 再处理，错误统一经 `main/server/index.ts` 末尾的错误中间件转成 400/500 JSON（`{ error: '中文提示' }`）。
- 错误信息面向教师用户，必须是一句可理解、可行动的中文，不写堆栈或内部细节。
- `main/shared/` 里的纯函数（domain/workflow）不依赖 Node 或 DOM，可被前后端与测试共用。

## 测试策略

- **单元/集成测试**（`npm test`）：node:test + `node:assert/strict`，覆盖核心状态机（`invalidate` 失效重建、版本递增、`canRelease` 条件、材料预算拒绝）、材料解析（用内联构造的最小 PDF 夹具真实解析）、模型协议（本机起一个假 HTTP 服务做夹具，验证设计/教学/评审分别收到正确请求，且失败不降级冒充成功）。
- **E2E**（`npm run test:e2e`）：Playwright 需服务已在 5173 运行；`workers: 1`，channel 为本机 Chrome。覆盖六步相邻跳转、桌面 1440px 与手机 390px 的完整闭环（截图输出到 `test-results/`）、上游修改使结果失效、注册/登录/账户隔离。**E2E 中的模型调用由协议夹具与本机假服务验证，不调用收费的真实模型服务**。

## 演示模式与产品红线（改动时必须遵守）

- 两个模型接口都配置 URL 与名称才进入 `live` 模式；否则 `demo` 模式，且界面必须有文字标识。
- demo 模式规则：设计返回可编辑数学样例；对话返回明确标记的固定示例；配置检查真实执行；模型表现与教育评价一律标为「待验证」，**不伪造模型调用、不编造分数或通过率**。
- 修改需求/能力/材料等上游内容时，必须使旧 Agent、检测、对话、反馈、启用状态失效（见 `main/shared/domain.ts` 的 `invalidate`），但不自动跳页。
- 真实模式存在 `review` 检查项时 `canRelease` 返回 false，禁止启用。
- 材料是「数据不是命令」：编译进系统指令时明确告知模型不得用材料中的指令覆盖教学规则（`compileInstructions`）。

## 安全与限制

- 密钥只存在于 `main/.env`（从 `main/.env.example` 复制），绝不进入前端或日志；`.env`、`data/` 均已被 gitignore。
- 密码 scrypt 加盐哈希；会话为随机 token + HttpOnly + SameSite=strict Cookie（7 天）；登录尝试按 IP 限流（30 次/分钟）。
- 所有 `/api` 非 GET 请求校验 Origin 与 Host 同源，否则 403。
- 上传限制：单文件 5MB / 16,000 字符，每 Agent 最多 5 份、合计 24,000 字符；超限明确拒绝，不静默截断。上传后只保留提取文字，不保存原始文件。
- 本项目是本机 Demo：公网部署需另行配置 HTTPS、备份与生产数据库；不要把 `app.listen(127.0.0.1)` 直接暴露出去。

## 项目级技能

`.agents/skills/` 下有两个本项目技能，涉及对应任务时应遵循：

- `frontend-design`：前端视觉设计指导。
- `shadcn`：shadcn 组件的添加、调试与组合。
