
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Product from '../models/Product';
import Category from '../models/Category';
import connectDB from '../config/db';

dotenv.config();

const seedSareeProducts = async () => {
  await connectDB();

  try {
    await Product.deleteMany({});
    console.log('Products cleared');

    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('No categories found. Please add some categories first.');
      process.exit(1);
    }

    const products = [];
    for (let i = 0; i < 20; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const originalPrice = parseFloat(faker.commerce.price({ min: 2000, max: 10000 }));
      const price = originalPrice - parseFloat(faker.commerce.price({ min: 100, max: 1000 }));

      const product = {
        name: `${randomCategory.name} Saree ${i + 1}`,
        description: faker.commerce.productDescription(),
        originalPrice: originalPrice,
        price: price,
        category: randomCategory._id,
        images: [faker.image.url(), faker.image.url()],
        fabric: 'Silk',
        color: faker.color.human(),
        stock: faker.number.int({ min: 0, max: 100 }),
        isBestSeller: faker.datatype.boolean(),
        isNewArrival: faker.datatype.boolean(),
      };
      products.push(product);
    }

    await Product.insertMany(products);
    console.log('20 saree products have been added.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedSareeProducts();
