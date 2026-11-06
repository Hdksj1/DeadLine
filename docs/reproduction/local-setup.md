# 本地启动与复现

当前目标是复现原型。完整业务与 10 分钟全新环境验证尚未完成。

## 前置环境

- Python 3.11（开发机另有 3.13，项目虚拟环境使用 3.11）。
- Node.js 与 npm；当前成功构建环境为 Node 23.11.1、npm 10.9.2。发布前需追加受支持的 Node LTS 验证。
- MySQL 8.0：仅真实数据库健康检查需要。页面预览、模拟测试和模型解析本身不要求数据库连接成功。

## 安装后端

在仓库根目录打开 PowerShell：

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.lock.txt
```

首次安装可将 `.env.example` 复制为 `.env`；已经配置过时不要覆盖。真实凭据仅填在本机 `.env`。

```powershell
Copy-Item .env.example .env
```

`requirements.txt` 记录直接依赖，`requirements.lock.txt` 记录本机验证环境完整包版本。此锁文件不是跨平台验证声明。

### 可选数据库配置

应用不自动建库或建表。`DB_NAME` 必须是已经存在且账号可访问的库；模板中的 `ddl_radar` 是计划名称，不会自动存在。

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=填已有数据库名
DB_USER=填数据库账号
DB_PASSWORD="填本机密码"
```

`/health/db` 仅执行 `SELECT 1`，不写数据。数据库 1049 表示指定库不存在。配置不完整或连接失败返回 503。未来业务落库使用专用数据库，不能继续向其他应用的库直接建表。

### 可选真实模型配置

```dotenv
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-flash
LLM_API_KEY=填本机密钥
```

解析会向所选模型服务发送正文并可能收费。不要把真实密钥填进前端、README 或提交记录。模型 ID 与服务能力最终以供应商账号实际可用情况为准。

启动后修改 `.env` 需要重启后端：配置已缓存，`--reload` 不保证监测该文件。系统环境变量优先于 `.env`。

## 启动两个服务

终端一，在根目录执行：

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

终端二，在根目录执行：

```powershell
cd frontend
npm ci
npm run dev
```

- 前端：http://127.0.0.1:5173
- Swagger：http://127.0.0.1:8000/docs
- 进程健康：http://127.0.0.1:8000/health
- 数据库健康：http://127.0.0.1:8000/health/db

前端通过 Vite 代理访问 `/api`。后端未启动时，页面仍可显示，但解析无法成功。Vite 仅是开发服务器，生产需要另行部署；登录 UI 不提供认证保护，当前只用于本地原型体验。

## 体验流程

1. 登录页选择“进入演示工作空间”，无需账号。
2. 首页查看演示事项，搜索、筛选，进入详情勾选任务。刷新后恢复初始演示状态。
3. 打开通知解析，填入示例或粘贴公开通知。
4. 配置真实模型密钥并启动后端后，点击解析；核对分类结果与待确认问题。
5. 点击引用，查看对应原文高亮。解析不保存到数据库，暂不能生成真实持久化任务。

## 无密钥验证

后端（在 `backend` 下）：

```powershell
..\.venv\Scripts\python.exe -m pytest -q
..\.venv\Scripts\python.exe -m pip check
```

前端（在 `frontend` 下）：

```powershell
npm run build
```

这些检查模拟模型调用，不连接真实数据库，不代表真实模型效果、邮件投递或 UI 视觉验收通过。

## 发布前仍需补齐

专用数据库初始化与迁移、真实身份验证、业务持久化、提醒调度、邮件配置、通知对比、全新环境计时、端到端和真实试用验证。阶段代码应从对应提交检出查看，但早期阶段的环境与功能不等同于最终版本。
