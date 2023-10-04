const puppeteer = require('puppeteer');
const axios = require('axios');
require('dotenv').config();

// Discord Webhook URL
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// Function to scrape and send notifications
const scrapeAndNotify = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://genshinaccounts.com/collections/honkai-star-rail-character-starter-accounts';

  await page.goto(url);

  // Scrape product titles and availability
  const productData = await page.$$eval('.card__content', (elements) => {
    return elements.map((element) => {
      const titleElement = element.querySelector('.card__heading a');
      const availabilityElement = element.querySelector('.badge--bottom-left');

      const title = titleElement ? titleElement.textContent.trim() : 'N/A';
      const availability = availabilityElement ? availabilityElement.textContent.trim() : 'N/A';

      return { title, availability };
    });
  });

  // Close the browser when done
  await browser.close();

  // Initialize an array to store embeds
  const embeds = [];

  // Check which products are back in stock and create embeds
  for (const { title, availability } of productData) {
    if (availability === 'In Stock') {
      // Product is in stock, create a Discord embed
      const embed = {
        title: `${title} is back in stock on ${url}`,
        color: 0x00FF00, // Green color
        timestamp: new Date(),
      };

      embeds.push(embed);

      console.log(`${title} is back in stock! Notification sent.`);
    } else {
      console.log(`${title} is still out of stock.`);
    }
  }

  // Send Discord webhook with embeds if there are any
  if (embeds.length > 0) {
    const message = {
      embeds,
    };

    await axios.post(webhookUrl, message);
  }

  // Wait for a specified interval (e.g., 1 hour) before running again
  const intervalInMilliseconds = 60 * 60 * 1000; // 1 hour
  setTimeout(scrapeAndNotify, intervalInMilliseconds);
};

// Start the script
scrapeAndNotify().catch((error) => console.error('Error:', error));
