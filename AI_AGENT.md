# AI Agent Global Guide

> ⚠️ **AI Agent 必讀** — 此文件是 AI 助手在任何開發任務開始前的必讀指南。
>
> **確認步驟**：
>
> 1. 完整閱讀此文件
> 2. 閱讀 `AI_CONTEXT.md`（項目邊界與規範）
> 3. 閱讀 `docs/ai-prompts.md`（開發指令模板）
> 4. 回覆：**「✅ AI Agent 指南已確認，已讀 AI_CONTEXT.md 與 ai-prompts.md，準備接受任務」**
> 5. 之後的每個任務都應按照 `ai-prompts.md` 中的相應模板進行

---

Welcome! This document is the primary entry point for AI Agents working on the **Dynamic Status Node Calculator** project.

## 🎯 Project Mission

Build a flexible, WYSIWYG node-based calculator to visualize and compute complex status additions (e.g., RPG stats, buffs, logic gates).

## 🗺️ Project Map

- **Frontend**: `/frontend` (React Flow + Zustand)
- **Backend**: `/backend` (Node.js + Express + MongoDB)
- **Shared Types**: `/shared` (Source of truth for TS interfaces)
- **AI Documentation**: `/ai_docs` (Detailed technical guides)

## � 必讀文件 (AI Agent 開始工作前必讀)

按以下順序閱讀：

1. **[ai_docs/AI_CONTEXT.md](./ai_docs/AI_CONTEXT.md)** — 項目邊界與全局約束
   - 項目名稱、技術棧、禁止事項
   - 業務鐵律：數值計算無預設非零值
   - 型別安全要求

2. **[docs/ai-prompts.md](./docs/ai-prompts.md)** — AI 開發指令模板（必讀）
   - 6 個標準開發模板
   - 測試驅動開發 (TDD) 工作流程
   - 最佳實踐與禁止事項

## 🛠️ Essential Commands

- `npm run doctor`: Check if your environment meets the requirements.
- `npm run dev`: Start local development (Hybrid mode).
- `npm run docker:dev`: Start full-stack development in Docker.

## 🚨 開發鐵律（必須遵守）

### 型別與代碼品質

1. **嚴格型別檢查**：禁止使用 `any` 型別
2. **型別優先**：修改任何功能前，先在 `/shared/types.ts` 中定義型別
3. **無 Linting 錯誤**：提交前確保 ESLint 與 Prettier 通過
4. **單元測試覆蓋**：所有核心邏輯必須有單元測試，覆蓋邊界條件

### 業務邏輯

5. **預設值鐵律**：數值計算引擎絕對不能有預設非 0 數值
   - 若無輸入，預設為 0
   - 任何未定義的節點值 = 0

### 版本控制

6. **分支策略**：
   - 禁止在 `main` 分支直接開發
   - 每個功能建立 `feature/xxx` 分支
   - 提交前確保分支來自最新的 `main`

7. **提交信息**：
   - 格式：`feat/fix/refactor: [簡潔描述]`
   - 包含對應的任務編號（如有）
   - Husky 會自動執行排版與語法檢查

### 環境與測試

8. **環境完整性**：變更必須在以下兩種環境都能正常運作：
   - 本地開發環境（`npm run dev`）
   - Docker 完整棧（`npm run docker:dev`）

9. **測試執行**：
   - 修改後執行：`npm run test`（前端）
   - 修改後執行：`npm run test`（後端）
   - 所有測試必須通過（綠燈）

10. **代碼審查歷史**：重構核心系統前，先查閱 `ai_docs` 中的過往技術決策

---

## 🔄 標準開發流程（AI Agent 必須遵循）

### Phase 1: 準備工作

```bash
# 1. 從 GitHub 拉取最新代碼
git checkout main
git pull origin main

# 2. 啟動開發環境
npm run dev
# 或
npm run docker:dev
```

### Phase 2: 功能開發 (使用 ai-prompts.md 的模板)

**步驟 A：建立功能分支**

```bash
git checkout -b feature/your-feature-name
```

**步驟 B：使用模板一 - 編寫單元測試**

- AI 根據 `ai-prompts.md` 的「模板一：測試驅動開發」生成測試
- 執行測試，確認失敗（紅燈 🔴）

**步驟 C：使用模板二 - 實現功能邏輯**

- AI 根據 `ai-prompts.md` 的「模板二：實現功能邏輯」生成實現
- 執行測試，確認通過（綠燈 🟢）
- 若測試失敗，使用「模板三：錯誤修復」反覆迭代

**步驟 D：驗證與清理**

```bash
npm run test          # 執行所有測試
npm run lint          # 檢查代碼風格（自動修復）
npm run type-check    # TypeScript 型別檢查
```

### Phase 3: 版本控制與審查

**步驟 E：提交代碼**

```bash
git add .
git commit -m "feat: [簡潔功能描述]"
# Husky 會自動執行 Prettier 與 ESLint
# 如果被攔截，修復問題後重新提交
```

**步驟 F：推送與發起 Pull Request**

```bash
git push origin feature/your-feature-name
```

- 在 GitHub 上建立 Pull Request
- 清楚描述實現了什麼功能
- 指定兩位組員進行代碼審查

**步驟 G：代碼審查**

- 審查者使用 `ai-prompts.md` 的「模板四：代碼審查輔助」
- 若有疑慮，可將代碼片段丟給 AI 輔助解讀
- 確認邏輯無誤後同意合併

**步驟 H：合併與完成**

```bash
# 審查通過後，在 GitHub 上合併到 main
# 本地更新
git checkout main
git pull origin main
# 準備下一個功能開發（回到 Phase 1）
```

---

## 🎯 AI Agent 在各個階段的職責

| 階段     | AI 職責                | 使用模板       |
| -------- | ---------------------- | -------------- |
| 需求分析 | 理解需求、提出邊界條件 | 無（溝通階段） |
| 測試設計 | 根據需求編寫單元測試   | 模板一         |
| 功能實現 | 編寫使測試通過的代碼   | 模板二         |
| 錯誤修復 | 根據失敗訊息診斷並修復 | 模板三         |
| 代碼審查 | 協助解讀複雜代碼邏輯   | 模板四         |
| 代碼改進 | 優化結構、性能、可讀性 | 模板五         |
| API 集成 | 連接前後端通信         | 模板六         |

---

## ⚠️ AI Agent 禁止事項

- ❌ **不要跳過單元測試**直接寫功能
- ❌ **不要使用 `any` 型別**或禁用 TypeScript 檢查
- ❌ **不要設置預設非零數值**（核心業務鐵律）
- ❌ **不要在 `main` 分支直接開發**
- ❌ **不要忽視 Linting 錯誤**，必須通過自動檢查
- ❌ **不要修改 `shared/types.ts` 以外的型別定義方式**
- ❌ **不要超出 `AI_CONTEXT.md` 的項目邊界**

---

## 📖 快速參考

### 常用命令

```bash
npm run init           # 初始化整個項目
npm run doctor         # 檢查環境
npm run dev            # 本地開發模式
npm run docker:dev     # Docker 完整棧開發
npm run test           # 執行測試
npm run lint           # 檢查與修復代碼風格
npm run type-check     # TypeScript 型別檢查
```

### 文件位置

- 前端代碼：`/frontend/src`
- 後端代碼：`/backend/src`
- 共享型別：`/shared/types.ts` ⭐ 重要
- 測試文件：`src/__tests__` 或 `*.test.ts`
- AI 文檔：`/ai_docs` 與 `docs/`

---

## 📞 遇到問題

1. **型別不確定**：查閱 `/shared/types.ts`
2. **測試失敗**：檢查邊界條件，使用模板三修復
3. **業務邏輯疑慮**：查閱 `/ai_docs` 中的相關決策
4. **環境問題**：執行 `npm run doctor`
5. **需要幫助**：將完整錯誤訊息與上下文提供給 AI

---

_Last Updated: 2026-05-15 by Development Team_
