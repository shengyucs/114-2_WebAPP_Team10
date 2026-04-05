# Team10_Week5_Report

## 練習了哪些當週上課的主題
url 委派
參數傳遞
template
GET(search)
POST(edit)

## 相關的程式技術
資料庫查詢：
   - filter(text__icontains=query) 實作模糊搜尋。
   - get_object_or_404() 安全取得單一物件。
HTTP 請求處理：
   - 區分 request.GET 與 request.POST 的應用場景。
   - 使用 redirect() 實作 Post/Redirect/Get 模式，避免重複送出表單。
Template 進階應用：
   - 使用 {{ request.GET.q|default:'' }} 處理搜尋關鍵字。


## 組員分工情況_第10組
喻笙  33%: django製作
涂家赫 33%: django製作
林劭宇 33%: django製作