# 林劭宇
幫我把localStorage改成sqlite

先把前端從 localStorage 改成 Django POST，後端改成 sqlite CRUD。

確認修改後沒有語法問題。

接著確認目前可用的 Python 環境。

已經改成 sqlite 儲存：

views.py
新增 toggle / delete / add POST 處理
使用 Task.objects.create()、task.save()、task.delete()
index.html
移除 localStorage
改成伺服器端表單提交
直接渲染 tasks / daily_tasks

幫我製作任務以及會議的網頁，跟任務一樣用相同的模板

現在直接更新功能與模板。

模板也同步改成同一個 layout，可切換任務與會議。

現在驗證 Django 設定與新模型，並建立遷移檔。

已完成：

models.py：新增 Meeting model
views.py：新增 meeting_list，共用同一個 index.html
urls.py：新增 /meetings/，並保留 /tasks/（/ 也是任務頁）
index.html：改成同一模板，兩種模式共用

想要在main content加一張圖片，幫我把logo.png加在"任務"左邊

找到 logo.png，直接把它加到任務頁的主內容標題左側。

Edited
index.html+7-0
已將 logo.png 加到主內容「任務」標題左側：

只在 page != 'meeting' 時顯示
使用 {% static 'logo.png' %}
已排成左圖右字的標題區塊

幫我套用12欄網格設計，側邊欄4格，內容8格

先看現在的 CSS 版型，確認要加哪個 grid class。

準備用 CSS grid 取代目前 flex 版型，讓側邊欄佔 4 格、內容佔 8 格。

我會再加一個響應式斷點，讓手機時改為單欄。

已套用 12 欄網格：

app-container 改成 display: grid; grid-template-columns: repeat(12, minmax(0,1fr));
sidebar 佔 4 格
main-content 佔 8 格
加上響應式：寬度小於 960px 時改成單欄

幫我加入人性化時間，顯示任務是多久以前新增的

先加入 humanize App，然後在任務列表顯示時間。

修正重複顯示，並補上任務時間的樣式。

已加上人性化時間顯示：

settings.py：加入 django.contrib.humanize
index.html：在任務項目下顯示 {{ task.created_at|timesince }} 前
index_style.css：新增 .task-time 樣式
現在每個任務會顯示「xx 前」的新增時間。