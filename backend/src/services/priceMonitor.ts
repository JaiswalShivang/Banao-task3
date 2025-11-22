import { Server as SocketServer } from 'socket.io';
import prisma from '../config/database.js';
import redis from '../config/redis.js';
import { fetchCryptoPrices } from '../utils/coinGecko.js';

let io: SocketServer;

export const initPriceMonitor = (socketServer: SocketServer) => {
  io = socketServer;
  startPriceMonitoring();
};

const startPriceMonitoring = () => {
  setInterval(async () => {
    try {
      const prices = await fetchCryptoPrices();
      
      try {
        await redis.set('crypto_prices', JSON.stringify(prices), 'EX', 60);
      } catch (err) {
        console.log('Redis cache update skipped');
      }
      
      io.emit('prices', prices);
      
      await checkAlerts(prices);
    } catch (error) {
      console.error('Price monitoring error:', error);
    }
  }, 30000);
};

const checkAlerts = async (prices: any[]) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { triggered: false },
      include: { user: true },
    });

    for (const alert of alerts) {
      const coin = prices.find(p => p.id === alert.coinId);
      if (!coin) continue;

      const currentPrice = coin.current_price;
      let shouldTrigger = false;

      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: { triggered: true },
        });

        io.emit(`alert-${alert.userId}`, {
          alertId: alert.id,
          coinId: alert.coinId,
          coinName: coin.name,
          condition: alert.condition,
          targetPrice: alert.targetPrice,
          currentPrice,
          message: `${coin.name} is now ${alert.condition} $${alert.targetPrice}. Current price: $${currentPrice}`,
        });
      }
    }
  } catch (error) {
    console.error('Alert checking error:', error);
  }
};
