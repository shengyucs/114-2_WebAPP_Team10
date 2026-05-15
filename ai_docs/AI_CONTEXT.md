# AI_CONTEXT.md

## 目的

這份文件是專為 AI agent 設計的上下文文檔。在開始任何實作任務之前，agent 必須先閱讀並確認理解本文件的所有內容。本文件定義了專案的邊界、規則和約束，確保所有生成的代碼符合專案標準。

## 專案名稱

Dynamic Status Node Calculator

## 開發限制

1. 前端使用 React + Zustand + Tailwind CSS。
2. 後端使用 Node.js + Express + Socket.io。
3. 資料庫為 MongoDB。
4. 嚴格遵守 TypeScript，禁用任何未定義的型別。
5. **業務邏輯鐵律**：數值計算引擎絕對不可有任何預設非 0 數值（若無輸入，預設值就是 0）。

## 技術棧

- 前端：React 18+, TypeScript, Zustand, React Flow, Tailwind CSS
- 後端：Node.js, Express, Socket.io, TypeScript
- 資料庫：MongoDB with Mongoose
- 共享層：TypeScript 類型定義

## 架構原則

- 業務邏輯僅在後端實現，前端僅負責 UI 和狀態管理
- 無循環依賴，DAG 拓撲結構
- 乘法區規則：區內相加，區間相乘
- 嚴格 TypeScript，無 any 類型
- AI 友好的文檔結構

## 實作前檢查清單

在開始實作任何功能之前，請確認：

- [ ] 已閱讀並理解本 AI_CONTEXT.md 的所有內容
- [ ] 確認技術棧選擇正確
- [ ] 確保業務邏輯不會放在前端
- [ ] 檢查是否有硬編碼值
- [ ] 驗證類型定義在 shared/types.ts 中

## 常見錯誤避免

- 不要在前端放置業務邏輯
- 不要使用硬編碼值
- 確保所有類型都定義在 shared/types.ts
- 測試驅動開發優先
