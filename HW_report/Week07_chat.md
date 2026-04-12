# 涂家赫
幫我在目前的 mainsite 專案中建立一個「帳號登入系統」，要求如下：

1. 使用者認證系統 (Auth System)：

資料庫連動：使用 Django 內建的 User Model 儲存帳號密碼

功能實作：在 views.py 中實作 login_view、logout_view 與 register_view。

網址委派：在 urls.py 中設定對應的路由，並展示網址反解析（Reverse Resolution）的應用。

2. 存取控制與資料隔離 (Access Control)：

登入驗證：在首頁view中使用 request.user.is_authenticated 判斷登入狀態。

資料過濾：修改 Task 模型，增加 user = ForeignKey(User) 欄位，確保使用者登入後「只能看到屬於自己的任務」（使用 .filter(user=request.user)）。

3. Session 與額外進階功能：

狀態記憶 (Session)：利用 Django Session 實作一個「最後登入時間」功能，並在模板中顯示。

訊息框架 (Messages Framework)：登入或註冊成功後，使用 messages.success 跳出提示。




我已經成功在您的 mainsite 專案中實作了完整的帳號登入系統。以下是實作的詳細內容：

1. 使用者認證系統
資料庫連動
修改了 Task 模型，新增 user = models.ForeignKey(User, on_delete=models.CASCADE) 欄位
使用 Django 內建的 User Model 儲存帳號密碼
Views 實作
在 views.py 中實作了三個主要 views：

login_view: 處理登入邏輯，使用 authenticate() 和 login()
logout_view: 處理登出，使用 logout()
register_view: 處理註冊，使用 User.objects.create_user()
網址委派與 Reverse Resolution
在 urls.py 中新增了路由：

模板中使用 {% url 'login' %} 等展示 reverse resolution。

2. 存取控制與資料隔離
登入驗證
所有主要 views（project_page, task_list, meeting_list, task_detail）都檢查 request.user.is_authenticated，未登入者重定向到登入頁面。

資料過濾
修改 _process_task_form 函數，在建立任務時指定 user=request.user
所有任務查詢都使用 .filter(user=request.user) 確保使用者只能看到自己的任務
get_object_or_404 中也加入 user=request.user 檢查
3. Session 與額外進階功能
Session 狀態記憶
在 login_view 中設定：

在模板中顯示最後登入時間。

Messages Framework
登入和註冊成功後使用 messages.success() 顯示提示訊息。

額外實作
模板
建立了 login.html 和 register.html 登入/註冊頁面
修改 index.html 在導航列顯示使用者名稱和登出連結
在主要頁面顯示最後登入時間
資料庫遷移
建立了必要的 migration 檔案
成功應用遷移更新資料庫結構
測試資料
建立了測試使用者（帳號：test，密碼：123456）以便測試功能。

系統現在支援完整的帳號管理，使用者登入後只能存取自己的任務資料，所有功能都按照您的要求實作完成。您可以啟動 Django 伺服器並測試登入系統