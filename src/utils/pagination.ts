import { Document, Model, Query } from 'mongoose';

interface PaginatedResult<T> {
  docs: any;
  totalDocs: any;
  totalPages: any;
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
  populateOptions?: string | string[]
): Promise<PaginatedResult<T>> => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const totalCount = await model.countDocuments(query);

  let queryBuilder: Query<T[], T> = model.find(query);

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
    count: data.length,
    page,
    pages: totalPages,
    limit,
  };
};

export default paginate;