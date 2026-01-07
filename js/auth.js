// Authentication System
let currentUser = null;
let isLoginMode = true;

// Check if user is logged in
async function checkAuth() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        currentUser = await db.users.get(parseInt(userId));
        if (currentUser) {
            updateUIForAuth(true);
            updateStreak();
            return true;
        }
    }
    updateUIForAuth(false);
    return false;
}

// Handle authentication (login/register)
async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name')?.value || '';
    
    if (isLoginMode) {
        // Login
        const user = await db.users.where('email').equals(email).first();
        if (user && user.password === password) {
            currentUser = user;
            localStorage.setItem('userId', user.id);
            await db.users.update(user.id, { lastLogin: new Date() });
            updateStreak();
            showSuccess('Welcome back!');
            router('dashboard');
        } else {
            showError('Invalid email or password');
        }
    } else {
        // Register
        const existingUser = await db.users.where('email').equals(email).first();
        if (existingUser) {
            showError('Email already registered');
            return;
        }
        
        const userId = await db.users.add({
            email,
            password,
            name,
            streak: 0,
            createdAt: new Date(),
            lastLogin: new Date()
        });
        
        currentUser = await db.users.get(userId);
        localStorage.setItem('userId', userId);
        showSuccess('Account created successfully!');
        router('dashboard');
    }
}

// Toggle between login and register
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submit = document.getElementById('auth-submit');
    const toggle = document.getElementById('auth-toggle');
    const registerFields = document.getElementById('register-fields');
    
    if (isLoginMode) {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Sign in to continue';
        submit.textContent = 'Sign In';
        toggle.textContent = 'Create an account';
        registerFields.classList.add('hidden');
    } else {
        title.textContent = 'Create Account';
        subtitle.textContent = 'Sign up to get started';
        submit.textContent = 'Sign Up';
        toggle.textContent = 'Already have an account?';
        registerFields.classList.remove('hidden');
    }
}

// Update streak counter
async function updateStreak() {
    if (!currentUser) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLogin = new Date(currentUser.lastLogin);
    lastLogin.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
        // Consecutive day
        await db.users.update(currentUser.id, { 
            streak: (currentUser.streak || 0) + 1,
            lastLogin: new Date()
        });
        currentUser.streak = (currentUser.streak || 0) + 1;
    } else if (daysDiff > 1) {
        // Streak broken
        await db.users.update(currentUser.id, { 
            streak: 1,
            lastLogin: new Date()
        });
        currentUser.streak = 1;
    }
    
    document.getElementById('streak-count').textContent = currentUser.streak || 0;
}

// Update UI based on auth state
function updateUIForAuth(authenticated) {
    const header = document.getElementById('app-header');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (authenticated) {
        header.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        header.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('userId');
    updateUIForAuth(false);
    router('home');
    showSuccess('Logged out successfully');
}

// Export
window.currentUser = () => currentUser;
window.checkAuth = checkAuth;
window.handleAuth = handleAuth;
window.toggleAuthMode = toggleAuthMode;
window.handleLogout = handleLogout;
