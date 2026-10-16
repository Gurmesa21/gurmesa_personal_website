// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, '../docs/evidence/day14-5/partD1/reproduction');

async function reproduce(type, listUrl, addBtn, formFields) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));

  const failedRequests = [];
  page.on('response', async (res) => {
    if (res.status() >= 400) {
      let body = '';
      try {
        body = await res.text();
      } catch(e) {}
      failedRequests.push({ url: res.url(), status: res.status(), body });
    }
  });

  try {
    console.log(`Reproducing for ${type}...`);
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/admin');

    await page.goto(`http://localhost:3000${listUrl}`);
    
    // Check if Edit button exists
    let editLinks = page.locator('a:has-text("Edit"), button:has-text("Edit")');
    if (await editLinks.count() === 0) {
      console.log(`No edit button, creating one...`);
      await page.click(`text="${addBtn}"`);
      await page.waitForTimeout(1000);
      for (const [selector, value] of Object.entries(formFields)) {
        await page.fill(selector, value);
      }
      await page.click('button[type="submit"]');
      await page.waitForURL(`**/admin/${type}**`);
      await page.waitForTimeout(1000);
    }
    
    editLinks = page.locator('a:has-text("Edit"), button:has-text("Edit")');
    
    if (await editLinks.count() > 0) {
        await editLinks.first().click();
        console.log(`Clicked Edit on ${type}. Waiting a bit...`);
        await page.waitForTimeout(3000);
    } else {
        console.log(`STILL Could not find Edit button on ${listUrl}`);
    }

    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    
    const screenshotPath = path.join(EVIDENCE_DIR, `${type}-error.png`);
    await page.screenshot({ path: screenshotPath });

    const reportPath = path.join(EVIDENCE_DIR, `${type}-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify({ consoleLogs, failedRequests }, null, 2));
    
    console.log(`Saved evidence for ${type}`);

  } catch (err) {
    console.error(`Error during ${type}:`, err);
  } finally {
    await browser.close();
  }
}

async function run() {
  await reproduce('services', '/admin/services', 'Add Service', {
    'input[name="title"]': 'Test Service',
    'input[name="slug"]': 'test-service',
    'input[name="summary"]': 'test',
    'textarea[name="description"]': 'test desc'
  });
  
  await reproduce('projects', '/admin/projects', 'Add Project', {
    'input[name="title"]': 'Test Project',
    'input[name="slug"]': 'test-project',
    'input[name="summary"]': 'test'
  });

  await reproduce('blog', '/admin/blog', 'Add Post', {
    'input[name="title"]': 'Test Post',
    'input[name="slug"]': 'test-post',
    'textarea[name="excerpt"]': 'test',
    'textarea[name="body"]': 'test body'
  });
}

run();
