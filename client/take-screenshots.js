import puppeteer from 'puppeteer';
import path from 'path';

const OUT_DIR = 'C:\\Users\\shanm\\.gemini\\antigravity\\brain\\5dda270f-e488-4f35-aa09-b90c14bf4ed9';

async function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: "new", defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to Home...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await delay(3000); 
    await page.screenshot({ path: path.join(OUT_DIR, 'home_page.png'), fullPage: true });

    console.log("Navigating to Login...");
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(OUT_DIR, 'login_page.png') });

    console.log("Logging in...");
    await page.type('input[type="email"]', 'admin@moviebooking.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log("Navigating to Admin...");
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
    await delay(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'admin_dashboard.png'), fullPage: true });

    console.log("Navigating to Profile...");
    await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle2' });
    await delay(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'profile_page.png'), fullPage: true });

    console.log("All screenshots taken successfully!");
  } catch (error) {
    console.error("Error during screenshot generation:", error);
  } finally {
    await browser.close();
  }
})();
