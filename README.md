# Neighbor-share
This is a neighbourhood platform where members list tools they own and others borrow them for a date range.

## Project Structure

```
backend/   FastAPI API, MongoDB models/schemas/routers/services
frontend/  React/Vite/Tailwind client
```

## Features

- Register, login, logout, access tokens, refresh tokens, protected routes, and admin authorization
- Browse tools with debounced keyword/category/price filters
- Tool listing creation, edit-ready backend, delete, blackout dates, image URLs, owner controls
- Reservation workflow: Pending, Confirmed, Declined, Cancelled, Completed, Overdue
- Conflict checking on approval using: new_start <= existing_end and new_end >= existing_start
- Reviews only for completed borrower reservations
- In-app notifications and notification bell
- Owner, borrower, and admin dashboards
- Responsive UI with cards, skeletons, empty states, toast notifications, modal confirmation

## Backend Setup

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate   # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` with your MongoDB Atlas URI and strong JWT secrets.

Run the API:

```bash
uvicorn app.main:app --reload
```

OpenAPI documentation will be available at http://localhost:8000/docs.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The app runs at http://localhost:5173 by default.
