// API Base URL (Ajustada según el backend existente)
const API_BASE = '/Catalogo_Tienda/backend/public';

// Utility: Convert Hex to RGB for shadow manipulation
function hexToRgb(hex) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
    }
    return '99, 102, 241'; // Fallback indigo
}

// Utility: Lighten/Darken color for hover states
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function showMessage(title, desc) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('product-grid').style.display = 'none';

    const msgBox = document.getElementById('message-container');
    msgBox.style.display = 'block';
    document.getElementById('msg-title').innerText = title;
    document.getElementById('msg-desc').innerText = desc;
}

async function initializeCatalog() {
    const urlParams = new URLSearchParams(window.location.search);
    const idStore = urlParams.get('id_store');

    if (!idStore) {
        showMessage('Enlace Inválido', 'Por favor, proporciona el id_store en la URL.');
        return;
    }

    try {
        // 1. Fetch Store Information
        const storeResponse = await fetch(`${API_BASE}/store?id_store=${idStore}`);
        const storeResult = await storeResponse.json();

        if (!storeResult.success || !storeResult.data) {
            throw new Error(storeResult.error || 'Tienda no encontrada.');
        }

        const store = storeResult.data;

        // Update UI with store details
        // Note: API returns 'store' for name, 'image' for logo, and 'colors' for color data.
        document.title = `${store.store ?? 'Tienda'} - Catálogo`;
        document.getElementById('store-name').innerText = store.store ?? 'ShoppyCatalog';

        // Set store logo if available
        if (store.image) {
            const logoEl = document.getElementById('store-logo');
            logoEl.src = store.image;
            logoEl.style.display = 'block';
        }

        // Default colors based on the provided image
        let primaryColor = '#0058b8';
        let gradientStart = '#e0efff';
        let gradientEnd = '#f8f9fb';

        // Apply custom primary color and gradient based on store.colors
        if (store.colors) {
            try {
                const colorsArray = JSON.parse(store.colors);
                if (Array.isArray(colorsArray) && colorsArray.length >= 1) {
                    primaryColor = colorsArray[0];
                    const rgb = hexToRgb(primaryColor);
                    const [r, g, b] = rgb.split(',').map(Number);
                    // Derive soft background gradient from the primary color
                    gradientStart = `rgba(${r}, ${g}, ${b}, 0.06)`;
                    gradientEnd = `rgba(${r}, ${g}, ${b}, 0.15)`;
                }
            } catch (e) {
                console.warn('Failed to parse store.colors', e);
            }
        }

        // Apply theme variables
        const primaryRgb = hexToRgb(primaryColor);
        const [r, g, b] = primaryRgb.split(',').map(Number);

        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--primary-color-hover', adjustColor(primaryColor, -20));
        document.documentElement.style.setProperty('--primary-color-rgb', primaryRgb);

        document.documentElement.style.setProperty('--bg-gradient-start', gradientStart);
        document.documentElement.style.setProperty('--bg-gradient-end', gradientEnd);

        // Tint the header glassmorphism & card borders with the primary color
        document.documentElement.style.setProperty('--card-border', `rgba(${r}, ${g}, ${b}, 0.18)`);

        // Apply gradient to the store name text
        const nameEl = document.getElementById('store-name');
        if (nameEl) {
            nameEl.style.background = `linear-gradient(to right, ${primaryColor}, ${adjustColor(primaryColor, 40)})`;
            nameEl.style.webkitBackgroundClip = 'text';
            nameEl.style.webkitTextFillColor = 'transparent';
        }
        // Dynamically set favicon to store logo if available
        if (store.image) {
            const faviconLink = document.getElementById('dynamic-favicon') || (function () {
                const link = document.createElement('link');
                link.id = 'dynamic-favicon';
                link.rel = 'icon';
                document.head.appendChild(link);
                return link;
            })();
            faviconLink.href = store.image;
        }

        // 2. Fetch Products
        const productsResponse = await fetch(`${API_BASE}/products?id_store=${idStore}&limit=100`); // Assuming reasonable limit
        const productsResult = await productsResponse.json();

        document.getElementById('loader').style.display = 'none';

        if (!productsResult.success) {
            throw new Error(productsResult.error || 'Error al cargar los productos.');
        }

        const products = productsResult.data;

        if (products.length === 0) {
            showMessage('Catálogo Vacío', 'Esta tienda aún no tiene productos disponibles para mostrar.');
            return;
        }

        renderProducts(products);

    } catch (error) {
        console.error('Error inicializando el catálogo:', error);
        showMessage('Error', error.message || 'Hubo un problema al cargar el catálogo. Inténtalo de nuevo más tarde.');
    }
}

// ─── Cart state ──────────────────────────────────────────────────────────────
const cart = [];
let currentProduct = null;

function formatMXN(amount) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// ─── Cart UI ──────────────────────────────────────────────────────────────────
function updateCartUI() {
    const count = cart.reduce((s, p) => s + p.quantity, 0);
    document.getElementById('cart-count').innerText = count;

    const list = document.getElementById('cart-items');
    if (cart.length === 0) {
        list.innerHTML = '<li class="cart-empty">No hay productos en el carrito.</li>';
        document.getElementById('cart-total').innerText = '';
        return;
    }

    list.innerHTML = cart.map(p => `
        <li class="cart-item">
            <div class="cart-item-info">
                <span class="cart-item-name">${p.name}</span>
                <span class="cart-item-qty">× ${p.quantity}</span>
            </div>
            <div class="cart-item-right">
                <span class="cart-item-price">${formatMXN(p.price * p.quantity)}</span>
                <button class="btn-cart-remove" data-id="${p.id_product}" title="Eliminar">✕</button>
            </div>
        </li>
    `).join('');

    const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);
    document.getElementById('cart-total').innerText = `Total: ${formatMXN(total)}`;
}

// ─── Product Modal ────────────────────────────────────────────────────────────
function openProductModal(product) {
    currentProduct = product;
    const imgSrc = product.image && product.image.trim() !== ''
        ? product.image
        : 'http://localhost/Catalogo_Tienda/backend/public/uploads/image.png';

    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-image').src = imgSrc;
    document.getElementById('modal-image').onerror = function () {
        this.src = 'http://localhost/Catalogo_Tienda/backend/public/uploads/image.png';
    };
    document.getElementById('modal-description').innerText = product.description || 'Sin descripción detallada.';
    document.getElementById('modal-price').innerText = formatMXN(product.price);

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('visible'));
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 300);
    currentProduct = null;
}

function addCurrentToCart() {
    if (!currentProduct) return;
    const existing = cart.find(p => p.id_product === currentProduct.id_product);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...currentProduct, quantity: 1 });
    }
    updateCartUI();
    closeProductModal();
    showCartToast(currentProduct.name);
}

// ─── Cart Modal ───────────────────────────────────────────────────────────────
function openCartModal() {
    updateCartUI();
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('visible'));
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function clearCart() {
    cart.length = 0;
    updateCartUI();
}

// Remove individual item
document.getElementById('cart-items').addEventListener('click', e => {
    const btn = e.target.closest('.btn-cart-remove');
    if (!btn) return;
    const id = btn.dataset.id;
    const idx = cart.findIndex(p => p.id_product === id);
    if (idx !== -1) cart.splice(idx, 1);
    updateCartUI();
});

// ─── Toast notification ───────────────────────────────────────────────────────
function showCartToast(name) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = `✓ "${name}" agregado al carrito`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Close modals on overlay click ───────────────────────────────────────────
document.getElementById('product-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('product-modal')) closeProductModal();
});
document.getElementById('cart-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('cart-modal')) closeCartModal();
});
// Close with Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProductModal(); closeCartModal(); }
});

// Cart button
document.getElementById('cart-button').addEventListener('click', openCartModal);

// ─── Product rendering ────────────────────────────────────────────────────────
function renderProducts(products) {
    const grid = document.getElementById('product-grid');

    const html = products.map((product, index) => {
        const imageSrc = product.image && product.image.trim() !== ''
            ? product.image
            : 'http://localhost/Catalogo_Tienda/backend/public/uploads/image.png';

        const priceFormatted = formatMXN(product.price);

        return `
            <div class="product-card" style="animation-delay: ${index * 0.05}s">
                <div class="product-image-container">
                    <img src="${imageSrc}" alt="${product.name}" class="product-image"
                         onerror="this.src='http://localhost/Catalogo_Tienda/backend/public/uploads/image.png'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description || 'Sin descripción detallada.'}</p>
                    <div class="product-footer">
                        <span class="product-price">${priceFormatted}</span>
                        <button class="btn-view" data-index="${index}">Ver más</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;

    // Delegated click → open modal
    grid.addEventListener('click', e => {
        const btn = e.target.closest('.btn-view');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        openProductModal(products[idx]);
    });

    // Trigger entrance animation
    setTimeout(() => grid.classList.add('visible'), 100);
}

// ─── Initialize on load ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initializeCatalog);
