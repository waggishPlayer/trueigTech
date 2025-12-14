const API_BASE = 'https://trueigtech.onrender.com';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

const elements = {
    // Auth Page Elements
    authTitle: document.getElementById('authTitle'),
    authSubtitle: document.getElementById('authSubtitle'),
    loginTab: document.getElementById('loginTab'),
    signupTab: document.getElementById('signupTab'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    signupRole: document.getElementById('signupRole'),

    // Dashboard Elements
    userDashboard: document.getElementById('userDashboard'),
    trainerDashboard: document.getElementById('trainerDashboard'),
    logoutBtn: document.getElementById('logoutBtn'),
    welcomeMsg: document.getElementById('welcomeMsg'),

    // Global
    modal: document.getElementById('modal'),
    toast: document.getElementById('toast')
};

let currentPlanId = null;

// --- Initialization Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Robust detection based on elements present, not just URL path
    const isAuthPage = document.getElementById('authTitle');
    const isDashboardPage = document.getElementById('userDashboard') || document.getElementById('trainerDashboard');

    // Check for Payment Success Flag (on dashboard)
    if (isDashboardPage && localStorage.getItem('paymentSuccess')) {
        showToast('Payment Successful! You are now subscribed.', 'success');
        localStorage.removeItem('paymentSuccess');
    }

    if (isAuthPage) {
        initAuthPage();
    } else if (isDashboardPage) {
        initDashboardPage();
    }
});

// --- Auth Page Logic ---
function initAuthPage() {
    // Get Role from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role'); // 'TRAINER' or 'USER'

    if (!roleParam || (roleParam !== 'TRAINER' && roleParam !== 'USER')) {
        window.location.href = 'index.html'; // Redirect to landing if invalid
        return;
    }

    // specific UI based on role
    if (roleParam === 'TRAINER') {
        elements.authTitle.textContent = 'Trainer Access';
        elements.authSubtitle.textContent = 'Manage your plans and clients';
        elements.signupRole.value = 'TRAINER';
    } else {
        elements.authTitle.textContent = 'User Portal';
        elements.authSubtitle.textContent = 'Access your fitness journey';
        elements.signupRole.value = 'USER';
    }

    // Tab Switching
    elements.loginTab.addEventListener('click', () => {
        elements.loginTab.classList.add('active');
        elements.signupTab.classList.remove('active');
        elements.loginForm.style.display = 'block';
        elements.signupForm.style.display = 'none';
        elements.loginForm.classList.add('active');
    });

    elements.signupTab.addEventListener('click', () => {
        elements.signupTab.classList.add('active');
        elements.loginTab.classList.remove('active');
        elements.signupForm.style.display = 'block';
        elements.loginForm.style.display = 'none';
        elements.signupForm.classList.add('active');
    });

    // Login Handler
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                // Strict Role Check
                if (data.user.role !== roleParam) {
                    showToast(`Access Denied. You are a ${data.user.role}. Please login via the ${data.user.role} page.`, 'error');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    return;
                }

                token = data.token;
                currentUser = data.user;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(currentUser));
                window.location.href = 'dashboard.html';
            } else {
                showToast(data.error || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            handleNetworkError(error);
        }
    });

    // Signup Handler
    elements.signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const role = elements.signupRole.value;

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();

            if (res.ok) {
                token = data.token;
                currentUser = data.user;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(currentUser));
                showToast('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showToast(data.error || 'Signup failed. Please try a different email.', 'error');
            }
        } catch (error) {
            handleNetworkError(error);
        }
    });
}

// --- Dashboard Page Logic ---
function initDashboardPage() {
    if (!token || !currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Setup Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            token = null;
            currentUser = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    elements.welcomeMsg.textContent = `Hi, ${currentUser.name}`;

    if (currentUser.role === 'USER') {
        elements.userDashboard.style.display = 'block';
        document.getElementById('userName').textContent = `${currentUser.name}'s Dashboard`;
        loadUserDashboard();
    } else if (currentUser.role === 'TRAINER') {
        elements.trainerDashboard.style.display = 'block';
        document.getElementById('trainerName').textContent = `${currentUser.name}'s Dashboard`;
        loadTrainerDashboard();
    }
}


// --- User Dashboard Functions ---
async function loadUserDashboard() {
    loadAllPlans();
    loadTrainers();
    setupUserTabs();
}

function setupUserTabs() {
    const tabs = document.querySelectorAll('#userDashboard .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('#userDashboard .tab-content').forEach(content => {
                content.classList.remove('active');
            });

            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            if (tabId === 'feedTab') loadFeed();
        });
    });
}

async function loadAllPlans() {
    try {
        const res = await fetch(`${API_BASE}/plans`);
        const data = await res.json();
        const container = document.getElementById('plansList');
        if (!container) return;
        container.innerHTML = '';

        if (data.plans.length === 0) {
            container.innerHTML = '<p>No plans available yet.</p>';
            return;
        }

        data.plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${plan.title}</h4>
                <p>By ${plan.trainerName}</p>
                <div class="price">$${plan.price}</div>
                <p>${plan.durationDays} days</p>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="viewPlan('${plan.id}')">View Details</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        handleNetworkError(error, 'Error loading available plans');
    }
}

async function viewPlan(planId) {
    try {
        const res = await fetch(`${API_BASE}/plans/${planId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const modalBody = document.getElementById('modalBody');

        if (data.plan.message) {
            modalBody.innerHTML = `
                <h3>${data.plan.title}</h3>
                <p>By ${data.plan.trainerName}</p>
                <div class="price">$${data.plan.price}</div>
                <p>${data.plan.durationDays} days</p>
                <p style="margin-top: 20px; color: var(--text-secondary);">${data.plan.message}</p>
                <button class="btn btn-primary" onclick="subscribeToPlan('${planId}')" style="margin-top: 20px;">Subscribe Now</button>
            `;
        } else {
            modalBody.innerHTML = `
                <h3>${data.plan.title}</h3>
                <p>By ${data.plan.trainerId.name}</p>
                <div class="price">$${data.plan.price}</div>
                <p>${data.plan.durationDays} days</p>
                <p style="margin-top: 15px;">${data.plan.description}</p>
                <span class="badge badge-success" style="margin-top: 15px; display: inline-block;">Subscribed</span>
            `;
        }
        elements.modal.style.display = 'block';
    } catch (error) {
        handleNetworkError(error, 'Error loading plan details');
    }
}

async function subscribeToPlan(planId) {
    // Redirect to Payment Simulation Page
    try {
        window.location.href = `payment-simulation.html?planId=${planId}`;
    } catch (error) {
        handleNetworkError(error, 'Error initiating subscription');
    }
}

async function loadFeed() {
    try {
        const res = await fetch(`${API_BASE}/feed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const container = document.getElementById('feedList');
        if (!container) return;
        container.innerHTML = '';

        if (data.feed.length === 0) {
            container.innerHTML = '<p>Follow trainers to see their plans here.</p>';
            return;
        }

        data.feed.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${item.title}</h4>
                <p>By ${item.trainer.name}</p>
                <div class="price">$${item.price}</div>
                <p>${item.durationDays} days</p>
                ${item.isPurchased ? '<span class="badge-success">Purchased</span>' : ''}
                <p style="margin-top: 10px; font-size: 13px;">${item.description.substring(0, 100)}...</p>
                <div class="card-actions">
                    ${!item.isPurchased ? `<button class="btn btn-primary" onclick="subscribeToPlan('${item.id}')">Subscribe</button>` : ''}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        handleNetworkError(error, 'Error loading feed');
    }
}

async function loadTrainers() {
    try {
        const res = await fetch(`${API_BASE}/trainers`);
        const data = await res.json();
        const container = document.getElementById('trainersList');
        if (!container) return;
        container.innerHTML = '';
        if (data.trainers.length === 0) {
            container.innerHTML = '<p>No trainers available yet.</p>';
            return;
        }
        data.trainers.forEach(trainer => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${trainer.name}</h4>
                <p>${trainer.email}</p>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="followTrainer('${trainer._id}')">Follow</button>
                    <button class="btn btn-secondary" onclick="unfollowTrainer('${trainer._id}')">Unfollow</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        handleNetworkError(error, 'Error loading trainers');
    }
}

async function followTrainer(trainerId) {
    try {
        const res = await fetch(`${API_BASE}/trainers/${trainerId}/follow`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Trainer followed!', 'success');
        } else {
            showToast(data.error || 'Failed to follow', 'error');
        }
    } catch (error) {
        handleNetworkError(error, 'Unable to follow trainer');
    }
}

async function unfollowTrainer(trainerId) {
    try {
        const res = await fetch(`${API_BASE}/trainers/${trainerId}/unfollow`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Trainer unfollowed!', 'success');
        } else {
            showToast(data.error || 'Failed to unfollow', 'error');
        }
    } catch (error) {
        handleNetworkError(error, 'Unable to unfollow trainer');
    }
}

// --- Trainer Dashboard Functions ---
async function loadTrainerDashboard() {
    setupCreatePlanForm();
    loadMyPlans();
}

function setupCreatePlanForm() {
    const showBtn = document.getElementById('showCreatePlanBtn');
    const formCard = document.getElementById('createPlanForm');
    const cancelBtn = document.getElementById('cancelPlanBtn');
    const planForm = document.getElementById('planForm');

    showBtn.addEventListener('click', () => {
        formCard.style.display = 'block';
        showBtn.style.display = 'none';
    });
    cancelBtn.addEventListener('click', () => {
        formCard.style.display = 'none';
        showBtn.style.display = 'block';
        planForm.reset();
    });

    planForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('planTitle').value;
        const description = document.getElementById('planDescription').value;
        const price = parseFloat(document.getElementById('planPrice').value);
        const durationDays = parseInt(document.getElementById('planDuration').value);

        try {
            const res = await fetch(`${API_BASE}/plans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, price, durationDays })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Plan created successfully!', 'success');
                formCard.style.display = 'none';
                showBtn.style.display = 'block';
                planForm.reset();
                loadMyPlans();
            } else {
                showToast(data.error || 'Failed to create plan', 'error');
            }
        } catch (error) {
            handleNetworkError(error, 'Unable to create plan');
        }
    });
}

async function loadMyPlans() {
    try {
        const res = await fetch(`${API_BASE}/plans`);
        const data = await res.json();
        const myPlans = data.plans.filter(plan => plan.trainerName === currentUser.name);
        const container = document.getElementById('myPlansList');
        if (!container) return;
        container.innerHTML = '';
        if (myPlans.length === 0) {
            container.innerHTML = '<p>You haven\'t created any plans yet.</p>';
            return;
        }
        myPlans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h4>${plan.title}</h4>
                <div class="price">$${plan.price}</div>
                <p>${plan.durationDays} days</p>
                <div class="card-actions">
                    <button class="btn btn-danger" onclick="deletePlan('${plan.id}')">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        handleNetworkError(error, 'Error loading your plans');
    }
}

async function deletePlan(planId) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
        const res = await fetch(`${API_BASE}/plans/${planId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Plan deleted!', 'success');
            loadMyPlans();
        } else {
            showToast(data.error || 'Failed to delete plan', 'error');
        }
    } catch (error) {
        handleNetworkError(error, 'Unable to delete plan');
    }
}


// --- Global Utils ---
if (elements.modal) {
    document.querySelector('.close').addEventListener('click', () => {
        elements.modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            elements.modal.style.display = 'none';
        }
    });
}



function showToast(message, type = '') {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.style.display = 'block';
    setTimeout(() => {
        elements.toast.style.display = 'none';
    }, 3500);
}

function handleNetworkError(error, contextMessage = 'Unable to connect to server') {
    if (!navigator.onLine) {
        showToast('No internet connection. Please check your network.', 'error');
    } else {
        showToast(`${contextMessage}. Please try again later.`, 'error');
    }
}
