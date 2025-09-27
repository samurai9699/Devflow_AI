# DevFlow AI - Developer Workflow Automation Platform

An AI-powered platform that automates repetitive developer tasks including boilerplate generation, documentation, testing, and code reviews.

## 🚀 Features

- **AI-Powered Automation**: Generate boilerplate, docs, and tests using OpenAI/Anthropic APIs
- **Custom Workflows**: Visual workflow builder for complex automation chains
- **GitHub Integration**: Automated PR reviews and suggestions
- **Team Workspaces**: Enterprise-ready collaboration features
- **Usage Analytics**: Track time saved and productivity metrics
- **Subscription Tiers**: Flexible pricing with usage-based billing
- **Real-time Updates**: WebSocket integration for live workflow execution
- **Enterprise Security**: Role-based access control and audit logs

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: Redis with Bull for background jobs
- **Authentication**: JWT with bcrypt
- **Payments**: Stripe integration
- **AI APIs**: OpenAI GPT-4 and Anthropic Claude
- **Real-time**: Socket.io

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios with React Query
- **UI Components**: Headless UI
- **Icons**: Heroicons

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Development**: Hot reload, TypeScript, ESLint

## 🚀 Quick Start

### Option 1: Automated Setup
```bash
# Clone and setup everything
git clone <repository-url>
cd devflow-ai
./setup.sh
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm run install:all

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Setup database
cd backend
npm run db:generate
npm run db:migrate
cd ..

# Start development servers
npm run dev
```

### Option 3: Docker
```bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d
```

## 🔧 Configuration

### Required Environment Variables

Create `backend/.env` with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devflow"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# AI APIs (at least one required)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis
REDIS_URL="redis://localhost:6379"

# GitHub (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### API Keys Setup

1. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
3. **Stripe**: Get your keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

## 📁 Project Structure

```
devflow-ai/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic & AI integration
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── utils/          # Utilities and helpers
│   │   └── server.ts       # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand state management
│   │   ├── lib/            # API client and utilities
│   │   └── main.tsx        # App entry point
│   └── package.json
├── docker-compose.yml      # Development environment
├── setup.sh               # Automated setup script
└── README.md
```

## 🔄 Development Workflow

### Starting Development
```bash
# Start all services
npm run dev

# Or individually
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

### Database Operations
```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Building for Production
```bash
# Build both frontend and backend
npm run build

# Or individually
npm run build:backend
npm run build:frontend
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow details
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow

### AI Generation
- `POST /api/ai/generate` - Generate content with AI

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics

### Subscriptions
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/checkout` - Create Stripe checkout session

## 🏗 Architecture Overview

### Backend Architecture
- **Express.js** server with TypeScript
- **Prisma ORM** for database operations
- **Bull Queue** for background job processing
- **Socket.io** for real-time updates
- **JWT** authentication with role-based access
- **Stripe** integration for subscription management

### Frontend Architecture
- **React 18** with functional components and hooks
- **Zustand** for lightweight state management
- **React Query** for server state management
- **Tailwind CSS** for styling
- **React Router** for navigation

### Database Schema
- **Users** with role-based permissions
- **Teams** for collaboration
- **Workflows** with step definitions
- **Executions** tracking workflow runs
- **Subscriptions** for billing management
- **Usage Tracking** for analytics

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation with Joi
- CORS protection
- Helmet.js security headers
- Role-based access control

## 📊 Monitoring & Analytics

- Workflow execution tracking
- Token usage monitoring
- Performance metrics
- Error logging with Winston
- Real-time execution updates

## 🚀 Deployment

### Docker Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup
- Set up PostgreSQL database
- Configure Redis instance
- Set environment variables
- Run database migrations
- Start the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the setup guide

## 🎯 Roadmap

- [ ] Visual workflow builder
- [ ] GitHub integration for PR automation
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API marketplace
- [ ] Custom AI model integration
