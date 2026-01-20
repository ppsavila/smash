// Simple client-side router with Firebase auth support

import { auth as firebaseAuth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.authRequired = new Set();
        this.authReady = false;
    }

    // Register a route
    register(path, handler, requiresAuth = false) {
        this.routes[path] = handler;
        if (requiresAuth) {
            this.authRequired.add(path);
        }
    }

    // Navigate to a route
    async navigate(path) {
        // Wait for auth to be ready
        if (!this.authReady) {
            await this.waitForAuth();
        }

        // Check if route requires authentication
        if (this.authRequired.has(path)) {
            const currentUser = firebaseAuth.currentUser;
            if (!currentUser) {
                // Save intended path for redirect after login
                localStorage.setItem('pendingPath', path);
                this.navigate('/login');
                return;
            }
        }

        const handler = this.routes[path];
        if (handler) {
            this.currentRoute = path;
            window.history.pushState({}, '', path);

            // Call handler (may be async)
            await handler();
        } else {
            console.error(`Route not found: ${path}`);
            this.navigate('/login');
        }
    }

    // Wait for Firebase auth to initialize
    waitForAuth() {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                this.authReady = true;
                unsubscribe();
                resolve(user);
            });
        });
    }

    // Initialize router
    async init() {
        // Wait for auth to initialize
        await this.waitForAuth();

        // Handle browser back/forward buttons
        window.addEventListener('popstate', async () => {
            const path = window.location.pathname;
            const handler = this.routes[path];
            if (handler) {
                this.currentRoute = path;
                await handler();
            }
        });

        // Handle initial route
        const initialPath = window.location.pathname + window.location.search;

        // Try to navigate to the initial path
        // The navigate method (potentially overridden) will handle 404s or dynamic routes
        await this.navigate(initialPath);
    }
}

export const router = new Router();
