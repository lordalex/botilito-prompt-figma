const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const viewports = [
  { name: 'Desktop-Large', width: 1920, height: 1080 },
  { name: 'Desktop', width: 1366, height: 768 },
  { name: 'Tablet-Landscape', width: 1024, height: 768 },
  { name: 'Tablet-Portrait', width: 768, height: 1024 },
  { name: 'Mobile-Large', width: 414, height: 896 },
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Mobile-Small', width: 320, height: 568 }
];

const url = 'http://localhost:3001';
const outputDir = path.join(__dirname, 'responsiveness-screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = [];

  console.log('Testing Login Page Responsiveness\n');
  console.log('='.repeat(60));

  for (const viewport of viewports) {
    console.log(`\nTesting ${viewport.name} (${viewport.width}x${viewport.height})`);

    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait a bit for any animations
    await new Promise(resolve => setTimeout(resolve, 500));

    // Analyze layout
    const analysis = await page.evaluate(() => {
      const form = document.querySelector('form');
      const body = document.body;
      const loginButton = document.querySelector('button[type="submit"]');
      const inputs = document.querySelectorAll('input');
      const logo = document.querySelector('img');

      return {
        hasHorizontalScroll: body.scrollWidth > window.innerWidth,
        hasVerticalScroll: body.scrollHeight > window.innerHeight,
        bodyScrollWidth: body.scrollWidth,
        bodyScrollHeight: body.scrollHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        formVisible: !!form,
        formDimensions: form ? {
          width: form.offsetWidth,
          height: form.offsetHeight,
          top: form.offsetTop,
          left: form.offsetLeft
        } : null,
        buttonVisible: !!loginButton,
        inputsCount: inputs.length,
        logoVisible: !!logo,
        logoDimensions: logo ? {
          width: logo.offsetWidth,
          height: logo.offsetHeight
        } : null
      };
    });

    // Take screenshot
    const screenshotPath = path.join(outputDir, `${viewport.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    const result = {
      viewport: viewport.name,
      size: `${viewport.width}x${viewport.height}`,
      screenshot: screenshotPath,
      ...analysis
    };

    results.push(result);

    // Print analysis
    console.log(`  ✓ Screenshot saved: ${viewport.name}.png`);
    console.log(`  - Horizontal scroll: ${analysis.hasHorizontalScroll ? '⚠️  YES (ISSUE!)' : '✓ No'}`);
    console.log(`  - Vertical scroll: ${analysis.hasVerticalScroll ? 'Yes' : 'No'}`);
    console.log(`  - Form visible: ${analysis.formVisible ? '✓ Yes' : '✗ No'}`);
    if (analysis.formDimensions) {
      console.log(`  - Form width: ${analysis.formDimensions.width}px`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESPONSIVENESS SUMMARY\n');

  const issues = results.filter(r => r.hasHorizontalScroll);

  if (issues.length === 0) {
    console.log('✅ No horizontal scroll issues detected!');
  } else {
    console.log(`⚠️  Found ${issues.length} viewport(s) with horizontal scroll:`);
    issues.forEach(issue => {
      console.log(`   - ${issue.viewport}: ${issue.bodyScrollWidth}px content in ${issue.windowWidth}px viewport`);
    });
  }

  console.log('\n📁 Screenshots saved to: ' + outputDir);

  // Save JSON report
  const reportPath = path.join(outputDir, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('📄 Detailed report: ' + reportPath);

  await browser.close();
})();
