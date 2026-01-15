from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from binance import Client
import logging
import os
from typing import Optional
from dotenv import load_dotenv
import random
from datetime import datetime

load_dotenv()

app = FastAPI(title="Binance Trading Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://binance-trading-bot-zeta.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Mock mode flag
MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"

class OrderRequest(BaseModel):
    symbol: str
    side: str  # BUY or SELL
    type: str  # MARKET or LIMIT
    quantity: float
    price: Optional[float] = None

class BasicBot:
    def __init__(self, api_key: str, api_secret: str, testnet: bool = True):
        self.mock_mode = MOCK_MODE
        if self.mock_mode:
            logger.info("Bot initialized in MOCK MODE")
            return
            
        if not api_key or not api_secret or api_key == "your_api_key":
            raise ValueError("Invalid API credentials")
        self.client = Client(api_key, api_secret, testnet=testnet)
        self.client.API_URL = 'https://testnet.binancefuture.com/fapi'
        logger.info("Bot initialized with testnet mode")

    def place_order(self, symbol: str, side: str, order_type: str, quantity: float, price: float = None):
        if self.mock_mode:
            # Mock order response
            mock_order = {
                "orderId": random.randint(1000000, 9999999),
                "symbol": symbol,
                "status": "FILLED",
                "clientOrderId": f"mock_{int(datetime.now().timestamp())}",
                "price": str(price) if price else str(random.uniform(40000, 60000)),
                "origQty": str(quantity),
                "executedQty": str(quantity),
                "cumQuote": str(quantity * (price or random.uniform(40000, 60000))),
                "timeInForce": "GTC" if order_type == "LIMIT" else "IOC",
                "type": order_type,
                "side": side,
                "updateTime": int(datetime.now().timestamp() * 1000)
            }
            logger.info(f"MOCK Order placed: {mock_order}")
            return mock_order
            
        try:
            if order_type == "MARKET":
                order = self.client.futures_create_order(
                    symbol=symbol,
                    side=side,
                    type=order_type,
                    quantity=quantity
                )
            else:  # LIMIT
                order = self.client.futures_create_order(
                    symbol=symbol,
                    side=side,
                    type=order_type,
                    quantity=quantity,
                    price=price,
                    timeInForce='GTC'
                )
            
            logger.info(f"Order placed: {order}")
            return order
        except Exception as e:
            logger.error(f"Order failed: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

# Initialize bot
API_KEY = os.getenv("BINANCE_API_KEY")
API_SECRET = os.getenv("BINANCE_API_SECRET")

try:
    bot = BasicBot(API_KEY, API_SECRET)
except Exception as e:
    logger.error(f"Bot initialization failed: {e}")
    if MOCK_MODE:
        bot = BasicBot("", "")  # Mock bot
    else:
        bot = None

@app.get("/test-connection")
async def test_connection():
    if not bot:
        raise HTTPException(status_code=500, detail="Bot not initialized")
    
    if MOCK_MODE:
        return {"status": "connected (MOCK MODE)", "balance": "10000.00"}
        
    try:
        account = bot.client.futures_account()
        return {"status": "connected", "balance": account.get('totalWalletBalance', 'N/A')}
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

@app.post("/place-order")
async def place_order(order: OrderRequest):
    if not bot:
        raise HTTPException(status_code=500, detail="Bot not initialized - check API credentials")
    return bot.place_order(
        symbol=order.symbol,
        side=order.side,
        order_type=order.type,
        quantity=order.quantity,
        price=order.price
    )

@app.get("/account")
async def get_account():
    if not bot:
        raise HTTPException(status_code=500, detail="Bot not initialized - check API credentials")
    try:
        return bot.client.futures_account()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "bot_initialized": bot is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
