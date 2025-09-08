// Frontend Dashboard Components
// [Version 11-01-2025 15:50:00]
// /frontend/src/components/RiskDashboard.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Shield } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         BarChart, Bar, PieChart, Pie, Cell, Heatmap } from 'recharts'

// Types for our risk data
interface PortfolioPosition {
  symbol: string
  weight: number
  marketValue: number
  quantity?: number
}

interface RiskMetrics {
  var_95: number
  var_99: number
  cvar_95: number
  cvar_99: number
  volatility_daily: number
  volatility_annual: number
  sharpe_ratio: number
  max_drawdown: number
}

interface Portfolio {
  id: string
  name: string
  positions: PortfolioPosition[]
  totalValue: number
  lastUpdated: Date
}

interface RiskCalculationResult {
  calculation_id: string
  timestamp: string
  portfolio_id: string
  risk_metrics: RiskMetrics
  methodology: {
    model_type: string
    confidence_level: number
    time_horizon_days: number
    quantum_enhancement: boolean
  }
  warnings: string[]
  computation_time_ms: number
}

// API client
class RiskAPIClient {
  private baseURL: string
  
  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000') {
    this.baseURL = baseURL
  }
  
  async calculateVaR(portfolio: Portfolio, params: {
    confidence_level: number
    time_horizon: number
    method: string
    num_simulations?: number
  }): Promise<RiskCalculationResult> {
    const response = await fetch(`${this.baseURL}/api/portfolio/var`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        portfolio_id: portfolio.id,
        name: portfolio.name,
        positions: portfolio.positions.map(pos => ({
          symbol: pos.symbol,
          weight: pos.weight,
          market_value: pos.marketValue
        })),
        base_currency: 'USD'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Risk calculation failed: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async optimizePortfolio(symbols: string[], expectedReturns: number[], constraints?: any) {
    const response = await fetch(`${this.baseURL}/api/portfolio/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        symbols,
        expected_returns: expectedReturns,
        risk_aversion: 1.0,
        constraints,
        optimization_method: 'quantum_inspired'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Portfolio optimization failed: ${response.statusText}`)
    }
    
    return response.json()
  }
}

// Risk metrics display component
const RiskMetricsCard: React.FC<{ metrics: RiskMetrics; loading: boolean }> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating Risk Metrics...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  
  const formatPercent = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">VaR (95%)</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.var_95)}</div>
          <p className="text-xs text-muted-foreground">1-day 95% confidence</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CVaR (95%)</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.cvar_95)}</div>
          <p className="text-xs text-muted-foreground">Expected shortfall</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volatility</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatPercent(metrics.volatility_annual)}</div>
          <p className="text-xs text-muted-foreground">Annualized volatility</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          <Shield className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.sharpe_ratio.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Portfolio composition chart
const PortfolioComposition: React.FC<{ positions: PortfolioPosition[] }> = ({ positions }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']
  
  const chartData = positions.map((pos, index) => ({
    name: pos.symbol,
    value: pos.weight * 100,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Composition</CardTitle>
        <CardDescription>Asset allocation by weight</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Weight']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Risk calculation controls
const RiskCalculationControls: React.FC<{
  onCalculate: (params: any) => void
  loading: boolean
}> = ({ onCalculate, loading }) => {
  const [confidenceLevel, setConfidenceLevel] = useState(0.95)
  const [timeHorizon, setTimeHorizon] = useState(1)
  const [method, setMethod] = useState('quantum_mc')
  const [numSimulations, setNumSimulations] = useState(10000)

  const handleCalculate = () => {
    onCalculate({
      confidence_level: confidenceLevel,
      time_horizon: timeHorizon,
      method,
      num_simulations: numSimulations
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Calculation Parameters</CardTitle>
        <CardDescription>Configure risk modeling parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="confidence">Confidence Level</Label>
            <Select value={confidenceLevel.toString()} onValueChange={(value) => setConfidenceLevel(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.90">90%</SelectItem>
                <SelectItem value="0.95">95%</SelectItem>
                <SelectItem value="0.99">99%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="horizon">Time Horizon (days)</Label>
            <Input
              id="horizon"
              type="number"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              min={1}
              max={252}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="method">Calculation Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantum_mc">Quantum Monte Carlo</SelectItem>
              <SelectItem value="monte_carlo">Classical Monte Carlo</SelectItem>
              <SelectItem value="historical">Historical Simulation</SelectItem>
              <SelectItem value="parametric">Parametric VaR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(method === 'monte_carlo' || method === 'quantum_mc') && (
          <div className="space-y-2">
            <Label htmlFor="simulations">Number of Simulations</Label>
            <Input
              id="simulations"
              type="number"
              value={numSimulations}
              onChange={(e) => setNumSimulations(Number(e.target.value))}
              min={1000}
              max={100000}
              step={1000}
            />
          </div>
        )}
        
        <Button onClick={handleCalculate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Calculate Risk Metrics'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Main dashboard component
const RiskDashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [calculationTime, setCalculationTime] = useState<number>(0)

  const apiClient = useMemo(() => new RiskAPIClient(), [])

  // Sample portfolio data - replace with actual data loading
  useEffect(() => {
    const samplePortfolio: Portfolio = {
      id: 'sample-portfolio-1',
      name: 'Sample Technology Portfolio',
      positions: [
        { symbol: 'AAPL', weight: 0.25, marketValue: 250000 },
        { symbol: 'GOOGL', weight: 0.25, marketValue: 250000 },
        { symbol: 'MSFT', weight: 0.20, marketValue: 200000 },
        { symbol: 'TSLA', weight: 0.15, marketValue: 150000 },
        { symbol: 'NVDA', weight: 0.15, marketValue: 150000 }
      ],
      totalValue: 1000000,
      lastUpdated: new Date()
    }
    setPortfolio(samplePortfolio)
  }, [])

  const handleCalculateRisk = async (params: any) => {
    if (!portfolio) return
    
    setLoading(true)
    try {
      const result = await apiClient.calculateVaR(portfolio, params)
      setRiskMetrics(result.risk_metrics)
      setWarnings(result.warnings || [])
      setCalculationTime(result.computation_time_ms)
    } catch (error) {
      console.error('Risk calculation failed:', error)
      // Handle error appropriately
    } finally {
      setLoading(false)
    }
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading portfolio...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Dashboard</h1>
          <p className="text-muted-foreground">
            Quantum-inspired risk analysis for {portfolio.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Portfolio Value: {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(portfolio.totalValue)}
          </Badge>
          {calculationTime > 0 && (
            <Badge variant="secondary">
              Computed in {calculationTime.toFixed(0)}ms
            </Badge>
          )}
        </div>
      </div>

      {warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {riskMetrics && <RiskMetricsCard metrics={riskMetrics} loading={loading} />}
          <PortfolioComposition positions={portfolio.positions} />
        </div>
        
        <div className="space-y-6">
          <RiskCalculationControls onCalculate={handleCalculateRisk} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default RiskDashboard

// Additional utility components for quantum visualization
export const QuantumAlgorithmIndicator: React.FC<{ enabled: boolean; method: string }> = ({ 
  enabled, 
  method 
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
    <span className="text-sm">
      {enabled ? `Quantum Enhanced (${method})` : 'Classical Method'}
    </span>
  </div>
)

export const PerformanceBenchmark: React.FC<{ 
  calculationTime: number; 
  method: string 
}> = ({ calculationTime, method }) => {
  const getBenchmarkStatus = (time: number, method: string) => {
    const thresholds = {
      'quantum_mc': 5000,
      'monte_carlo': 3000,
      'historical': 2000,
      'parametric': 1000
    }
    
    const threshold = thresholds[method as keyof typeof thresholds] || 2000
    return time <= threshold ? 'excellent' : time <= threshold * 2 ? 'good' : 'needs_optimization'
  }
  
  const status = getBenchmarkStatus(calculationTime, method)
  const statusColors = {
    excellent: 'text-green-600',
    good: 'text-yellow-600',
    needs_optimization: 'text-red-600'
  }
  
  return (
    <div className={`text-sm ${statusColors[status]}`}>
      Performance: {status.replace('_', ' ')} ({calculationTime.toFixed(0)}ms)
    </div>
  )
}
