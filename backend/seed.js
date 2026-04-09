const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Library = require('./models/Library');
const Book = require('./models/Book');
const Seat = require('./models/Seat');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library-reservation');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([User.deleteMany(), Library.deleteMany(), Book.deleteMany(), Seat.deleteMany()]);

    // Create admin
    const admin = await User.create({
      name: 'Admin Librarian',
      email: 'admin@library.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create students
    const students = await User.insertMany([
      { name: 'Priya Sharma', email: 'priya@student.com', password: 'student123', role: 'student' },
      { name: 'Arjun Kumar', email: 'arjun@student.com', password: 'student123', role: 'student' },
      { name: 'Meera Nair', email: 'meera@student.com', password: 'student123', role: 'student' }
    ]);

    // Create libraries
    const libraries = await Library.insertMany([
      {
        libraryName: 'Chennai Central Library',
        city: 'Chennai',
        address: '3 Rajaji Salai, Chennai, Tamil Nadu 600001',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
        status: 'Open',
        totalSeats: 0,
        description: 'The grand central library of Chennai, open since 1896.',
        openingHours: '8:00 AM - 8:00 PM'
      },
      {
        libraryName: 'Anna Centenary Library',
        city: 'Chennai',
        address: 'Kotturpuram, Chennai, Tamil Nadu 600085',
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
        status: 'Open',
        totalSeats: 0,
        description: 'One of the largest libraries in Asia with modern facilities.',
        openingHours: '9:00 AM - 9:00 PM'
      },
      {
        libraryName: 'Coimbatore City Library',
        city: 'Coimbatore',
        address: 'Big Bazaar Street, Coimbatore, Tamil Nadu 641001',
        image: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800',
        status: 'Maintenance',
        totalSeats: 0,
        description: 'Currently under renovation. Will reopen soon!',
        openingHours: 'Temporarily Closed'
      },
      {
        libraryName: 'Madurai Public Library',
        city: 'Madurai',
        address: 'West Masi Street, Madurai, Tamil Nadu 625001',
        image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800',
        status: 'Open',
        totalSeats: 0,
        description: 'Serving Madurai readers since 1920.',
        openingHours: '9:00 AM - 7:00 PM'
      }
    ]);

    // Create seats for open libraries
    const openLibraries = libraries.filter(l => l.status === 'Open');
    const seatTypes = ['regular', 'window', 'quiet', 'computer'];
    const allSeats = [];

    for (const lib of openLibraries) {
      for (let i = 1; i <= 20; i++) {
        allSeats.push({
          libraryId: lib._id,
          seatNumber: `S${String(i).padStart(2, '0')}`,
          status: 'available',
          seatType: seatTypes[Math.floor(Math.random() * seatTypes.length)]
        });
      }
      await Library.findByIdAndUpdate(lib._id, { totalSeats: 20 });
    }

    await Seat.insertMany(allSeats);

    // Create books
    const bookList = [
      { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', genre: 'Fantasy', quantity: 5 },
      { title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', genre: 'Fantasy', quantity: 3 },
      { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', quantity: 4 },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Classic', quantity: 2 },
      { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', quantity: 6 },
      { title: '1984', author: 'George Orwell', genre: 'Dystopian', quantity: 3 },
      { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', genre: 'Finance', quantity: 4 },
      { title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', genre: 'Biography', quantity: 5 },
      { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', genre: 'Sci-Fi', quantity: 2 },
      { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'History', quantity: 3 }
    ];

    for (const lib of libraries) {
      const booksForLib = bookList.slice(0, 6).map(b => ({ ...b, libraryId: lib._id }));
      await Book.insertMany(booksForLib);
    }

    console.log('✅ Seed data created successfully!');
    console.log('👤 Admin: admin@library.com / admin123');
    console.log('👨‍🎓 Student: priya@student.com / student123');
    mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
