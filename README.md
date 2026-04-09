# 📚 LibraryNest — Library Seat Reservation System

A full-stack MERN application for managing library seat reservations with role-based access, animated UI, and admin workflows.

![Tech Stack](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Express.js-404D59?style=flat)
![Tech Stack](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tech Stack](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

---

## ✨ Features

### Student
- Browse libraries by city/search
- Visual seat layout with type icons (regular 💺, window 🪟, quiet 🤫, computer 💻)
- Search books globally and see which libraries carry them
- Reserve seats with date & time slot selection
- Confetti 🎊 animation on successful booking
- Track reservation status (Pending → Approved/Rejected/Cancelled)
- Cancel reservations with sad animation 😢
- Profile management (name, email, password, avatar)

### Admin (Librarian)
- Dashboard with live stats and pending requests
- Library management: add/edit/delete, set status (Open/Closed/Maintenance)
- Emergency closure: marking a library as closed auto-cancels all active reservations
- Book inventory management per library
- Seat management with visual grid
- Reservation approval system: Approve ✅ / Reject ❌ / Cancel 🚫 with notes
- Confetti on approve, sad animation on reject/cancel
- Reports with filtering by status, library, student search, and seat usage stats

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, React Router v6, Axios    |
| Styling     | Custom CSS with CSS Variables, animations |
| State       | Context API + useState/useEffect    |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB + Mongoose                  |
| Auth        | JWT (JSON Web Tokens)               |
| Notifications | react-toastify                    |

---

## 📁 Project Structure

```
library-seat-reservation/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Library.js
│   │   ├── Book.js
│   │   ├── Seat.js
│   │   └── Reservation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── libraries.js
│   │   ├── books.js
│   │   ├── seats.js
│   │   ├── reservations.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js + .css
        │   ├── LibraryCard.js + .css
        │   └── Confetti.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── StudentDashboard.js
        │   ├── LibraryListPage.js
        │   ├── LibraryDetailPage.js
        │   ├── BookSearchPage.js
        │   ├── ReservationPage.js
        │   ├── MyReservationsPage.js
        │   ├── ProfilePage.js
        │   └── admin/
        │       ├── AdminDashboard.js
        │       ├── AdminLibraries.js
        │       ├── AdminBooks.js
        │       ├── AdminSeats.js
        │       ├── AdminReservations.js
        │       └── AdminReports.js
        ├── utils/
        │   └── api.js
        ├── App.js
        ├── index.js
        └── index.css
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v16+ — [nodejs.org](https://nodejs.org)
- **MongoDB** running locally, or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- **npm** or **yarn**

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/library-seat-reservation.git
cd library-seat-reservation
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from the example):

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-reservation
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

> 💡 For MongoDB Atlas, replace the URI with your Atlas connection string:
> `mongodb+srv://user:password@cluster.mongodb.net/library-reservation`

---

### 3. Seed the database (optional but recommended)

```bash
npm run seed
```

This creates:
- 👑 Admin account: `admin@library.com` / `admin123`
- 🎓 Student accounts: `priya@student.com` / `student123`, `arjun@student.com`, `meera@student.com`
- 4 sample libraries (Chennai, Coimbatore, Madurai)
- 60 seats across open libraries
- Sample books in each library

---

### 4. Start the backend

```bash
npm run dev       # with nodemon (auto-restart)
# or
npm start         # production
```

Backend runs on: **http://localhost:5000**

---

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

> The `proxy` field in `frontend/package.json` forwards `/api` calls to `http://localhost:5000` automatically.

---

## 🔑 Default Credentials

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@library.com        | admin123   |
| Student | priya@student.com        | student123 |
| Student | arjun@student.com        | student123 |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint           | Description         |
|--------|--------------------|---------------------|
| POST   | /api/auth/register | Register new user   |
| POST   | /api/auth/login    | Login               |
| GET    | /api/auth/me       | Get current user    |

### Libraries
| Method | Endpoint             | Description               | Auth    |
|--------|----------------------|---------------------------|---------|
| GET    | /api/libraries       | List all (with filters)   | Public  |
| GET    | /api/libraries/:id   | Get single library        | Public  |
| POST   | /api/libraries       | Create library            | Admin   |
| PUT    | /api/libraries/:id   | Update library            | Admin   |
| DELETE | /api/libraries/:id   | Delete library            | Admin   |

### Books
| Method | Endpoint         | Description              | Auth    |
|--------|------------------|--------------------------|---------|
| GET    | /api/books       | List/search books        | Auth    |
| POST   | /api/books       | Add book                 | Admin   |
| PUT    | /api/books/:id   | Update book              | Admin   |
| DELETE | /api/books/:id   | Delete book              | Admin   |

### Seats
| Method | Endpoint              | Description     | Auth    |
|--------|-----------------------|-----------------|---------|
| GET    | /api/seats            | List seats      | Auth    |
| POST   | /api/seats            | Add seat        | Admin   |
| POST   | /api/seats/reserve    | Check seat      | Auth    |
| PUT    | /api/seats/:id        | Update seat     | Admin   |
| DELETE | /api/seats/:id        | Delete seat     | Admin   |

### Reservations
| Method | Endpoint                         | Description         | Auth    |
|--------|----------------------------------|---------------------|---------|
| GET    | /api/reservations                | List reservations   | Auth    |
| POST   | /api/reservations                | Create reservation  | Auth    |
| PUT    | /api/reservations/:id/approve    | Approve             | Admin   |
| PUT    | /api/reservations/:id/reject     | Reject              | Admin   |
| PUT    | /api/reservations/:id/cancel     | Cancel              | Auth    |
| GET    | /api/reservations/stats/overview | Stats               | Admin   |

### Users
| Method | Endpoint             | Description        | Auth  |
|--------|----------------------|--------------------|-------|
| GET    | /api/users           | All users          | Admin |
| PUT    | /api/users/profile   | Update own profile | Auth  |
| PUT    | /api/users/password  | Change password    | Auth  |

---

## 🎨 UI Highlights

- **Animated login page** — Floating emoji books, pastel gradient blobs, glass-morphism card
- **Confetti animation** — Fires on successful reservation approval
- **Sad grey confetti** — Fires on cancellation with 😢 prompt
- **Library closed overlay** — Blur + greyscale + lock icon on closed/maintenance cards
- **Seat grid** — Color-coded interactive seat picker (available/reserved/unavailable/selected)
- **Time slot picker** — Visual button grid for start/end time selection
- **Sticky booking summary** — Live updates as you select options
- **Responsive** — Works on desktop, tablet, and mobile

---

## 🚢 Deployment

### Backend (Railway / Render / Heroku)

1. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`
2. Deploy from the `backend/` folder
3. Start command: `npm start`

### Frontend (Vercel / Netlify)

1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Build command: `npm run build`
3. Output directory: `build`

> Remove the `proxy` from `package.json` when deploying frontend separately.

---

## 🧪 Common Issues

| Problem | Solution |
|---------|----------|
| MongoDB connection error | Check `MONGODB_URI` in `.env`, ensure MongoDB is running |
| Port already in use | Change `PORT` in backend `.env` |
| CORS error | Backend CORS is open by default; restrict in production |
| Token errors | Clear `localStorage` in browser and re-login |

---

## 📄 License

MIT License — free to use for academic and personal projects.

---

Made with ❤️ using the MERN Stack
