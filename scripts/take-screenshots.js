import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
  console.log('Starting Vite preview server on port', PORT);
  const server = spawn('npx', ['vite', 'preview', '--port', PORT.toString()], {
    cwd: ROOT,
    shell: true,
    stdio: 'pipe'
  });

  server.stdout.on('data', (data) => {
    // console.log(`[server]: ${data}`);
  });

  server.stderr.on('data', (data) => {
    // console.error(`[server err]: ${data}`);
  });

  // Wait for server to be responsive
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        console.log('Preview server is ready!');
        return server;
      }
    } catch (e) {
      // wait
    }
    await sleep(300);
  }
  throw new Error('Server failed to start');
}

async function capture() {
  const server = await startServer();

  console.log('Launching Edge Chromium...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2 // High DPI retina
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Public pages list
  const publicPages = [
    { name: '01_home', hash: '#/' },
    { name: '02_journal', hash: '#/journal' },
    { name: '03_students', hash: '#/students' },
    { name: '04_leaderboard', hash: '#/leaderboard' },
    { name: '05_competitions', hash: '#/competitions' },
    { name: '06_about', hash: '#/about' },
    { name: '07_developer', hash: '#/developer' },
    { name: '08_admin_login', hash: '#/admin/login' }
  ];

  console.log('\n--- Capturing Public Pages ---');
  for (const p of publicPages) {
    const url = `${BASE_URL}/${p.hash}`;
    console.log(`Capturing ${p.name} from ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await sleep(500); // Allow icons & fonts to settle
    const filePath = path.join(SCREENSHOTS_DIR, `${p.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved: ${filePath}`);
  }

  // Get a student id for student profile
  const studentId = await page.evaluate(() => {
    const students = JSON.parse(localStorage.getItem('sanad_students') || '[]');
    return students[0] ? students[0].id : null;
  });

  if (studentId) {
    console.log(`Capturing 03_student_profile for student ${studentId}...`);
    await page.goto(`${BASE_URL}/#/student/${studentId}`, { waitUntil: 'networkidle0' });
    await sleep(500);
    const profilePath = path.join(SCREENSHOTS_DIR, '03_student_profile.png');
    await page.screenshot({ path: profilePath, fullPage: true });
    console.log(`Saved: ${profilePath}`);
  }

  // Enable admin session
  console.log('\n--- Authenticating as Admin for Administrative Modules ---');
  await page.evaluate(() => {
    localStorage.setItem('sanad_admin_session', 'true');
    sessionStorage.setItem('sanad_admin_session', 'true');
  });

  const adminPages = [
    { name: '09_admin_dashboard', hash: '#/admin/dashboard' },
    { name: '10_admin_attendance', hash: '#/admin/attendance' },
    { name: '11_admin_memorization', hash: '#/admin/memorization' },
    { name: '12_admin_journal', hash: '#/admin/journal' },
    { name: '13_admin_students', hash: '#/admin/students' },
    { name: '14_admin_points', hash: '#/admin/points' },
    { name: '15_admin_wheel', hash: '#/admin/wheel' },
    { name: '16_admin_competitions', hash: '#/admin/competitions' },
    { name: '17_admin_settings', hash: '#/admin/settings' }
  ];

  for (const p of adminPages) {
    const url = `${BASE_URL}/${p.hash}`;
    console.log(`Capturing ${p.name} from ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await sleep(600); // Allow animations & charts to settle
    const filePath = path.join(SCREENSHOTS_DIR, `${p.name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved: ${filePath}`);
  }

  console.log('\nAll screenshots captured successfully!');

  await browser.close();
  server.kill();
  process.exit(0);
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
