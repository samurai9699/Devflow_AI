#!/bin/bash

echo "🚀 Setting up DevFlow AI Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Setup environment files
echo "⚙️ Setting up environment files..."
cp backend/.env.example backend/.env
echo "✅ Created backend/.env (please update with your API keys)"

# Setup database
echo "🗄️ Setting up database..."
cd backend
npm run db:generate
npm run db:migrate
cd ..

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update backend/.env with your API keys:"
echo "   - OPENAI_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo "   - STRIPE_SECRET_KEY (for payments)"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Or use Docker:"
echo "   docker-compose up"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"