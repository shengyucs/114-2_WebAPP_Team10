# 林劭宇

我的任務是新增operater node，在畫面左邊新增一個方塊，當我點擊時，畫面中間的畫布會生成出一個新的方塊，當我選取這個方塊時，右邊會出現簡單的property可以選擇這個方塊要進行的是加減乘除哪一種運算

實作完成
變更的 6 個檔案
檔案 變更內容
shared/types.ts 新增 'operator' 到 type union；新增 operator?: '+' | '-' | '\*' | '/'
frontend/src/store/useStore.ts addNode('operator') 自動帶入預設 operator: '+'
frontend/src/components/nodes/OperatorNode.tsx 新建：amber 橘色主題，Body 顯示大型運算符號，左/右各一個 handle
frontend/src/components/Canvas.tsx 註冊 operator: OperatorNode；MiniMap 加入橘色配色
frontend/src/App.tsx Toolbox 新增 Operator Node 按鈕（amber 色系）
frontend/src/components/InspectorPanel.tsx 選取 operator node 時，Inspector 最上方出現 Operation 區塊，4 個按鈕對應 + − × ÷，active 狀態藍色 highlight
