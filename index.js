const puppeteer = require('puppeteer');
const axios = require('axios');
const cron = require('node-cron');

// Discord Webhook URL
const webhookUrl = 'YOUR_DISCORD_WEBHOOK_URL';

// Cron schedule (e.g., every hour)
const cronSchedule = '0 * * * *'; // Runs every hour

// Function to scrape and send notifications
const scrapeAndNotify = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://genshinaccounts.com/collections/honkai-star-rail-character-starter-accounts';

  await page.goto(url);

  // You can add your scraping logic here to extract the desired data from the webpage.
  // Example: Extract product titles
  const productTitles = await page.$$eval('.product-title', (elements) =>
    elements.map((element) => element.textContent.trim())
  );

  // Example: Extract product availability (you might need to customize this based on the site's structure)
  const productAvailability = await page.$$eval('.product-availability', (elements) =>
    elements.map((element) => element.textContent.trim())
  );

  // Close the browser when done
  await browser.close();

  // Initialize an array to store embeds
  const embeds = [];

  // Check which products are back in stock and create embeds
  for (let i = 0; i < productTitles.length; i++) {
    if (productAvailability[i] === 'In Stock') {
      // Product is in stock, create a Discord embed
      const embed = {
        title: `${productTitles[i]} is back in stock on ${url}`,
        color: 0x00FF00, // Green color
        timestamp: new Date(),
      };

      embeds.push(embed);

      console.log(`${productTitles[i]} is back in stock! Notification sent.`);
    } else {
      console.log(`${productTitles[i]} is still out of stock.`);
    }
  }

  // Send Discord webhook with embeds if there are any
  if (embeds.length > 0) {
    const message = {
      embeds,
    };

    await axios.post(webhookUrl, message);
  }
};

// Schedule the script to run at the specified interval
cron.schedule(cronSchedule, () => {
  console.log('Running the script...');
  scrapeAndNotify().catch((error) => console.error('Error:', error));
});
