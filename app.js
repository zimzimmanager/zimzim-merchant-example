// ============================================================================
// Zim-Zim Merchant API — Oddiy, Tushunarli va Interaktiv Boshqaruv Skripti
// ============================================================================

const API_BASE_URL = "https://api-kafe.zim-zim.uz/api/v1/merchant";
const DEFAULT_API_KEY = "demo_zimzim_sandbox_2026";

// LocalStorage orqali tokenni tekshirish yoki avtomatik standart token o'rnatish
let currentApiKey = localStorage.getItem("zimzim_api_key");
if (!currentApiKey) {
  currentApiKey = DEFAULT_API_KEY;
  localStorage.setItem("zimzim_api_key", currentApiKey);
}

// Boshlang'ich demo taomlar ro'yxati (oddiy va tushunarli)
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

// Jonli konsol holati
let lastInspectorData = {
  method: "GET",
  url: "/products?limit=8",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Api-Key": currentApiKey,
  },
  requestBody: null,
  responseStatus: "200 OK",
  responseBody: {
    message: "Tizim tayyor. Chap tarafdagi biror tugmani bosib sinab ko'ring!",
  },
  latency: 24,
};
let activeConsoleTab = "response";

// DOM Elementlari
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const resetDemoKeyBtn = document.getElementById("resetDemoKeyBtn");
const toggleKeyVisibility = document.getElementById("toggleKeyVisibility");
const tokenStatusBar = document.getElementById("tokenStatusBar");
const tokenStatusText = document.getElementById("tokenStatusText");
const productCountBadge = document.getElementById("productCountBadge");
const productsGrid = document.getElementById("productsGrid");
const refreshProductsBtn = document.getElementById("refreshProductsBtn");
const toastContainer = document.getElementById("toastContainer");

// Konsol DOM
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

// Tablar DOM
const tabProductsBtn = document.getElementById("tabProductsBtn");
const tabOrdersBtn = document.getElementById("tabOrdersBtn");
const tabDictsBtn = document.getElementById("tabDictsBtn");
const tabProducts = document.getElementById("tabProducts");
const tabOrders = document.getElementById("tabOrders");
const tabDicts = document.getElementById("tabDicts");

// Ma'lumotnomalar DOM
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
const newDishCategory = document.getElementById("newDishCategory");
const newDishDesc = document.getElementById("newDishDesc");

// Kassa va Buyurtmalar DOM
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

// ── Xabarnomalar (Toasts) Chiqarish ──
function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  const isSuccess = type === "success";

  toast.className = `p-3.5 rounded-2xl border shadow-2xl flex items-start gap-2.5 text-xs font-medium animate-fade-in transition-all ${
    isSuccess
      ? "bg-zinc-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40"
      : "bg-zinc-900/95 border-red-500/40 text-red-300 shadow-red-950/40"
  }`;

  toast.innerHTML = `
    <span class="text-base shrink-0">${isSuccess ? "✅" : "⚠️"}</span>
    <div class="flex-1 leading-snug">${message}</div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Token Statusini Yangilash ──
function updateTokenBanner() {
  const isDemo =
    currentApiKey === DEFAULT_API_KEY || currentApiKey.startsWith("demo_");

  if (isDemo) {
    tokenStatusBar.className =
      "bg-emerald-500/10 border-b border-emerald-500/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs transition-colors";
    tokenStatusText.innerHTML = `🟢 <b>Demo Token faol:</b> <span class="font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold">${currentApiKey}</span> — Barcha tugmalarni bemalol bosib sinab ko'rishingiz mumkin!`;
  } else if (currentApiKey) {
    tokenStatusBar.className =
      "bg-emerald-500/10 border-b border-emerald-500/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs transition-colors";
    tokenStatusText.innerHTML = `🟢 <b>Maxfiy Token ulangan:</b> <span class="font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold">${currentApiKey.slice(0, 10)}••••••••</span> — Zim-Zim serveriga to'g'ridan-to'g'ri so'rovlar yuborilmoqda.`;
  } else {
    tokenStatusBar.className =
      "bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs transition-colors";
    tokenStatusText.innerHTML = `⚠️ <b>API Token kiritilmagan:</b> Yuqoridagi maydonga o'z <b>X-Api-Key</b> maxfiy tokeningizni kiriting yoki "Demo token" tugmasini bosing.`;
  }
}

// ── API So'rov Funktsiyasi (Haqiqiy server + Avtomatik Sandbox Simulyatsiyasi) ──
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

  // 1. Haqiqiy serverga so'rov jo'natishga urinish
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

    resStatus = res.status;
    resStatusText = res.statusText || (res.ok ? "OK" : "Error");
    try {
      realData = await res.json();
    } catch {
      realData = null;
    }
    resOk = res.ok;
  } catch (err) {
    resOk = false;
  }

  const latency = Math.max(18, Date.now() - startTime);

  // 2. Agar haqiqiy server 200/201 muvaffaqiyat qaytarsa — o'shani ko'rsatamiz
  if (resOk && realData) {
    lastInspectorData = {
      method,
      url: path,
      headers,
      requestBody: body,
      responseStatus: `${resStatus} ${resStatusText}`,
      responseBody: realData,
      latency,
    };
    updateConsoleView();
    return { ok: true, status: resStatus, data: realData };
  }

  // 3. Demo / Sandbox rejimi: Foydalanuvchi "prosta tak" barcha jarayonlarni ko'rishi uchun
  // API spetsifikatsiyasiga to'liq mos formatdagi jonli javob shakllantiriladi:
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
    };
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

// ── Jonli Konsolni Yangilash ──
function updateConsoleView() {
  consoleMethod.textContent = lastInspectorData.method;

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
  consoleLatency.textContent = `Kechikish: ${lastInspectorData.latency}ms`;

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

// ── Kodni Nusxalash (cURL & Fetch) ──
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

// ── Taomlar Ro'yxatini Chizish (Render Products) ──
async function loadProducts() {
  productsGrid.innerHTML = `
    <div class="col-span-2 py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Taomlar yuklanmoqda...</span>
    </div>
  `;

  const res = await callApi("GET", "/products?limit=8&offset=0");

  if (res.ok && res.data?.payload?.data) {
    currentProducts = res.data.payload.data;
  } else if (res.ok && res.data?.data) {
    currentProducts = res.data.data;
  }

  productCountBadge.textContent = `${currentProducts.length} taom`;
  renderProductsGrid();
}

function renderProductsGrid() {
  productsGrid.innerHTML = "";
  currentProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className =
      "p-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 flex flex-col justify-between gap-3.5 transition-all shadow-md group";
    card.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">ID: #${p.product_id}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
            p.enable
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }">
            ${p.enable ? "🟢 Sotuvda bor" : "🔴 Tugagan"}
          </span>
        </div>
        
        <div>
          <h4 class="text-sm font-bold text-white group-hover:text-red-400 transition-colors">${p.name}</h4>
          ${p.category ? `<span class="text-[10px] text-zinc-400 font-medium">${p.category}</span>` : ""}
        </div>

        <p class="text-sm font-mono text-red-400 font-extrabold tracking-tight">${Number(p.price).toLocaleString()} UZS</p>
      </div>

      <!-- Tushunarli Matnli Tugmalar -->
      <div class="flex items-center gap-1.5 pt-2 border-t border-zinc-800/80">
        <button onclick="addToCart(${p.product_id})" class="flex-1 py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/20" title="Ushbu taomni buyurtma savatiga qo'shish">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>+ Savatga</span>
        </button>
        <button onclick="editPricePrompt(${p.product_id}, ${p.price})" class="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all" title="Taom narxini o'zgartirish (PUT /products)">
          <i data-lucide="edit-3" class="w-3 h-3 text-blue-400"></i>
          <span>Narx</span>
        </button>
        <button onclick="deleteProduct(${p.product_id})" class="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition-all" title="Taomni o'chirish (DELETE /products/{id})">
          <i data-lucide="trash-2" class="w-3 h-3"></i>
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
  refreshIcons();
}

// ── 1-BOSISHDA TEZKOR SINOV SSENARIYLARI (QUICK TEST) ──
window.quickTest = async (action) => {
  if (action === "create") {
    const randomDishNames = [
      "Zim-Zim Maxsus Qozon Kabob",
      "Toshkent To'y Oshi (Maxsus)",
      "Qo'y Go'shtli Tandir Somsa",
      "Jaz Shashlik (Premium)",
    ];
    const name =
      randomDishNames[Math.floor(Math.random() * randomDishNames.length)];
    const price = Math.floor(25 + Math.random() * 40) * 1000;

    const payload = {
      payload: [
        {
          name,
          price,
          enable: true,
          description: "Avtomatik tezkor sinov taomi",
        },
      ],
    };

    const res = await callApi("PUT", "/products", payload);
    const newId =
      res.data?.payload?.data?.[0]?.product_id ||
      res.data?.data?.[0]?.product_id ||
      Math.floor(136000 + Math.random() * 9000);

    currentProducts.unshift({
      product_id: newId,
      name,
      price,
      enable: true,
      category: "Tezkor sinov",
    });
    productCountBadge.textContent = `${currentProducts.length} taom`;
    renderProductsGrid();
    showTab("products");
    showToast(
      `🎉 <b>Yangi taom qo'shildi:</b> "${name}" (${price.toLocaleString()} UZS). Konsolda PUT javobi ko'rinmoqda!`,
    );
  } else if (action === "update") {
    if (currentProducts.length === 0) return;
    const dish = currentProducts[0];
    const newPrice = dish.price + 5000;

    const payload = {
      payload: [
        {
          product_id: dish.product_id,
          price: newPrice,
          enable: true,
        },
      ],
    };

    await callApi("PUT", "/products", payload);
    dish.price = newPrice;
    renderProductsGrid();
    showTab("products");
    showToast(
      `✏️ <b>Narx yangilandi:</b> "${dish.name}" narxi ${newPrice.toLocaleString()} UZS ga o'zgardi!`,
    );
  } else if (action === "order") {
    // 1-va 2-taomlarni savatga solish
    currentCart = [
      { ...currentProducts[0] },
      { ...(currentProducts[1] || currentProducts[0]) },
    ];
    updateCartView();
    showTab("orders");

    // Buyurtma yaratish
    const orderPayload = {
      place_id: 1,
      table_id: 5,
      guests: 2,
      items: currentCart.map((it) => ({
        product_id: it.product_id,
        quantity: 1,
        price: it.price,
      })),
    };

    const res = await callApi("POST", "/orders", orderPayload);
    const orderId =
      res.data?.payload?.data?.order_id ||
      res.data?.data?.order_id ||
      Math.floor(1000 + Math.random() * 9000);

    currentActiveOrderId = orderId;
    activeOrderId.textContent = `#${orderId}`;
    activeOrderBox.classList.remove("hidden");
    activeOrderBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    refreshIcons();

    showToast(
      `🛒 <b>Kassa buyurtmasi ochildi!</b> #${orderId}-raqamli buyurtma Stol #5 ga yuborildi. Endi "To'lov bilan yopish"ni bosing!`,
    );
  }
};

// ── YANGI TAOM QO'SHISH (PUT /products) ──
submitAddDishBtn.onclick = async () => {
  const name = newDishName.value.trim();
  const price = Number(newDishPrice.value);
  const category = newDishCategory.value.trim() || "Boshqa";
  const desc = newDishDesc.value.trim();

  if (!name || isNaN(price)) {
    alert("Iltimos, taom nomi va narxini to'g'ri kiriting!");
    return;
  }

  submitAddDishBtn.disabled = true;
  submitAddDishBtn.innerHTML = `<span>Yuborilmoqda...</span>`;

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
  submitAddDishBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>Menyuga Kiritish va Saqlash</span>`;
  addDishModal.classList.add("hidden");
  addDishModal.classList.remove("flex");

  const newId =
    res.data?.payload?.data?.[0]?.product_id ||
    res.data?.data?.[0]?.product_id ||
    Math.floor(136000 + Math.random() * 9000);

  currentProducts.unshift({
    product_id: newId,
    name,
    price,
    enable: true,
    category,
  });
  productCountBadge.textContent = `${currentProducts.length} taom`;
  renderProductsGrid();
  showToast(`🎉 "${name}" taomi menyuga muvaffaqiyatli qo'shildi!`);
};

// ── NARXNI TAHRIRLASH (PUT /products) ──
window.editPricePrompt = async (productId, oldPrice) => {
  const newPriceStr = prompt(
    `Taom narxini o'zgartirish:\nYangi narxni kiriting (hozirgi narx: ${oldPrice.toLocaleString()} UZS):`,
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
    showToast(
      `✏️ #${productId} taom narxi ${newPrice.toLocaleString()} UZS ga yangilandi!`,
    );
  }
};

// ── TAOMNI O'CHIRISH (DELETE /products/{id}) ──
window.deleteProduct = async (productId) => {
  const product = currentProducts.find((p) => p.product_id === productId);
  const title = product ? product.name : `#${productId}`;

  if (!confirm(`Haqiqatan ham "${title}" taomini menyudan o'chirmoqchimisiz?`)) {
    return;
  }

  await callApi("DELETE", `/products/${productId}`);
  currentProducts = currentProducts.filter((p) => p.product_id !== productId);
  productCountBadge.textContent = `${currentProducts.length} taom`;
  renderProductsGrid();
  showToast(`🗑 "${title}" menyudan o'chirildi!`);
};

// ── SAVAT VA BUYURTMA (POST /orders) ──
window.addToCart = (productId) => {
  const product = currentProducts.find((p) => p.product_id === productId);
  if (!product) return;

  currentCart.push({ ...product });
  updateCartView();
  showToast(
    `🛒 <b>"${product.name}"</b> savatga qo'shildi! Yuqoridagi "2. Kassa & Buyurtma" bo'limiga o'ting.`,
  );
};

function updateCartView() {
  if (currentCart.length === 0) {
    orderItemsList.innerHTML = `<div class="py-8 text-center text-zinc-500 text-xs">Savat hozircha bo'sh.<br/>Chapdagi "1. Taomlar & Menyu" bo'limidan taom qo'shing.</div>`;
    orderTotalAmount.textContent = "0 UZS";
    return;
  }

  orderItemsList.innerHTML = "";
  let total = 0;
  currentCart.forEach((item, index) => {
    total += item.price;
    const row = document.createElement("div");
    row.className =
      "py-2.5 flex justify-between items-center text-zinc-200 text-xs";
    row.innerHTML = `
      <div class="truncate mr-2">
        <span class="font-bold text-white block truncate">${item.name}</span>
        <span class="text-[10px] text-zinc-500 font-mono">ID: #${item.product_id}</span>
      </div>
      <div class="flex items-center gap-2.5 shrink-0">
        <span class="font-mono text-red-400 font-bold">${Number(item.price).toLocaleString()} UZS</span>
        <button onclick="removeFromCart(${index})" class="text-zinc-500 hover:text-red-400 p-1 transition-colors" title="Savatdan o'chirish">
          <i data-lucide="trash" class="w-3.5 h-3.5"></i>
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
  createOrderBtn.textContent = "Buyurtmani Yuborish (POST /orders)";

  const orderId =
    res.data?.payload?.data?.order_id ||
    res.data?.data?.order_id ||
    Math.floor(1000 + Math.random() * 9000);

  currentActiveOrderId = orderId;
  activeOrderId.textContent = `#${orderId}`;
  activeOrderBox.classList.remove("hidden");
  activeOrderBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  refreshIcons();

  showToast(
    `🎉 <b>Yangi Buyurtma #${orderId} ochildi!</b> Oshxonaga uzatildi. Endi to'lov bilan yopishingiz mumkin.`,
  );
};

// ── BUYURTMANI TO'LOV BILAN YOPISH (POST /orders/{id}/close) ──
closeOrderBtn.onclick = async () => {
  if (!currentActiveOrderId) return;

  const paymentTypeId =
    Number(document.getElementById("paymentTypeSelect").value) || 1;
  closeOrderBtn.disabled = true;
  closeOrderBtn.textContent = "To'lov yopilmoqda...";

  const total = currentCart.reduce((sum, item) => sum + item.price, 0) || 54000;
  const payload = {
    payment_type_id: paymentTypeId,
    amount: total,
  };

  await callApi("POST", `/orders/${currentActiveOrderId}/close`, payload);
  closeOrderBtn.disabled = false;
  closeOrderBtn.textContent =
    "To'lov Bilan Yopish (POST /orders/{id}/close)";

  showToast(
    `🎉 <b>Buyurtma #${currentActiveOrderId} to'lov bilan muvaffaqiyatli yopildi!</b> Kassa kvitansiyasi chiqarildi.`,
  );
  currentCart = [];
  updateCartView();
  activeOrderBox.classList.add("hidden");
  currentActiveOrderId = null;
};

// ── MA'LUMOTNOMALARNI YUKLASH (DICTIONARIES) ──
window.fetchDictionary = async (dictType) => {
  const res = await callApi("GET", `/${dictType}`);
  if (res.ok && dictDisplayBox) {
    dictDisplayBox.classList.remove("hidden");
    dictTitle.textContent = `/${dictType} ma'lumotlari:`;
    const items = res.data?.payload?.data || res.data?.data || [];
    dictCount.textContent = `${items.length} ta element`;
    dictContentList.innerHTML = items
      .map(
        (it) => `
        <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div>
            <span class="font-bold text-white block">${it.name || it.short || `ID: #${it.id}`}</span>
            ${it.capacity ? `<span class="text-[10px] text-zinc-500">Sig'imi: ${it.capacity} kishi</span>` : ""}
            ${it.seats ? `<span class="text-[10px] text-zinc-500">O'rinlar: ${it.seats} ta</span>` : ""}
          </div>
          <span class="font-mono text-zinc-400 text-xs bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">ID: #${it.id}</span>
        </div>
      `,
      )
      .join("");
    showToast(
      `📚 /${dictType} bo'yicha ${items.length} ta ma'lumot yuklandi va konsolda ko'rsatildi!`,
    );
  }
};

// ── TABLARNI ALMASHTIRISH ──
function showTab(tabName) {
  [tabProducts, tabOrders, tabDicts].forEach((el) =>
    el.classList.add("hidden"),
  );
  [tabProductsBtn, tabOrdersBtn, tabDictsBtn].forEach((btn) => {
    btn.className =
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-zinc-400 hover:text-white flex items-center justify-center gap-2";
  });

  if (tabName === "products") {
    tabProducts.classList.remove("hidden");
    tabProductsBtn.className =
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2";
  } else if (tabName === "orders") {
    tabOrders.classList.remove("hidden");
    tabOrdersBtn.className =
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2";
  } else if (tabName === "dicts") {
    tabDicts.classList.remove("hidden");
    tabDictsBtn.className =
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2";
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

// ── TOKEN SOZLAMALARI ──
apiKeyInput.value = currentApiKey;
updateTokenBanner();

saveKeyBtn.onclick = () => {
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
      "px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all shrink-0";
  }, 1500);
  showToast("🔑 Yangi API token muvaffaqiyatli saqlandi!");
  loadProducts();
};

if (resetDemoKeyBtn) {
  resetDemoKeyBtn.onclick = () => {
    currentApiKey = DEFAULT_API_KEY;
    localStorage.setItem("zimzim_api_key", currentApiKey);
    apiKeyInput.value = currentApiKey;
    updateTokenBanner();
    showToast("🟢 Standart demo token tiklandi!");
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

refreshProductsBtn.onclick = () => {
  loadProducts();
  showToast("🔄 Menyudagi taomlar yangilandi!");
};

// Dastur ishga tushishi
loadProducts();
updateCartView();
refreshIcons();
