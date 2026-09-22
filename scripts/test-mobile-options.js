const http = require("http");

const BASE_URL = "http://localhost:3000";

const routesToTest = [
  // 1. Mobile Quick Access & Bottom Nav Targets
  { name: "Home Page", path: "/" },
  { name: "Deals Page", path: "/deals" },
  { name: "Wedding Packages", path: "/wedding-packages" },
  { name: "Track Order", path: "/track-order" },
  { name: "Corporate B2B", path: "/b2b" },
  { name: "Compare Products", path: "/compare" },
  { name: "Account / Orders", path: "/account" },
  { name: "Wishlist", path: "/wishlist" },
  { name: "Cart", path: "/cart" },

  // 2. Mobile Role Direct Portals
  { name: "Admin ERP Portal", path: "/admin" },
  { name: "Sales CRM Portal", path: "/sales" },

  // 3. Official DB Categories
  { name: "DB Cat: Electronics", path: "/category/electronics" },
  { name: "DB Cat: AC & Cooling", path: "/category/ac-cooling" },
  { name: "DB Cat: Refrigeration", path: "/category/refrigeration" },
  { name: "DB Cat: Washing & Cleaning", path: "/category/washing-cleaning" },
  { name: "DB Cat: Kitchen Appliances", path: "/category/kitchen-appliances" },
  { name: "DB Cat: Furniture", path: "/category/furniture" },
  { name: "DB Cat: Home & Living", path: "/category/home-living" },

  // 4. Aliased Category Routes
  { name: "Alias: Appliances", path: "/category/appliances" },
  { name: "Alias: Kitchen", path: "/category/kitchen" },
  { name: "Alias: Audio & Video", path: "/category/audio-video" },
  { name: "Alias: Smart Home", path: "/category/smart-home" },
  { name: "Alias: Personal Care", path: "/category/personal-care" },

  // 5. Direct Subcategory Slugs (Supported as full routes)
  { name: "Sub-route: Split Inverter ACs", path: "/category/split-inverter-acs" },
  { name: "Sub-route: LED Smart TVs", path: "/category/led-smart-tvs" },
  { name: "Sub-route: Double Door Fridges", path: "/category/double-door-refrigerators" },
  { name: "Sub-route: Front Load Washers", path: "/category/front-load-washing-machines" },
  { name: "Sub-route: Microwave & OTG", path: "/category/microwave-otg" },
  { name: "Sub-route: Beds & Suites", path: "/category/beds" },
  { name: "Sub-route: Lighting & Lamps", path: "/category/lighting-lamps" },
  { name: "Sub-route: Smartphones alias", path: "/category/smartphones" },
  { name: "Sub-route: ACs alias", path: "/category/air-conditioners" },

  // 6. Subcategory Query Parameter Routes
  { name: "Query: Electronics (TVs)", path: "/category/electronics?sub=led-smart-tvs" },
  { name: "Query: AC & Cooling (Split)", path: "/category/ac-cooling?sub=split-inverter-acs" },
  { name: "Query: Refrigeration (Side-by-Side)", path: "/category/refrigeration?sub=side-by-side-refrigerators" },
];

function checkUrl(urlPath) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${urlPath}`;
    const req = http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          path: urlPath,
          statusCode: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          length: data.length,
        });
      });
    });

    req.on("error", (err) => {
      resolve({
        path: urlPath,
        statusCode: 0,
        ok: false,
        error: err.message,
      });
    });

    req.setTimeout(8000, () => {
      req.abort();
      resolve({
        path: urlPath,
        statusCode: 408,
        ok: false,
        error: "Timeout",
      });
    });
  });
}

async function testApiEndpoints() {
  console.log("\n--- Testing Mobile Drawer APIs ---");

  // Test Shipping Pincode verification API
  const pincodeTest = await new Promise((resolve) => {
    http.get(`${BASE_URL}/api/v1/shipping/pincode?pincode=221001`, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    });
  });
  const pinOk = pincodeTest.statusCode === 200 && pincodeTest.body?.success;
  console.log(`[API] Pincode Check (221001): Status ${pincodeTest.statusCode}, City: ${pincodeTest.body?.city}, Serviceable: ${pincodeTest.body?.serviceable} -> ${pinOk ? "PASSED" : "FAILED"}`);

  // Test Auth /me check API
  const authMeTest = await new Promise((resolve) => {
    http.get(`${BASE_URL}/api/v1/auth/me`, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    });
  });
  const authOk = authMeTest.statusCode === 200;
  console.log(`[API] Auth Check (/me): Status ${authMeTest.statusCode}, Authenticated: ${authMeTest.body?.authenticated} -> ${authOk ? "PASSED" : "FAILED"}`);

  return pinOk && authOk;
}

async function main() {
  console.log("==================================================");
  console.log("       AUREEVO MOBILE OPTIONS & ROUTES TEST       ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  for (const item of routesToTest) {
    const res = await checkUrl(item.path);
    if (res.ok) {
      console.log(`✅ [${res.statusCode}] ${item.name.padEnd(35)} -> ${res.path}`);
      passed++;
    } else {
      console.error(`❌ [${res.statusCode}] ${item.name.padEnd(35)} -> ${res.path} ${res.error || "Failed"}`);
      failed++;
    }
  }

  const apisPassed = await testApiEndpoints();

  console.log("\n==================================================");
  console.log(`FINAL RESULT: ${passed} ROUTES PASSED, ${failed} FAILED | APIs: ${apisPassed ? "PASSED" : "FAILED"}`);
  console.log("==================================================");

  if (failed > 0 || !apisPassed) {
    process.exit(1);
  }
}

main();
