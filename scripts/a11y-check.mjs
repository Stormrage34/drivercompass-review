/**
 * Dev-only accessibility audit: Chromium + axe-core against a running build.
 * Usage: node scripts/a11y-check.mjs http://localhost:3100
 * Output: .taste-skill/a11y-report.json and a short console summary.
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const base = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const chrome = process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable";
const axeSource = fs.readFileSync(
  path.resolve("node_modules/axe-core/axe.min.js"),
  "utf8",
);
const outFile = path.resolve(".taste-skill/a11y-report.json");

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const results = [];

async function audit(label, url) {
  await page.goto(`${base}${url}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await page.evaluate(axeSource);
  const report = await page.evaluate(async () => {
    const r = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] },
    });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
      html: v.nodes[0]?.html?.slice(0, 300),
      summary: v.nodes[0]?.failureSummary?.slice(0, 300),
    }));
  });
  results.push({ label, url, violations: report });
  const serious = report.filter((v) => v.impact === "critical" || v.impact === "serious");
  console.log(
    `${label}: ${report.length} violations (${serious.length} critical/serious)${
      serious.length ? " -> " + serious.map((v) => v.id).join(", ") : ""
    }`,
  );
}

async function login(email, password) {
  const cookies = await page.cookies();
  if (cookies.length) await page.deleteCookie(...cookies);
  await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
  await new Promise((resolve) => setTimeout(resolve, 800));
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30_000 }),
    page.click('button[type="submit"]'),
  ]);
}

try {
  await audit("Homepage", "/");
  await audit("Jobs", "/jobs");
  await audit("Job detail", "/jobs/wizard-test-c-e-driver-bremen-1bzkh");
  await audit("Companies", "/companies");
  await audit("Company profile", "/companies/wizard-test-transport-b-v-rddob");
  await audit("Driver registration", "/register?role=driver");
  await audit("Employer registration", "/register?role=employer");
  await audit("Login", "/login");

  await login("pilotdriver@demo.local", "PilotDriver!2026");
  await audit("Driver profile", "/dashboard/profile");
  await audit("Driver applications", "/dashboard/applications");

  await login("wizard@demo.local", "WizardDemo!2026");
  await audit("Employer enquiry inbox", "/employer/enquiries");
  await audit("Employer vacancy wizard", "/employer/vacancies/8c293863-9f86-4e36-8ad2-aa23987aad2f/edit");

  await login("admin@demo.local", "AdminDemo!2026");
  await audit("Moderator verification queue", "/admin/verifications");
  await audit("Admin reviews", "/admin/reviews");
  await audit("Admin reports", "/admin/reports");
  await audit("Admin contact messages", "/admin/messages");
} catch (error) {
  console.error("a11y run failed:", error);
  process.exitCode = 1;
} finally {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ base, results }, null, 2));
  await browser.close();
}
