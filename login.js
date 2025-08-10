
// Cargar usuarios
let users = [];

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    setupLoginEventListeners();
});

// Cargar usuarios del localStorage
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
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Event listeners
function setupLoginEventListeners() {
    document.getElementById('admin-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('admin-phone').value;
        const password = document.getElementById('admin-password').value;
        
        const user = users.find(u => u.phone === phone && u.password === password && u.isAdmin);
        
        if (user) {
            localStorage.setItem('currentAdmin', JSON.stringify(user));
            showNotification('Acceso autorizado. Redirigiendo...');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            showError('Credenciales incorrectas o no tienes permisos de administrador');
        }
    });
}

// Mostrar notificación de éxito
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2ed573;
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

// Mostrar error
function showError(message) {
    const error = document.createElement('div');
    error.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ff4757;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    error.textContent = message;
    document.body.appendChild(error);
    
    setTimeout(() => {
        error.remove();
    }, 3000);
}
