# Dynamic Status Node Calculator

一個基於 React Flow 的動態數值節點計算器，用於可視化與計算複雜的狀態加成與邏輯。

## 🛠 技術棧 (Tech Stack)

- **前端**: React, Vite, TypeScript, React Flow, Zustand, Tailwind CSS
- **後端**: Node.js, Express, Socket.io, Mongoose (MongoDB)
- **共享**: TypeScript Interfaces (Single Source of Truth)
- **環境**: Docker (Database), Husky (Git Hooks), Vitest (Testing)

---

## 🚀 快速開始 (Quick Start)

對於新加入的開發者，請依照以下步驟建置開發環境：

### 1. 基礎環境檢查

確保您的電腦已安裝：

- **Node.js** (v18+)
- **Git**
- **Docker Desktop** (用於本地資料庫)

### 2. 初始化專案

在專案根目錄執行以下指令，這會自動安裝所有依賴（根目錄、前端、後端）並設定環境變數：

```bash
npm run init
```

### 3. 啟動開發環境

你有兩種方式啟動開發環境：

#### 選項 A：本地開發模式 (建議用於快速開發與偵錯)

執行以下指令，系統會自動啟動 **本地資料庫 (Docker)** 以及 **前/後端開發伺服器**：

```bash
npm run dev
```

#### 選項 B：全容器 Docker 模式 (建議用於環境一致性測試)

執行以下指令，整個專案（含前、後端與資料庫）都會在 Docker 容器中執行：

```bash
npm run docker:dev
```

> **提示**：Docker 模式已配置好 **Hot-reload**，修改本地程式碼會即時反映。

---

## 📂 資料夾結構 (Project Structure)

```text
.
├── frontend/               # 前端專案 (React + Vite)
│   └── src/
│       ├── components/     # UI 元件
│       ├── store/          # Zustand 狀態管理
│       ├── test/           # 測試配置與 Setup
│       └── App.test.tsx    # 基礎渲染測試
├── backend/                # 後端專案 (Node.js + Express)
├── shared/                 # 前後端共用型別 (TypeScript Interfaces)
├── scripts/                # 自動化開發腳本
├── ai_docs/                # AI Agent 專用技術文件
├── AI_AGENT.md             # AI Agent 全局開發導引
└── docker-compose.yml      # Docker 配置 (MongoDB, Frontend, Backend)
```

---

## 📜 常用指令 (Available Scripts)

| 指令                   | 描述                         |
| :--------------------- | :--------------------------- |
| `npm run init`         | 一鍵初始化環境（安裝、配置） |
| `npm run doctor`       | 檢查開發環境依賴是否齊全     |
| `npm run dev`          | 同時啟動前/後端開發伺服器    |
| `npm run docker:dev`   | 啟動全容器開發環境 (附 Log)  |
| `npm run docker:up`    | 背景啟動全容器環境           |
| `npm run docker:down`  | 停止並移除所有容器           |
| `npm run dev:frontend` | 僅啟動前端                   |
| `npm run dev:backend`  | 僅啟動後端                   |
| `npm test`             | 執行前端單元測試             |
| `npm run db:up`        | 啟動本地 MongoDB 容器        |
| `npm run db:down`      | 停止本地 MongoDB 容器        |

---

## 🤝 開發規範

- **Git 分支**: 請不要直接在 `main` 分支開發。請建立 `feature/your-feature-name` 分支。
- **代碼風格**: 專案已整合 Prettier 與 ESLint，會在 `git commit` 時自動檢查與排版。
- **嚴格型別**: 專案禁止使用 `any` 型別。若使用 `any` 將無法通過 Commit 檢查。
