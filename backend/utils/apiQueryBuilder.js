/**
 * Advanced API Features & Query Builder.
 * Encapsulates Filtering, Searching, Sorting, Field Limiting, and Pagination.
 */
export class APIQueryBuilder {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString || {};
    this.filterObj = {};
  }

  /**
   * 1. Filtering:
   * Translates URL query operators (?price[gte]=1000&price[lte]=5000)
   * into MongoDB query operators ({ price: { $gte: 1000, $lte: 5000 } }).
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Handle stringified comparison operators: gte, gt, lte, lt, in, ne, regex
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|ne|regex)\b/g, (match) => `$${match}`);

    this.filterObj = JSON.parse(queryStr);

    // Optional free-text search if 'search' query param is passed
    if (this.queryString.search) {
      this.filterObj.$or = [
        { title: { $regex: this.queryString.search, $options: "i" } },
        { company: { $regex: this.queryString.search, $options: "i" } },
      ];
    }

    this.query = this.query.find(this.filterObj);
    return this;
  }

  /**
   * 2. Sorting:
   * Handles multi-column sorting: ?sort=-price,title -> .sort('-price title')
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt -_id");
    }
    return this;
  }

  /**
   * 3. Field Limiting (Projection):
   * Restricts returned JSON fields to reduce network bandwidth.
   * Example: ?fields=title,price,coverImage -> .select('title price coverImage')
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  /**
   * 4. Pagination:
   * Calculates skip and limit for page-based querying.
   * Default: page=1, limit=12
   */
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(this.queryString.limit, 10) || 12));
    const skip = (page - 1) * limit;

    this.page = page;
    this.limit = limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Generates pagination envelope metadata for client UI
   */
  async getPaginationMetadata(Model) {
    const totalDocs = await Model.countDocuments(this.filterObj);
    const totalPages = Math.ceil(totalDocs / this.limit) || 1;

    return {
      page: this.page,
      limit: this.limit,
      totalDocs,
      totalPages,
      hasNextPage: this.page < totalPages,
      hasPrevPage: this.page > 1,
    };
  }
}

export default APIQueryBuilder;
