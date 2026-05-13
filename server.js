require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { chromium } = require('playwright');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || 'USD';

async function scrapeListings(brainrot, mutation) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const searchQuery = mutation
      ? `${brainrot} ${mutation}`
      : brainrot;

    const url = `https://www.eldorado.gg/items?search=${encodeURIComponent(searchQuery)}`;

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    const listings = await page.evaluate(() => {
      const data = [];
      const cards = document.querySelectorAll('div');

      cards.forEach(card => {
        const text = card.innerText || '';

        const priceMatch = text.match(/\$\s?(\d+(\.\d+)?)/);

        if (priceMatch) {
          data.push({
            title: text.split('\n')[0],
            price: parseFloat(priceMatch[1])
          });
        }
      });

      return data;
    });

    const filtered = listings.filter(item => {
      const title = item.title.toLowerCase();

      const brainrotMatch = title.includes(brainrot.toLowerCase());

      const mutationMatch = mutation
        ? title.includes(mutation.toLowerCase())
        : true;

      return brainrotMatch && mutationMatch;
    });

    await browser.close();

    return filtered;

  } catch (err) {
    await browser.close();
    throw err;
  }
}

async function convertCurrency(amount, currency) {
  if (currency.toUpperCase() === 'USD') {
    return amount;
  }

  try {
    const response = await axios.get(
      `https://api.exchangerate.host/convert?from=USD&to=${currency}&amount=${amount}`
    );

    return response.data.result || amount;
  } catch {
    return amount;
  }
}

app.post('/api/check', async (req, res) => {
  try {
    const {
      brainrot,
      mutation,
      currency = DEFAULT_CURRENCY
    } = req.body;

    if (!brainrot) {
      return res.status(400).json({
        error: 'Brainrot value required'
      });
    }

    const listings = await scrapeListings(brainrot, mutation);

    if (!listings.length) {
      return res.json({
        success: false,
        message: 'No listings found'
      });
    }

    const prices = listings.map(l => l.price);

    const averageUSD =
      prices.reduce((a, b) => a + b, 0) / prices.length;

    const convertedAverage =
      await convertCurrency(averageUSD, currency);

    res.json({
      success: true,
      search: {
        brainrot,
        mutation,
        currency
      },
      stats: {
        listingCount: listings.length,
        averageUSD: averageUSD.toFixed(2),
        convertedAverage: convertedAverage.toFixed(2),
        lowest: Math.min(...prices).toFixed(2),
        highest: Math.max(...prices).toFixed(2)
      },
      listings
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to scrape listings'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});