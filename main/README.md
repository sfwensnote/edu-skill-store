# 教学助手

面向教师的教育智能体设计、检测与运行管理平台。教师用自然语言描述“希望 AI 怎样教学生”，系统将其整理为可解释、可检测的教学技能（Educational Skills）。

本目录是 Demo 的应用根目录，所有开发、构建和测试命令均在这里执行。

## 当前版本

当前代码对应的完整流程、数据逻辑和实现边界见 [项目详细说明](docs/项目详细说明.md)。

前端已重构为：助手库 → 单页教学设计器 → Skill 逐项生成、选择与调整 → 逐项确认检测 → 投入使用 → 运行记录与报告。

创建阶段不包含教学材料、六步向导、知识库或模型参数。当前页面使用前端演示数据跑通交互；原有 Express、SQLite、认证和模型代码保留，新的平台 API 将在后续阶段接入。

## 运行

需要 Node.js 24。

```bash
npm install
npm run dev
```

打开 [http://127.0.0.1:5173/#/library](http://127.0.0.1:5173/#/library)。前端与 API 共用端口 5173。

```bash
npm test
npm run build
npm run test:e2e
```

端到端测试覆盖桌面助手库、创建与 Skill 调整、生成/检测/启用闭环，以及 390px 移动端页签和无横向溢出。

## 目录

```text
shared/                  领域类型与状态规则
server/                  Express、SQLite、认证与模型适配
src/components/          顶部导航与基础组件
src/features/library/    助手库和我的助手
src/features/designer/   教学设计器与 Skill 设计稿
src/features/testing/    自动检测工作区
src/features/usage/      使用、日志和报告
src/styles/              视觉变量与页面样式
tests/                   领域测试与 Playwright 全流程测试
```

完整视觉规则见 [DESIGN.md](DESIGN.md)，前端结构见 [docs/前端重设计.md](docs/前端重设计.md)。
