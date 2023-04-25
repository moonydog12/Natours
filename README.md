# Express.js project - Natours

## Middleware

Receiving request 、 Sending response 循環中執行的 function

- express.js 使用 middleware 來操作 req/res object
- 在 express.js 中大部分 function 都是 middleware, ex.路由制定
- 程式碼根據在檔案中的順序執行 (A pipeline)
- 要記得執行參數提供的 `next()` function 來連接多個 middleware
- 通常會把 global middleware 放在程式碼最上面(別忘了 middleware 根據檔案順序執行，放在上層才不會因為回傳 response 導致失效)

> 💡
> [Express doc - Middleware](https://expressjs.com/en/guide/writing-middleware.html)

## MVC Architecture

- MODEL(商業邏輯)

  解決商業需求的程式碼，和商業需求直接相關(嘗試解決的商業問題、客戶需求)。
  例子:

  - 在資料庫建立一個新的資料
  - 驗證使用者資訊
  - 檢查使用者是否存在、密碼等...
  - 限制使用者權限

- CONTROLLER(程式邏輯)

  - 和程式執行(application implementation)相關的程式碼，和商業問題較無關聯
  - 關注點在管理 request 、 response
  - 連接商業邏輯和表現層的橋樑

- VIEW

  表現層邏輯、模板

> Fat models/thin controllers: 把邏輯集中在 MODEL,保持 CONTROLLER 簡單、容易管理。
