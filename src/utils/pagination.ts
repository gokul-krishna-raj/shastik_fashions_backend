import { Document, Model, Query } from 'mongoose';

interface PaginatedResult<T> {
  docs?: any;
  totalDocs: number;
  totalPages: number;
  data: T[];
  count: number;
  page: number;
  pages: number;
  limit: number;
}

const paginate = async <T extends Document>(
  model: Model<T>,
  query: object = {},
  page: number = 1,
  limit: number = 10,
  populateOptions?: string | string[],
  sortOptions?: string | object
): Promise<PaginatedResult<T>> => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const totalCount = await model.countDocuments(query);

  let queryBuilder: Query<T[], T> = model.find(query);

  if (sortOptions) {
    queryBuilder = queryBuilder.sort(sortOptions as any);
  }

  if (populateOptions) {
    if (Array.isArray(populateOptions)) {
      populateOptions.forEach(option => {
        queryBuilder = queryBuilder.populate(option);
      });
    } else {
      queryBuilder = queryBuilder.populate(populateOptions);
    }
  }

  const data = await queryBuilder.skip(startIndex).limit(limit);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    totalDocs: totalCount,
    count: data.length,
    page,
    pages: totalPages,
    totalPages, // Add missing property
    limit,
  };
};

export default paginate;