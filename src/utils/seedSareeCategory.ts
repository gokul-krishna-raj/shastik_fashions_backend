
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import connectDB from '../config/db';

dotenv.config();

const seedSareeCategories = async () => {
  await connectDB();

  try {
    await Category.deleteMany({});
    console.log('Categories cleared');

    const categories = [
      {
        name: 'Banarasi',
        description: 'Banarasi sarees are known for their gold and silver brocade or zari, fine silk and opulent embroidery.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Kanjeevaram',
        description: 'Kanjeevaram sarees are made from pure mulberry silk thread. The sarees are known for their vibrant colors and excellent craftsmanship.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Chanderi',
        description: 'Chanderi sarees are produced from three kinds of fabric: pure silk, Chanderi cotton and silk cotton.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Bandhani',
        description: 'Bandhani is a type of tie-dye textile decorated by plucking the cloth with the fingernails into many tiny bindings that form a figurative design.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Paithani',
        description: 'Paithani is a variety of saree, which is named after the Paithan town in Aurangabad, Maharashtra where they are woven by hand.',
        image: 'no-photo.jpg',
      },
    ];

    await Category.insertMany(categories);
    console.log('Saree categories have been added.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedSareeCategories();
