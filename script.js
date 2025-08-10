
// Variables globales
let products = [];
let users = [];
let cart = [];
let currentUser = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadUsers();
    loadCart();
    setupEventListeners();
});

// Cargar productos desde JSON
function loadProducts() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Productos de ejemplo
        products = [
            {
                id: 1,
                name: "Smartphone Premium",
                description: "Teléfono inteligente con cámara de alta resolución y batería de larga duración",
                price: 599.99,
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                stock: 10
            },
            {
                id: 2,
                name: "Laptop Gaming",
                description: "Laptop para gaming con procesador de alta gama y tarjeta gráfica dedicada",
                price: 1299.99,
                image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300",
                stock: 5
            },
            {
                id: 3,
                name: "Auriculares Bluetooth",
                description: "Auriculares inalámbricos con cancelación de ruido activa",
                price: 199.99,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
                stock: 20
            }
        ];
        saveProducts();
    }
    displayProducts();
}

// Guardar productos en localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Cargar usuarios
function loadUsers() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        // Usuario admin por defecto
        users = [
            {
                phone: "123456789",
                password: "admin123",
                name: "Administrador",
                isAdmin: true
            }
        ];
        saveUsers();
    }
}

// Guardar usuarios
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Cargar carrito
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Guardar carrito
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Mostrar productos
function displayProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Crear tarjeta de producto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price}</div>
            <p class="stock-info">Stock: ${product.stock}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})" 
                ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
            </button>
        </div>
    `;
    return card;
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('No hay suficiente stock disponible');
            return;
        }
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification('Producto agregado al carrito');
}

// Actualizar contador del carrito
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Mostrar carrito
function showCart() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
        `;
        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = total.toFixed(2);
    modal.style.display = 'block';
}

// Actualizar cantidad en carrito
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item && product) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= product.stock) {
            item.quantity = newQuantity;
        } else if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        } else {
            alert('No hay suficiente stock disponible');
            return;
        }
        saveCart();
        showCart(); // Actualizar vista
    }
}

// Eliminar del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showCart(); // Actualizar vista
}

// Finalizar compra
function checkout() {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    if (!currentUser) {
        alert('Debes iniciar sesión para realizar una compra');
        showLogin();
        return;
    }
    
    const order = {
        id: Date.now(),
        userId: currentUser.phone,
        userName: currentUser.name,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString(),
        status: 'Pendiente'
    };
    
    // Guardar pedido
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Actualizar stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    saveProducts();
    displayProducts();
    
    // Limpiar carrito
    cart = [];
    saveCart();
    
    closeCart();
    showNotification('¡Pedido realizado con éxito!');
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        const user = users.find(u => u.phone === phone && u.password === password);
        if (user) {
            currentUser = user;
            closeLogin();
            showNotification(`Bienvenido, ${user.name}`);
            updateLoginButton();
        } else {
            alert('Credenciales incorrectas');
        }
    });
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        
        if (password !== confirm) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (users.find(u => u.phone === phone)) {
            alert('Ya existe un usuario con este número de teléfono');
            return;
        }
        
        const newUser = {
            phone: phone,
            password: password,
            name: name,
            isAdmin: false
        };
        
        users.push(newUser);
        saveUsers();
        currentUser = newUser;
        closeRegister();
        showNotification(`Cuenta creada exitosamente. Bienvenido, ${name}`);
        updateLoginButton();
    });
    
    // Cart icon click
    document.getElementById('cart-icon').addEventListener('click', showCart);
}

// Funciones de modales
function showLogin() {
    document.getElementById('login-modal').style.display = 'block';
}

function closeLogin() {
    document.getElementById('login-modal').style.display = 'none';
}

function showRegister() {
    closeLogin();
    document.getElementById('register-modal').style.display = 'block';
}

function closeRegister() {
    document.getElementById('register-modal').style.display = 'none';
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Actualizar botón de login
function updateLoginButton() {
    const loginBtn = document.querySelector('.nav-btn');
    if (currentUser) {
        loginBtn.textContent = `Hola, ${currentUser.name}`;
        loginBtn.onclick = logout;
        
        if (currentUser.isAdmin) {
            const adminBtn = document.createElement('button');
            adminBtn.textContent = 'Admin';
            adminBtn.className = 'nav-btn';
            adminBtn.onclick = () => window.location.href = 'admin.html';
            loginBtn.parentNode.insertBefore(adminBtn, loginBtn);
        }
    } else {
        loginBtn.textContent = 'Iniciar Sesión';
        loginBtn.onclick = showLogin;
    }
}

// Cerrar sesión
function logout() {
    currentUser = null;
    updateLoginButton();
    showNotification('Sesión cerrada');
    location.reload();
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--success);
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Cerrar modales al hacer click fuera
window.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
