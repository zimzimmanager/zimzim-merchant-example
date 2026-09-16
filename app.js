// ============================================================================
// Zim-Zim Merchant API — Rasmiy va Interaktiv Boshqaruv Skripti (Real + Sandbox)
// ============================================================================

const API_BASE_URL = "https://api-kafe.zim-zim.uz/api/v1/merchant";
const DEFAULT_API_KEY = "demo_zimzim_sandbox_2026";

// // LocalStorage orqali tokenni tekshirish yoki avtomatik standart token o'rnatish
let currentApiKey = localStorage.getItem("zimzim_api_key");
if (!currentApiKey) {
  currentApiKey = DEFAULT_API_KEY;
  localStorage.setItem("zimzim_api_key", currentApiKey);
}

// Boshlang'ich demo taomlar ro'yxati (Faqat Offline / Standart demo token holatlari uchun)
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
let currentActiveOrderAmount = 0;
let currentOrgName = null;

// Jonli konsol holati
let lastInspectorData = {
  method: "GET",
  url: "/products?limit=20&offset=0",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Api-Key": currentApiKey,
  },
  requestBody: null,
  responseStatus: "200 OK",
  responseBody: {
    message: "Tizim tayyor. Chap tarafdagi biror amalni tanlab sinab ko'ring!",
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
const orderTypeSelect = document.getElementById("orderTypeSelect");
const tableFieldsGroup = document.getElementById("tableFieldsGroup");
const orderTableSelect = document.getElementById("orderTableSelect");
const orderGuestsInput = document.getElementById("orderGuestsInput");
const orderPhoneInput = document.getElementById("orderPhoneInput");
const createOrderBtn = document.getElementById("createOrderBtn");
const closeOrderBtn = document.getElementById("closeOrderBtn");
const activeOrderBox = document.getElementById("activeOrderBox");
const activeOrderId = document.getElementById("activeOrderId");
const orderItemsList = document.getElementById("orderItemsList");
const orderTotalAmount = document.getElementById("orderTotalAmount");
const paymentTypeSelect = document.getElementById("paymentTypeSelect");

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ── Bildirishnoma (Toast) ──
function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  const isError = type === "error";
  toast.className = `p-3 rounded-xl shadow-xl flex items-start gap-2.5 text-xs border animate-in fade-in slide-in-from-bottom-2 duration-200 transition-all ${
    isError
      ? "bg-red-950/90 dark:bg-red-950/90 text-red-200 border-red-800 shadow-red-900/30"
      : "bg-zinc-900 dark:bg-zinc-900 text-white border-zinc-700 shadow-black/40"
  }`;
  toast.innerHTML = `
    <i data-lucide="${isError ? "alert-circle" : "check-circle-2"}" class="w-4 h-4 ${
      isError ? "text-red-400" : "text-emerald-400"
    } shrink-0 mt-0.5"></i>
    <div class="flex-1 leading-relaxed">${message}</div>
  `;
  toastContainer.appendChild(toast);
  refreshIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Token Holatini Yangilash ──
function updateTokenBanner() {
  // Inputdagi tokenni tekshirish
  const inputVal = apiKeyInput ? apiKeyInput.value.trim() : "";
  const token = inputVal || currentApiKey;
  const isReal =
    Boolean(token) &&
    token !== DEFAULT_API_KEY &&
    !token.startsWith("demo_");

  if (isReal) {
    tokenStatusBar.className =
      "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5";
    const orgLabel = currentOrgName ? ` • ${currentOrgName}` : "";
    tokenStatusBar.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>JONLI SINOV REJIMI (REAL API)${orgLabel}</span>
    `;
    if (tokenStatusText) {
      tokenStatusText.textContent = `Haqiqiy serverga ulangan (${token.slice(0, 8)}...)${orgLabel}. Mock ma'lumotlar o'chirilgan.`;
    }
  } else {
    tokenStatusBar.className =
      "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5";
    tokenStatusBar.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      <span>DEMO SANDBOX REJIMI</span>
    `;
    if (tokenStatusText) {
      tokenStatusText.textContent =
        "Standart demo token faol. Haqiqiy do'koningizni sinash uchun yuqoriga o'z API tokeringizni kiriting.";
    }
  }
}

// ── Haqiqiy API So'rov Funktsiyasi (Real Server + Aniq Xatolar + Qat'iy Mock Tekshiruvi) ──
async function callApi(method, path, body = null) {
  const startTime = Date.now();
  const fullUrl = `${API_BASE_URL}${path}`;

  // Eng so'nggi tokenni olish: agar inputda boshqa token yozilgan bo'lsa, uni darhol ishlatish
  const inputToken = apiKeyInput ? apiKeyInput.value.trim() : "";
  const activeKey = inputToken || currentApiKey || DEFAULT_API_KEY;
  currentApiKey = activeKey;

  const isRealToken = Boolean(
    activeKey &&
    activeKey !== DEFAULT_API_KEY &&
    !activeKey.startsWith("demo_")
  );

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (activeKey) {
    headers["X-Api-Key"] = activeKey;
  }

  // 1. Haqiqiy serverga so'rov jo'natish
  let resOk = false;
  let resStatus = 200;
  let resStatusText = "OK";
  let realData = null;
  let fetchError = null;

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
    fetchError = err.message || "Tarmoq yoki CORS xatosi";
  }

  // MUHIM: HTTP 200/201 kelsa ham, javob "konvertida"
  // (auth.status yoki payload.status) "ERROR" bo'lishi mumkin.
  const appStatus = realData?.payload?.status || realData?.auth?.status;
  const hasAppError = Boolean(
    appStatus === "ERROR" ||
    realData?.payload?.error ||
    realData?.auth?.error
  );
  if (resOk && hasAppError) {
    resOk = false;
  }

  const latency = Math.max(16, Date.now() - startTime);

  // Tashkilot nomini yangilash
  if (realData?.auth?.organization_name) {
    currentOrgName = realData.auth.organization_name;
    updateTokenBanner();
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // QAT'IY QOIDA: Agar REAL token bo'lsa (isRealToken === true):
  // MOCK DATALAR UMUMAN ISHLAMASIN! Server xatosi bo'lsa ham aynan server javobi
  // qizil rangda, aniq xato kodi va xabari bilan to'g'ridan-to'g'ri ko'rsatilsin!
  // ═════════════════════════════════════════════════════════════════════════════
  if (isRealToken) {
    const statusString = realData
      ? `${resStatus} ${resStatusText}`
      : fetchError
        ? `CORS / Network Error`
        : `${resStatus} ${resStatusText}`;

    const responseBody = realData || {
      error: "NETWORK_ERROR",
      message: fetchError || `Serverdan javob olinmadi (HTTP ${resStatus})`,
    };

    lastInspectorData = {
      method,
      url: path,
      headers,
      requestBody: body,
      responseStatus: statusString,
      responseBody,
      latency,
    };
    updateConsoleView();

    if (resOk) {
      return { ok: true, status: resStatus, data: realData };
    } else {
      const errMsg =
        realData?.payload?.error?.message ||
        realData?.auth?.error?.message ||
        realData?.error?.message ||
        realData?.message ||
        (typeof realData?.error === "string" ? realData.error : null) ||
        fetchError ||
        `Server xatosi (HTTP ${resStatus})`;

      const errCode =
        realData?.payload?.error?.code ||
        realData?.auth?.error?.code ||
        "ERROR";

      showToast(`Server xatosi [${errCode}]: ${errMsg}`, "error");
      return { ok: false, status: resStatus, error: errMsg, code: errCode, data: realData };
    }
  }

  // 2. Demo rejimida haqiqiy server muvaffaqiyatli javob qaytarsa:
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

  // 3. Demo rejimida serverdan xato kelsa (faqat demo token bo'lganda):
  // Agar serverdan xato javobi kelgan bo'lsa, konsolda aynan shu xato ko'rsatiladi
  if (realData && !resOk) {
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
    const errMsg =
      realData?.payload?.error?.message ||
      realData?.auth?.error?.message ||
      `Server xatosi (HTTP ${resStatus})`;
    showToast(`Server xatosi: ${errMsg}`, "error");
    return { ok: false, status: resStatus, error: errMsg, data: realData };
  }

  // 4. Faqat Tarmoq xatosi bo'lganda va Demo token bo'lgandagina Sandbox Mock Fallback:
  let simulatedData = null;
  let simulatedStatus = "200 OK";

  if (path.startsWith("/products/categories")) {
    simulatedData = {
      auth: { status: "OK", organization_id: 1 },
      payload: {
        status: "OK",
        data: [
          { product_id: 101, name: "Shashliklar", is_category: true, parent_id: null },
          { product_id: 102, name: "Asosiy taomlar", is_category: true, parent_id: null },
          { product_id: 103, name: "Salatlar", is_category: true, parent_id: null },
          { product_id: 104, name: "Ichimliklar", is_category: true, parent_id: null },
        ],
      },
    };
  } else if (path.startsWith("/products")) {
    if (method === "GET") {
      simulatedData = {
        auth: {
          status: "OK",
          organization_id: 1,
          organization_name: "O'zbegim Demo Restorani",
        },
        payload: {
          status: "OK",
          data: currentProducts,
          meta: {
            total: currentProducts.length,
            limit: 20,
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
          is_category: false,
          action: isUpdate ? "updated" : "created",
          name: it.name,
          price: it.price,
        };
      });
      simulatedData = {
        auth: { status: "OK", organization_id: 1 },
        payload: { status: "OK", data: createdOrUpdated },
      };
      simulatedStatus = "200 OK";
    } else if (method === "DELETE") {
      const ids = body?.payload || [];
      simulatedData = {
        auth: { status: "OK", organization_id: 1 },
        payload: { status: "OK", data: { deleted_count: ids.length || 1 } },
      };
      simulatedStatus = "200 OK";
    }
  } else if (path.startsWith("/orders")) {
    if (path.endsWith("/close")) {
      const parts = path.split("/");
      const orderId = parts[2];
      simulatedData = {
        auth: { status: "OK", organization_id: 1 },
        payload: {
          status: "OK",
          data: {
            order_id: Number(orderId),
            status: 20,
            price: body?.payments?.[0]?.amount || 54000,
            closed_at: new Date().toISOString(),
          },
        },
      };
      simulatedStatus = "200 OK";
    } else if (method === "POST") {
      const newOrderId = Math.floor(1000 + Math.random() * 9000);
      const total =
        body?.dishes?.reduce(
          (sum, d) => sum + (d.price || 25000) * (d.quantity || 1),
          0,
        ) || 54000;
      simulatedData = {
        auth: { status: "OK", organization_id: 1 },
        payload: {
          status: "OK",
          data: {
            order_id: newOrderId,
            order_number: 1,
            type: body?.type || "takeaway",
            table_id: body?.table_id || null,
            status: 1,
            price: total,
            goods: body?.dishes || [],
            created_at: new Date().toISOString(),
          },
        },
      };
      simulatedStatus = "201 Created";
    }
  } else if (path === "/payment-types") {
    simulatedData = {
      auth: { status: "OK", organization_id: 1 },
      payload: {
        status: "OK",
        data: [
          { payment_type_id: 1, name: "Naqd pul", received_type: "ReceivedCash", vip: false },
          { payment_type_id: 2, name: "Uzcard / Humo (Terminal)", received_type: "Terminal", vip: false },
          { payment_type_id: 3, name: "Click / Payme (Online)", received_type: "Online", vip: false },
        ],
      },
    };
  } else if (path === "/places") {
    simulatedData = {
      auth: { status: "OK", organization_id: 1 },
      payload: {
        status: "OK",
        data: [
          { place_id: 1, name: "Asosiy Zal", price_type: null },
          { place_id: 2, name: "Yozgi Terassa", price_type: null },
          { place_id: 3, name: "VIP Xona", price_type: "extra", extra_price: 50000 },
        ],
      },
    };
  } else if (path === "/tables") {
    simulatedData = {
      auth: { status: "OK", organization_id: 1 },
      payload: {
        status: "OK",
        data: [
          { table_id: 1, place_id: 1, number: 1, capacity: 4, status: 0 },
          { table_id: 2, place_id: 1, number: 2, capacity: 4, status: 0 },
          { table_id: 5, place_id: 1, number: 5, capacity: 6, status: 0 },
          { table_id: 10, place_id: 2, number: 10, capacity: 2, status: 0 },
          { table_id: 20, place_id: 3, number: 20, capacity: 12, status: 0 },
        ],
      },
    };
  } else if (path === "/units") {
    simulatedData = {
      auth: { status: "OK", organization_id: 1 },
      payload: {
        status: "OK",
        data: [
          { unit_id: 1, name: "Dona", short_name: "dona" },
          { unit_id: 2, name: "Kilogramm", short_name: "kg" },
          { unit_id: 3, name: "Porsiya", short_name: "pors" },
          { unit_id: 4, name: "Litr", short_name: "l" },
        ],
      },
    };
  } else {
    simulatedData = {
      auth: { status: "OK", organization_id: 1 },
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
      "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded";
  } else if (m === "PUT") {
    consoleMethod.className =
      "font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded";
  } else if (m === "POST") {
    consoleMethod.className =
      "font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded";
  } else if (m === "DELETE") {
    consoleMethod.className =
      "font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded";
  }

  consoleUrl.textContent = `${API_BASE_URL}${lastInspectorData.url}`;
  consoleStatus.textContent = lastInspectorData.responseStatus;
  consoleLatency.textContent = `Kechikish: ${lastInspectorData.latency}ms`;

  // MUHIM: HTTP status matni "200 OK" bo'lsa ham, javob tanasi (auth/payload)
  // ichida "ERROR" bo'lishi mumkin — konsol shuni ham albatta hisobga oladi,
  // aks holda foydalanuvchiga xato "muvaffaqiyatli" ko'rinib qoladi.
  const bodyStatus =
    lastInspectorData.responseBody?.payload?.status ||
    lastInspectorData.responseBody?.auth?.status;
  const hasBodyError = Boolean(
    bodyStatus === "ERROR" ||
      lastInspectorData.responseBody?.payload?.error ||
      lastInspectorData.responseBody?.auth?.error,
  );
  const isOk =
    (lastInspectorData.responseStatus.startsWith("2") ||
      lastInspectorData.responseStatus.includes("OK")) &&
    !hasBodyError;
  consoleStatus.className = `font-bold px-2 py-0.5 rounded-full shrink-0 text-xs ${
    isOk ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
  }`;

  if (activeConsoleTab === "response") {
    consoleOutput.textContent = JSON.stringify(
      lastInspectorData.responseBody,
      null,
      2,
    );
    consoleOutput.className = isOk
      ? "text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all"
      : "text-red-700 dark:text-red-300 whitespace-pre-wrap break-all";
  } else if (activeConsoleTab === "request") {
    consoleOutput.textContent = lastInspectorData.requestBody
      ? JSON.stringify(lastInspectorData.requestBody, null, 2)
      : "// Ushbu so'rovda tana (request body) mavjud emas";
    consoleOutput.className = "text-blue-600 dark:text-blue-400 whitespace-pre-wrap break-all";
  } else if (activeConsoleTab === "headers") {
    consoleOutput.textContent = JSON.stringify(
      lastInspectorData.headers,
      null,
      2,
    );
    consoleOutput.className = "text-amber-600 dark:text-amber-400 whitespace-pre-wrap break-all";
  }
}

function setConsoleTab(tab) {
  activeConsoleTab = tab;
  [showResponseTab, showRequestTab, showHeadersTab].forEach((btn) => {
    btn.className = "px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white";
  });

  if (tab === "response") {
    showResponseTab.className =
      "px-4 py-2 text-zinc-900 dark:text-white font-bold border-b-2 border-red-500";
  } else if (tab === "request") {
    showRequestTab.className =
      "px-4 py-2 text-zinc-900 dark:text-white font-bold border-b-2 border-red-500";
  } else if (tab === "headers") {
    showHeadersTab.className =
      "px-4 py-2 text-zinc-900 dark:text-white font-bold border-b-2 border-red-500";
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
  copyCurlBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400"></i><span class="text-emerald-600 dark:text-emerald-400">Nusxalandi!</span>`;
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
    copyFetchBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-600 dark:text-emerald-400"></i><span class="text-emerald-600 dark:text-emerald-400">Nusxalandi!</span>`;
    refreshIcons();
    setTimeout(() => {
      copyFetchBtn.innerHTML = `<i data-lucide="code" class="w-3 h-3"></i><span>Fetch</span>`;
      refreshIcons();
    }, 2000);
  };
}

// ── Tashkilot Ma'lumotnomalarini Avtomatik Yuklash (Meta: To'lov turlari va Stollar) ──
async function loadOrganizationMeta() {
  try {
    // 1. To'lov turlari
    const ptRes = await callApi("GET", "/payment-types");
    if (ptRes.ok) {
      const ptList = ptRes.data?.payload?.data || ptRes.data?.data || [];
      if (Array.isArray(ptList) && ptList.length > 0 && paymentTypeSelect) {
        paymentTypeSelect.innerHTML = ptList
          .map(
            (pt) =>
              `<option value="${pt.payment_type_id || pt.id}">${pt.name} (ID: ${pt.payment_type_id || pt.id})</option>`,
          )
          .join("");
      }
    }

    // 2. Stollar
    const tblRes = await callApi("GET", "/tables");
    if (tblRes.ok) {
      const tblList = tblRes.data?.payload?.data || tblRes.data?.data || [];
      if (Array.isArray(tblList) && tblList.length > 0 && orderTableSelect) {
        orderTableSelect.innerHTML = tblList
          .map(
            (tbl) =>
              `<option value="${tbl.table_id || tbl.id}">Stol #${tbl.number || tbl.table_id || tbl.id} (${tbl.capacity || 4} kishi)</option>`,
          )
          .join("");
      }
    }
  } catch (err) {
    console.warn("Tashkilot ma'lumotlarini yuklashda xatolik:", err);
  }
}

// ── Taomlar Ro'yxatini Chizish (Render Products) ──
async function loadProducts() {
  productsGrid.innerHTML = `
    <div class="col-span-2 py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Taomlar yuklanmoqda...</span>
    </div>
  `;

  const res = await callApi("GET", "/products?limit=20&offset=0");

  if (res.ok) {
    const rawItems = res.data?.payload?.data || res.data?.data || [];
    // Faqat taomlarni (kategoriyalarni emas) ajratib olish
    const dishes = rawItems.filter((p) => !p.is_category);
    currentProducts = dishes.length > 0 ? dishes : rawItems;
    productCountBadge.textContent = `${currentProducts.length} taom`;
    renderProductsGrid();
  } else {
    currentProducts = [];
    productCountBadge.textContent = "Xatolik";
    productsGrid.innerHTML = `
      <div class="col-span-2 py-12 text-center text-red-500 text-xs flex flex-col items-center gap-2">
        <i data-lucide="alert-circle" class="w-8 h-8 text-red-500"></i>
        <span class="font-bold">Serverdan taomlarni yuklab bo'lmadi</span>
        <span class="text-[11px] text-zinc-400 max-w-md">${res.error || "Server xatosi"}</span>
      </div>
    `;
    refreshIcons();
  }
}

function renderProductsGrid() {
  productsGrid.innerHTML = "";
  if (currentProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-span-2 py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
        Menyuda hech qanday taom topilmadi. Yuqoridagi "+ Yangi taom qo'shish" tugmasini bosing.
      </div>
    `;
    return;
  }

  currentProducts.forEach((p) => {
    const card = document.createElement("div");
    card.className =
      "p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between gap-3.5 transition-all shadow-md group";
    card.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">ID: #${p.product_id}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
            p.enable
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }">
            ${p.enable ? "Sotuvda bor" : "Tugagan"}
          </span>
        </div>

        <div>
          <h4 class="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">${p.name}</h4>
          ${p.category ? `<span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">${p.category}</span>` : ""}
        </div>

        <p class="text-sm font-mono text-red-600 dark:text-red-400 font-extrabold tracking-tight">${Number(p.price).toLocaleString()} UZS</p>
      </div>

      <!-- Tushunarli Matnli Tugmalar -->
      <div class="flex items-center gap-1.5 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <button onclick="addToCart(${p.product_id})" class="flex-1 py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/20" title="Savatga qo'shish">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Savatga</span>
        </button>
        <button onclick="editPricePrompt(${p.product_id}, ${p.price})" class="py-2 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1 transition-all" title="Taom narxini o'zgartirish">
          <i data-lucide="edit-3" class="w-3 h-3 text-blue-600 dark:text-blue-400"></i>
          <span>Narx</span>
        </button>
        <button onclick="deleteProduct(${p.product_id})" class="py-2 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500/20 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition-all" title="Taomni o'chirish">
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
    if (res.ok) {
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
        `<b>Yangi taom qo'shildi:</b> "${name}" (${price.toLocaleString()} UZS). Konsolda PUT javobi ko'rinmoqda!`,
      );
    }
  } else if (action === "update") {
    if (currentProducts.length === 0) {
      showToast("Yangilash uchun avval menyuda taom bo'lishi kerak", "error");
      return;
    }
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

    const res = await callApi("PUT", "/products", payload);
    if (res.ok) {
      dish.price = newPrice;
      renderProductsGrid();
      showTab("products");
      showToast(
        `<b>Narx yangilandi:</b> "${dish.name}" narxi ${newPrice.toLocaleString()} UZS ga o'zgardi!`,
      );
    }
  } else if (action === "order") {
    if (currentProducts.length === 0) {
      showToast("Buyurtma ochish uchun menyuda kamida bitta taom bo'lishi kerak", "error");
      return;
    }
    // 1- va 2-taomlarni savatga solish
    currentCart = [
      { ...currentProducts[0], quantity: 1 },
      { ...(currentProducts[1] || currentProducts[0]), quantity: 1 },
    ];
    updateCartView();
    showTab("orders");

    // Buyurtma yaratish (takeaway barcha restoranlarda stol talab qilmasdan 100% ishlaydi)
    const orderPayload = {
      type: "takeaway",
      dishes: currentCart.map((it) => ({
        product_id: Number(it.product_id),
        quantity: it.quantity || 1,
        price: Number(it.price),
      })),
      client_phone: "+998901234567",
    };

    const res = await callApi("POST", "/orders", orderPayload);
    if (res.ok) {
      const orderId =
        res.data?.payload?.data?.order_id ||
        res.data?.data?.order_id ||
        res.data?.order_id ||
        Math.floor(1000 + Math.random() * 9000);
      const orderPrice =
        res.data?.payload?.data?.price ||
        res.data?.data?.price ||
        currentCart.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0);

      currentActiveOrderId = orderId;
      currentActiveOrderAmount = orderPrice;
      activeOrderId.textContent = `#${orderId}`;
      activeOrderBox.classList.remove("hidden");
      activeOrderBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      refreshIcons();

      showToast(
        `<b>Kassa buyurtmasi ochildi!</b> #${orderId}-raqamli buyurtma yaratildi. Endi "To'lov bilan yopish"ni bosing!`,
      );
    }
  }
};

// ── YANGI TAOM QO'SHISH (PUT /products) ──
submitAddDishBtn.onclick = async () => {
  const name = newDishName.value.trim();
  const price = Number(newDishPrice.value);
  const category = newDishCategory.value.trim() || "Boshqa";
  const desc = newDishDesc.value.trim();

  if (!name || isNaN(price) || price <= 0) {
    alert("Iltimos, taom nomi va to'g'ri narxini kiriting!");
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

  if (res.ok) {
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
    showToast(`"${name}" taomi menyuga muvaffaqiyatli qo'shildi!`);
  }
};

// ── NARXNI TAHRIRLASH (PUT /products) ──
window.editPricePrompt = async (productId, oldPrice) => {
  const newPriceStr = prompt(
    `Taom narxini o'zgartirish:\nYangi narxni kiriting (hozirgi narx: ${Number(oldPrice).toLocaleString()} UZS):`,
    oldPrice,
  );
  if (!newPriceStr || isNaN(Number(newPriceStr))) return;

  const newPrice = Number(newPriceStr);
  const payload = {
    payload: [
      {
        product_id: Number(productId),
        price: newPrice,
        enable: true,
      },
    ],
  };

  const res = await callApi("PUT", "/products", payload);
  if (res.ok) {
    const found = currentProducts.find(
      (p) => Number(p.product_id) === Number(productId),
    );
    if (found) {
      found.price = newPrice;
      renderProductsGrid();
      showToast(
        `#${productId} taom narxi ${newPrice.toLocaleString()} UZS ga yangilandi!`,
      );
    }
  }
};

// ── TAOMNI O'CHIRISH (DELETE /products) ──
// DIQQAT: Rasmiy Zim-Zim API da DELETE /products { payload: [id] } ishlatiladi!
window.deleteProduct = async (productId) => {
  const product = currentProducts.find(
    (p) => Number(p.product_id) === Number(productId),
  );
  const title = product ? product.name : `#${productId}`;

  if (
    !confirm(`Haqiqatan ham "${title}" taomini menyudan o'chirmoqchimisiz?`)
  ) {
    return;
  }

  const res = await callApi("DELETE", "/products", {
    payload: [Number(productId)],
  });

  if (res.ok) {
    currentProducts = currentProducts.filter(
      (p) => Number(p.product_id) !== Number(productId),
    );
    productCountBadge.textContent = `${currentProducts.length} taom`;
    renderProductsGrid();
    showToast(`"${title}" menyudan o'chirildi!`);
  }
};

// ── SAVAT VA BUYURTMA (POST /orders) ──
window.addToCart = (productId) => {
  const product = currentProducts.find(
    (p) => Number(p.product_id) === Number(productId),
  );
  if (!product) return;

  const existing = currentCart.find(
    (it) => Number(it.product_id) === Number(productId),
  );
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    currentCart.push({ ...product, quantity: 1 });
  }

  updateCartView();
  showToast(
    `<b>"${product.name}"</b> savatga qo'shildi! Yuqoridagi "2. Kassa & Buyurtma" bo'limiga o'ting.`,
  );
};

function updateCartView() {
  if (currentCart.length === 0) {
    orderItemsList.innerHTML = `<div class="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">Savat hozircha bo'sh.<br/>Chapdagi "1. Taomlar & Menyu" bo'limidan taom qo'shing.</div>`;
    orderTotalAmount.textContent = "0 UZS";
    return;
  }

  orderItemsList.innerHTML = "";
  let total = 0;
  currentCart.forEach((item, index) => {
    const qty = item.quantity || 1;
    const subtotal = item.price * qty;
    total += subtotal;

    const row = document.createElement("div");
    row.className =
      "py-2.5 flex justify-between items-center text-zinc-700 dark:text-zinc-200 text-xs";
    row.innerHTML = `
      <div class="truncate mr-2">
        <span class="font-bold text-zinc-900 dark:text-white block truncate">${item.name}</span>
        <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">ID: #${item.product_id} • ${Number(item.price).toLocaleString()} x ${qty}</span>
      </div>
      <div class="flex items-center gap-2.5 shrink-0">
        <span class="font-mono text-red-600 dark:text-red-400 font-bold">${subtotal.toLocaleString()} UZS</span>
        <button onclick="removeFromCart(${index})" class="text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors" title="Savatdan o'chirish">
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

// Buyurtma turi o'zgarganda stol tanlash guruhini ko'rsatish/yashirish
if (orderTypeSelect) {
  orderTypeSelect.onchange = () => {
    if (orderTypeSelect.value === "table") {
      tableFieldsGroup.classList.remove("hidden");
    } else {
      tableFieldsGroup.classList.add("hidden");
    }
  };
}

createOrderBtn.onclick = async () => {
  if (currentCart.length === 0) {
    alert("Buyurtma berish uchun avval biror taomni savatga qo'shing!");
    return;
  }

  if (currentCart.length === 0) {
    showToast("Buyurtma yuborish uchun avval savatga kamida bitta taom qo'shing!", "error");
    return;
  }

  const orderType = orderTypeSelect?.value || "takeaway";
  const clientPhone = orderPhoneInput?.value.trim() || "+998901234567";

  // DIQQAT: Rasmiy Zim-Zim API da type (table/takeaway/delivery) va dishes[] kutiladi!
  const orderPayload = {
    type: orderType,
    dishes: currentCart.map((item) => ({
      product_id: Number(item.product_id),
      quantity: item.quantity || 1,
      price: Number(item.price),
    })),
    client_phone: clientPhone,
  };

  if (orderType === "table") {
    orderPayload.table_id = Number(orderTableSelect?.value || 1);
  }

  createOrderBtn.disabled = true;
  createOrderBtn.textContent = "Yuborilmoqda...";

  const res = await callApi("POST", "/orders", orderPayload);
  createOrderBtn.disabled = false;
  createOrderBtn.textContent = "Buyurtmani Yuborish (POST /orders)";

  if (res.ok) {
    const orderId =
      res.data?.payload?.data?.order_id ||
      res.data?.data?.order_id ||
      res.data?.order_id;
    const totalAmount =
      res.data?.payload?.data?.price ||
      res.data?.data?.price ||
      currentCart.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0);

    currentActiveOrderId = orderId;
    currentActiveOrderAmount = totalAmount;
    activeOrderId.textContent = `#${orderId}`;
    activeOrderBox.classList.remove("hidden");
    activeOrderBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    refreshIcons();

    showToast(
      `<b>Yangi Buyurtma #${orderId} ochildi!</b> Oshxonaga qabul qilindi. Endi to'lov bilan yopishingiz mumkin.`,
    );
  } else {
    activeOrderBox.classList.add("hidden");
    currentActiveOrderId = null;
  }
};

// ── BUYURTMANI TO'LOV BILAN YOPISH (POST /orders/{id}/close) ──
// DIQQAT: Rasmiy Zim-Zim API da { payments: [{ payment_type_id, amount }] } kutiladi!
closeOrderBtn.onclick = async () => {
  if (!currentActiveOrderId) return;

  const paymentTypeId =
    Number(document.getElementById("paymentTypeSelect")?.value) || 1;
  closeOrderBtn.disabled = true;
  closeOrderBtn.textContent = "To'lov yopilmoqda...";

  const total =
    currentActiveOrderAmount ||
    currentCart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) ||
    34000;

  const payload = {
    payments: [
      {
        payment_type_id: paymentTypeId,
        amount: total,
      },
    ],
  };

  const res = await callApi(
    "POST",
    `/orders/${currentActiveOrderId}/close`,
    payload,
  );
  closeOrderBtn.disabled = false;
  closeOrderBtn.textContent = "To'lov Bilan Yopish (POST /orders/{id}/close)";

  if (res.ok) {
    showToast(
      `<b>Buyurtma #${currentActiveOrderId} to'lov bilan muvaffaqiyatli yopildi!</b> Kassa kvitansiyasi chiqarildi.`,
    );
    currentCart = [];
    updateCartView();
    activeOrderBox.classList.add("hidden");
    currentActiveOrderId = null;
    currentActiveOrderAmount = 0;
  }
};

// ── MA'LUMOTNOMALARNI YUKLASH (DICTIONARIES) ──
window.fetchDictionary = async (dictType) => {
  const normalizedPath = dictType.startsWith("/") ? dictType : `/${dictType}`;
  const res = await callApi("GET", normalizedPath);

  if (res.ok && dictDisplayBox) {
    dictDisplayBox.classList.remove("hidden");
    dictTitle.textContent = `${normalizedPath} ma'lumotlari:`;
    const items = res.data?.payload?.data || res.data?.data || [];
    dictCount.textContent = `${items.length} ta element`;
    dictContentList.innerHTML = items
      .map(
        (it) => `
        <div class="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
          <div>
            <span class="font-bold text-zinc-900 dark:text-white block">${it.name || it.short_name || it.short || `ID: #${it.id || it.product_id || it.payment_type_id || it.table_id || it.place_id || it.unit_id}`}</span>
            ${it.capacity ? `<span class="text-[10px] text-zinc-400 dark:text-zinc-500">Sig'imi: ${it.capacity} kishi</span>` : ""}
            ${it.seats ? `<span class="text-[10px] text-zinc-400 dark:text-zinc-500">O'rinlar: ${it.seats} ta</span>` : ""}
            ${it.number ? `<span class="text-[10px] text-zinc-400 dark:text-zinc-500">Stol raqami: #${it.number}</span>` : ""}
          </div>
          <span class="font-mono text-zinc-500 dark:text-zinc-400 text-xs bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">ID: #${it.id || it.product_id || it.payment_type_id || it.table_id || it.place_id || it.unit_id}</span>
        </div>
      `,
      )
      .join("");
    showToast(
      `${normalizedPath} bo'yicha ${items.length} ta ma'lumot yuklandi va konsolda ko'rsatildi!`,
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
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2";
  });

  if (tabName === "products") {
    tabProducts.classList.remove("hidden");
    tabProductsBtn.className =
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm flex items-center justify-center gap-2";
  } else if (tabName === "orders") {
    tabOrders.classList.remove("hidden");
    tabOrdersBtn.className =
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm flex items-center justify-center gap-2";
  } else if (tabName === "dicts") {
    tabDicts.classList.remove("hidden");
    tabDictsBtn.className =
      "flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm flex items-center justify-center gap-2";
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

// Token kiritilishi yoki paste qilinishi bilan darhol aktivlashtirish
apiKeyInput.addEventListener("input", () => {
  const val = apiKeyInput.value.trim();
  if (val) {
    currentApiKey = val;
    localStorage.setItem("zimzim_api_key", currentApiKey);
    updateTokenBanner();
  }
});

saveKeyBtn.onclick = () => {
  currentApiKey = apiKeyInput.value.trim() || DEFAULT_API_KEY;
  localStorage.setItem("zimzim_api_key", currentApiKey);
  apiKeyInput.value = currentApiKey;
  currentOrgName = null;
  updateTokenBanner();
  saveKeyBtn.textContent = "Saqlandi!";
  saveKeyBtn.className =
    "px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold transition-all shrink-0";
  setTimeout(() => {
    saveKeyBtn.textContent = "Saqlash";
    saveKeyBtn.className =
      "px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all shrink-0";
  }, 1500);
  showToast("Yangi API token muvaffaqiyatli saqlandi!");
  loadProducts();
  loadOrganizationMeta();
};

if (resetDemoKeyBtn) {
  resetDemoKeyBtn.onclick = () => {
    currentApiKey = DEFAULT_API_KEY;
    localStorage.setItem("zimzim_api_key", currentApiKey);
    apiKeyInput.value = currentApiKey;
    currentOrgName = null;
    updateTokenBanner();
    showToast("Standart demo token tiklandi!");
    loadProducts();
    loadOrganizationMeta();
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

const themeToggleBtn = document.getElementById("themeToggleBtn");
if (themeToggleBtn) {
  themeToggleBtn.onclick = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("zimzim_theme", isDark ? "dark" : "light");
  };
}

// ── Jonli Konsolni Yashirish / Ko'rsatish ──
const toggleConsoleBtn = document.getElementById("toggleConsoleBtn");
const consoleBody = document.getElementById("consoleBody");
if (toggleConsoleBtn && consoleBody) {
  const consolePanel = toggleConsoleBtn.closest(".sticky");
  toggleConsoleBtn.onclick = () => {
    const isHidden = consoleBody.classList.toggle("hidden");
    toggleConsoleBtn.innerHTML = isHidden
      ? '<i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>'
      : '<i data-lucide="chevron-up" class="w-3.5 h-3.5"></i>';
    if (consolePanel) {
      consolePanel.classList.toggle("h-[calc(100vh-100px)]", !isHidden);
    }
    refreshIcons();
  };
}

refreshProductsBtn.onclick = () => {
  loadProducts();
  showToast("Menyudagi taomlar yangilandi!");
};

// Dastur ishga tushishi
loadProducts();
loadOrganizationMeta();
updateCartView();
