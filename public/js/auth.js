// Authentication utilities
const auth = {
    // Check if user is logged in
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Get current user data
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Save user data
    setCurrentUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Get user role
    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    // Login
    async login(email, password) {
        try {
            const response = await api.login(email, password);

            if (response.success && response.data && response.data.token) {
                api.setToken(response.data.token);
                this.setCurrentUser(response.data.user);
                return response;
            }

            throw new Error(response.message || 'Login failed');
        } catch (error) {
            throw error;
        }
    },

    // Register
    async register(userData) {
        try {
            const response = await api.register(userData);

            if (response.success && response.data && response.data.token) {
                api.setToken(response.data.token);
                this.setCurrentUser(response.data.user);
                return response;
            }

            throw new Error(response.message || 'Registration failed');
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        api.setToken(null);
        window.location.href = '/pages/login.html';
    },

    // Redirect based on role
    redirectToDashboard() {
        const role = this.getUserRole();
        if (role === 'instructor') {
            window.location.href = '/pages/instructor-dashboard.html';
        } else if (role === 'learner') {
            window.location.href = '/pages/learner-dashboard.html';
        } else {
            window.location.href = '/pages/login.html';
        }
    },

    // Protect page (require authentication)
    requireAuth(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return false;
        }

        if (requiredRole) {
            const userRole = this.getUserRole();
            if (userRole !== requiredRole) {
                showToast('Access denied', 'error');
                this.redirectToDashboard();
                return false;
            }
        }

        return true;
    },

    // Redirect if already authenticated
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            this.redirectToDashboard();
            return true;
        }
        return false;
    }
};
