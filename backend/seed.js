const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const seed = async () => {
  try {
    // ✅ CONNECT FIRST
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // ✅ THEN DELETE USERS
    await User.deleteMany({});
    console.log("🧹 Old users deleted");

    // ✅ CREATE ADMIN (NO HASH HERE)
    await User.create({
      name: 'Admin Librarian',
      email: 'admin@library.com',
      password: 'admin123',
      role: 'admin'
    });

    // ✅ CREATE STUDENT
    await User.create({
      name: 'Priya Sharma',
      email: 'priya@student.com',
      password: 'student123',
      role: 'student'
    });

    console.log("🎉 Users seeded successfully!");
    console.log("👤 Admin: admin@library.com / admin123");

    // ✅ CLOSE CONNECTION
    await mongoose.disconnect();

  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

seed();