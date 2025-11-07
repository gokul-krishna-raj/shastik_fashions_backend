import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import connectDB from '../config/db';

dotenv.config();

const seedSareeCategories = async () => {
  await connectDB();

  try {
    await Category.deleteMany({});
    console.log('Old categories cleared ✅');

    const categories = [
      {
        name: 'Wedding Silk',
        slug: 'wedding-silk',
        description: 'Luxurious silk sarees perfect for weddings and grand celebrations, featuring rich zari and traditional motifs.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Soft Silk',
        slug: 'soft-silk',
        description: 'Lightweight and comfortable silk sarees with a smooth texture, ideal for both festive and casual wear.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Elegant Silk',
        slug: 'elegant-silk',
        description: 'Graceful silk sarees designed for sophistication, blending modern patterns with traditional elegance.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Cotton',
        slug: 'cotton',
        description: 'Breathable and comfortable cotton sarees for daily wear, suitable for all seasons.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Kerala Cotton',
        slug: 'kerala-cotton',
        description: 'Traditional white and gold bordered sarees from Kerala, symbolizing simplicity and purity.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Kubera Pattu',
        slug: 'kubera-pattu',
        description: 'Richly woven silk sarees known for their grandeur, inspired by traditional South Indian weaving techniques.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Poontamil Sarees',
        slug: 'poontamil-sarees',
        description: 'Beautifully crafted sarees from Tamil Nadu, known for vibrant colors and cultural heritage.',
        image: 'no-photo.jpg',
      },
      {
        name: 'Printed Cotton Saree',
        slug: 'printed-cotton-saree',
        description: 'Stylish printed cotton sarees with modern and ethnic designs, perfect for everyday elegance.',
        image: 'no-photo.jpg',
      },
    ];


    await Category.insertMany(categories);
    console.log('✅ Saree categories added successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

seedSareeCategories();
