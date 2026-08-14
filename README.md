# Student Intelligence Portal

A MERN-based Student Intelligence Portal for placement data, student analytics, filtering, and placement-readiness insights.

## Tech Stack

- React + Vite
- Tailwind CSS v4
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Recharts
- Axios
- Excel import

## Project Structure

```text
Student Intelligence Portal/
├── Backend/
└── Frontend/
```

## Local Setup

### Backend

```bash
cd Backend
npm install
```

Create `Backend/.env` from `.env.example`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
FRONTEND_URL=http://localhost:5173
AUTH_SECRET=your-long-random-secret-at-least-32-characters
```

Start the backend:

```bash
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
```

Create `Frontend/.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

## Tailwind CSS

Tailwind CSS v4 is configured through `@tailwindcss/vite`. The authentication screens use Tailwind utility classes, and the existing dashboard styles remain available in `Dashboard.css` so the current dashboard layout is preserved.

## Security Notes

- Never commit `.env` files.
- Never commit `node_modules`.
- Rotate any database credential that was previously exposed.
- Public signup creates student accounts only. Admin/trainer accounts must be provisioned securely on the backend.
