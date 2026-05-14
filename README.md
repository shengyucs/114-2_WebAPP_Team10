# Dynamic Status Node Calculator

一個基於 React Flow 的動態數值節點計算器，用於可視化與計算複雜的狀態加成與邏輯。

## 🛠 技術棧 (Tech Stack)

- **前端**: React, Vite, TypeScript, React Flow, Zustand, Tailwind CSS
- **後端**: Node.js, Express, Socket.io, Mongoose (MongoDB)
- **環境**: Docker (Database), Husky (Git Hooks)

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

執行以下指令，系統會自動啟動 **本地資料庫 (Docker)** 以及 **前/後端開發伺服器**：

```bash
npm run dev
```

---

## 📂 資料夾結構 (Project Structure)

```text
.
├── frontend/               # 前端專案 (React + Vite)
│   └── src/
│       ├── components/     # UI 元件 (ui/ 與 features/)
│       ├── hooks/          # 自定義 Hooks
│       ├── store/          # Zustand 狀態管理
│       └── pages/          # 頁面級組件
├── backend/                # 後端專案 (Node.js + Express)
│   └── src/
│       ├── models/         # MongoDB Models
│       ├── controllers/    # Request Handlers
│       └── routes/         # API 路由
├── scripts/                # 自動化開發腳本
└── docker-compose.yml      # Docker 配置 (MongoDB)
```

---

## 📜 常用指令 (Available Scripts)

| 指令                   | 描述                         |
| :--------------------- | :--------------------------- |
| `npm run init`         | 一鍵初始化環境（安裝、配置） |
| `npm run doctor`       | 檢查開發環境依賴是否齊全     |
| `npm run dev`          | 同時啟動前/後端開發伺服器    |
| `npm run dev:frontend` | 僅啟動前端                   |
| `npm run dev:backend`  | 僅啟動後端                   |
| `npm run db:up`        | 啟動本地 MongoDB 容器        |
| `npm run db:down`      | 停止本地 MongoDB 容器        |

---

## 🤝 開發規範

- **Git 分支**: 請不要直接在 `main` 分支開發。請建立 `feature/your-feature-name` 分支。
- **代碼風格**: 專案已整合 Prettier 與 ESLint，會在 `git commit` 時自動檢查與排版。
- **嚴格型別**: 專案禁止使用 `any` 型別。若使用 `any` 將無法通過 Commit 檢查。
