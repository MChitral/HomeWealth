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

2. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

3. **Access the app**
   - Open http://localhost:5000 in your browser
   - The database will be automatically set up and ready to use

4. **Stop the app**
   ```bash
   # Press Ctrl+C in the terminal, then:
   docker-compose down
   ```

### Useful Docker Commands

```bash
# Start in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build
```

## Local Development (Without Docker)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

3. **Create database**
   ```bash
   createdb mortgage_app
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

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
