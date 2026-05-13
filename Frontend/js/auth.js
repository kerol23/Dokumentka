const API_URL = 'http://localhost:8080/api';

// ===== PŘIHLÁŠENÍ =====
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('submit-btn');
        const errorMsg = document.getElementById('error-message');

        btn.classList.add('btn-loading');
        btn.disabled = true;
        errorMsg.style.display = 'none';

        const usernameOrEmail = document.getElementById('usernameOrEmail').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail, password })
            });

            console.log('Status:', response.status);
            console.log('OK:', response.ok);

            const text = await response.text();
            console.log('Response:', text);

            if (response.ok) {
                localStorage.setItem('token', text);
                console.log('Token uložen, přesměrovávám...');
                window.location.href = 'dashboard.html';
            } else {
                try {
                    const error = JSON.parse(text);
                    errorMsg.textContent = error.message || 'Nesprávné přihlašovací údaje';
                } catch {
                    errorMsg.textContent = 'Nesprávné přihlašovací údaje';
                }
                errorMsg.style.display = 'block';
                loginForm.style.animation = 'shake 0.5s ease';
                setTimeout(() => loginForm.style.animation = '', 500);
            }
        } catch (err) {
            console.log('Chyba:', err);
            errorMsg.textContent = 'Chyba připojení k serveru: ' + err.message;
            errorMsg.style.display = 'block';
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    });
}

// ===== REGISTRACE =====
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('submit-btn');
        const errorMsg = document.getElementById('error-message');
        const successMsg = document.getElementById('success-message');

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';

        if (password !== passwordConfirm) {
            errorMsg.textContent = 'Hesla se neshodují!';
            errorMsg.style.display = 'block';
            return;
        }

        btn.classList.add('btn-loading');
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                successMsg.textContent = '✅ Registrace proběhla úspěšně! Přesměrovávám na přihlášení...';
                successMsg.style.display = 'block';
                btn.style.display = 'none';

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                const text = await response.text();
                try {
                    const error = JSON.parse(text);
                    errorMsg.textContent = error.message || 'Registrace se nezdařila';
                } catch {
                    errorMsg.textContent = 'Registrace se nezdařila';
                }
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Chyba připojení k serveru: ' + err.message;
            errorMsg.style.display = 'block';
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    });
}

// ===== ZOBRAZIT/SKRÝT HESLO =====
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId || 'password');
    const icon = document.getElementById(iconId || 'eye-icon');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// ===== ZAPOMENUTÉ HESLO =====
function forgotPassword() {
    alert('Funkce bude brzy dostupná! 🚀');
}