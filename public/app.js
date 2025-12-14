const API_BASE = 'http://localhost:5001';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

const elements = {
    authSection: document.getElementById('authSection'),
    userDashboard: document.getElementById('userDashboard'),
    trainerDashboard: document.getElementById('trainerDashboard'),
    loginTab: document.getElementById('loginTab'),
    signupTab: document.getElementById('signupTab'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    logoutBtn: document.getElementById('logoutBtn'),
    modal: document.getElementById('modal'),
    toast: document.getElementById('toast')
};

// Auth Tab Switching
elements.loginTab.addEventListener('click', () => {
    elements.loginTab.classList.add('active');
    elements.signupTab.classList.remove('active');
    elements.loginForm.style.display = 'block';
    elements.signupForm.style.display = 'none';
});

elements.signupTab.addEventListener('click', () => {
    elements.signupTab.classList.add('active');
    elements.loginTab.classList.remove('active');
    elements.signupForm.style.display = 'block';
    elements.loginForm.style.display = 'none';
});

// Login
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
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showToast('Login successful!', 'success');
            loadDashboard();
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    }
});

// Signup
elements.signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.querySelector('input[name="role"]:checked').value;

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
            showToast('Account created!', 'success');
            loadDashboard();
        } else {
            showToast(data.error || 'Signup failed', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    }
});

// Logout
elements.logoutBtn.addEventListener('click', () => {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out', 'success');
    loadDashboard();
});

// Load Dashboard
function loadDashboard() {
    if (!token || !currentUser) {
        elements.authSection.style.display = 'block';
        elements.userDashboard.style.display = 'none';
        elements.trainerDashboard.style.display = 'none';
        elements.logoutBtn.style.display = 'none';
        return;
    }

    elements.authSection.style.display = 'none';
    elements.logoutBtn.style.display = 'block';

    if (currentUser.role === 'USER') {
        elements.userDashboard.style.display = 'block';
        elements.trainerDashboard.style.display = 'none';
        document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;
        loadUserDashboard();
    } else if (currentUser.role === 'TRAINER') {
        elements.trainerDashboard.style.display = 'block';
        elements.userDashboard.style.display = 'none';
        document.getElementById('trainerName').textContent = `Welcome, ${currentUser.name}`;
        loadTrainerDashboard();
    }
}

// User Dashboard Functions
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
        showToast('Error loading plans', 'error');
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
        <p style="margin-top: 20px; color: var(--text-light);">${data.plan.message}</p>
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
        showToast('Error loading plan', 'error');
    }
}

async function subscribeToPlan(planId) {
    try {
        const res = await fetch(`${API_BASE}/plans/${planId}/subscribe`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
            showToast('Subscription successful!', 'success');
            elements.modal.style.display = 'none';
            loadAllPlans();
            loadFeed();
        } else {
            showToast(data.error || 'Subscription failed', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    }
}

async function loadFeed() {
    try {
        const res = await fetch(`${API_BASE}/feed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const container = document.getElementById('feedList');
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
        ${item.isPurchased ? '<span class="badge badge-success">Purchased</span>' : ''}
        <p style="margin-top: 10px; font-size: 13px;">${item.description.substring(0, 100)}...</p>
        <div class="card-actions">
          ${!item.isPurchased ? `<button class="btn btn-primary" onclick="subscribeToPlan('${item.id}')">Subscribe</button>` : ''}
        </div>
      `;
            container.appendChild(card);
        });
    } catch (error) {
        showToast('Error loading feed', 'error');
    }
}

async function loadTrainers() {
    try {
        const res = await fetch(`${API_BASE}/trainers`);
        const data = await res.json();

        const container = document.getElementById('trainersList');
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
        showToast('Error loading trainers', 'error');
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
        showToast('Network error', 'error');
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
        showToast('Network error', 'error');
    }
}

// Trainer Dashboard Functions
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
            showToast('Network error', 'error');
        }
    });
}

async function loadMyPlans() {
    try {
        const res = await fetch(`${API_BASE}/plans`);
        const data = await res.json();

        const myPlans = data.plans.filter(plan => plan.trainerName === currentUser.name);

        const container = document.getElementById('myPlansList');
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
        showToast('Error loading plans', 'error');
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
        showToast('Network error', 'error');
    }
}

// Modal
document.querySelector('.close').addEventListener('click', () => {
    elements.modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        elements.modal.style.display = 'none';
    }
});

// Toast
function showToast(message, type = '') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.style.display = 'block';

    setTimeout(() => {
        elements.toast.style.display = 'none';
    }, 3000);
}

// Initialize
loadDashboard();
