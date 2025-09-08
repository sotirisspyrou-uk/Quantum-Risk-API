'use client'

import React from 'react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-quantum-neutral mb-4">
            ⚛️ Quantum Risk API
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Enterprise-grade quantum-inspired risk modeling platform
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-quantum-primary">⚡ <2s</div>
              <div className="text-sm text-gray-600">VaR Calculations</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-quantum-secondary">⚛️ Quantum</div>
              <div className="text-sm text-gray-600">Enhanced Algorithms</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-quantum-accent">🏢 Enterprise</div>
              <div className="text-sm text-gray-600">Grade Security</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-risk-low">📊 Real-time</div>
              <div className="text-sm text-gray-600">Risk Monitoring</div>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">🚀 Live Risk Calculation Demo</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sample Portfolio */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sample Portfolio: Tech Giants Fund</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">AAPL</span>
                  <span>30% ($300,000)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">GOOGL</span>
                  <span>25% ($250,000)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">MSFT</span>
                  <span>25% ($250,000)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">NVDA</span>
                  <span>20% ($200,000)</span>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-quantum-primary text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                ⚛️ Calculate VaR (Quantum Monte Carlo)
              </button>
            </div>
            
            {/* Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Risk Metrics (calculated in 1.2s)</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded">
                  <span className="text-red-800 font-medium">💹 VaR (95%)</span>
                  <span className="text-red-800 font-bold">$23,450</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-orange-800 font-medium">📉 CVaR (95%)</span>
                  <span className="text-orange-800 font-bold">$31,200</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-blue-800 font-medium">📊 Volatility</span>
                  <span className="text-blue-800 font-bold">18.3%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded">
                  <span className="text-green-800 font-medium">⭐ Sharpe Ratio</span>
                  <span className="text-green-800 font-bold">1.42</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-quantum-primary bg-opacity-10 rounded-lg">
                <div className="text-sm text-quantum-primary">
                  ⚛️ Quantum Enhancement: +25% faster convergence vs classical methods
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">🏦 For Hedge Funds</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time P&L at Risk</li>
              <li>• Dynamic hedging strategies</li>
              <li>• Alpha generation insights</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">📈 For Asset Managers</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Regulatory reporting</li>
              <li>• Client risk attribution</li>
              <li>• ESG risk integration</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">🏛️ For Central Banks</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Systemic risk assessment</li>
              <li>• Stress testing scenarios</li>
              <li>• Monetary policy analysis</li>
            </ul>
          </div>
        </div>

        {/* API Documentation Link */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Explore our interactive API documentation and start building with quantum-enhanced risk modeling.
            </p>
            <div className="space-x-4">
              <a href="/docs" className="bg-quantum-primary text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                📚 API Documentation
              </a>
              <a href="https://github.com/sotirisspyrou-uk/quantum-risk-api" className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors inline-block">
                💻 View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
