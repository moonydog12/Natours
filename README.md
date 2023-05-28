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

## Authentication,AUthorization & Security

### 使用 JWT(JSON Web Token)做身分驗證

使用 Session 在 Server 端存使用者資訊，違反了 Rest API 無狀態(stateless)的原則。

因此這個專案採用 JWT 取代傳統 Session 來做使用者的身分驗證，來保持無狀態。

流程如下:

1. Client 端發出一個 Post 請求(挾帶 email、密碼)給 server
2. Server 端透過資料庫確認，製造一個 unique JWT
3. Server 回傳 JWT 給使用者
4. Client 端儲存 JWT(cookie 或 localStorage)
5. Client 端嘗試存取受保護的路由
6. Server 端檢查 JWT，如果通過檢查(verifying)，允許 Client 端存取路由

示意圖:

![JWT process flow chart](./assets/jwt-flow.jpg 'JWT flow')

## Best practices

安全性對於應用程式而言是至關重要的一環，但是關於安全性的技術深度及攻擊手段很多，無法在課程內容中全部涵蓋。因此老師針對了較常見的攻擊方式，提供一些提升程式安全性的實踐。

![Best Practices](./assets/best-practices.jpg 'Best Practices')

## Data Modeling

### Types of relationships between data

**One to One:**

ex.一部電影對應一個名字。

**One to Many:**

- 1:Few

  ex:一部電影對應多的獎項。

- 1:Many

  實務上較常出現的資料表關聯。

  ex:一部電影可能對應上千條評論。

- 1:Ton

**One to Many:**

ex.一部電影會有多位演員，演員會主演多部電影。

### Referencing v.s Embedding

**Referenced/Normalized**

將相關數據集(dataset)和文檔(document)分開，用 Parent document 的相關欄位(例如 ID)去索引 Child documents 的資料。

也稱為 Child Referencing。

優點:輕易 query 每一個 document。

缺點:需要多個 query 才能找到資料，降低效能。

**Embedded/Denormalized**

把 child documents 的資料都存放在同一個 main document。

優點:提升效能(做一次 query 就拿到全部資料)。

缺點:不能單獨 query embedded data。

### Framework to decide when to Embed & When to Reference

|                      |                                           Embedding |                  Referencing                   |
| :------------------- | --------------------------------------------------: | :--------------------------------------------: |
| Relationship type    |                                     1:FEW<br>1:Many |          1:Many<br>1:Ton<br>Many:Many          |
| Data access patterns | Data is mostly read<br>Data does not change quickly |             Data is updated a lot              |
| Data closeness       |                     Datasets really belong together | Frequently need to query datasets on their own |

### Types of referencing

**Child referencing**

適用情形: 1 to Few

例子:

```json
// app
{
  "_id": 23,
  "app": "My Movie Database",
  "logs": [
    1,
    2,
    // ...Millions of log ID
    28273927
  ]
}

// log
{
  "_id": 1,
  "type": "error",
  "timestamp":1412184927
}
```

**Parent referencing**

適用情形: 1 to Many / 1 to Ton

例子:

```json
// app
{
  "_id": 23,
  "app": "My Movie Database",
}

// log
{
  "_id": 1,
  "app":23,
  "type": "error",
  "timestamp":1412184927
}
```

**Two way referencing**

適用情形: Many to Many

例子:

```json
// movie
{
  "_id": 23,
  "title": "Little mermaid",
  "releaseYear": 2023,
  "actors": [
    87
    // and many more
  ]
}

// actor

{
  "_id": 87,
  "name": "Halle Lynn Bailey",
  "age": 23,
  "movies": [
    23
    // and many more
  ]
}
```

### Summary

1. **根據 app 查詢、更新資料的方式建構資料表關係**。換句話說，首先透過 app 的 use case 定義出問題，再選擇最有效率解決問題的結構。
2. mongoDB 通常情況偏好 embedding，尤其關係為 1 to Few 或 1 to Many。
3. 使用 referencing 當關係為 1 to Ton 或是 Many to Many。
4. 偏好 referencing 當資料更新頻繁或是經常需要讀取單筆資料。
5. 偏好 embedding 當資料多數時間用來讀取，以及 datasets 性質接近。
6. 不要讓 arrays 無限增長，因此，若需要正規化，使用 child referencing 來表示 1 to Many 關係，parent referencing 表示 1 To Ton 關係。
7. 使用 Two-way referencing 來表示 Many to Many 關係。
