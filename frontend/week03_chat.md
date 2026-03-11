# 喻笙
做成類似notion的排版

加 navigator列

網頁左側也加入一排選單，類似專案，任務，會議這樣

在左側選單的最下方，加入一個小視窗，預留給每日單字api

目前scrollbar會移動除了整個網頁navbar之外的整個網頁，我要讓workspace和todo-list部分分開，並且Daily word也像navbar一樣不會移動。

navbar的style好像跑掉了，最初那種比較好。

現在排版沒問題了。維持排版，將整體加入羅馬美術風格。

調整我的網頁，讓兩個scrollbar會分別移動workspace和todo-list，並且Daily word也像navbar一樣不會移動。

為了實現你的需求，我們需要將網頁佈局調整為「應用程式風格」（App-like layout），即固定外部容器的大小，並讓內部的特定區域（如側邊欄的清單和主區域的工作表）各自擁有獨立的滾動條。同時，利用 Flexbox 佈局確保標題、輸入框和 Daily Word 像導覽列一樣固定不動。

修改說明：

1. 全域滾動控制：在 body 加入 overflow: hidden，防止整個頁面隨內容增長而產生滾動條，這是建立多個獨立滾動區域的前提。

2. 側邊欄固定：側邊欄原本就使用了 flex-direction: column。透過對 sidebar h2 和 .daily-word-widget 設定 flex-shrink: 0，確保它們在空間不足時不會被壓縮，從而達到「固定」在頂部和底部的效果。中間的 sidebar ul 已設定 flex-grow: 1 與 overflow-y: auto，因此只有連結清單會滾動。

3. 主內容區域（Todo-list）調整：將 .main-content 轉為 display: flex 並設定為垂直排列（column）。移除 .main-content 的滾動屬性，改為將 overflow-y: auto 套用在 #taskList 上。這樣一來，頂部的標題（h1）與輸入框（.input-area）會固定在原位，只有下方的清單會獨立滾動。
