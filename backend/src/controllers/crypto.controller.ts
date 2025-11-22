import type { Request, Response } from "express";
import redis from "../config/redis.js";
import { fetchCryptoPrices } from "../utils/coinGecko.js";

export const getCryptoPrices = async (req: Request, res: Response) => {
  try {
    let cached = null;
    
    try {
      cached = await redis.get('crypto_prices');
    } catch (err) {
      console.log('Redis not available, fetching fresh data');
    }
    
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    
    const prices = await fetchCryptoPrices();
    
    try {
      await redis.set('crypto_prices', JSON.stringify(prices), 'EX', 60);
    } catch (err) {
      console.log('Could not cache prices in Redis');
    }
    
    res.status(200).json(prices);
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
