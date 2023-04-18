# Express.js project - Natours

## Middleware

Receiving request 、 Sending response 循環中執行的 function

- express.js 使用 middleware 來操作 req/res object
- 在 express.js 中大部分 function 都是 middleware, ex.路由制定
- 程式碼根據在檔案中的順序執行 (A pipeline)
- 要記得執行參數提供的 `next()` function 來連接多個 middleware
- 通常會把 global middleware 放在程式碼最上面(別忘了 middleware 根據檔案順序執行，放在上層才不會因為回傳 response 導致失效)

>💡
> [Express doc - Middleware](https://expressjs.com/en/guide/writing-middleware.html)
