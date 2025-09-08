#!/bin/bash

echo "🚀 Starting Quantum Risk API Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Development environment ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️ Database: localhost:5432"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f"
