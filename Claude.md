# Claude Code Development Guide
> **Handover Documentation for Claude Code Agent**

## 🎯 Project Overview

**Repository**: `quantum-risk-api`  
**Purpose**: Enterprise quantum-inspired risk modeling platform  
**Architecture**: Next.js frontend + FastAPI backend + Supabase database  
**Target**: Institutional finance and risk management

## 🏗️ Development Priorities

### Phase 1: Core Infrastructure (Week 1-2)
1. **Project Scaffolding**
   ```bash
   # Required project structure
   quantum-risk-api/
   ├── frontend/          # Next.js 15.1.7 application
   ├── api/              # FastAPI Python backend
   ├── docs/             # Documentation
   ├── tests/            # Test suites
   └── docker/           # Containerization
   ```

2. **Frontend Setup** (`/frontend/`)
   - Next.js 15.1.7 with App Router
   - TypeScript configuration
   - Tailwind CSS setup
   - Zustand state management
   - Supabase client integration

3. **Backend Setup** (`/api/`)
   - FastAPI application structure
   - Pydantic models for risk calculations
   - NumPy/SciPy integration
   - Database connection layer

### Phase 2: Risk Engine Development (Week 3-4)
1. **Core Risk Models** (`/api/models/`)
   ```python
   # Priority implementations
   class RiskCalculator:
       def calculate_var(portfolio, confidence_level)
       def calculate_cvar(portfolio, confidence_level)
       def monte_carlo_simulation(portfolio, iterations)
       def quantum_optimization(constraints, objective)
   ```

2. **API Endpoints** (`/api/routes/`)
   - `/portfolio/var` - Value-at-Risk calculation
   - `/portfolio/cvar` - Conditional VaR
   - `/portfolio/monte-carlo` - Simulation engine
   - `/portfolio/optimize` - Quantum-inspired optimization

3. **Data Pipeline** (`/api/data/`)
   - Market data ingestion
   - Portfolio position management
   - Risk factor calculation
   - Result caching layer

### Phase 3: Frontend Interface (Week 5-6)
1. **Dashboard Components** (`/frontend/components/`)
   - Portfolio overview dashboard
   - Risk metrics visualization
   - Monte Carlo result charts
   - Real-time risk monitoring

2. **API Integration** (`/frontend/lib/`)
   - API client with error handling
   - State management for portfolio data
   - Real-time updates via Supabase

## 🔧 Technical Implementation Guidelines

### Backend Architecture Patterns
```python
# FastAPI application structure
app/
├── main.py              # FastAPI app initialization
├── api/
│   ├── routes/         # API endpoint definitions
│   ├── models/         # Pydantic data models
│   └── dependencies/   # Dependency injection
├── core/
│   ├── config.py       # Configuration management
│   ├── security.py     # Authentication/authorization
│   └── database.py     # Database connection
├── risk/
│   ├── calculations.py # Core risk algorithms
│   ├── quantum.py      # Quantum-inspired algorithms
│   └── monte_carlo.py  # Simulation engine
└── tests/              # Test suites
```

### Frontend Architecture Patterns
```typescript
// Next.js application structure
src/
├── app/                # App Router pages
├── components/         # Reusable UI components
├── lib/               # Utility functions and API clients
├── hooks/             # Custom React hooks
├── stores/            # Zustand state stores
├── types/             # TypeScript type definitions
└── styles/            # Global styles and Tailwind config
```

## 🧪 Testing Strategy

### Backend Testing (`/api/tests/`)
```python
# Priority test coverage
def test_var_calculation():
    # Test VaR accuracy against known datasets
    
def test_monte_carlo_performance():
    # Ensure <2 second response for 10k simulations
    
def test_api_endpoints():
    # Integration tests for all API routes
    
def test_quantum_algorithms():
    # Validate quantum-inspired optimization
```

### Frontend Testing (`/frontend/__tests__/`)
```typescript
// Component and integration tests
describe('Risk Dashboard', () => {
  test('displays portfolio metrics correctly')
  test('handles API errors gracefully')
  test('updates real-time data')
})
```

## 📊 Performance Requirements

### API Performance Targets
- **Response Time**: < 2 seconds for 10,000 Monte Carlo simulations
- **Throughput**: 1,000+ portfolio assessments per minute
- **Memory Usage**: < 512MB per calculation instance
- **Error Rate**: < 0.1% for valid inputs

### Frontend Performance Targets
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB (compressed)

## 🔐 Security Considerations

### API Security
- Input validation with Pydantic
- Rate limiting (100 requests/minute per user)
- JWT authentication via Supabase
- SQL injection prevention
- Request/response logging for audit

### Frontend Security
- XSS prevention with Content Security Policy
- Secure API key management
- User session management
- Data sanitization

## 🌐 Deployment Configuration

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
CLAUDE_API_KEY=...
REDIS_URL=...

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Deployment Targets
- **Frontend**: Vercel (automatic deployment from main branch)
- **Backend**: Railway or Render (containerized deployment)
- **Database**: Supabase (managed PostgreSQL)

## 🐛 Common Gotchas & Solutions

### NumPy/SciPy Dependencies
```bash
# Ensure proper scientific computing setup
pip install numpy scipy pandas scikit-learn
# For Apple Silicon Macs
pip install --only-binary=all numpy scipy
```

### Supabase Integration
```typescript
// Correct SSR client initialization
import { createServerClient } from '@supabase/ssr'
// NOT: createClientComponentClient (deprecated)
```

### CORS Configuration
```python
# FastAPI CORS setup for development
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"])
```

## 📝 Development Checklist

- [ ] Initialize project structure
- [ ] Set up development environment
- [ ] Implement core risk calculation engine
- [ ] Create API endpoints with proper validation
- [ ] Build responsive frontend dashboard
- [ ] Integrate Supabase authentication
- [ ] Add comprehensive test coverage
- [ ] Configure deployment pipelines
- [ ] Performance optimization
- [ ] Security audit and hardening

## 🚀 Quick Commands

```bash
# Development workflow
npm run dev          # Start frontend development server
cd api && uvicorn main:app --reload  # Start backend API
npm test            # Run frontend tests
cd api && pytest   # Run backend tests
npm run build       # Build for production
docker-compose up   # Full stack with Docker
```

## 📞 Support & Questions

For technical questions during development:
- **Primary**: Check PLAN.md for detailed specifications
- **Architecture**: Review project structure in this document
- **Performance**: Refer to benchmark targets above
- **Security**: Follow patterns outlined in security section

**Author**: Sotiris Spyrou (sotiris@verityai.co)
