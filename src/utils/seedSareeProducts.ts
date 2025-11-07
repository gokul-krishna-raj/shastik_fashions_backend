import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import Product from '../models/Product';
import Category from '../models/Category';
import connectDB from '../config/db';

dotenv.config();

const sareeImages = [
  'https://images.pexels.com/photos/16422256/pexels-photo-16422256.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/16246274/pexels-photo-16246274.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/17649139/pexels-photo-17649139.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/14578299/pexels-photo-14578299.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/16422241/pexels-photo-16422241.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/17649090/pexels-photo-17649090.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/16246285/pexels-photo-16246285.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/16422258/pexels-photo-16422258.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/17649112/pexels-photo-17649112.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/17649084/pexels-photo-17649084.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const seedSareeProducts = async () => {
  await connectDB();

  try {
    await Product.deleteMany({});
    console.log('🧹 Old products cleared');

    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('⚠️ No categories found. Please seed categories first.');
      process.exit(1);
    }

    const products = [];
    for (let i = 0; i < 50; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomImage = sareeImages[Math.floor(Math.random() * sareeImages.length)];

      const originalPrice = parseFloat(faker.commerce.price({ min: 2000, max: 10000 }));
      const discount = parseFloat(faker.commerce.price({ min: 100, max: 1500 }));
      const price = Math.max(originalPrice - discount, 1000);

      const product = {
        name: `${randomCategory.name} Saree ${i + 1}`,
        description: faker.commerce.productDescription(),
        originalPrice,
        price,
        category: randomCategory._id,
        images: [randomImage],
        fabric: faker.helpers.arrayElement([
          'Silk',
          'Cotton',
          'Soft Silk',
          'Kanchipuram Silk',
          'Printed Cotton',
          'Kerala Cotton',
        ]),
        color: faker.color.human(),
        stock: faker.number.int({ min: 5, max: 100 }),
        isBestSeller: faker.datatype.boolean(),
        isNewArrival: faker.datatype.boolean(),
      };

      products.push(product);
    }

    await Product.insertMany(products);
    console.log(`✅ ${products.length} saree products added successfully!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

seedSareeProducts();
