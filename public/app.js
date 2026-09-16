// ============================================================================
// Zim-Zim Merchant API — Interactive Frontend Client Application
// ============================================================================

let currentApiKey = localStorage.getItem('zimzim_api_key') || '';
let currentProducts = [];
let currentCart = [];
let currentActiveOrderId = null;

// Console state
let lastInspectorData = {
  method: 'GET',
  url: '/api/v1/merchant/products?limit=6',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Api-Key': currentApiKey || '<YOUR_TOKEN>',
  },
  requestBody: null,
  responseStatus: '200 OK',
  responseBody: {},
  latency: 42,
};
let activeConsoleTab = 'response';

// DOM Elements
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const productsGrid = document.getElementById('productsGrid');
const refreshProductsBtn = document.getElementById('refreshProductsBtn');

// Console DOM
const consoleMethod = document.getElementById('consoleMethod');
const consoleUrl = document.getElementById('consoleUrl');
const consoleStatus = document.getElementById('consoleStatus');
const consoleOutput = document.getElementById('consoleOutput');
const consoleLatency = document.getElementById('consoleLatency');
const copyCurlBtn = document.getElementById('copyCurlBtn');
const showResponseTab = document.getElementById('showResponseTab');
const showRequestTab = document.getElementById('showRequestTab');
const showHeadersTab = document.getElementById('showHeadersTab');

// Tabs DOM
const tabProductsBtn = document.getElementById('tabProductsBtn');
const tabOrdersBtn = document.getElementById('tabOrdersBtn');
const tabDictsBtn = document.getElementById('tabDictsBtn');
const tabProducts = document.getElementById('tabProducts');
const tabOrders = document.getElementById('tabOrders');
const tabDicts = document.getElementById('tabDicts');

// Modal DOM
const addDishModal = document.getElementById('addDishModal');
const openAddDishModalBtn = document.getElementById('openAddDishModalBtn');
const closeAddDishModalBtn = document.getElementById('closeAddDishModalBtn');
const cancelAddDishBtn = document.getElementById('cancelAddDishBtn');
const submitAddDishBtn = document.getElementById('submitAddDishBtn');
const newDishName = document.getElementById('newDishName');
const newDishPrice = document.getElementById('newDishPrice');
const newDishDesc = document.getElementById('newDishDesc');

// Orders DOM
const createOrderBtn = document.getElementById('createOrderBtn');
const closeOrderBtn = document.getElementById('closeOrderBtn');
const activeOrderBox = document.getElementById('activeOrderBox');
const activeOrderId = document.getElementById('activeOrderId');
const orderItemsList = document.getElementById('orderItemsList');
const orderTotalAmount = document.getElementById('orderTotalAmount');

// Initialize Lucide icons
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ── API Caller Helper (via local proxy to bypass CORS) ──
async function callApi(method, path, body = null) {
  const startTime = Date.now();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (currentApiKey) {
    headers['X-Api-Key'] = currentApiKey;
  }

  const proxyUrl = `/api/proxy${path}`;

  try {
    const res = await fetch(proxyUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const latency = Date.now() - startTime;
    let data;
    try {
      data = await res.json();
    } catch {
      data = { status: res.status, statusText: res.statusText };
    }

    // Update Console Inspector
    lastInspectorData = {
      method,
      url: `/api/v1/merchant${path}`,
      headers,
      requestBody: body,
      responseStatus: `${res.status} ${res.statusText || (res.ok ? 'OK' : 'Error')}`,
      responseBody: data,
      latency,
    };

    updateConsoleView();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    const latency = Date.now() - startTime;
    lastInspectorData = {
      method,
      url: `/api/v1/merchant${path}`,
      headers,
      requestBody: body,
      responseStatus: 'Network Error',
      responseBody: { error: err.message, note: 'Server bilan aloqa yoki proxy tekshirilmoqda' },
      latency,
    };
    updateConsoleView();
    return { ok: false, error: err };
  }
}

// ── Update Console View ──
function updateConsoleView() {
  consoleMethod.textContent = lastInspectorData.method;
  consoleUrl.textContent = lastInspectorData.url;
  consoleStatus.textContent = lastInspectorData.responseStatus;
  consoleLatency.textContent = `Latency: ${lastInspectorData.latency}ms`;

  // Color badges
  const isOk = lastInspectorData.responseStatus.startsWith('2');
  consoleStatus.className = `font-bold px-2 py-0.5 rounded-full shrink-0 text-xs ${
    isOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
  }`;

  if (activeConsoleTab === 'response') {
    consoleOutput.textContent = JSON.stringify(lastInspectorData.responseBody, null, 2);
    consoleOutput.className = 'text-emerald-400 whitespace-pre-wrap break-all';
  } else if (activeConsoleTab === 'request') {
    consoleOutput.textContent = lastInspectorData.requestBody
      ? JSON.stringify(lastInspectorData.requestBody, null, 2)
      : '// Ushbu so\'rovda tana (request body) yuborilmagan';
    consoleOutput.className = 'text-blue-400 whitespace-pre-wrap break-all';
  } else if (activeConsoleTab === 'headers') {
    consoleOutput.textContent = JSON.stringify(lastInspectorData.headers, null, 2);
    consoleOutput.className = 'text-amber-400 whitespace-pre-wrap break-all';
  }
}

// ── Tab Switcher for Inspector ──
function setConsoleTab(tab) {
  activeConsoleTab = tab;
  [showResponseTab, showRequestTab, showHeadersTab].forEach((btn) => {
    btn.className = 'px-4 py-2 text-zinc-400 hover:text-white';
  });

  if (tab === 'response') {
    showResponseTab.className = 'px-4 py-2 text-white font-bold border-b-2 border-red-500';
  } else if (tab === 'request') {
    showRequestTab.className = 'px-4 py-2 text-white font-bold border-b-2 border-red-500';
  } else if (tab === 'headers') {
    showHeadersTab.className = 'px-4 py-2 text-white font-bold border-b-2 border-red-500';
  }
  updateConsoleView();
}

showResponseTab.onclick = () => setConsoleTab('response');
showRequestTab.onclick = () => setConsoleTab('request');
showHeadersTab.onclick = () => setConsoleTab('headers');

// ── Copy cURL Helper ──
copyCurlBtn.onclick = async () => {
  const { method, url, headers, requestBody } = lastInspectorData;
  let curl = `curl -X ${method} "https://api-kafe.zim-zim.uz${url}" \\\n`;
  for (const [k, v] of Object.entries(headers)) {
    curl += `  -H "${k}: ${v}" \\\n`;
  }
  if (requestBody) {
    curl += `  -d '${JSON.stringify(requestBody, null, 2)}'`;
  }

  await navigator.clipboard.writeText(curl);
  copyCurlBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i><span class="text-emerald-400">Copied!</span>`;
  refreshIcons();
  setTimeout(() => {
    copyCurlBtn.innerHTML = `<i data-lucide="copy" class="w-3 h-3"></i><span>Copy cURL</span>`;
    refreshIcons();
  }, 2000);
};

// ── Fetch & Render Products (GET /products) ──
async function loadProducts() {
  productsGrid.innerHTML = `
    <div class="col-span-2 py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Mahsulotlar yuklanmoqda...</span>
    </div>
  `;

  const res = await callApi('GET', '/products?limit=8&offset=0');

  if (res.ok && res.data?.data && res.data.data.length > 0) {
    currentProducts = res.data.data;
  } else {
    // Agar API Key bo'lmasa yoki serverda test ma'lumoti bo'lmasa demo ma'lumotlar
    currentProducts = [
      { product_id: 136001, name: "Qiyma Shashlik", price: 24000, enable: true },
      { product_id: 136002, name: "Jaz Go'shtli Shashlik", price: 28000, enable: true },
      { product_id: 136003, name: "Zim-Zim Maxsus Palov", price: 42000, enable: true },
      { product_id: 136004, name: "Tandir Somsa", price: 12000, enable: true },
    ];
  }

  renderProductsGrid();
}

function renderProductsGrid() {
  productsGrid.innerHTML = '';
  currentProducts.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between gap-3 hover:border-zinc-700 transition-all';
    card.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold text-zinc-500">ID: #${p.product_id}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${p.enable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}">
            ${p.enable ? 'Sotuvda bor' : 'Tugagan'}
          </span>
        </div>
        <h3 class="text-sm font-bold text-white">${p.name}</h3>
        <p class="text-xs font-mono text-red-400 font-semibold">${Number(p.price).toLocaleString()} UZS</p>
      </div>

      <div class="flex items-center gap-1.5 pt-2 border-t border-zinc-800/80">
        <button onclick="addToCart(${p.product_id})" class="flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Savatga</span>
        </button>
        <button onclick="editPricePrompt(${p.product_id}, ${p.price})" class="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs" title="Narxini o'zgartirish">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="deleteProduct(${p.product_id})" class="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs" title="O'chirish">
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
    alert('Iltimos, taom nomi va narxini to\'g\'ri kiriting!');
    return;
  }

  submitAddDishBtn.disabled = true;
  submitAddDishBtn.textContent = 'Yuborilmoqda...';

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

  const res = await callApi('PUT', '/products', payload);
  submitAddDishBtn.disabled = false;
  submitAddDishBtn.textContent = 'Saqlash va Yuborish';
  addDishModal.classList.add('hidden');
  addDishModal.classList.remove('flex');

  // Add to local state
  const newId = res.data?.data?.[0]?.product_id || Date.now() % 100000;
  currentProducts.unshift({ product_id: newId, name, price, enable: true });
  renderProductsGrid();
};

// ── UPDATE DISH PRICE (PUT /products) ──
window.editPricePrompt = async (productId, oldPrice) => {
  const newPriceStr = prompt(`Yangi narxni kiriting (hozirgi: ${oldPrice} UZS):`, oldPrice);
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

  await callApi('PUT', '/products', payload);
  const found = currentProducts.find((p) => p.product_id === productId);
  if (found) {
    found.price = newPrice;
    renderProductsGrid();
  }
};

// ── DELETE DISH (DELETE /products/{id}) ──
window.deleteProduct = async (productId) => {
  if (!confirm(`Haqiqatan ham #${productId} taomni o'chirmoqchimisiz?`)) return;

  await callApi('DELETE', `/products/${productId}`);
  currentProducts = currentProducts.filter((p) => p.product_id !== productId);
  renderProductsGrid();
};

// ── CART & ORDER FLOW (POST /orders) ──
window.addToCart = (productId) => {
  const product = currentProducts.find((p) => p.product_id === productId);
  if (!product) return;

  currentCart.push(product);
  updateCartView();
  // Switch to orders tab
  showTab('orders');
};

function updateCartView() {
  if (currentCart.length === 0) {
    orderItemsList.innerHTML = `<div class="py-3 text-center text-zinc-500 text-xs">Savat bo'sh. Taom qo'shing.</div>`;
    orderTotalAmount.textContent = '0 UZS';
    return;
  }

  orderItemsList.innerHTML = '';
  let total = 0;
  currentCart.forEach((item, index) => {
    total += item.price;
    const row = document.createElement('div');
    row.className = 'py-2 flex justify-between items-center text-zinc-300';
    row.innerHTML = `
      <span>${item.name}</span>
      <div class="flex items-center gap-2">
        <span class="font-mono text-white font-semibold">${Number(item.price).toLocaleString()} UZS</span>
        <button onclick="removeFromCart(${index})" class="text-zinc-500 hover:text-red-400 p-0.5">
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
    alert('Buyurtma berish uchun avval biror taomni savatga qo\'shing!');
    return;
  }

  const placeId = Number(document.getElementById('orderPlaceSelect').value);
  const tableId = Number(document.getElementById('orderTableInput').value);
  const guests = Number(document.getElementById('orderGuestsInput').value);

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
  createOrderBtn.textContent = 'Yuborilmoqda...';

  const res = await callApi('POST', '/orders', orderPayload);
  createOrderBtn.disabled = false;
  createOrderBtn.textContent = 'Buyurtmani jo\'natish (POST /orders)';

  const orderId = res.data?.data?.order_id || res.data?.data?.id || Math.floor(1000 + Math.random() * 9000);
  currentActiveOrderId = orderId;
  activeOrderId.textContent = `#${orderId}`;
  activeOrderBox.classList.remove('hidden');
};

// ── CLOSE ORDER (POST /orders/{id}/close) ──
closeOrderBtn.onclick = async () => {
  if (!currentActiveOrderId) return;

  closeOrderBtn.disabled = true;
  closeOrderBtn.textContent = 'To\'lov yopilmoqda...';

  const payload = {
    payment_type_id: 1, // Naqd / Karta
    amount: currentCart.reduce((sum, item) => sum + item.price, 0) || 48000,
  };

  const res = await callApi('POST', `/orders/${currentActiveOrderId}/close`, payload);
  closeOrderBtn.disabled = false;
  closeOrderBtn.textContent = 'To\'lov bilan yopish (POST /orders/{id}/close)';

  alert(`🎉 Buyurtma #${currentActiveOrderId} to'lov bilan muvaffaqiyatli yopildi!`);
  currentCart = [];
  updateCartView();
  activeOrderBox.classList.add('hidden');
  currentActiveOrderId = null;
};

// ── DICTIONARIES ──
window.fetchDictionary = async (dictType) => {
  await callApi('GET', `/${dictType}`);
};

// ── TAB SWITCHING ──
function showTab(tabName) {
  [tabProducts, tabOrders, tabDicts].forEach((el) => el.classList.add('hidden'));
  [tabProductsBtn, tabOrdersBtn, tabDictsBtn].forEach((btn) => {
    btn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all text-zinc-400 hover:text-white flex items-center justify-center gap-2';
  });

  if (tabName === 'products') {
    tabProducts.classList.remove('hidden');
    tabProductsBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2';
  } else if (tabName === 'orders') {
    tabOrders.classList.remove('hidden');
    tabOrdersBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2';
  } else if (tabName === 'dicts') {
    tabDicts.classList.remove('hidden');
    tabDictsBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all bg-zinc-800 text-white shadow-sm flex items-center justify-center gap-2';
  }
}

tabProductsBtn.onclick = () => showTab('products');
tabOrdersBtn.onclick = () => showTab('orders');
tabDictsBtn.onclick = () => showTab('dicts');

// ── MODAL LISTENERS ──
openAddDishModalBtn.onclick = () => {
  addDishModal.classList.remove('hidden');
  addDishModal.classList.add('flex');
};
closeAddDishModalBtn.onclick = cancelAddDishBtn.onclick = () => {
  addDishModal.classList.add('hidden');
  addDishModal.classList.remove('flex');
};

// ── API KEY CONFIG ──
if (currentApiKey) {
  apiKeyInput.value = currentApiKey;
}

saveKeyBtn.onclick = () => {
  currentApiKey = apiKeyInput.value.trim();
  localStorage.setItem('zimzim_api_key', currentApiKey);
  saveKeyBtn.textContent = 'Saqlandi!';
  saveKeyBtn.className = 'px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold transition-all shrink-0';
  setTimeout(() => {
    saveKeyBtn.textContent = 'Saqlash';
    saveKeyBtn.className = 'px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all shrink-0';
  }, 1500);
  loadProducts();
};

toggleKeyVisibility.onclick = () => {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleKeyVisibility.innerHTML = '<i data-lucide="eye-off" class="w-3.5 h-3.5"></i>';
  } else {
    apiKeyInput.type === 'password';
    toggleKeyVisibility.innerHTML = '<i data-lucide="eye" class="w-3.5 h-3.5"></i>';
  }
  refreshIcons();
};

refreshProductsBtn.onclick = () => loadProducts();

// Start
loadProducts();
refreshIcons();
