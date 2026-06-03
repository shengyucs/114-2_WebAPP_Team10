# Dynamic Status Node Calculator

一個基於 React Flow 的動態數值節點計算器，用於 RPG 數值加成與邏輯公式的可視化拖拽與即時計算。
本專案採用 **Stateless & Database-less (無狀態與無資料庫)** 的去中心化架構，所有模組皆透過前端進行 LZ-String 壓縮分享以及 Google Drive 雲端儲存進行 UGC 共享。

---

## 🛠 技術棧 (Tech Stack)

- **前端**: React 19, Vite, TypeScript, React Flow, Zustand, Tailwind CSS
- **後端**: Node.js, Express, Socket.io
- **資料庫/儲存**: **完全無資料庫 (Database-less)**
  - 本地暫存：在未儲存至雲端前，任何節點或連線變更皆會自動備份於瀏覽器 `localStorage` (`rpg_calc_autosave`)，在網頁重整或意外關閉重開時能自動還原。
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
- _(選用)_ **Docker** (僅當需要在本地測試生產環境部署或展示時需要，日常開發已不需安裝)

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
└── docker-compose.yml      # Docker 生產環境單一容器配置 (託管前後端)
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
| `npm run docker:up`    | 背景啟動生產環境單一容器 (`http://localhost:5000`)           |
| `npm run docker:down`  | 停止並清理生產環境容器                                       |
| `npm run dev:frontend` | 僅啟動前端開發伺服器                                         |
| `npm run dev:backend`  | 僅啟動後端計算微服務                                         |

---

## 💿 雲端與生產環境部署 (Production Deployment)

為了使專案能夠輕鬆部署於任何伺服器或雲端平台，本專案提供了一個**單一容器 (Single Container)** 的生產環境封裝方案：

1. **靜態資源打包**：在 Docker 構建階段中，前端 React App 會被編譯為靜態檔案。
2. **單一埠口監聽**：後端 Express 伺服器在生產模式 (`NODE_ENV=production`) 下，將自動掛載並託管前端靜態資源，並於單一埠口 `5000` 同時處理網頁服務與 WebSocket 連線。

### 🚀 快速啟動生產環境容器

您只需在安裝有 Docker 的伺服器上執行以下指令：

```bash
# 構建並啟動生產環境容器
docker compose up -d --build
```

啟動完成後，您即可透過以下網址存取完整的應用程式：

- 生產環境網址：`http://localhost:5000/`

> [!NOTE]
> 啟動時可透過環境變數 `PORT` 更改容器內的監聽埠口（預設為 5000）。

---

## 🤝 開發與 Git 提交規範

- **Git 分支隔離**: 嚴禁直接提交至 `main` 分支。請使用 `feat/`、`fix/` 或 `refactor/` 作為前綴建立開發分支。
- **Lint 與自動排版**: 專案已配置 Husky 與 lint-staged，每次 `git commit` 時會自動針對 staged 檔案執行 Prettier 排版與 ESLint 靜態檢查，有任何 Warnings 將無法提交。
- **型別安全**: 專案設定為 Strict TypeScript 模式，**嚴禁使用 `any`**（請使用 `unknown` 或宣告具體介面）。
- **TDD 優先**: 後端的核心算法或新加入的計算邏輯，請務必先撰寫測試案例再進行實作，維持 100% 的路徑覆蓋率。
