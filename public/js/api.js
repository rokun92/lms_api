// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// API Client with authentication
class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const { method = 'GET', body, includeAuth = true, isFormData = false } = options;

        const config = {
            method,
            headers: this.getHeaders(includeAuth),
        };

        // Handle FormData differently
        if (isFormData) {
            delete config.headers['Content-Type'];
            config.body = body;
        } else if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { email, password },
            includeAuth: false,
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData,
            includeAuth: false,
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    // Instructor endpoints
    async uploadCourse(formData) {
        return this.request('/instructor/courses', {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    async getInstructorCourses() {
        return this.request('/instructor/courses');
    }

    async getInstructorProfile() {
        return this.request('/instructor/profile');
    }

    async updateInstructorProfile(data) {
        return this.request('/instructor/profile', {
            method: 'PUT',
            body: data,
        });
    }

    async getLearnerHome() {
        return this.request('/learner/home');
    }

    async getEnrolledCourses() {
        return this.request('/learner/enrolled-courses');
    }

    async getCertificates() {
        return this.request('/learner/certificates');
    }

    // Course endpoints
    async getAllCourses() {
        return this.request('/courses', { includeAuth: false });
    }

    async getCourseById(id) {
        return this.request(`/courses/${id}`, { includeAuth: false });
    }

    async purchaseCourse(id, accountNumber, secret) {
        const body = {};
        if (accountNumber) body.accountNumber = accountNumber;
        if (secret) body.secret = secret;

        return this.request(`/courses/${id}/purchase`, {
            method: 'POST',
            body,
        });
    }

    async getCourseContent(id) {
        return this.request(`/courses/${id}/content`);
    }

    async updateProgress(id, progressData) {
        return this.request(`/courses/${id}/progress`, {
            method: 'POST',
            body: progressData,
        });
    }

    async completeCourse(id) {
        return this.request(`/courses/${id}/complete`, {
            method: 'POST',
        });
    }

    async getInstructorEarnings() {
        return this.request('/payment/instructor/earnings');
    }

    async getOrgBalance() {
        return this.request('/bank/org-balance', { includeAuth: false });
    }

    async validateTransaction(transactionId, accountNumber, secret) {
        return this.request(`/bank/transactions/${transactionId}/validate`, {
            method: 'POST',
            body: { accountNumber, secret },
            includeAuth: false,
        });
    }

    // Exam/Question endpoints (Instructor)
    async getQuestions(courseId) {
        return this.request(`/instructor/courses/${courseId}/questions`);
    }

    async addQuestion(courseId, questionData) {
        return this.request(`/instructor/courses/${courseId}/questions`, {
            method: 'POST',
            body: questionData,
        });
    }

    async updateQuestion(questionId, questionData) {
        return this.request(`/instructor/questions/${questionId}`, {
            method: 'PUT',
            body: questionData,
        });
    }

    async deleteQuestion(questionId) {
        return this.request(`/instructor/questions/${questionId}`, {
            method: 'DELETE',
        });
    }

    // Exam/Progress endpoints (Learner)
    async getProgress(courseId) {
        return this.request(`/courses/${courseId}/progress`);
    }

    async getExam(courseId) {
        return this.request(`/courses/${courseId}/exam`);
    }

    async submitExam(courseId, answers) {
        return this.request(`/courses/${courseId}/exam`, {
            method: 'POST',
            body: { answers }
        });
    }
}

// Export singleton instance
const api = new APIClient();
