# DDL 雷达前端

React + TypeScript + Vite。包含登录界面、事项总览、通知解析和事项详情。

## 启动

在项目根目录打开终端：

```powershell
cd frontend
npm ci
npm run dev
```

打开 http://127.0.0.1:5173 。默认进入登录页，点击“进入演示工作空间”体验。

后端在另一个终端启动：

```powershell
cd D:\Chuanzhi_competion\backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Vite 开发服务器将 `/api` 代理到本机 8000 端口，不需要放开后端跨域权限。生产部署需要配置同源反向代理，本项目暂未包含部署配置。

## 当前可用范围

- 登录仅为 UI 预览，不验证身份、不存储密码，不构成访问控制。
- 总览和详情使用标注的固定样例。勾选任务只保留在当前页面会话，刷新后重置。
- 通知解析真实调用后端，需要在项目根目录 `.env` 配置 DeepSeek。正文将发送给模型平台，可能产生费用。
- 解析结果点击引用可高亮原文；人工确认、生成任务、数据库保存和邮件发送尚未接入。
- PDF 上传暂不支持。

## 构建检查

```powershell
npm run build
```

该命令执行 TypeScript 检查并生成 `dist/`。模型密钥只在后端配置，不能放入前端或任何 `VITE_` 环境变量。
