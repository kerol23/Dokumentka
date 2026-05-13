const API_URL = 'http://localhost:8080/api';
let allDocuments = [];
let currentView = 'grid';
let currentEditId = null;

// ===== INICIALIZACE =====
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    await loadUserInfo();
    await loadDocuments();
    initAddForm();
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

            const planName = document.getElementById('plan-name');
            const planBtn = document.getElementById('plan-toggle-btn');
            const planDocs = document.getElementById('plan-docs');

            if (user.plan === 'PREMIUM') {
                planName.textContent = 'Premium plán ⭐';
                planBtn.textContent = 'Přepnout na Basic';
                planBtn.classList.add('downgrade');
                planDocs.textContent = 'Neomezené dokumenty';
                document.getElementById('plan-icon').style.color = '#f1c40f';
            } else {
                planName.textContent = 'Basic plán';
                planBtn.textContent = 'Upgradovat na Premium';
                planBtn.classList.remove('downgrade');
                document.getElementById('plan-icon').style.color = 'var(--primary)';
            }
        } else {
            logout();
        }
    } catch (err) {
        console.error('Chyba načítání uživatele:', err);
    }
}

// ===== NAČTENÍ DOKUMENTŮ =====
async function loadDocuments() {
    try {
        const response = await fetch(`${API_URL}/documents`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            allDocuments = await response.json();
            renderByCategories(allDocuments);
            updateStats(allDocuments);
        } else if (response.status === 401) {
            logout();
        }
    } catch (err) {
        console.error('Chyba načítání dokumentů:', err);
    }
}

// ===== VYKRESLENÍ PODLE KATEGORIÍ =====
function renderByCategories(documents) {
    const container = document.getElementById('documents-container');
    const emptyState = document.getElementById('empty-state');
    const sectionHeader = document.getElementById('section-header');

    if (documents.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        sectionHeader.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    sectionHeader.style.display = 'flex';

    const categories = [
        { key: 'FAKTURY', label: 'Faktury', icon: 'fa-file-invoice' },
        { key: 'PRACE', label: 'Práce', icon: 'fa-briefcase' },
        { key: 'POJISTENI', label: 'Pojištění', icon: 'fa-shield-alt' },
        { key: 'BANKA', label: 'Banka', icon: 'fa-university' },
        { key: 'ZDRAVOTNI', label: 'Zdravotní', icon: 'fa-heartbeat' },
        { key: 'SKOLA', label: 'Škola', icon: 'fa-graduation-cap' },
        { key: 'OSTATNI', label: 'Ostatní', icon: 'fa-folder' }
    ];

    let html = '';
    categories.forEach(cat => {
        const catDocs = documents.filter(d => d.category === cat.key);
        if (catDocs.length === 0) return;

        html += `
            <div class="category-section">
                <div class="category-section-header">
                    <div class="category-section-icon ${cat.key}">
                        <i class="fas ${cat.icon}"></i>
                    </div>
                    <h3>${cat.label}</h3>
                    <span class="category-count">${catDocs.length}</span>
                </div>
                <div class="documents-grid">
                    ${catDocs.map((doc, index) => `
                        <div class="doc-card" style="animation-delay: ${index * 0.05}s"
                             onclick="openDetail(${doc.id})">
                            <div class="doc-actions">
                                <button class="doc-action-btn edit" onclick="event.stopPropagation(); openEdit(${doc.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="doc-action-btn delete" onclick="event.stopPropagation(); deleteDocument(${doc.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="doc-icon ${doc.category}">
                                ${getCategoryIcon(doc.category)}
                            </div>
                            <div class="doc-name">${doc.name}</div>
                            <div class="doc-category">${getCategoryLabel(doc.category)}</div>
                            <div class="doc-date">${formatDate(doc.uploadedAt)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ===== VYKRESLENÍ FILTROVANÉ KATEGORIE =====
function renderDocuments(documents) {
    const container = document.getElementById('documents-container');
    const emptyState = document.getElementById('empty-state');
    const sectionHeader = document.getElementById('section-header');

    if (documents.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        sectionHeader.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    sectionHeader.style.display = 'flex';
    container.className = '';

    container.innerHTML = `
        <div class="documents-grid">
            ${documents.map((doc, index) => `
                <div class="doc-card" style="animation-delay: ${index * 0.05}s"
                     onclick="openDetail(${doc.id})">
                    <div class="doc-actions">
                        <button class="doc-action-btn edit" onclick="event.stopPropagation(); openEdit(${doc.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="doc-action-btn delete" onclick="event.stopPropagation(); deleteDocument(${doc.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="doc-icon ${doc.category}">
                        ${getCategoryIcon(doc.category)}
                    </div>
                    <div class="doc-name">${doc.name}</div>
                    <div class="doc-category">${getCategoryLabel(doc.category)}</div>
                    <div class="doc-date">${formatDate(doc.uploadedAt)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== STATISTIKY =====
function updateStats(documents) {
    document.getElementById('total-docs').textContent = documents.length;
    document.getElementById('plan-docs').textContent =
        `${documents.length}/10 dokumentů`;
}

// ===== VYHLEDÁVÁNÍ =====
let searchTimeout;
async function handleSearch(query) {
    clearTimeout(searchTimeout);
    if (query.length === 0) {
        document.getElementById('page-title').textContent = 'Přehled dokumentů';
        document.getElementById('section-title').textContent = 'Všechny dokumenty';
        renderByCategories(allDocuments);
        return;
    }
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/documents/search?query=${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const results = await response.json();
                renderDocuments(results);
                document.getElementById('section-title').textContent =
                    `Výsledky hledání: "${query}" (${results.length})`;
            }
        } catch (err) {
            console.error('Chyba vyhledávání:', err);
        }
    }, 300);
}

// ===== KATEGORIE =====
async function showCategory(category, element) {
    setActiveNav(element);
    document.getElementById('page-title').textContent = getCategoryLabel(category);
    document.getElementById('section-title').textContent = getCategoryLabel(category);

    try {
        const response = await fetch(`${API_URL}/documents/category/${category}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            const docs = await response.json();
            renderDocuments(docs);
        }
    } catch (err) {
        console.error('Chyba načítání kategorie:', err);
    }
}

// ===== ZOBRAZIT VŠE =====
function showSection(section, element) {
    setActiveNav(element);
    document.getElementById('page-title').textContent = 'Přehled dokumentů';
    document.getElementById('section-title').textContent = 'Všechny dokumenty';
    renderByCategories(allDocuments);
}

// ===== PŘIDAT DOKUMENT =====
function openAddModal() {
    currentEditId = null;
    document.getElementById('add-modal-title').textContent = 'Přidat dokument';
    document.getElementById('add-btn').textContent = 'Přidat dokument';
    document.getElementById('file-group').style.display = 'block';
    document.getElementById('add-form').reset();
    document.getElementById('file-label').textContent = 'Klikněte pro nahrání souboru';
    document.getElementById('modal-error').style.display = 'none';
    document.getElementById('add-modal').style.display = 'flex';
}

function initAddForm() {
    document.getElementById('add-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('add-btn');
        const errorMsg = document.getElementById('modal-error');
        errorMsg.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Ukládám...';

        const name = document.getElementById('doc-name').value;
        const category = document.getElementById('doc-category').value;
        const description = document.getElementById('doc-description').value;
        const file = document.getElementById('doc-file').files[0];

        try {
            if (currentEditId) {
                const response = await fetch(`${API_URL}/documents/${currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ name, category, description })
                });

                if (response.ok) {
                    closeModal('add-modal');
                    await loadDocuments();
                } else {
                    const error = await response.json();
                    errorMsg.textContent = error.message || 'Nepodařilo se upravit dokument';
                    errorMsg.style.display = 'block';
                }
            } else {
                const response = await fetch(`${API_URL}/documents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        name,
                        category,
                        description,
                        fileName: file ? file.name : 'bez-souboru'
                    })
                });

                if (response.ok) {
                    const doc = await response.json();
                    if (file) {
                        const formData = new FormData();
                        formData.append('file', file);
                        await fetch(`${API_URL}/documents/${doc.id}/upload`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: formData
                        });
                    }
                    closeModal('add-modal');
                    await loadDocuments();
                } else {
                    const error = await response.json();
                    errorMsg.textContent = error.message || 'Nepodařilo se přidat dokument';
                    errorMsg.style.display = 'block';
                }
            }
        } catch (err) {
            errorMsg.textContent = 'Chyba připojení k serveru';
            errorMsg.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = currentEditId ? 'Uložit změny' : 'Přidat dokument';
        }
    });
}

// ===== DETAIL DOKUMENTU =====
async function openDetail(id) {
    const doc = allDocuments.find(d => d.id === id);
    if (!doc) return;

    document.getElementById('detail-title').textContent = doc.name;
    document.getElementById('detail-body').innerHTML = `
        <div class="detail-info">
            <div class="detail-icon ${doc.category}">
                ${getCategoryIcon(doc.category)}
            </div>
            <div class="detail-row">
                <span class="detail-label">Název</span>
                <span class="detail-value">${doc.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Kategorie</span>
                <span class="detail-value">${getCategoryLabel(doc.category)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Popis</span>
                <span class="detail-value">${doc.description || 'Bez popisu'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Soubor</span>
                <span class="detail-value">${doc.fileName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Nahráno</span>
                <span class="detail-value">${formatDate(doc.uploadedAt)}</span>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-outline" onclick="closeModal('detail-modal')">Zavřít</button>
            <button class="btn-primary" onclick="closeModal('detail-modal'); openEdit(${doc.id})">
                <i class="fas fa-edit"></i> Upravit
            </button>
        </div>
    `;
    document.getElementById('detail-modal').style.display = 'flex';
}

// ===== EDITACE DOKUMENTU =====
function openEdit(id) {
    const doc = allDocuments.find(d => d.id === id);
    if (!doc) return;

    currentEditId = id;
    document.getElementById('add-modal-title').textContent = 'Upravit dokument';
    document.getElementById('add-btn').textContent = 'Uložit změny';
    document.getElementById('file-group').style.display = 'none';
    document.getElementById('modal-error').style.display = 'none';

    document.getElementById('doc-name').value = doc.name;
    document.getElementById('doc-category').value = doc.category;
    document.getElementById('doc-description').value = doc.description || '';

    document.getElementById('add-modal').style.display = 'flex';
}

// ===== SMAZÁNÍ DOKUMENTU =====
async function deleteDocument(id) {
    if (!confirm('Opravdu chcete smazat tento dokument?')) return;

    try {
        const response = await fetch(`${API_URL}/documents/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            await loadDocuments();
        }
    } catch (err) {
        console.error('Chyba mazání:', err);
    }
}

// ===== POMOCNÉ FUNKCE =====
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    if (id === 'add-modal') {
        currentEditId = null;
        document.getElementById('add-form').reset();
        document.getElementById('add-modal-title').textContent = 'Přidat dokument';
        document.getElementById('add-btn').textContent = 'Přidat dokument';
        document.getElementById('file-group').style.display = 'block';
        document.getElementById('file-label').textContent = 'Klikněte pro nahrání souboru';
        document.getElementById('modal-error').style.display = 'none';
    }
}

function setView(view) {
    currentView = view;
    document.getElementById('grid-btn').classList.toggle('active', view === 'grid');
    document.getElementById('list-btn').classList.toggle('active', view === 'list');

    const gridClass = view === 'grid' ? 'documents-grid' : 'documents-list';
    const removeClass = view === 'grid' ? 'documents-list' : 'documents-grid';

    document.querySelectorAll('.documents-grid, .documents-list').forEach(el => {
        el.classList.add(gridClass);
        el.classList.remove(removeClass);
    });
}

function handleFileSelect(input) {
    const file = input.files[0];
    if (file) {
        document.getElementById('file-label').textContent = file.name;
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function setActiveNav(element) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (element) element.classList.add('active');
}

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

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function getCategoryLabel(category) {
    const labels = {
        'FAKTURY': 'Faktury',
        'PRACE': 'Práce',
        'POJISTENI': 'Pojištění',
        'BANKA': 'Banka',
        'ZDRAVOTNI': 'Zdravotní',
        'SKOLA': 'Škola',
        'OSTATNI': 'Ostatní'
    };
    return labels[category] || category;
}

function getCategoryIcon(category) {
    const icons = {
        'FAKTURY': '<i class="fas fa-file-invoice"></i>',
        'PRACE': '<i class="fas fa-briefcase"></i>',
        'POJISTENI': '<i class="fas fa-shield-alt"></i>',
        'BANKA': '<i class="fas fa-university"></i>',
        'ZDRAVOTNI': '<i class="fas fa-heartbeat"></i>',
        'SKOLA': '<i class="fas fa-graduation-cap"></i>',
        'OSTATNI': '<i class="fas fa-folder"></i>'
    };
    return icons[category] || '<i class="fas fa-file"></i>';
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
            showPlanNotification(msg);
        }
    } catch (err) {
        console.error('Chyba přepínání plánu:', err);
    }
}

function showPlanNotification(message) {
    const notification = document.getElementById('plan-notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
});