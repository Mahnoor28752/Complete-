// This system module now proxies requests to the backend API.
const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ? process.env.REACT_APP_API_BASE : 'http://localhost:5000/api';

class AttendanceSystem {
    constructor() {
        this.token = null;
        this.currentUser = null;
    }

    // Auth helpers
    setAuth(token, user) {
        this.token = token;
        this.currentUser = user || null;
    }

    getToken() {
        return this.token;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    clearAuth() {
        this.token = null;
        this.currentUser = null;
    }

    async login(username, password) {
        const resp = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await resp.json();
        if (!resp.ok) return { success: false, message: data.message || 'Login failed' };
        // store token and user in-memory
        this.setAuth(data.token, data.user);
        return { success: true, user: data.user };
    }

    logout() {
        this.clearAuth();
        window.location.href = '/';
    }

    // Fetch latest current user from server (useful after admin updates)
    async refreshCurrentUser() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const resp = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (resp.ok && data.user) {
                this.currentUser = data.user;
                return data.user;
            }
            return null;
        } catch (err) {
            console.error('refreshCurrentUser error', err);
            return null;
        }
    }

    async generateQRCode(courseId, durationMinutes = 15) {
        const token = this.getToken();
        const resp = await fetch(`${API_BASE}/teacher/generate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ courseId, durationMinutes })
        });
        return await resp.json();
    }

    async getCurrentQR(courseId) {
        const token = this.getToken();
        const url = new URL(`${API_BASE}/teacher/current`);
        if (courseId) url.searchParams.append('courseId', courseId);
        const resp = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${token}` } });
        return await resp.json();
    }

    async markAttendance(qrString) {
        const token = this.getToken();
        const resp = await fetch(`${API_BASE}/attendance/scan`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ qrString })
        });
        return await resp.json();
    }

    async getAttendanceToday() {
        const token = this.getToken();
        const resp = await fetch(`${API_BASE}/attendance/today`, { headers: { 'Authorization': `Bearer ${token}` } });
        return await resp.json();
    }

    async getAttendanceMonth(month, year) {
        const token = this.getToken();
        const url = new URL(`${API_BASE}/attendance/month`);
        url.searchParams.append('month', month);
        url.searchParams.append('year', year);
        const resp = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${token}` } });
        return await resp.json();
    }

    async addStudent(name, rollNo) {
        const token = this.getToken();
        const resp = await fetch(`${API_BASE}/admin/students`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, rollNo })
        });
        return await resp.json();
    }

    async addCourse(code, name) {
        const token = this.getToken();
        const resp = await fetch(`${API_BASE}/admin/courses`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ code, name })
        });
        return await resp.json();
    }

    async signup(email, password, fullName, role) {
        const resp = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                name: fullName,
                role,
                username: email.split('@')[0] // derive username from email
            })
        });
        const data = await resp.json();
        if (!resp.ok) return { success: false, message: data.message || 'Signup failed' };
        return { success: true, user: data.user };
    }
}

export const system = new AttendanceSystem();