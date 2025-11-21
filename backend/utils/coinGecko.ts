import "dotenv/config";
import axios from 'axios';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_API_URL = process.env.COINGECKO_API_URL;

export const fetchCryptoPrices = async () => {
  if (!COINGECKO_API_URL || !COINGECKO_API_KEY) {
    throw new Error('CoinGecko API configuration is missing');
  }

  try {
    const response = await axios.get(COINGECKO_API_URL, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
      },
      headers: {
        'x-cg-demo-api-key': COINGECKO_API_KEY,
      },
    });
    console.log('Fetched data from CoinGecko API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from CoinGecko API:', error);
    throw error;
  }
}

