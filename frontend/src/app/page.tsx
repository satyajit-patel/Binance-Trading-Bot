'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [order, setOrder] = useState({
    symbol: 'BTCUSDT',
    side: 'BUY',
    type: 'MARKET',
    quantity: '0.001',
    price: '50000'
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('unknown')

  useEffect(() => {
    const pingBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/health')
        const data = await response.json()
        console.log('Backend ping response:', data)
        setConnectionStatus(response.ok ? 'healthy' : 'error')
      } catch (error) {
        console.log('Backend ping error:', error)
        setConnectionStatus('offline')
      }
    }
    
    pingBackend()
  }, [])

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/test-connection')
      const data = await response.json()
      if (response.ok) {
        setConnectionStatus('connected')
        setResult(`✅ Connected! Balance: ${data.balance} USDT`)
      } else {
        setConnectionStatus('error')
        setResult(`❌ Connection failed: ${data.detail}`)
      }
    } catch (error) {
      setConnectionStatus('error')
      setResult(`❌ Network error: ${error}`)
    }
  }

  const placeOrder = async () => {
    setLoading(true)
    setResult('')
    try {
      const response = await fetch('http://localhost:8000/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...order,
          quantity: parseFloat(order.quantity),
          price: order.price ? parseFloat(order.price) : null
        })
      })
      const data = await response.json()
      if (response.ok) {
        setResult(JSON.stringify(data, null, 2))
      } else {
        setResult(`Error: ${data.detail}`)
      }
    } catch (error) {
      setResult(`Network Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Binance Trading Bot
          </h1>
          <p className="text-gray-400">Futures Testnet Trading Interface</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Place Order</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Symbol</label>
                <input
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  value={order.symbol}
                  placeholder="e.g., BTCUSDT"
                  onChange={(e) => setOrder({...order, symbol: e.target.value.toUpperCase()})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Side</label>
                  <select
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    value={order.side}
                    onChange={(e) => setOrder({...order, side: e.target.value})}
                  >
                    <option value="BUY" className="bg-green-600">🟢 BUY</option>
                    <option value="SELL" className="bg-red-600">🔴 SELL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Type</label>
                  <select
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    value={order.type}
                    onChange={(e) => setOrder({...order, type: e.target.value})}
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Quantity</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={order.quantity}
                  placeholder="0.001"
                  onChange={(e) => setOrder({...order, quantity: e.target.value})}
                />
              </div>
              
              {order.type === 'LIMIT' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Price (USDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    value={order.price}
                    placeholder="50000"
                    onChange={(e) => setOrder({...order, price: e.target.value})}
                  />
                </div>
              )}
              
              <button
                onClick={testConnection}
                className="w-full p-3 mb-4 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 transition-colors"
              >
                Test Connection
              </button>
              
              <button
                onClick={placeOrder}
                disabled={loading || !order.quantity}
                className={`w-full p-4 rounded-lg font-semibold text-lg transition-all ${
                  loading || !order.quantity
                    ? 'bg-gray-600 cursor-not-allowed'
                    : order.side === 'BUY'
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25'
                    : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </div>
                ) : (
                  `${order.side} ${order.symbol}`
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Order Result</h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : result ? (
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 h-64 overflow-auto">
                <pre className={`text-sm ${result.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {result}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 h-64 flex items-center justify-center text-gray-500">
                Order results will appear here...
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>⚠️ This is connected to Binance Futures Testnet - No real money involved</p>
        </div>
      </div>
    </div>
  )
}
