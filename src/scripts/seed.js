import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.config.js';
import User from '../models/user.model.js';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';

// Configuration API URLs (use defaults if not in env)
const FAKESTORE_API_URL = process.env.FAKESTORE_API_URL || 'https://fakestoreapi.com/products';
const KOLZSTICKS_API_URL = process.env.KOLZSTICKS_API_URL || 'https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json';

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to Database...');
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    // Keep users but update/delete seeded admin to avoid duplication
    await User.deleteMany({ email: 'admin@example.com' });

    console.log('👤 Seeding Administrator User...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password1!',
      phone: '9999999999',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('✅ Admin User seeded successfully.');

    // Storage for category mapping (Name -> Category Document)
    const categoryMap = new Map();

    // Helper to get or create category (with parent subcategory support)
    const getOrCreateCategory = async (name, parentName = null) => {
      const formattedName = name.trim();
      const mapKey = parentName ? `${parentName.trim()} > ${formattedName}` : formattedName;

      if (categoryMap.has(mapKey)) {
        return categoryMap.get(mapKey);
      }

      let parentDoc = null;
      if (parentName) {
        parentDoc = await getOrCreateCategory(parentName);
      }

      let category = await Category.findOne({ name: formattedName });
      if (!category) {
        category = await Category.create({
          name: formattedName,
          parent: parentDoc ? parentDoc._id : null,
          description: `${formattedName} category`,
        });
      }

      categoryMap.set(mapKey, category);
      return category;
    };

    console.log('🌐 Fetching products from FakeStore API...');
    const fakeStoreResponse = await fetch(FAKESTORE_API_URL);
    const fakeStoreProducts = await fakeStoreResponse.json();
    console.log(`📥 Fetched ${fakeStoreProducts.length} products from FakeStore API.`);

    console.log('🌐 Fetching products from Kolzsticks API...');
    const kolzsticksResponse = await fetch(KOLZSTICKS_API_URL);
    const kolzsticksProducts = await kolzsticksResponse.json();
    console.log(`📥 Fetched ${kolzsticksProducts.length} products from Kolzsticks API.`);

    const productsToInsert = [];

    // Processing FakeStore Products
    console.log('📦 Processing FakeStore products...');
    for (const item of fakeStoreProducts) {
      // Map category name to clean string
      let categoryName = item.category;
      if (categoryName === "men's clothing") categoryName = "Men's Clothing";
      if (categoryName === "women's clothing") categoryName = "Women's Clothing";
      if (categoryName === "jewelery") categoryName = "Jewelry";
      if (categoryName === "electronics") categoryName = "Electronics";

      const categoryDoc = await getOrCreateCategory(categoryName);

      productsToInsert.push({
        name: item.title,
        description: item.description,
        price: item.price,
        images: [item.image],
        category: categoryDoc._id,
        seller: adminUser._id,
        stock: Math.floor(Math.random() * 90) + 10, // 10 to 100 stock
        ratings: item.rating ? item.rating.rate : 4.0,
        numReviews: item.rating ? item.rating.count : 10,
        tags: [categoryName.toLowerCase(), 'fakestore'],
        isActive: true,
      });
    }

    // Processing Kolzsticks Products
    console.log('📦 Processing Kolzsticks products...');
    for (const item of kolzsticksProducts) {
      // Kolzsticks has parent category & subCategory
      const parentCat = item.category || 'Other';
      const subCat = item.subCategory;

      let categoryDoc;
      if (subCat) {
        categoryDoc = await getOrCreateCategory(subCat, parentCat);
      } else {
        categoryDoc = await getOrCreateCategory(parentCat);
      }

      // Price is in cents, convert to main currency units
      const price = item.priceCents ? item.priceCents / 100 : 19.99;

      productsToInsert.push({
        name: item.name,
        description: item.description || `High-quality ${item.name}`,
        price: price,
        images: [item.image],
        category: categoryDoc._id,
        seller: adminUser._id,
        stock: Math.floor(Math.random() * 90) + 10, // 10 to 100 stock
        ratings: item.rating ? item.rating.stars : 4.5,
        numReviews: item.rating ? item.rating.count : 15,
        tags: item.keywords || [parentCat.toLowerCase()],
        isActive: true,
      });
    }

    console.log(`💾 Inserting ${productsToInsert.length} total products into the database...`);
    const inserted = await Product.insertMany(productsToInsert);
    console.log(`🚀 Successfully seeded ${inserted.length} products!`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.stack}`);
    process.exit(1);
  }
};

seedDatabase();
