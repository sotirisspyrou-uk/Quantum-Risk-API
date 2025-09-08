# API Endpoints & Data Validation
# [Version 11-01-2025 15:50:00]
# /api/routes/risk_api.py

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
from decimal import Decimal
import asyncio
import redis
import json
import uuid

from .calculations import QuantumRiskEngine, Portfolio, QuantumPortfolioOptimizer
from .database import get_db_session
from .auth import verify_token, get_current_user

# Pydantic models for request/response validation
class PortfolioPosition(BaseModel):
    """Individual portfolio position"""
    symbol: str = Field(..., regex="^[A-Z]{1,10}$", description="Valid ticker symbol")
    weight: float = Field(..., ge=0, le=1, description="Portfolio weight (0-1)")
    market_value: Optional[float] = Field(None, gt=0, description="Market value in USD")
    quantity: Optional[float] = Field(None, description="Number of shares/units")
    
    @validator('symbol')
    def validate_symbol(cls, v):
        # Additional validation for symbol format
        if not v.isalpha():
            raise ValueError('Symbol must contain only letters')
        return v.upper()

class PortfolioRequest(BaseModel):
    """Portfolio risk calculation request"""
    portfolio_id: str = Field(..., description="Unique portfolio identifier")
    name: Optional[str] = Field(None, description="Portfolio name")
    positions: List[PortfolioPosition] = Field(..., min_items=1, max_items=500)
    base_currency: str = Field("USD", description="Base currency")
    
    @validator('positions')
    def validate_portfolio_weights(cls, v):
        total_weight = sum(pos.weight for pos in v)
        if abs(total_weight - 1.0) > 0.01:  # Allow 1% tolerance
            raise ValueError(f'Portfolio weights must sum to 1.0, got {total_weight}')
        return v

class RiskCalculationRequest(BaseModel):
    """Risk calculation parameters"""
    confidence_level: float = Field(0.95, ge=0.90, le=0.999, description="VaR confidence level")
    time_horizon: int = Field(1, ge=1, le=252, description="Time horizon in days")
    method: str = Field("quantum_mc", regex="^(historical|parametric|monte_carlo|quantum_mc)$")
    num_simulations: Optional[int] = Field(10000, ge=1000, le=100000, description="Monte Carlo simulations")
    risk_free_rate: float = Field(0.02, ge=0, le=0.10, description="Risk-free rate")

class OptimizationRequest(BaseModel):
    """Portfolio optimization parameters"""
    expected_returns: List[float] = Field(..., description="Expected returns for each asset")
    symbols: List[str] = Field(..., description="Asset symbols")
    risk_aversion: float = Field(1.0, ge=0.1, le=10.0, description="Risk aversion parameter")
    constraints: Optional[Dict] = Field(None, description="Portfolio constraints")
    optimization_method: str = Field("quantum_inspired", regex="^(quantum_inspired|classical_mv|risk_parity)$")

class StressTestRequest(BaseModel):
    """Stress testing scenarios"""
    portfolio_id: str
    scenarios: Dict[str, Dict[str, float]] = Field(
        ..., 
        description="Stress scenarios: {scenario_name: {symbol: shock_percentage}}"
    )

# Response models
class RiskMetricsResponse(BaseModel):
    """Risk calculation results"""
    calculation_id: str
    timestamp: datetime
    portfolio_id: str
    risk_metrics: Dict[str, Union[float, str]]
    methodology: Dict[str, Union[str, float, int]]
    stress_scenarios: Optional[List[Dict]] = None
    regulatory_capital: Optional[Dict[str, float]] = None
    warnings: List[str] = []
    computation_time_ms: float

class OptimizationResponse(BaseModel):
    """Portfolio optimization results"""
    optimization_id: str
    timestamp: datetime
    optimal_weights: List[float]
    expected_return: float
    volatility: float
    sharpe_ratio: float
    optimization_method: str
    convergence_info: Dict
    constraints_satisfied: bool

class HealthCheckResponse(BaseModel):
    """System health check"""
    status: str
    timestamp: datetime
    version: str
    database_status: str
    redis_status: str
    quantum_engine_status: str

# FastAPI application setup
app = FastAPI(
    title="Quantum Risk API",
    description="Enterprise quantum-inspired risk modeling platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://quantum-risk-api.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
risk_engine = QuantumRiskEngine(quantum_enabled=True)
portfolio_optimizer = QuantumPortfolioOptimizer(quantum_enabled=True)
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Dependency injection
async def get_risk_engine():
    return risk_engine

async def get_optimizer():
    return portfolio_optimizer

async def get_redis():
    return redis_client

# API Routes

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """System health check endpoint"""
    try:
        # Check database connectivity
        db_status = "healthy"  # Implement actual DB check
        
        # Check Redis connectivity
        redis_status = "healthy" if redis_client.ping() else "unhealthy"
        
        # Check quantum engine
        quantum_status = "healthy" if risk_engine.quantum_enabled else "disabled"
        
        return HealthCheckResponse(
            status="healthy" if all([
                db_status == "healthy",
                redis_status == "healthy"
            ]) else "degraded",
            timestamp=datetime.utcnow(),
            version="1.0.0",
            database_status=db_status,
            redis_status=redis_status,
            quantum_engine_status=quantum_status
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Health check failed: {str(e)}"
        )

@app.post("/api/portfolio/var", response_model=RiskMetricsResponse)
async def calculate_var(
    portfolio_request: PortfolioRequest,
    risk_params: RiskCalculationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    risk_engine: QuantumRiskEngine = Depends(get_risk_engine),
    redis_client = Depends(get_redis)
):
    """Calculate Value-at-Risk for portfolio"""
    try:
        calculation_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        # Check cache first
        cache_key = f"var:{portfolio_request.portfolio_id}:{hash(str(risk_params))}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            cached_data = json.loads(cached_result)
            cached_data["calculation_id"] = calculation_id
            cached_data["from_cache"] = True
            return RiskMetricsResponse(**cached_data)
        
        # Convert request to Portfolio object
        portfolio = Portfolio(
            positions={pos.symbol: pos.weight for pos in portfolio_request.positions},
            prices={pos.symbol: pos.market_value or 100.0 for pos in portfolio_request.positions}
        )
        
        # Load historical data (placeholder - implement actual data loading)
        portfolio.returns = await load_historical_returns(
            [pos.symbol for pos in portfolio_request.positions]
        )
        
        # Calculate VaR
        var_result = risk_engine.calculate_var(
            portfolio=portfolio,
            confidence_level=risk_params.confidence_level,
            time_horizon=risk_params.time_horizon,
            method=risk_params.method
        )
        
        # Calculate comprehensive risk metrics
        comprehensive_metrics = risk_engine.calculate_portfolio_metrics(
            portfolio=portfolio,
            risk_free_rate=risk_params.risk_free_rate
        )
        
        # Prepare response
        response_data = {
            "calculation_id": calculation_id,
            "timestamp": start_time,
            "portfolio_id": portfolio_request.portfolio_id,
            "risk_metrics": {
                "var_95": comprehensive_metrics.var_95,
                "var_99": comprehensive_metrics.var_99,
                "cvar_95": comprehensive_metrics.cvar_95,
                "cvar_99": comprehensive_metrics.cvar_99,
                "volatility_daily": comprehensive_metrics.volatility_daily,
                "volatility_annual": comprehensive_metrics.volatility_annual,
                "sharpe_ratio": comprehensive_metrics.sharpe_ratio,
                "max_drawdown": comprehensive_metrics.max_drawdown,
                "currency": portfolio_request.base_currency
            },
            "methodology": {
                "model_type": risk_params.method,
                "confidence_level": risk_params.confidence_level,
                "time_horizon_days": risk_params.time_horizon,
                "simulation_paths": risk_params.num_simulations,
                "quantum_enhancement": risk_engine.quantum_enabled
            },
            "warnings": validate_portfolio_risk(portfolio_request),
            "computation_time_ms": (datetime.utcnow() - start_time).total_seconds() * 1000
        }
        
        # Cache result for 1 hour
        redis_client.setex(cache_key, 3600, json.dumps(response_data, default=str))
        
        # Log calculation in background
        background_tasks.add_task(
            log_calculation,
            calculation_id,
            portfolio_request.portfolio_id,
            current_user["user_id"],
            "var_calculation"
        )
        
        return RiskMetricsResponse(**response_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"VaR calculation failed: {str(e)}"
        )

@app.post("/api/portfolio/optimize", response_model=OptimizationResponse)
async def optimize_portfolio(
    optimization_request: OptimizationRequest,
    current_user: dict = Depends(get_current_user),
    optimizer: QuantumPortfolioOptimizer = Depends(get_optimizer)
):
    """Optimize portfolio using quantum-inspired algorithms"""
    try:
        optimization_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        # Validate inputs
        if len(optimization_request.expected_returns) != len(optimization_request.symbols):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expected returns and symbols must have same length"
            )
        
        # Load covariance matrix (placeholder - implement actual data loading)
        covariance_matrix = await load_covariance_matrix(optimization_request.symbols)
        
        # Run optimization
        optimization_result = optimizer.optimize_portfolio(
            expected_returns=np.array(optimization_request.expected_returns),
            covariance_matrix=covariance_matrix,
            constraints=optimization_request.constraints or {}
        )
        
        return OptimizationResponse(
            optimization_id=optimization_id,
            timestamp=start_time,
            optimal_weights=optimization_result["weights"].tolist(),
            expected_return=optimization_result["expected_return"],
            volatility=optimization_result["volatility"],
            sharpe_ratio=optimization_result["sharpe_ratio"],
            optimization_method=optimization_result["optimization_method"],
            convergence_info={
                "success": optimization_result["success"],
                "iterations": optimization_result.get("iterations", 0)
            },
            constraints_satisfied=optimization_result["success"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Portfolio optimization failed: {str(e)}"
        )

@app.post("/api/portfolio/stress-test")
async def stress_test_portfolio(
    stress_request: StressTestRequest,
    current_user: dict = Depends(get_current_user),
    risk_engine: QuantumRiskEngine = Depends(get_risk_engine)
):
    """Perform stress testing on portfolio"""
    try:
        # Load portfolio data
        portfolio_data = await load_portfolio_by_id(stress_request.portfolio_id)
        
        if not portfolio_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        portfolio = Portfolio(
            positions=portfolio_data["positions"],
            prices=portfolio_data["prices"]
        )
        
        # Run stress tests
        stress_results = risk_engine.stress_test_portfolio(
            portfolio=portfolio,
            scenarios=stress_request.scenarios
        )
        
        # Format results
        formatted_results = []
        for scenario_name, impact in stress_results.items():
            formatted_results.append({
                "scenario": scenario_name,
                "portfolio_impact_percentage": impact * 100,
                "portfolio_impact_amount": impact * sum(portfolio.positions.values()),
                "severity": classify_stress_severity(impact)
            })
        
        return {
            "stress_test_id": str(uuid.uuid4()),
            "portfolio_id": stress_request.portfolio_id,
            "timestamp": datetime.utcnow(),
            "results": formatted_results,
            "summary": {
                "worst_case_scenario": min(stress_results.items(), key=lambda x: x[1]),
                "best_case_scenario": max(stress_results.items(), key=lambda x: x[1]),
                "scenarios_tested": len(stress_results)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stress testing failed: {str(e)}"
        )

@app.get("/api/portfolio/{portfolio_id}/history")
async def get_portfolio_risk_history(
    portfolio_id: str,
    days: int = Field(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get historical risk metrics for portfolio"""
    try:
        # Implement historical data retrieval
        history_data = await load_portfolio_risk_history(portfolio_id, days)
        
        return {
            "portfolio_id": portfolio_id,
            "time_period_days": days,
            "historical_metrics": history_data,
            "summary_statistics": calculate_historical_summary(history_data)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve portfolio history: {str(e)}"
        )

# Utility functions

def validate_portfolio_risk(portfolio_request: PortfolioRequest) -> List[str]:
    """Validate portfolio for potential risk issues"""
    warnings = []
    
    # Check for concentration risk
    max_weight = max(pos.weight for pos in portfolio_request.positions)
    if max_weight > 0.3:
        warnings.append(f"High concentration risk: {max_weight:.1%} in single position")
    
    # Check for minimum diversification
    if len(portfolio_request.positions) < 5:
        warnings.append("Low diversification: fewer than 5 positions")
    
    # Check for micro positions
    micro_positions = [pos for pos in portfolio_request.positions if pos.weight < 0.01]
    if len(micro_positions) > 10:
        warnings.append(f"Many micro positions ({len(micro_positions)}) may increase transaction costs")
    
    return warnings

def classify_stress_severity(impact: float) -> str:
    """Classify stress test impact severity"""
    if impact >= 0:
        return "positive"
    elif impact > -0.05:
        return "low"
    elif impact > -0.15:
        return "moderate"
    elif impact > -0.30:
        return "high"
    else:
        return "severe"

async def load_historical_returns(symbols: List[str]) -> pd.DataFrame:
    """Load historical returns for symbols (placeholder)"""
    import pandas as pd
    import numpy as np
    
    # Placeholder implementation - replace with actual data source
    dates = pd.date_range(end=datetime.now(), periods=252, freq='D')
    returns_data = {}
    
    for symbol in symbols:
        # Generate synthetic returns for demonstration
        returns_data[symbol] = np.random.normal(0.001, 0.02, len(dates))
    
    return pd.DataFrame(returns_data, index=dates)

async def load_covariance_matrix(symbols: List[str]) -> np.ndarray:
    """Load covariance matrix for symbols (placeholder)"""
    import numpy as np
    
    # Placeholder implementation
    n = len(symbols)
    # Generate a positive definite covariance matrix
    A = np.random.randn(n, n) * 0.01
    return np.dot(A, A.T) + np.eye(n) * 0.0004  # Add small diagonal for stability

async def load_portfolio_by_id(portfolio_id: str) -> Optional[Dict]:
    """Load portfolio data by ID (placeholder)"""
    # Placeholder implementation - replace with actual database query
    return {
        "positions": {"AAPL": 0.3, "GOOGL": 0.3, "TSLA": 0.2, "MSFT": 0.2},
        "prices": {"AAPL": 150.0, "GOOGL": 2800.0, "TSLA": 800.0, "MSFT": 350.0}
    }

async def load_portfolio_risk_history(portfolio_id: str, days: int) -> List[Dict]:
    """Load historical risk metrics (placeholder)"""
    # Placeholder implementation
    return []

def calculate_historical_summary(history_data: List[Dict]) -> Dict:
    """Calculate summary statistics for historical data"""
    if not history_data:
        return {}
    
    # Placeholder implementation
    return {
        "average_var": 0.0,
        "max_var": 0.0,
        "min_var": 0.0,
        "volatility_trend": "stable"
    }

async def log_calculation(calculation_id: str, portfolio_id: str, user_id: str, calculation_type: str):
    """Log calculation for audit purposes"""
    # Implement audit logging
    print(f"Logged calculation: {calculation_id} for user {user_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
