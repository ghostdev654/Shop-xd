
// Variables globales para admin
let products = [];
let orders = [];
let currentAdmin = null;

// Verificar si es admin al cargar
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadProducts();
    loadOrders();
    setupAdminEventListeners();
});

// Verificar autenticación de admin
function checkAdminAuth() {
    const adminUser = localStorage.getItem('currentAdmin');
    if (!adminUser) {
        window.location.href = 'login.html';
        return;
    }
    currentAdmin = JSON.parse(adminUser);
    if (!currentAdmin.isAdmin) {
        alert('No tienes permisos de administrador');
        window.location.href = 'index.html';
        return;
    }
}

// Cargar productos
function loadProducts() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    displayAdminProducts();
}

// Cargar pedidos
function loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
    displayOrders();
}

// Guardar productos
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Guardar pedidos
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Mostrar productos en admin
function displayAdminProducts() {
    const container = document.getElementById('admin-products-list');
    container.innerHTML = '';
    
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div>
                <h4>${product.name}</h4>
                <p>Precio: $${product.price} | Stock: ${product.stock}</p>
                <p>${product.description}</p>
            </div>
            <div class="product-actions">
                <button class="edit-btn" onclick="editProduct(${product.id})">Editar</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(productItem);
    });
}

// Mostrar pedidos
function displayOrders() {
    const container = document.getElementById('orders-list');
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No hay pedidos registrados</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div>
                <h4>Pedido #${order.id}</h4>
                <p><strong>Cliente:</strong> ${order.userName} (${order.userId})</p>
                <p><strong>Fecha:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Estado:</strong> ${order.status}</p>
                <div class="order-items">
                    <strong>Productos:</strong>
                    <ul>
                        ${order.items.map(item => `
                            <li>${item.name} - Cantidad: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <div class="order-actions">
                <select onchange="updateOrderStatus(${order.id}, this.value)" value="${order.status}">
                    <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Procesando" ${order.status === 'Procesando' ? 'selected' : ''}>Procesando</option>
                    <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                    <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
        `;
        container.appendChild(orderItem);
    });
}

// Mostrar sección de productos
function showProducts() {
    document.getElementById('products-section').style.display = 'block';
    document.getElementById('orders-section').style.display = 'none';
    
    // Actualizar botones activos
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Mostrar sección de pedidos
function showOrders() {
    document.getElementById('products-section').style.display = 'none';
    document.getElementById('orders-section').style.display = 'block';
    
    // Actualizar botones activos
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Mostrar modal para agregar producto
function showAddProduct() {
    document.getElementById('product-modal-title').textContent = 'Agregar Producto';
    document.getElementById('product-submit').textContent = 'Agregar Producto';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').style.display = 'block';
}

// Editar producto
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('product-modal-title').textContent = 'Editar Producto';
    document.getElementById('product-submit').textContent = 'Actualizar Producto';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-modal').style.display = 'block';
}

// Eliminar producto
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        displayAdminProducts();
        showNotification('Producto eliminado exitosamente');
    }
}

// Cerrar modal de producto
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Actualizar estado del pedido
function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveOrders();
        showNotification('Estado del pedido actualizado');
    }
}

// Event Listeners para admin
function setupAdminEventListeners() {
    // Formulario de producto
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const description = document.getElementById('product-description').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value;
        const stock = parseInt(document.getElementById('product-stock').value);
        
        if (id) {
            // Editar producto existente
            const productIndex = products.findIndex(p => p.id == id);
            if (productIndex !== -1) {
                products[productIndex] = { id: parseInt(id), name, description, price, image, stock };
                showNotification('Producto actualizado exitosamente');
            }
        } else {
            // Agregar nuevo producto
            const newProduct = {
                id: Date.now(),
                name,
                description,
                price,
                image,
                stock
            };
            products.push(newProduct);
            showNotification('Producto agregado exitosamente');
        }
        
        saveProducts();
        displayAdminProducts();
        closeProductModal();
    });
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
    }
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
