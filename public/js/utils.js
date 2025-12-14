// Utility functions

// Toast notifications
function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
            <div>
                <strong>${getToastIcon(type)} ${getToastTitle(type)}</strong>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem;">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.25rem;">&times;</button>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

function getToastTitle(type) {
    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };
    return titles[type] || titles.info;
}

// Loading overlay
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('bn-BD', {
        style: 'currency',
        currency: 'BDT'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateString);
}

// Truncate text
function truncate(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password
function isValidPassword(password) {
    return password.length >= 6;
}

// Get content type badge color
function getContentTypeBadge(contentType) {
    const badges = {
        text: 'info',
        video: 'primary',
        audio: 'success',
        mcq: 'warning'
    };
    return badges[contentType] || 'secondary';
}

// Get content type icon
function getContentTypeIcon(contentType) {
    const icons = {
        text: '📝',
        video: '🎥',
        audio: '🎵',
        mcq: '❓'
    };
    return icons[contentType] || '📄';
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle form submission with loading
async function handleFormSubmit(formElement, submitHandler) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = formElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Loading...';

            await submitHandler(new FormData(formElement));

        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Create navbar
function createNavbar(role = null) {
    const user = auth.getCurrentUser();
    const isAuth = auth.isAuthenticated();

    let menuItems = '';

    if (isAuth && role === 'instructor') {
        menuItems = `
            <li><a href="/pages/instructor-dashboard.html" class="navbar-link">Dashboard</a></li>
            <li><a href="/pages/instructor-courses.html" class="navbar-link">My Courses</a></li>
            <li><a href="/pages/upload-course.html" class="navbar-link">Upload Course</a></li>
            <li><a href="#" onclick="auth.logout()" class="navbar-link">Logout</a></li>
        `;
    } else if (isAuth && role === 'learner') {
        menuItems = `
            <li><a href="/pages/learner-dashboard.html" class="navbar-link">Dashboard</a></li>
            <li><a href="/pages/courses.html" class="navbar-link">Browse Courses</a></li>
            <li><a href="/pages/my-courses.html" class="navbar-link">My Courses</a></li>
            <li><a href="#" onclick="auth.logout()" class="navbar-link">Logout</a></li>
        `;
    } else {
        menuItems = `
            <li><a href="/" class="navbar-link">Home</a></li>
            <li><a href="/pages/login.html" class="navbar-link">Login</a></li>
            <li><a href="/pages/register.html" class="btn btn-primary btn-sm">Get Started</a></li>
        `;
    }

    return `
        <nav class="navbar">
            <div class="container navbar-content">
                <a href="/" class="navbar-brand">🎓 LMS</a>
                <ul class="navbar-menu">
                    ${menuItems}
                </ul>
            </div>
        </nav>
    `;
}

// Set active navbar link
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Initialize page
function initPage(role = null) {
    // Insert navbar
    const navbarHTML = createNavbar(role);
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Set active link
    setActiveNavLink();

    // Add toast container
    createToastContainer();
}
