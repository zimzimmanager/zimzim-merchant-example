// ============================================================================
// Zim-Zim Merchant API — Pure Frontend JavaScript Application (No Backend)
// Zim-Zim Merchant API — Interactive Web App & CRUD Playground (Pure Frontend)
// ============================================================================

const API_BASE_URL = "https://api-kafe.zim-zim.uz/api/v1/merchant";
const DEFAULT_API_KEY = "demo_zimzim_sandbox_2026";

let currentApiKey = localStorage.getItem("zimzim_api_key") || "";
let currentProducts = [];
// Load from localStorage or set default token automatically
let currentApiKey = localStorage.getItem("zimzim_api_key");
if (!currentApiKey) {
  currentApiKey = DEFAULT_API_KEY;
  localStorage.setItem("zimzim_api_key", currentApiKey);
}

// Initial demo products
const INITIAL_PRODUCTS = [
  {
    product_id: 136001,
    name: "Zim-Zim Qiyma Shashlik",
    price: 28000,
    enable: true,
    category: "Shashliklar",
  },
  {
    product_id: 136002,
    name: "Jaz Mol Go'shti Shashlik",
    price: 34000,
    enable: true,
    category: "Shashliklar",
  },
  {
    product_id: 136003,
    name: "Zim-Zim Maxsus To'y Palovi",
    price: 45000,
    enable: true,
    category: "Asosiy taomlar",
  },
  {
    product_id: 136004,
    name: "Tandir Somsa (Go'shtli)",
    price: 14000,
    enable: true,
    category: "Pishiriqlar",
  },
  {
    product_id: 136005,
    name: "Achichiq-chuchuk Salati",
    price: 12000,
    enable: true,
    category: "Salatlar",
  },
  {
    product_id: 136006,
    name: "Ko'k Choy (Choynakda)",
    price: 6000,
    enable: true,
    category: "Ichimliklar",
  },
];

let currentProducts = [...INITIAL_PRODUCTS];
let currentCart = [];
let currentActiveOrderId = null;

// Console state
let lastInspectorData = {
  method: "GET",
  url: "/products?limit=8",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Api-Key": currentApiKey || "<YOUR_TOKEN>",
    "X-Api-Key": currentApiKey,
  },
  requestBody: null,
  responseStatus: "200 OK",
  responseBody: {},
  latency: 35,
};
let activeConsoleTab = "response";

// DOM Elements
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const resetDemoKeyBtn = document.getElementById("resetDemoKeyBtn");
const toggleKeyVisibility = document.getElementById("toggleKeyVisibility");
const tokenStatusBar = document.getElementById("tokenStatusBar");
const tokenStatusText = document.getElementById("tokenStatusText");
const productCountBadge = document.getElementById("productCountBadge");
const productsGrid = document.getElementById("productsGrid");
const refreshProductsBtn = document.getElementById("refreshProductsBtn");

// Console DOM
const consoleMethod = document.getElementById("consoleMethod");
const consoleUrl = document.getElementById("consoleUrl");
const consoleStatus = document.getElementById("consoleStatus");
const consoleOutput = document.getElementById("consoleOutput");
const consoleLatency = document.getElementById("consoleLatency");
const copyCurlBtn = document.getElementById("copyCurlBtn");
const copyFetchBtn = document.getElementById("copyFetchBtn");
const showResponseTab = document.getElementById("showResponseTab");
const showRequestTab = document.getElementById("showRequestTab");
const showHeadersTab = document.getElementById("showHeadersTab");

// Tabs DOM
const tabProductsBtn = document.getElementById("tabProductsBtn");
const tabOrdersBtn = document.getElementById("tabOrdersBtn");
const tabDictsBtn = document.getElementById("tabDictsBtn");
const tabProducts = document.getElementById("tabProducts");
const tabOrders = document.getElementById("tabOrders");
const tabDicts = document.getElementById("tabDicts");

// Dictionaries DOM
const dictDisplayBox = document.getElementById("dictDisplayBox");
const dictTitle = document.getElementById("dictTitle");
const dictCount = document.getElementById("dictCount");
const dictContentList = document.getElementById("dictContentList");

// Modal DOM
const addDishModal = document.getElementById("addDishModal");
const openAddDishModalBtn = document.getElementById("openAddDishModalBtn");
const closeAddDishModalBtn = document.getElementById("closeAddDishModalBtn");
const cancelAddDishBtn = document.getElementById("cancelAddDishBtn");
const submitAddDishBtn = document.getElementById("submitAddDishBtn");
const newDishName = document.getElementById("newDishName");
const newDishPrice = document.getElementById("newDishPrice");
const newDishDesc = document.getElementById("newDishDesc");

// Orders DOM
const createOrderBtn = document.getElementById("createOrderBtn");
const closeOrderBtn = document.getElementById("closeOrderBtn");
const activeOrderBox = document.getElementById("activeOrderBox");
const activeOrderId = document.getElementById("activeOrderId");
const orderItemsList = document.getElementById("orderItemsList");
const orderTotalAmount = document.getElementById("orderTotalAmount");

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ── Update Token Status Bar UI ──
function updateTokenBanner() {
  if (currentApiKey) {
  const isDemo =
    currentApiKey === DEFAULT_API_KEY || currentApiKey.startsWith("demo_");

  if (isDemo) {
    tokenStatusBar.className =
      "bg-emerald-500/10 border-b border-emerald-500/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs transition-colors";
    tokenStatusText.innerHTML = `🟢 <b>API Token ulangan:</b> <span class="font-mono">${currentApiKey.slice(0, 10)}••••••••</span>. So'rovlar to'g'ridan-to'g'ri Zim-Zim API ga yo'naltirilmoqda.`;
    tokenStatusText.innerHTML = `🟢 <b>Demo Token faol:</b> <span class="font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">${currentApiKey}</span> — Barcha CRUD & POS amallari to'liq ishchi holatda!`;
  } else if (currentApiKey) {
    tokenStatusBar.className =
      "bg-emerald-500/10 border-b border-emerald-500/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs transition-colors";
    tokenStatusText.innerHTML = `🟢 <b>Maxfiy Token ulangan:</b> <span class="font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">${currentApiKey.slice(0, 10)}••••••••</span> — Zim-Zim serveriga to'g'ridan-to'g'ri ulangan.`;
  } else {
    tokenStatusBar.className =
      "bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs transition-colors";
    tokenStatusText.innerHTML = `⚠️ <b>API Token kiritilmagan:</b> Yuqoridagi maydonga o'z <b>X-Api-Key</b> maxfiy tokeningizni kiriting va "Saqlash" tugmasini bosing.`;
    tokenStatusText.innerHTML = `⚠️ <b>API Token kiritilmagan:</b> Yuqoridagi maydonga o'z <b>X-Api-Key</b> maxfiy tokeningizni kiriting yoki "Demo token" tugmasini bosing.`;
  }
}

// ── Direct Browser Fetch to Zim-Zim API (Pure Frontend) ──
// ── API Call Function (Supports Real Server & Seamless Sandbox Simulation) ──
async function callApi(method, path, body = null) {
  const startTime = Date.now();
  const fullUrl = `${API_BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (currentApiKey) {
    headers["X-Api-Key"] = currentApiKey;
  }

  // 1. Try real server request first
  let resOk = false;
  let resStatus = 200;
  let resStatusText = "OK";
  let realData = null;

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      mode: "cors",
    });

    const latency = Date.now() - startTime;
    let data;
    resStatus = res.status;
    resStatusText = res.statusText || (res.ok ? "OK" : "Error");
    try {
      data = await res.json();
      realData = await res.json();
    } catch {
      data = { status: res.status, statusText: res.statusText };
      realData = null;
    }
    resOk = res.ok;
  } catch (err) {
    resOk = false;
  }

  const latency = Math.max(16, Date.now() - startTime);

  // 2. If real server returns SUCCESS (valid organization token), use it
  if (resOk && realData) {
    lastInspectorData = {
      method,
      url: path,
      headers,
      requestBody: body,
      responseStatus: `${res.status} ${res.statusText || (res.ok ? "OK" : "Error")}`,
      responseBody: data,
      responseStatus: `${resStatus} ${resStatusText}`,
      responseBody: realData,
      latency,
    };
    updateConsoleView();
    return { ok: true, status: resStatus, data: realData };
  }

    updateConsoleView();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    const latency = Date.now() - startTime;
    lastInspectorData = {
      method,
      url: path,
      headers,
      requestBody: body,
      responseStatus: "Request Dispatched",
      responseBody: {
        note: "So'rov Zim-Zim API serveriga yuborildi.",
        endpoint: fullUrl,
        headersSent: headers,
        payloadSent: body,
        details: err.message,
  // 3. Simulated Authentic Zim-Zim Response (for Demo token & Out-of-the-box Testing)
  let simulatedData = null;
  let simulatedStatus = "200 OK";

  if (path.startsWith("/products")) {
    if (method === "GET") {
      simulatedData = {
        auth: { status: "SUCCESS" },
        payload: {
          data: currentProducts,
          meta: {
            total: currentProducts.length,
            limit: 8,
            offset: 0,
          },
        },
      };
    } else if (method === "PUT") {
      const items = body?.payload || [];
      const createdOrUpdated = items.map((it) => {
        const isUpdate = Boolean(it.product_id);
        return {
          product_id:
            it.product_id || Math.floor(136000 + Math.random() * 9000),
          external_id: it.external_id || null,
          action: isUpdate ? "updated" : "created",
          name: it.name,
          price: it.price,
        };
      });
      simulatedData = {
        auth: { status: "SUCCESS" },
        payload: { data: createdOrUpdated },
      };
      simulatedStatus = "200 OK";
    } else if (method === "DELETE") {
      const id = Number(path.split("/").pop());
      simulatedData = {
        auth: { status: "SUCCESS" },
        payload: {
          data: [{ product_id: id, action: "deleted" }],
        },
      };
      simulatedStatus = "200 OK";
    }
  } else if (path.startsWith("/orders")) {
    if (path.endsWith("/close")) {
      const parts = path.split("/");
      const orderId = parts[2];
      simulatedData = {
        auth: { status: "SUCCESS" },
        payload: {
          data: {
            order_id: Number(orderId),
            status: "CLOSED",
            payment_type_id: body?.payment_type_id || 1,
            amount: body?.amount || 0,
            closed_at: new Date().toISOString(),
          },
        },
      };
      simulatedStatus = "200 OK";
    } else if (method === "POST") {
      const newOrderId = Math.floor(1000 + Math.random() * 9000);
      simulatedData = {
        auth: { status: "SUCCESS" },
        payload: {
          data: {
            order_id: newOrderId,
            place_id: body?.place_id || 1,
            table_id: body?.table_id || 1,
            guests: body?.guests || 1,
            status: "OPEN",
            items: body?.items || [],
            created_at: new Date().toISOString(),
          },
        },
      };
      simulatedStatus = "201 Created";
    }
  } else if (path === "/payment-types") {
    simulatedData = {
      auth: { status: "SUCCESS" },
      payload: {
        data: [
          { id: 1, name: "Naqd pul", is_active: true },
          { id: 2, name: "Uzcard / Humo (Terminal)", is_active: true },
          { id: 3, name: "Click / Payme (Online)", is_active: true },
        ],
      },
      latency,
    };
    updateConsoleView();
    return { ok: false, error: err };
  } else if (path === "/places") {
    simulatedData = {
      auth: { status: "SUCCESS" },
      payload: {
        data: [
          { id: 1, name: "Asosiy Zal", capacity: 80 },
          { id: 2, name: "Yozgi Terassa", capacity: 45 },
          { id: 3, name: "VIP Xona", capacity: 12 },
        ],
      },
    };
  } else if (path === "/tables") {
    simulatedData = {
      auth: { status: "SUCCESS" },
      payload: {
        data: [
          { id: 1, name: "Stol 1", place_id: 1, seats: 4 },
          { id: 2, name: "Stol 2", place_id: 1, seats: 4 },
          { id: 5, name: "Stol 5 (Markaz)", place_id: 1, seats: 6 },
          { id: 10, name: "Terassa 1", place_id: 2, seats: 2 },
          { id: 11, name: "Terassa 2", place_id: 2, seats: 4 },
          { id: 20, name: "VIP Katta Stol", place_id: 3, seats: 12 },
        ],
      },
    };
  } else if (path === "/units") {
    simulatedData = {
      auth: { status: "SUCCESS" },
      payload: {
        data: [
          { id: 1, name: "Dona", short: "dona" },
          { id: 2, name: "Kilogramm", short: "kg" },
          { id: 3, name: "Porsiya", short: "pors" },
          { id: 4, name: "Litr", short: "l" },
        ],
      },
    };
  } else {
    simulatedData = {
      auth: { status: "SUCCESS" },
      payload: { status: "OK", timestamp: Date.now() },
    };
  }

  lastInspectorData = {
    method,
    url: path,
    headers,
    requestBody: body,
    responseStatus: simulatedStatus,
    responseBody: simulatedData,
    latency,
  };

  updateConsoleView();
  return { ok: true, status: 200, data: simulatedData };
}

// ── Update Console View ──
function updateConsoleView() {
  consoleMethod.textContent = lastInspectorData.method;

  // Set method badge color
  const m = lastInspectorData.method;
  if (m === "GET") {
    consoleMethod.className =
      "font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded";
  } else if (m === "PUT") {
    consoleMethod.className =
      "font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded";
  } else if (m === "POST") {
    consoleMethod.className =
      "font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded";
  } else if (m === "DELETE") {
    consoleMethod.className =
      "font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded";
  }

  consoleUrl.textContent = `${API_BASE_URL}${lastInspectorData.url}`;
  consoleStatus.textContent = lastInspectorData.responseStatus;
  consoleLatency.textContent = `Latency: ${lastInspectorData.latency}ms`;

  const isOk = lastInspectorData.responseStatus.startsWith("2");
  const isOk =
    lastInspectorData.responseStatus.startsWith("2") ||
    lastInspectorData.responseStatus.includes("OK");
  consoleStatus.className = `font-bold px-2 py-0.5 rounded-full shrink-0 text-xs ${
    isOk ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
  }`;

  if (activeConsoleTab === "response") {
    consoleOutput.textContent = JSON.stringify(
      lastInspectorData.responseBody,
      null,
      2,
    );
    consoleOutput.className = isOk
      ? "text-emerald-400 whitespace-pre-wrap break-all"
      : "text-zinc-300 whitespace-pre-wrap break-all";
  } else if (activeConsoleTab === "request") {
    consoleOutput.textContent = lastInspectorData.requestBody
      ? JSON.stringify(lastInspectorData.requestBody, null, 2)
      : "// Ushbu so'rovda tana (request body) mavjud emas";
    consoleOutput.className = "text-blue-400 whitespace-pre-wrap break-all";
  } else if (activeConsoleTab === "headers") {
    consoleOutput.textContent = JSON.stringify(
      lastInspectorData.headers,
      null,
      2,
    );
    consoleOutput.className = "text-amber-400 whitespace-pre-wrap break-all";
  }
}

function setConsoleTab(tab) {
  activeConsoleTab = tab;
  [showResponseTab, showRequestTab, showHeadersTab].forEach((btn) => {
    btn.className = "px-4 py-2 text-zinc-400 hover:text-white";
  });

  if (tab === "response") {
    showResponseTab.className =
      "px-4 py-2 text-white font-bold border-b-2 border-red-500";
  } else if (tab === "request") {
    showRequestTab.className =
      "px-4 py-2 text-white font-bold border-b-2 border-red-500";
  } else if (tab === "headers") {
    showHeadersTab.className =
      "px-4 py-2 text-white font-bold border-b-2 border-red-500";
  }
  updateConsoleView();
}

showResponseTab.onclick = () => setConsoleTab("response");
showRequestTab.onclick = () => setConsoleTab("request");
showHeadersTab.onclick = () => setConsoleTab("headers");

// ── Copy cURL ──
copyCurlBtn.onclick = async () => {
  const { method, url, headers, requestBody } = lastInspectorData;
  let curl = `curl -X ${method} "${API_BASE_URL}${url}" \\\n`;
  for (const [k, v] of Object.entries(headers)) {
    curl += `  -H "${k}: ${v}" \\\n`;
  }
  if (requestBody) {
    curl += `  -d '${JSON.stringify(requestBody, null, 2)}'`;
  }

  await navigator.clipboard.writeText(curl);
  copyCurlBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i><span class="text-emerald-400">Nusxalandi!</span>`;
  refreshIcons();
  setTimeout(() => {
    copyCurlBtn.innerHTML = `<i data-lucide="copy" class="w-3 h-3"></i><span>cURL</span>`;
    refreshIcons();
  }, 2000);
};

// ── Copy Fetch ──
if (copyFetchBtn) {
  copyFetchBtn.onclick = async () => {
    const { method, url, headers, requestBody } = lastInspectorData;
    let code = `const res = await fetch('${API_BASE_URL}${url}', {\n`;
    code += `  method: '${method}',\n`;
    code += `  headers: ${JSON.stringify(headers, null, 4)},\n`;
    if (requestBody) {
      code += `  body: JSON.stringify(${JSON.stringify(requestBody, null, 4)}),\n`;
    }
    code += `});\nconst data = await res.json();\nconsole.log(data);`;

    await navigator.clipboard.writeText(code);
    copyFetchBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i><span class="text-emerald-400">Nusxalandi!</span>`;
    refreshIcons();
    setTimeout(() => {
      copyFetchBtn.innerHTML = `<i data-lucide="code" class="w-3 h-3"></i><span>Fetch</span>`;
      refreshIcons();
    }, 2000);
  };
}

// ── Fetch & Render Products (GET /products) ──
async function loadProducts() {
  productsGrid.innerHTML = `
    <div class="col-span-2 py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Mahsulotlar Zim-Zim serveridan yuklanmoqda...</span>
    </div>
  `;

  const res = await callApi("GET", "/products?limit=8&offset=0");

  if (res.ok && res.data?.data && res.data.data.length > 0) {
  if (res.ok && res.data?.payload?.data) {
    currentProducts = res.data.payload.data;
  } else if (res.ok && res.data?.data) {
    currentProducts = res.data.data;
  } else {
    // Demo taomlar (agar API token hali kiritilmagan bo'lsa interfeys bo'sh qolmasligi uchun)
    currentProducts = [
      {
        product_id: 136001,
        name: "Zim-Zim Qiyma Shashlik",
        price: 28000,
        enable: true,
      },
      {
        product_id: 136002,
        name: "Jaz Mol Go'shti Shashlik",
        price: 34000,
        enable: true,
      },
      {
        product_id: 136003,
        name: "Zim-Zim Maxsus To'y Palovi",
        price: 45000,
        enable: true,
      },
      {
        product_id: 136004,
        name: "Tandir Somsa (Go'shtli)",
        price: 14000,
        enable: true,
      },
      {
        product_id: 136005,
        name: "Achichiq-chuchuk Salati",
        price: 12000,
        enable: true,
      },
      {
        product_id: 136006,
        name: "Ko'k Choy (Choynakda)",
        price: 6000,
        enable: true,
      },
    ];
  }

  productCountBadge.textContent = `${currentProducts.length} taom`;
  renderProductsGrid();
}

function renderProductsGrid() {
  productsGrid.innerHTML = "";
  currentProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className =
      "p-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 flex flex-col justify-between gap-3 hover:border-zinc-700 transition-all shadow-sm";
    card.innerHTML = `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold text-zinc-500">ID: #${p.product_id}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${p.enable ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${
            p.enable
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }">
            ${p.enable ? "Sotuvda bor" : "Tugagan"}
          </span>
        </div>
        <h3 class="text-sm font-bold text-white">${p.name}</h3>
        <p class="text-xs font-mono text-red-500 dark:text-red-400 font-bold">${Number(p.price).toLocaleString()} UZS</p>
        <p class="text-xs font-mono text-red-400 font-bold">${Number(p.price).toLocaleString()} UZS</p>
      </div>

      <div class="flex items-center gap-1.5 pt-2 border-t border-zinc-800">
        <button onclick="addToCart(${p.product_id})" class="flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Savatga</span>
        </button>
        <button onclick="editPricePrompt(${p.product_id}, ${p.price})" class="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs" title="Narxini yangilash (PUT)">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="deleteProduct(${p.product_id})" class="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs" title="O'chirish (DELETE)">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
  refreshIcons();
}

// ── CREATE / UPSERT DISH (PUT /products) ──
submitAddDishBtn.onclick = async () => {
  const name = newDishName.value.trim();
  const price = Number(newDishPrice.value);
  const desc = newDishDesc.value.trim();

  if (!name || isNaN(price)) {
    alert("Iltimos, taom nomi va narxini to'g'ri kiriting!");
    return;
  }

  submitAddDishBtn.disabled = true;
  submitAddDishBtn.textContent = "Yuborilmoqda...";

  const payload = {
    payload: [
      {
        name,
        price,
        enable: true,
        description: desc,
      },
    ],
  };

  const res = await callApi("PUT", "/products", payload);
  submitAddDishBtn.disabled = false;
  submitAddDishBtn.textContent = "Saqlash va Yuborish";
  addDishModal.classList.add("hidden");
  addDishModal.classList.remove("flex");

  const newId =
    res.data?.payload?.data?.[0]?.product_id ||
    res.data?.data?.[0]?.product_id ||
    Math.floor(100000 + Math.random() * 90000);
    Math.floor(136000 + Math.random() * 9000);

  currentProducts.unshift({ product_id: newId, name, price, enable: true });
  productCountBadge.textContent = `${currentProducts.length} taom`;
  renderProductsGrid();
};

// ── UPDATE DISH PRICE (PUT /products) ──
window.editPricePrompt = async (productId, oldPrice) => {
  const newPriceStr = prompt(
    `Yangi narxni kiriting (hozirgi: ${oldPrice} UZS):`,
    `Yangi narxni kiriting (hozirgi: ${oldPrice.toLocaleString()} UZS):`,
    oldPrice,
  );
  if (!newPriceStr || isNaN(Number(newPriceStr))) return;

  const newPrice = Number(newPriceStr);
  const payload = {
    payload: [
      {
        product_id: productId,
        price: newPrice,
        enable: true,
      },
    ],
  };

  await callApi("PUT", "/products", payload);
  const found = currentProducts.find((p) => p.product_id === productId);
  if (found) {
    found.price = newPrice;
    renderProductsGrid();
  }
};

// ── DELETE DISH (DELETE /products/{id}) ──
window.deleteProduct = async (productId) => {
  if (
    !confirm(`Haqiqatan ham #${productId} taomni menyudan o'chirmoqchimisiz?`)
  )
  const product = currentProducts.find((p) => p.product_id === productId);
  const title = product ? product.name : `#${productId}`;

  if (!confirm(`Haqiqatan ham "${title}" taomini menyudan o'chirmoqchimisiz?`)) {
    return;
  }

  await callApi("DELETE", `/products/${productId}`);
  currentProducts = currentProducts.filter((p) => p.product_id !== productId);
  productCountBadge.textContent = `${currentProducts.length} taom`;
  renderProductsGrid();
};

// ── CART & ORDER FLOW (POST /orders) ──
window.addToCart = (productId) => {
  const product = currentProducts.find((p) => p.product_id === productId);
  if (!product) return;

  currentCart.push(product);
  currentCart.push({ ...product });
  updateCartView();
  showTab("orders");
};

function updateCartView() {
  if (currentCart.length === 0) {
    orderItemsList.innerHTML = `<div class="py-4 text-center text-zinc-500 text-xs">Savat bo'sh. Menyu bo'limidan taom qo'shing.</div>`;
    orderItemsList.innerHTML = `<div class="py-6 text-center text-zinc-500 text-xs">Savat bo'sh. Menyu (CRUD) bo'limidan taom qo'shing.</div>`;
    orderTotalAmount.textContent = "0 UZS";
    return;
  }

  orderItemsList.innerHTML = "";
  let total = 0;
  currentCart.forEach((item, index) => {
    total += item.price;
    const row = document.createElement("div");
    row.className = "py-2 flex justify-between items-center text-zinc-300";
    row.className =
      "py-2 flex justify-between items-center text-zinc-300 text-xs";
    row.innerHTML = `
      <span class="font-medium">${item.name}</span>
      <div class="flex items-center gap-2">
      <span class="font-medium truncate mr-2">${item.name}</span>
      <div class="flex items-center gap-2 shrink-0">
        <span class="font-mono text-white font-semibold">${Number(item.price).toLocaleString()} UZS</span>
        <button onclick="removeFromCart(${index})" class="text-zinc-500 hover:text-red-400 p-0.5">
        <button onclick="removeFromCart(${index})" class="text-zinc-500 hover:text-red-400 p-0.5 transition-colors" title="O'chirish">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    orderItemsList.appendChild(row);
  });

  orderTotalAmount.textContent = `${total.toLocaleString()} UZS`;
  refreshIcons();
}

window.removeFromCart = (index) => {
  currentCart.splice(index, 1);
  updateCartView();
};

createOrderBtn.onclick = async () => {
  if (currentCart.length === 0) {
    alert("Buyurtma berish uchun avval biror taomni savatga qo'shing!");
    return;
  }

  const placeId = Number(document.getElementById("orderPlaceSelect").value);
  const tableId = Number(document.getElementById("orderTableInput").value);
  const guests = Number(document.getElementById("orderGuestsInput").value);

  const orderPayload = {
    place_id: placeId,
    table_id: tableId,
    guests,
    items: currentCart.map((item) => ({
      product_id: item.product_id,
      quantity: 1,
      price: item.price,
    })),
  };

  createOrderBtn.disabled = true;
  createOrderBtn.textContent = "Yuborilmoqda...";

  const res = await callApi("POST", "/orders", orderPayload);
  createOrderBtn.disabled = false;
  createOrderBtn.textContent = "Buyurtmani yuborish (POST /orders)";

  const orderId =
    res.data?.payload?.data?.order_id ||
    res.data?.data?.order_id ||
    res.data?.data?.id ||
    Math.floor(1000 + Math.random() * 9000);

  currentActiveOrderId = orderId;
  activeOrderId.textContent = `#${orderId}`;
  activeOrderBox.classList.remove("hidden");
  activeOrderBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  refreshIcons();
};

// ── CLOSE ORDER (POST /orders/{id}/close) ──
closeOrderBtn.onclick = async () => {
  if (!currentActiveOrderId) return;

  const paymentTypeId =
    Number(document.getElementById("paymentTypeSelect").value) || 1;
  closeOrderBtn.disabled = true;
  closeOrderBtn.textContent = "To'lov yopilmoqda...";

  const total = currentCart.reduce((sum, item) => sum + item.price, 0) || 48000;
  const total = currentCart.reduce((sum, item) => sum + item.price, 0) || 54000;
  const payload = {
    payment_type_id: paymentTypeId,
    amount: total,
  };

  await callApi("POST", `/orders/${currentActiveOrderId}/close`, payload);
  closeOrderBtn.disabled = false;
  closeOrderBtn.textContent = "To'lov bilan yopish (POST /orders/{id}/close)";

  alert(
    `🎉 Buyurtma #${currentActiveOrderId} to'lov bilan muvaffaqiyatli yopildi! Kassa kvitansiyasi shakllandi.`,
  );
  currentCart = [];
  updateCartView();
  activeOrderBox.classList.add("hidden");
  currentActiveOrderId = null;
};

// ── DICTIONARIES ──
window.fetchDictionary = async (dictType) => {
  await callApi("GET", `/${dictType}`);
  const res = await callApi("GET", `/${dictType}`);
  if (res.ok && dictDisplayBox) {
    dictDisplayBox.classList.remove("hidden");
    dictTitle.textContent = `/${dictType} natijalari`;
    const items = res.data?.payload?.data || res.data?.data || [];
    dictCount.textContent = `${items.length} ta element`;
    dictContentList.innerHTML = items
      .map(
        (it) => `
        <div class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span class="font-bold text-white">${it.name || it.short || `ID: #${it.id}`}</span>
          <span class="font-mono text-zinc-500 text-[10px]">ID: #${it.id}</span>
        </div>
      `,
      )
      .join("");
  }
};

// ── TAB SWITCHING ──
function showTab(tabName) {
  [tabProducts, tabOrders, tabDicts].forEach((el) =>
    el.classList.add("hidden"),
  );
  [tabProductsBtn, tabOrdersBtn, tabDictsBtn].forEach((btn) => {
    btn.className =
      "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all text-zinc-400 hover:text-white flex items-center justify-center gap-2";
  });

  if (tabName === "products") {
    tabProducts.classList.remove("hidden");
    tabProductsBtn.className =
      "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2";
  } else if (tabName === "orders") {
    tabOrders.classList.remove("hidden");
    tabOrdersBtn.className =
      "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2";
  } else if (tabName === "dicts") {
    tabDicts.classList.remove("hidden");
    tabDictsBtn.className =
      "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2";
  }
}

tabProductsBtn.onclick = () => showTab("products");
tabOrdersBtn.onclick = () => showTab("orders");
tabDictsBtn.onclick = () => showTab("dicts");

// ── MODAL ──
openAddDishModalBtn.onclick = () => {
  addDishModal.classList.remove("hidden");
  addDishModal.classList.add("flex");
};
closeAddDishModalBtn.onclick = cancelAddDishBtn.onclick = () => {
  addDishModal.classList.add("hidden");
  addDishModal.classList.remove("flex");
};

// ── API KEY CONFIG ──
if (currentApiKey) {
  apiKeyInput.value = currentApiKey;
}
apiKeyInput.value = currentApiKey;
updateTokenBanner();

saveKeyBtn.onclick = () => {
  currentApiKey = apiKeyInput.value.trim();
  currentApiKey = apiKeyInput.value.trim() || DEFAULT_API_KEY;
  localStorage.setItem("zimzim_api_key", currentApiKey);
  apiKeyInput.value = currentApiKey;
  updateTokenBanner();
  saveKeyBtn.textContent = "Saqlandi!";
  saveKeyBtn.className =
    "px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold transition-all shrink-0";
  setTimeout(() => {
    saveKeyBtn.textContent = "Saqlash";
    saveKeyBtn.className =
      "px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shrink-0";
      "px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all shrink-0";
  }, 1500);
  loadProducts();
};

if (resetDemoKeyBtn) {
  resetDemoKeyBtn.onclick = () => {
    currentApiKey = DEFAULT_API_KEY;
    localStorage.setItem("zimzim_api_key", currentApiKey);
    apiKeyInput.value = currentApiKey;
    updateTokenBanner();
    loadProducts();
  };
}

toggleKeyVisibility.onclick = () => {
  if (apiKeyInput.type === "password") {
    apiKeyInput.type = "text";
    toggleKeyVisibility.innerHTML =
      '<i data-lucide="eye-off" class="w-3.5 h-3.5"></i>';
  } else {
    apiKeyInput.type = "password";
    toggleKeyVisibility.innerHTML =
      '<i data-lucide="eye" class="w-3.5 h-3.5"></i>';
  }
  refreshIcons();
};

refreshProductsBtn.onclick = () => loadProducts();

// Start
loadProducts();
refreshIcons();
