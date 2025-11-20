# Canadian Mortgage Strategy & Wealth Forecasting App

A full-stack web application helping Canadians compare financial strategies for managing mortgages and building wealth.

## Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Git

### Run the App

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`**
   ```bash
   cp env.local.example .env.local
   # Update DATABASE_URL if you changed the Postgres port/user/password
   ```

4. **Start PostgreSQL with Docker Compose**
   ```bash
   docker compose up db -d
   ```

5. **Push the database schema**
   ```bash
   npm run db:push
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```
   - Open http://localhost:5000 in your browser

7. **Stop services**
   ```bash
   # Stop the app (Ctrl+C)
   docker compose down
   ```

### Useful Docker Commands

```bash
# Start Postgres in the background
docker compose up db -d

# View Postgres logs
docker compose logs -f db

# Stop the database
docker compose down

# Stop and remove data (fresh start)
docker compose down -v
```

## Local Development (Without Docker)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### Setup

The steps above already cover local development (run Docker for Postgres, push the schema, then `npm run dev`). If you prefer a fully manual setup, create a Postgres database yourself and point `DATABASE_URL` at it before running `npm run db:push`.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **UI**: Shadcn UI + Tailwind CSS

## Features

- 🏠 Mortgage tracking with Canadian-specific calculations
- 📊 Multi-scenario comparison (up to 4 simultaneous)
- 💰 Investment alternative modeling
- 📈 10-30 year net worth projections
- 🎯 Emergency fund planning
- 💸 Cash flow management

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Sync database schema
- `npm run db:studio` - Open database GUI

## License

MIT
