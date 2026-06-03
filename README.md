# Dynamic Status Node Calculator

一個基於 React Flow 的動態數值節點計算器，用於 RPG 數值加成與邏輯公式的可視化拖拽與即時計算。
本專案採用 **Stateless & Database-less (無狀態與無資料庫)** 的去中心化架構，所有模組皆透過前端進行 LZ-String 壓縮分享以及 Google Drive 雲端儲存進行 UGC 共享。

---

## 🛠 技術棧 (Tech Stack)

- **前端**: React 19, Vite, TypeScript, React Flow, Zustand, Tailwind CSS
- **後端**: Node.js, Express, Socket.io (去中心化、無狀態的高速計算微服務)
- **資料庫/儲存**: **完全無資料庫 (Database-less)**
  - 匿名分享：前端利用 `lz-string` 將圖表 JSON 狀態壓縮為 URL-safe Base64 網址雜湊 (`#/s/...`)。
  - 雲端備份：使用者可登入 Google 帳號，直接讀取/存檔至個人 Google Drive，並可一鍵設定對外公開讀取權限分享 (`#/drive/...`)。
- **環境與工具**: Husky (Git Hooks), Vitest (測試框架), ESLint & Prettier (代碼規範), Docker (容器化配置)

---

## 🚀 快速開始 (Quick Start)

對於新加入的開發者，請依照以下步驟建置本地開發環境：

### 1. 基礎環境檢查

確保您的電腦已安裝：

- **Node.js** (建議 v20 或以上)
- **Git**
- _(選用)_ **Docker Desktop** (僅當您想以全容器化模式啟動服務時需要，本地開發模式已不需安裝 Docker)

### 2. 初始化專案

在專案根目錄執行以下指令，這會自動為您安裝所有模組依賴（根目錄、前端、後端）、設定環境變數模板，並自動執行開發環境健康檢查：

```bash
npm run init
```

### 3. 啟動開發環境

#### 本地開發模式 (極速啟動，推薦)

執行以下指令，系統會同時啟動本地的前端開發伺服器與後端計算微服務（不需啟動任何 Docker 容器或資料庫）：

```bash
npm run dev
```

- 前端網址：`http://localhost:5173/`
- 後端網址：`http://localhost:5000/`

#### 全容器 Docker 模式 (環境一致性測試)

執行以下指令，會在 Docker 容器中啟動前後端服務，並自動建立內部通訊網路：

```bash
npm run docker:dev
```

---

## 📂 資料夾結構 (Project Structure)

```text
.
├── frontend/               # 前端專案 (React + Vite)
│   ├── src/
│   │   ├── components/     # UI 元件 (Canvas, InspectorPanel, Toolbox 等)
│   │   ├── services/       # 外部服務 (WebSocket, GoogleDrive 串接)
│   │   ├── store/          # Zustand 全域狀態管理 (前端狀態與 Google Drive 狀態)
│   │   ├── test/           # 前端測試案例 (含分享、循環阻擋等驗證)
│   │   └── utils/          # 輔助函式 (如前端 DFS 循環依賴偵測)
├── backend/                # 後端專案 (Node.js + Express)
│   ├── src/
│   │   ├── utils/          # 後端計算引擎 (Kahn 拓撲排序、RPG 數值加算/乘算核心)
│   │   └── index.ts        # WebSocket 監聽與計算分發
├── shared/                 # 前後端共用型別定義 (TypeScript Interfaces - 唯一事實來源)
├── scripts/                # 專案自動化維護腳本 (init, doctor 檢查)
├── reference/              # 開發規格書與實作計畫存檔
└── docker-compose.yml      # Docker 容器堆疊配置 (Frontend, Backend)
```

---

## 📜 常用指令 (Available Scripts)

您可以在專案根目錄使用以下便捷指令：

| 指令                   | 描述                                                         |
| :--------------------- | :----------------------------------------------------------- |
| `npm run init`         | 一鍵初始化環境（安裝所有目錄套件、配置環境變數與 Git Hooks） |
| `npm run doctor`       | 檢查本機開發環境與套件完整性                                 |
| `npm run dev`          | 同時啟動本地前端 (Vite) 與後端 (Express) 開發服務            |
| `npm test`             | **執行完整測試**（會同時執行前端與後端的 Vitest 測試套件）   |
| `npm run docker:dev`   | 啟動 Docker 全容器開發環境並於終端機輸出 Logs                |
| `npm run docker:up`    | 背景啟動 Docker 全容器環境                                   |
| `npm run docker:down`  | 停止並清理 Docker 容器環境                                   |
| `npm run dev:frontend` | 僅啟動前端開發伺服器                                         |
| `npm run dev:backend`  | 僅啟動後端計算微服務                                         |

---

## 🤝 開發與 Git 提交規範

- **Git 分支隔離**: 嚴禁直接提交至 `main` 分支。請使用 `feat/`、`fix/` 或 `refactor/` 作為前綴建立開發分支。
- **Lint 與自動排版**: 專案已配置 Husky 與 lint-staged，每次 `git commit` 時會自動針對 staged 檔案執行 Prettier 排版與 ESLint 靜態檢查，有任何 Warnings 將無法提交。
- **型別安全**: 專案設定為 Strict TypeScript 模式，**嚴禁使用 `any`**（請使用 `unknown` 或宣告具體介面）。
- **TDD 優先**: 後端的核心算法或新加入的計算邏輯，請務必先撰寫測試案例再進行實作，維持 100% 的路徑覆蓋率。
