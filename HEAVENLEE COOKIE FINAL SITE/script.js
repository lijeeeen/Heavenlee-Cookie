import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMRHi_pAPe7gFfbCb_0gmVuJm2nw5yhno",
  authDomain: "heavenleecookie-site.firebaseapp.com",
  projectId: "heavenleecookie-site",
  storageBucket: "heavenleecookie-site.firebasestorage.app",
  messagingSenderId: "514802186481",
  appId: "1:514802186481:web:f2e7567d02e7d02361d150",
  measurementId: "G-5FSR26S4EK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase Connected Successfully");

emailjs.init({
  publicKey: "2iNDXwE69cchvWAaJ"
});


const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "HEAVENLEE CLASSIC",
    price: 40,
    stock: 24,
    image: "images/classic.png",
    desc: "A soft-baked classic with rich buttery flavor and a perfectly tender center—simple, comforting, and made to feel like home."
  },
  {
    id: 2,
    name: "VELVET CLOUD",
    price: 40,
    stock: 18,
    image: "images/velvet.png",
    desc: "Our signature favorite—light, smooth, and delicately cocoa-kissed, with a soft, melt-in-your-mouth finish that keeps customers coming back."
  },
  {
    id: 3,
    name: "OREO GOSH",
    price: 40,
    stock: 16,
    image: "images/monster.png",
    desc: "A rich chocolate cookie filled with crushed Oreo pieces, offering a creamy crunch in every indulgent bite."
  },
  {
    id: 4,
    name: "S’MORES PLEASE",
    price: 40,
    stock: 20,
    image: "images/s'mores.png",
    desc: "A warm blend of chocolate, marshmallow, and graham—bringing a soft, gooey, and nostalgic sweetness."
  },
  {
    id: 5,
    name: "QUAD OF CLOUD",
    price: 160,
    stock: 12,
    image: "images/box.png",
    desc: "Choose any four of your favorite flavors and enjoy a perfectly curated box—made for sharing, gifting, or indulging your own cravings."
  },
  {
    id: "announcement",
    name: "NEW FLAVORS SOON",
    image: "images/soon.png",
    desc: "Something heavenly is baking behind the scenes. Stay tuned for upcoming Heavenlee flavors made to surprise your cravings.",
    isAnnouncement: true
  }
];

let products = JSON.parse(localStorage.getItem("heavenlee_products_A_plus")) || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem("heavenlee_cart_A_plus")) || [];
let orders = JSON.parse(localStorage.getItem("heavenlee_orders_A_plus")) || [];
let adminAccount = { username: "admin", password: "heavenlee123" };

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hide");
  }, 900);
});

function sendOrderEmail(order) {
  const templateParams = {
    customer_name: order.name,
    customer_email: order.email,
    order_id: order.id,
    total: order.total,
    payment: order.payment,
    status: order.status,
    address: order.address,
    items: order.items.map(item => `${item.name} x${item.qty}`).join(", ")
  };

    emailjs.send("Heavenlee Cookies", "template_9nbfyj8", templateParams)
    .then(() => {
      console.log("Order confirmation email sent.");
    })
    .catch((error) => {
      console.error("Email sending failed FULL ERROR:", error);
      alert(
        "Email failed: " +
        (error.text || error.message || JSON.stringify(error))
      );
    });
}

function saveData() {
  localStorage.setItem("heavenlee_products_A_plus", JSON.stringify(products));
  localStorage.setItem("heavenlee_cart_A_plus", JSON.stringify(cart));
  localStorage.setItem("heavenlee_orders_A_plus", JSON.stringify(orders));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function toggleMobileMenu() {
  document.getElementById("navLinks").classList.toggle("active");
}

function closeMobileMenu() {
  document.getElementById("navLinks").classList.remove("active");
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const searchValue = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const sortValue = document.getElementById("sortSelect")?.value || "default";

  let filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchValue) ||
    product.desc.toLowerCase().includes(searchValue)
  );

  if (sortValue === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortValue === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sortValue === "stock") {
    filteredProducts.sort((a, b) => b.stock - a.stock);
  }

  if (filteredProducts.length === 0) {
    grid.innerHTML = `<div class="empty-state">No cookie flavor found.</div>`;
    return;
  }

  grid.innerHTML = "";

  filteredProducts.forEach(product => {
    const card = document.createElement("div");

    if (product.isAnnouncement) {
      card.className = "product-card announcement-card";

      card.innerHTML = `
        <div class="product-img announcement-img">
          <img src="${product.image}" alt="${product.name}" />
          <div class="announcement-overlay">Coming Soon</div>
        </div>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>

        <div class="product-meta">
          <div class="price">Soon</div>
          <div class="stock">Stay Tuned</div>
        </div>

        <button class="btn-primary full-btn" disabled>
          New Flavors Coming Soon
        </button>
      `;

      grid.appendChild(card);
      return;
    }

    card.className = "product-card";

    card.innerHTML = `
      <div class="product-img"><img src="${product.image}" alt="${product.name}" /></div>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>

      <div class="product-meta">
        <div class="price">₱${product.price}</div>
        <div class="stock ${product.stock <= 0 ? "out" : ""}">
          ${product.stock > 0 ? product.stock + " left" : "Sold out"}
        </div>
      </div>

      <button class="btn-primary full-btn" ${product.stock <= 0 ? "disabled" : ""} onclick="addToCart(${product.id})">
        ${product.stock <= 0 ? "Sold Out" : "Add to Cart"}
      </button>
    `;

    grid.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (!product || product.stock <= 0) {
    showToast("This cookie is out of stock.");
    return;
  }

  if (existing) {
    if (existing.qty >= product.stock) {
      showToast("No more stock available for this cookie.");
      return;
    }

    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    });
  }

  saveData();
  updateCartCount();
  showToast(`${product.name} added to cart.`);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = count;
}

function openCart() {
  renderCart();
  document.getElementById("cartModal").classList.add("active");
}

function closeCart() {
  document.getElementById("cartModal").classList.remove("active");
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItems.innerHTML = `<div class="empty-state">Your cart is empty. Add some cookies first 🍪</div>`;
    cartTotal.textContent = "₱0";
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong><br>
        <small>₱${item.price} × ${item.qty} = ₱${item.price * item.qty}</small>
      </div>

      <div class="cart-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <strong>${item.qty}</strong>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = `₱${total}`;
}

function changeQty(productId, amount) {
  const cartItem = cart.find(item => item.id === productId);
  const product = products.find(item => item.id === productId);

  if (!cartItem || !product) return;

  if (amount > 0 && cartItem.qty >= product.stock) {
    showToast("No more stock available.");
    return;
  }

  cartItem.qty += amount;

  if (cartItem.qty <= 0) {
    cart = cart.filter(item => item.id !== productId);
  }

  saveData();
  updateCartCount();
  renderCart();
}

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  closeCart();
  document.getElementById("checkoutModal").classList.add("active");
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.remove("active");
}

function placeOrder() {
  const name = document.getElementById("customerName").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const payment = document.getElementById("paymentMethod").value;
  const note = document.getElementById("orderNote").value.trim();

  if (!name || !phone || !address) {
    showToast("Please complete your name, phone, and address.");
    return;
  }

  for (const item of cart) {
    const product = products.find(p => p.id === item.id);

    if (!product || item.qty > product.stock) {
      showToast(`${item.name} does not have enough stock.`);
      return;
    }
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    product.stock -= item.qty;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderId = "HC-" + Math.floor(10000 + Math.random() * 90000);

  const order = {
    id: orderId,
    name,
    email,
    phone,
    address,
    payment,
    note,
    items: cart,
    total,
    status: "Pending",
    date: new Date().toLocaleString()
  };

  orders.unshift(order);
  cart = [];

  console.log("ORDER EMAIL DATA:", order);
  console.log("CUSTOMER EMAIL:", order.email);

  sendOrderEmail(order);
  saveData();
  updateCartCount();
  renderProducts();
  renderOrders();
  renderStocks();
  closeCheckout();
  
  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("customerAddress").value = "";
  document.getElementById("orderNote").value = "";

  alert(
    `Order placed successfully!\n\nYour Order ID is: ${orderId}\nPayment: Cash on Delivery\n\nPlease save your Order ID to track your order.`
  );
}

function getStatusClass(status) {
  const clean = status.toLowerCase().replaceAll(" ", "-");

  if (clean.includes("pending")) return "status-pending";
  if (clean.includes("preparing")) return "status-preparing";
  if (clean.includes("delivery")) return "status-delivery";
  if (clean.includes("completed")) return "status-completed";
  if (clean.includes("cancelled")) return "status-cancelled";

  return "status-pending";
}

function trackOrder() {
  const input = document.getElementById("trackInput").value.trim().toUpperCase();
  const result = document.getElementById("statusResult");
  const order = orders.find(item => item.id.toUpperCase() === input);

  result.style.display = "block";

  if (!order) {
    result.innerHTML = `
      <strong>Order not found.</strong><br>
      <small>Please check your Order ID and try again.</small>
    `;
    return;
  }

  result.innerHTML = `
    <strong>Order ${order.id}</strong><br>
    <small>Customer: ${order.name}</small><br>
    <small>Total: ₱${order.total} • ${order.payment}</small><br>
    <span class="status-pill ${getStatusClass(order.status)}">${order.status}</span>
  `;
}

function updateAdminCreateBox() {
  return;
}

function createAdminAccount() {
  return;
}

async function loginAdmin() {
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value.trim();

  const adminEmail = username === "admin"
    ? "admin@heavenleecookies.com"
    : username;

  try {
    await signInWithEmailAndPassword(auth, adminEmail, password);

    document.getElementById("adminLoginBox").style.display = "none";
    document.getElementById("adminPanel").classList.add("active");

    renderOrders();
    renderStocks();

    showToast("Owner dashboard opened.");
  } catch (error) {
    showToast("Incorrect admin login.");
    console.error(error);
  }
}

async function logoutAdmin() {
  await signOut(auth);

  document.getElementById("adminLoginBox").style.display = "block";
  document.getElementById("adminPanel").classList.remove("active");
  document.getElementById("adminUsername").value = "";
  document.getElementById("adminPassword").value = "";

  showToast("Logged out successfully.");
}
function switchAdminTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".admin-content").forEach(content => content.classList.remove("active"));

  if (tab === "orders") {
    document.querySelectorAll(".admin-tab")[0].classList.add("active");
    document.getElementById("ordersTab").classList.add("active");
  } else {
    document.querySelectorAll(".admin-tab")[1].classList.add("active");
    document.getElementById("stocksTab").classList.add("active");
  }
}

function renderOrders() {
  const list = document.getElementById("ordersList");

  if (!list) return;

  if (orders.length === 0) {
    list.innerHTML = `<div class="empty-state">No orders yet.</div>`;
    return;
  }

  list.innerHTML = orders.map(order => `
    <div class="order-card">
      <h4>${order.id} — ${order.name}</h4>

      <p>
        <strong>Phone:</strong> ${order.phone}<br>
        <strong>Address:</strong> ${order.address}<br>
        <strong>Items:</strong> ${order.items.map(item => `${item.name} x${item.qty}`).join(", ")}<br>
        <strong>Total:</strong> ₱${order.total}<br>
        <strong>Payment:</strong> ${order.payment}<br>
        <strong>Note:</strong> ${order.note || "None"}<br>
        <strong>Date:</strong> ${order.date}
      </p>

      <select onchange="updateOrderStatus('${order.id}', this.value)">
        <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
        <option ${order.status === "Preparing" ? "selected" : ""}>Preparing</option>
        <option ${order.status === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
        <option ${order.status === "Completed" ? "selected" : ""}>Completed</option>
        <option ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
      </select>

      <span class="status-pill ${getStatusClass(order.status)}">${order.status}</span>
    </div>
  `).join("");
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(item => item.id === orderId);

  if (!order) return;

  order.status = status;

  saveData();
  renderOrders();

  showToast(`Order ${orderId} updated to ${status}.`);
}

function renderStocks() {
  const list = document.getElementById("stocksList");

  if (!list) return;

  list.innerHTML = products.map(product => `
    <div class="stock-row">
      <div>
        <strong>${product.name}</strong><br>
        <small>₱${product.price}</small>
      </div>

      <input type="number" min="0" value="${product.stock}" onchange="updateStock(${product.id}, this.value)" />
    </div>
  `).join("");
}

function updateStock(productId, value) {
  const product = products.find(item => item.id === productId);

  if (!product) return;

  product.stock = Math.max(0, Number(value));

  saveData();
  renderProducts();
  renderStocks();

  showToast(`${product.name} stock updated.`);
}

window.onclick = function(event) {
  const cartModal = document.getElementById("cartModal");
  const checkoutModal = document.getElementById("checkoutModal");

  if (event.target === cartModal) closeCart();
  if (event.target === checkoutModal) closeCheckout();
};

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(element => revealObserver.observe(element));

renderProducts();
updateCartCount();
updateAdminCreateBox();

window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.switchAdminTab = switchAdminTab;
window.renderOrders = renderOrders;
window.renderStocks = renderStocks;
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.placeOrder = placeOrder;
window.trackOrder = trackOrder;
window.updateOrderStatus = updateOrderStatus;
window.updateStock = updateStock;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.renderProducts = renderProducts; 
