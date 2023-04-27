class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1)條件篩選
    const queryObj = { ...this.queryString }; // 拷貝一個新的 request 物件
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B)進階篩選
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // 為特定 mongoose 運算子新增字符

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2)排序
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // 預設排序為 tour 被新建的時間
      // this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3)限制搜尋欄位
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // 排除特定欄位
    }

    return this;
  }

  paginate() {
    // 4)分頁
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
