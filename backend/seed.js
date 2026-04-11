const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Library = require('./models/Library');
const Book = require('./models/Book');
const Seat = require('./models/Seat');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // =========================
    // 👤 CREATE ADMIN (SAFE)
    // =========================
    const existingAdmin = await User.findOne({ email: 'admin@library.com' });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await User.create({
        name: 'Admin Librarian',
        email: 'admin@library.com',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('✅ Admin created');
    } else {
      console.log('⚠️ Admin already exists');
    }

    // =========================
    // 👨‍🎓 CREATE STUDENTS (SAFE)
    // =========================
    const studentsData = [
      { name: 'Priya Sharma', email: 'priya@student.com' },
      { name: 'Arjun Kumar', email: 'arjun@student.com' },
      { name: 'Meera Nair', email: 'meera@student.com' }
    ];

    for (const student of studentsData) {
      const exists = await User.findOne({ email: student.email });

      if (!exists) {
        const hashedPassword = await bcrypt.hash('student123', 10);

        await User.create({
          ...student,
          password: hashedPassword,
          role: 'student'
        });

        console.log(`✅ Student created: ${student.email}`);
      }
    }

    // =========================
    // 📚 CREATE LIBRARIES (ONLY IF EMPTY)
    // =========================
    const libraryCount = await Library.countDocuments();

    if (libraryCount === 0) {
      const libraries = await Library.insertMany([
        {
          libraryName: 'Chennai Central Library',
          city: 'Chennai',
          address: '3 Rajaji Salai, Chennai',
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
          status: 'Open',
          totalSeats: 0,
          description: 'Central library of Chennai.',
          openingHours: '8:00 AM - 8:00 PM'
        },
        {
          libraryName: 'Anna Centenary Library',
          city: 'Chennai',
          address: 'Kotturpuram, Chennai',
          image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
          status: 'Open',
          totalSeats: 0,
          description: 'One of the largest libraries.',
          openingHours: '9:00 AM - 9:00 PM'
        }
      ]);

      console.log('✅ Libraries created');

      // =========================
      // 💺 CREATE SEATS
      // =========================
      const seats = [];

      for (const lib of libraries) {
        for (let i = 1; i <= 20; i++) {
          seats.push({
            libraryId: lib._id,
            seatNumber: `S${String(i).padStart(2, '0')}`,
            status: 'available',
            seatType: 'regular'
          });
        }
        await Library.findByIdAndUpdate(lib._id, { totalSeats: 20 });
      }

      await Seat.insertMany(seats);
      console.log('✅ Seats created');

      // =========================
      // 📖 CREATE BOOKS
      // =========================
      const books = [
        { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', quantity: 5 },
        { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', genre: 'Finance', quantity: 4 }
      ];

      for (const lib of libraries) {
        const booksForLib = books.map(b => ({ ...b, libraryId: lib._id }));
        await Book.insertMany(booksForLib);
      }

      console.log('✅ Books created');
    } else {
      console.log('⚠️ Libraries already exist');
    }

    console.log('🎉 Seeding completed!');
    console.log('👤 Admin: admin@library.com / admin123');
    console.log('👨‍🎓 Student: priya@student.com / student123');

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();