#!/bin/bash

echo "🚀 Iniciando ambiente de desenvolvimento Biocol Import System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

echo "📊 Subindo PostgreSQL..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Aguardando PostgreSQL ficar pronto..."
sleep 10

echo "🔄 Executando migrations do Prisma..."
cd backend
npm run prisma:generate
npm run prisma:migrate

echo "🌱 Populando dados iniciais..."
# We'll add seed script later

echo "✅ Ambiente pronto!"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Frontend: cd frontend && npm run dev"
echo "   2. Backend:  cd backend && npm run dev"
echo "   3. Acesse: http://localhost:5173"
echo ""