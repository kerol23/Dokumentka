const API_URL = 'http://localhost:8080/api';

// ===== INICIALIZACE =====
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    await loadUserInfo();
});

// ===== NAČTENÍ INFO O UŽIVATELI =====
async function loadUserInfo() {
    try {
        const response = await fetch(`${API_URL}/user/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const user = await response.json();

            document.getElementById('user-avatar').textContent =
                user.username.charAt(0).toUpperCase();
            document.getElementById('profile-avatar').textContent =
                user.username.charAt(0).toUpperCase();

            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-email').textContent = user.email;

            const planBadge = document.getElementById('profile-plan');
            if (user.plan === 'PREMIUM') {
                planBadge.textContent = 'Premium ⭐';
                planBadge.classList.add('premium');
                document.getElementById('plan-name').textContent = 'Premium plán ⭐';
                document.getElementById('plan-toggle-btn').textContent = 'Přepnout na Basic';
                document.getElementById('plan-toggle-btn').classList.add('downgrade');
                document.getElementById('plan-docs').textContent = 'Neomezené dokumenty';
            } else {
                planBadge.textContent = 'Basic';
                planBadge.classList.remove('premium');
                document.getElementById('plan-name').textContent = 'Basic plán';
                document.getElementById('plan-toggle-btn').textContent = 'Upgradovat na Premium';
                document.getElementById('plan-toggle-btn').classList.remove('downgrade');
                document.getElementById('plan-docs').textContent = '0/10 dokumentů';
            }

            // Aktualizuj pravou stranu
            updatePlanCard(user.plan);

        } else {
            logout();
        }
    } catch (err) {
        console.error('Chyba načítání uživatele:', err);
    }
}

// ===== UPRAVIT PROFIL =====
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const successMsg = document.getElementById('profile-success');
    const errorMsg = document.getElementById('profile-error');
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    const newUsername = document.getElementById('new-username').value;
    const newEmail = document.getElementById('new-email').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const newPasswordConfirm = document.getElementById('new-password-confirm').value;

    if (newPassword && newPassword !== newPasswordConfirm) {
        errorMsg.textContent = 'Nová hesla se neshodují!';
        errorMsg.style.display = 'block';
        return;
    }

    if (newPassword && newPassword.length < 6) {
        errorMsg.textContent = 'Nové heslo musí mít alespoň 6 znaků!';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/user/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                username: newUsername || null,
                email: newEmail || null,
                currentPassword: currentPassword || null,
                newPassword: newPassword || null
            })
        });

        if (response.ok) {
            const newToken = await response.text();
            if (newToken && newToken.startsWith('ey')) {
                localStorage.setItem('token', newToken);
            }
            successMsg.textContent = '✅ Profil byl úspěšně aktualizován! Přesměrovávám...';
            successMsg.style.display = 'block';
            document.getElementById('profile-form').reset();
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            const text = await response.text();
            try {
                const error = JSON.parse(text);
                errorMsg.textContent = error.message || 'Nepodařilo se aktualizovat profil';
            } catch {
                errorMsg.textContent = 'Nepodařilo se aktualizovat profil';
            }
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Chyba připojení k serveru';
        errorMsg.style.display = 'block';
    }
});

// ===== SMAZÁNÍ ÚČTU =====
function confirmDeleteAccount() {
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    document.getElementById('delete-password').value = '';
}

async function deleteAccount() {
    const password = document.getElementById('delete-password').value;

    if (!password) {
        alert('Zadejte prosím heslo pro potvrzení!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/user/me`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ currentPassword: password })
        });

        if (response.ok) {
            localStorage.removeItem('token');
            alert('Váš účet byl úspěšně smazán.');
            window.location.href = '../index.html';
        } else {
            const text = await response.text();
            try {
                const error = JSON.parse(text);
                alert(error.message || 'Nepodařilo se smazat účet');
            } catch {
                alert('Nepodařilo se smazat účet');
            }
        }
    } catch (err) {
        alert('Chyba připojení k serveru');
    }
}

// ===== PŘEPÍNÁNÍ PLÁNU =====
async function togglePlan() {
    const planName = document.getElementById('plan-name');
    const isPremium = planName.textContent.includes('Premium');

    try {
        const endpoint = isPremium ? 'downgrade' : 'upgrade';
        const response = await fetch(`${API_URL}/user/${endpoint}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            await loadUserInfo();
            const msg = isPremium ? '✅ Přepnuto na Basic plán' : '🎉 Přepnuto na Premium!';
            showNotification(msg);
        }
    } catch (err) {
        console.error('Chyba přepínání plánu:', err);
    }
}

function showNotification(message) {
    const notification = document.getElementById('plan-notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// ===== AKTUALIZACE PLAN KARTY =====
function updatePlanCard(plan) {
    const isPremium = plan === 'PREMIUM';
    const badgeLarge = document.getElementById('plan-badge-large');
    const planDescription = document.getElementById('plan-description');
    const planSwitchBtn = document.getElementById('plan-switch-btn');
    const featuresTitle = document.getElementById('features-title');
    const featuresList = document.getElementById('features-list');

    if (isPremium) {
        badgeLarge.textContent = 'Premium ⭐';
        badgeLarge.classList.add('premium');
        planDescription.textContent = 'Máte Premium plán s neomezeným počtem dokumentů!';
        planSwitchBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Přepnout na Basic (zdarma)';
        planSwitchBtn.className = 'btn-outline btn-full';
        featuresTitle.textContent = 'Přepnutím na Basic ztratíte';
        featuresList.innerHTML = `
            <li class="feature-item no"><i class="fas fa-times"></i><span>Neomezené dokumenty</span></li>
            <li class="feature-item no"><i class="fas fa-times"></i><span>Prioritní podpora</span></li>
            <li class="feature-item no"><i class="fas fa-times"></i><span>AI kategorizace (brzy)</span></li>
            <li class="feature-item yes"><i class="fas fa-check"></i><span>Základní funkce zůstanou</span></li>
            <li class="feature-item yes"><i class="fas fa-check"></i><span>Až 10 dokumentů</span></li>
        `;
    } else {
        badgeLarge.textContent = 'Basic';
        badgeLarge.classList.remove('premium');
        planDescription.textContent = 'Upgradujte na Premium a získejte neomezený přístup!';
        planSwitchBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Upgradovat na Premium — 99 Kč/měsíc';
        planSwitchBtn.className = 'btn-primary btn-full';
        featuresTitle.textContent = 'Co získáte s Premium';
        featuresList.innerHTML = `
            <li class="feature-item yes"><i class="fas fa-check"></i><span>Neomezené dokumenty</span></li>
            <li class="feature-item yes"><i class="fas fa-check"></i><span>Všechny kategorie</span></li>
            <li class="feature-item yes"><i class="fas fa-check"></i><span>Nahrávání souborů</span></li>
            <li class="feature-item yes"><i class="fas fa-check"></i><span>Prioritní podpora</span></li>
            <li class="feature-item yes"><i class="fas fa-check"></i><span>AI kategorizace (brzy)</span></li>
        `;
    }
}

// ===== USER DROPDOWN =====
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('user-menu');
    if (menu && !menu.contains(e.target)) {
        document.getElementById('user-dropdown').style.display = 'none';
    }
});

// ===== ODHLÁŠENÍ =====
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}