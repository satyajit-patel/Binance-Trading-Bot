# Binance Trading Bot

🚀 **Live Demo**: [https://binance-trading-bot-omega.vercel.app/](https://binance-trading-bot-omega.vercel.app/)

🎥 **Demo Video**: [https://drive.google.com/file/d/14zPaGwGEJ1grXd4sgspPl_fBjMnYsHhU/view?usp=sharing](https://drive.google.com/file/d/14zPaGwGEJ1grXd4sgspPl_fBjMnYsHhU/view?usp=sharing)

A simplified trading bot for Binance Futures Testnet with a modern web interface.

## What it does

This application allows you to place BUY/SELL orders on Binance Futures Testnet using both MARKET and LIMIT order types. It features a sleek dark-themed web interface with real-time feedback, loading states, and comprehensive error handling.

## Flow

1. **Setup**: Configure Binance Testnet API credentials in `.env`
2. **Order Placement**: Use the web interface to select symbol, side (BUY/SELL), type (MARKET/LIMIT), quantity, and price
3. **Execution**: Bot sends order to Binance API via python-binance library
4. **Response**: Real-time display of order details and execution status
5. **Logging**: All requests, responses, and errors are logged in the backend

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI server with trading endpoints
│   ├── requirements.txt # Python dependencies
│   ├── .env            # API credentials (create from .env.example)
│   └── .env.example    # Environment template
├── frontend/
│   └── src/app/page.tsx # Next.js trading interface
└── README.md
```

## Setup

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file with your Binance Testnet credentials
cp .env.example .env
# Edit .env and add your API keys

python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Get Binance Testnet Credentials
1. Visit [Binance Testnet](https://testnet.binancefuture.com)
2. Create account and generate API keys
3. Add keys to `backend/.env` file

## Features

- ✅ **Modern UI**: Dark-themed interface with gradients and animations
- ✅ **Real-time Feedback**: Loading spinners and status updates
- ✅ **Order Types**: Market and Limit orders
- ✅ **Trading Sides**: Buy/Sell with color-coded buttons
- ✅ **Input Validation**: Form validation and error handling
- ✅ **Testnet Integration**: Safe testing environment
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Logging**: Backend request/response logging

## API Endpoints

- `POST /place-order` - Place trading orders
- `GET /account` - Get account information
- `GET /health` - Health check and bot status

## Requirements

- Python 3.7+
- Node.js 18+
- Binance Testnet account with API credentials

## Troubleshooting

**API Key Error**: Ensure your `.env` file has valid Binance Testnet API credentials
**CORS Error**: Make sure backend is running on port 8000
**Network Error**: Check if both frontend (3000) and backend (8000) are running
