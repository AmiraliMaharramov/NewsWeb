// ============================================================
// ADMIN PANEL - CORE
// ============================================================
let adminLoggedIn = false;
let articlesPage = 1;
const ARTICLES_PER_PAGE = 10;
let filteredArticlesCache = [];
let selectedArticles = new Set();

function showAdmin() {
    document.getElementById('page-frontend').classList.add('hidden');
    document.getElementById('page-admin').classList.remove('hidden');
    if (adminLoggedIn) { document.getElementById('admin-login').classList.add('hidden'); document.getElementById('admin-dashboard').classList.remove('hidden'); showAdminPage('dash'); }
}
function goToFrontend() { document.getElementById('page-frontend').classList.remove('hidden'); document.getElementById('page-admin').classList.add('hidden'); db = getDB(); init(); }
function doLogin() {
    const user = document.getElementById('loginUser').value.trim(), pass = document.getElementById('loginPass').value;
    const err = document.getElementById('loginError');
    const validUser = (db.users || []).find(u => u.username === user && u.password === pass) || (user === db.settings.username && pass === db.settings.password);
    if (validUser) {
        adminLoggedIn = true; err.classList.add('hidden');
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('adminUsernameDisplay').textContent = user;
        document.getElementById('adminAvatar').textContent = user[0].toUpperCase();
        addLog('Giriş yapıldı: ' + user);
        showAdminPage('dash');
    } else { err.textContent = 'Kullanıcı adı veya şifre hatalı!'; err.classList.remove('hidden'); }
}
function doLogout() { adminLoggedIn = false; document.getElementById('admin-dashboard').classList.add('hidden'); document.getElementById('admin-login').classList.remove('hidden'); document.getElementById('loginPass').value = ''; }

function addLog(action) {
    if (!db.activityLog) db.activityLog = [];
    db.activityLog.unshift({ id: uid(), action, date: new Date().toISOString(), user: document.getElementById('adminUsernameDisplay')?.textContent || 'admin' });
    if (db.activityLog.length > 100) db.activityLog = db.activityLog.slice(0, 100);
    saveDB(db);
}

function showAdminPage(page) {
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');
    const titles = { dash: 'Dashboard', articles: 'Haberler', newArticle: 'Haber Yaz', categories: 'Kategoriler', rss: 'RSS / Kaynak Çek', settings: 'Ayarlar', comments: 'Yorumlar', media: 'Medya', analytics: 'Analitik', seo: 'SEO Yönetici', ads: 'Reklam Yönetimi', users: 'Kullanıcılar', notifications: 'Bildirimler', theme: 'Tema Ayarları', scheduled: 'Zamanlanmış', activityLog: 'Aktivite Günlüğü', socialSettings: 'Sosyal Medya', bulkOps: 'Toplu İşlemler', contentCalendar: 'İçerik Takvimi', livePreview: 'Canlı Önizleme', systemHealth: 'Sistem Sağlığı', archiver: 'Arşivleyici', duplicates: 'Kopya Tespit', readerStats: 'Okuyucu İstatistik', shortcuts: 'Kısayollar' };
    document.getElementById('adminPageTitle').textContent = titles[page] || page;
    closeMobileSidebar();
    const renderers = { dash: renderDashboard, articles: renderArticlesTable, newArticle: () => renderArticleForm(null), categories: renderCategories, rss: (typeof renderRSSManager === 'function' ? renderRSSManager : renderRSSPage), settings: renderSettings, comments: renderAdminComments, media: renderMediaLibrary, analytics: renderAnalytics, seo: renderSEO, ads: renderAdsManager, users: renderUsers, notifications: renderNotifications, theme: renderThemeSettings, scheduled: renderScheduled, activityLog: renderActivityLog, socialSettings: renderSocialSettings, bulkOps: renderBulkOps, contentCalendar: renderContentCalendar, livePreview: renderLivePreview, systemHealth: renderSystemHealth, archiver: renderArchiver, duplicates: renderDuplicateDetector, readerStats: renderReaderStats, shortcuts: renderShortcuts };
    if (renderers[page]) renderers[page]();
}

// Mobile Sidebar
function toggleSidebar() { document.getElementById('adminSidebar').classList.toggle('open'); document.getElementById('mobileOverlay').classList.toggle('active'); }
function closeMobileSidebar() { document.getElementById('adminSidebar').classList.remove('open'); document.getElementById('mobileOverlay').classList.remove('active'); }

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
    db = getDB();
    const total = db.articles.length, pub = db.articles.filter(a => a.status === 'published').length, draft = db.articles.filter(a => a.status === 'draft').length, views = db.articles.reduce((s, a) => s + (a.views || 0), 0);
    const commentCount = (db.comments || []).length;
    const pendingComments = (db.comments || []).filter(c => c.status === 'pending').length;
    document.getElementById('navBadgeArticles').textContent = total;
    const pendBadge = document.getElementById('navBadgeComments');
    if (pendBadge) pendBadge.textContent = pendingComments;
    document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-icon">📰</div><div class="stat-value">${total}</div><div class="stat-label">Toplam Haber</div></div>
    <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-value">${pub}</div><div class="stat-label">Yayında</div></div>
    <div class="stat-card orange"><div class="stat-icon">📝</div><div class="stat-value">${draft}</div><div class="stat-label">Taslak</div></div>
    <div class="stat-card blue"><div class="stat-icon">👁️</div><div class="stat-value">${views.toLocaleString()}</div><div class="stat-label">Görüntülenme</div></div>
    <div class="stat-card" style="border-left-color:#8e44ad"><div class="stat-icon">💬</div><div class="stat-value">${commentCount}</div><div class="stat-label">Yorum</div></div>
    <div class="stat-card" style="border-left-color:#e67e22"><div class="stat-icon">📧</div><div class="stat-value">${(db.newsletter || []).length}</div><div class="stat-label">Abone</div></div>`;
    const recent = [...db.articles].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    document.getElementById('dashRecentArticles').innerHTML = recent.map(art => `<div class="recent-article">
    ${art.image ? `<img class="recent-img" src="${esc(art.image)}" onerror="this.style.display='none'" alt="">` : `<div class="recent-img" style="background:var(--gray-100);display:flex;align-items:center;justify-content:center">📰</div>`}
    <div class="recent-info"><div class="recent-title">${esc(art.title)}</div><div class="recent-meta">${getCatName(art.category)} · ${timeAgo(art.date)} · ${art.status === 'published' ? '✅' : '📝'}</div></div>
    <button class="btn btn-sm btn-secondary" onclick="editArticle('${art.id}')">Düzenle</button>
  </div>`).join('') || '<div class="empty-state" style="padding:30px"><div>Henüz haber yok</div></div>';
    document.getElementById('dashCatStats').innerHTML = db.categories.map(cat => { const count = db.articles.filter(a => a.category === cat.id).length; const pct = total ? Math.round(count / total * 100) : 0; return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${cat.name}</span><span style="font-weight:700">${count}</span></div><div style="height:6px;background:var(--gray-100);border-radius:3px"><div style="height:100%;width:${pct}%;background:${cat.color};border-radius:3px;transition:width 0.5s"></div></div></div>`; }).join('');
}

// ============================================================
// ARTICLES CRUD
// ============================================================
function renderArticlesTable() {
    db = getDB(); selectedArticles.clear();
    const catFilter = document.getElementById('articleCatFilter');
    catFilter.innerHTML = '<option value="">Tüm Kategoriler</option>' + db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    filterArticles();
}
function filterArticles() {
    const q = (document.getElementById('articleFilter').value || '').toLowerCase();
    const cat = document.getElementById('articleCatFilter').value;
    const status = document.getElementById('articleStatusFilter').value;
    filteredArticlesCache = db.articles.filter(a => {
        if (cat && a.category !== cat) return false;
        if (status && a.status !== status) return false;
        if (q && !a.title.toLowerCase().includes(q) && !(a.author || '').toLowerCase().includes(q)) return false;
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    articlesPage = 1; renderArticlesTablePage();
}
function renderArticlesTablePage() {
    const total = filteredArticlesCache.length, start = (articlesPage - 1) * ARTICLES_PER_PAGE, page = filteredArticlesCache.slice(start, start + ARTICLES_PER_PAGE);
    const tbody = document.getElementById('articlesTableBody');
    if (!total) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Haber bulunamadı</div></div></td></tr>`; document.getElementById('articlesPagination').innerHTML = ''; return; }
    tbody.innerHTML = page.map(art => `<tr>
    <td><input type="checkbox" class="article-checkbox" data-id="${art.id}" onchange="toggleSelectArticle('${art.id}',this.checked)"></td>
    <td>${art.image ? `<img class="table-thumb" src="${esc(art.image)}" onerror="this.style.display='none'">` : `<div class="table-thumb" style="background:var(--gray-100);display:flex;align-items:center;justify-content:center">📰</div>`}</td>
    <td><div class="table-title" title="${esc(art.title)}">${esc(art.title)}</div><div style="font-size:11px;color:var(--gray-500);margin-top:2px">${esc(art.author || '')}</div></td>
    <td><span class="badge" style="background:${getCatColor(art.category)};color:white">${getCatName(art.category)}</span></td>
    <td><span class="status-${art.status}"><span class="status-dot"></span><span class="status-text">${art.status === 'published' ? 'Yayında' : 'Taslak'}</span></span></td>
    <td style="white-space:nowrap;font-size:12px;color:var(--gray-500);font-family:var(--font-mono)">${timeAgo(art.date)}</td>
    <td><div class="table-actions"><button class="btn btn-sm btn-secondary" onclick="editArticle('${art.id}')">✏️</button><button class="btn btn-sm ${art.status === 'published' ? 'btn-secondary' : 'btn-success'}" onclick="toggleStatus('${art.id}')">${art.status === 'published' ? '↩' : '▶'}</button><button class="btn btn-sm btn-danger" onclick="deleteArticle('${art.id}')">🗑️</button></div></td>
  </tr>`).join('');
    const totalPages = Math.ceil(total / ARTICLES_PER_PAGE);
    if (totalPages <= 1) { document.getElementById('articlesPagination').innerHTML = ''; return; }
    let pag = '<div class="pagination">';
    pag += `<button class="page-btn ${articlesPage === 1 ? 'disabled' : ''}" onclick="goArticlesPage(${articlesPage - 1})">‹</button>`;
    for (let i = 1; i <= totalPages; i++) { if (i === 1 || i === totalPages || Math.abs(i - articlesPage) <= 2) pag += `<button class="page-btn ${i === articlesPage ? 'active' : ''}" onclick="goArticlesPage(${i})">${i}</button>`; else if (Math.abs(i - articlesPage) === 3) pag += '<span class="page-btn" style="cursor:default">…</span>'; }
    pag += `<button class="page-btn ${articlesPage === totalPages ? 'disabled' : ''}" onclick="goArticlesPage(${articlesPage + 1})">›</button></div>`;
    document.getElementById('articlesPagination').innerHTML = pag;
}
function goArticlesPage(p) { const t = Math.ceil(filteredArticlesCache.length / ARTICLES_PER_PAGE); if (p < 1 || p > t) return; articlesPage = p; renderArticlesTablePage(); }
function toggleSelectArticle(id, checked) { if (checked) selectedArticles.add(id); else selectedArticles.delete(id); }

function renderArticleForm(id) {
    db = getDB();
    const sel = document.getElementById('artCategory');
    sel.innerHTML = '<option value="">Kategori Seç</option>' + db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if (id) { const art = db.articles.find(a => a.id === id); if (!art) return; document.getElementById('editArticleId').value = id; document.getElementById('artTitle').value = art.title || ''; document.getElementById('artCategory').value = art.category || ''; document.getElementById('artStatus').value = art.status || 'published'; document.getElementById('artAuthor').value = art.author || ''; document.getElementById('artFeatured').value = art.featured ? '1' : '0'; document.getElementById('artSummary').value = art.summary || ''; document.getElementById('artBody').value = art.body || ''; document.getElementById('artImage').value = art.image || ''; document.getElementById('artSource').value = art.source || ''; document.getElementById('artTags').value = art.tags || ''; updateImagePreview(art.image || ''); document.getElementById('adminPageTitle').textContent = 'Haber Düzenle'; }
    else { document.getElementById('editArticleId').value = '';['artTitle', 'artSummary', 'artBody', 'artImage', 'artSource', 'artTags', 'artAuthor'].forEach(i => document.getElementById(i).value = ''); document.getElementById('artStatus').value = 'published'; document.getElementById('artFeatured').value = '0'; document.getElementById('artCategory').value = ''; updateImagePreview(''); }
}
function updateImagePreview(url) { const prev = document.getElementById('imagePreview'); if (url && url.trim()) prev.innerHTML = `<img src="${esc(url)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<div style=text-align:center;color:var(--red);padding:20px>❌ Yüklenemedi</div>'">`; else prev.innerHTML = `<div class="image-preview-text"><div style="font-size:32px">🖼️</div><div>Görsel URL girin</div></div>`; }

function saveArticle(statusOverride) {
    const id = document.getElementById('editArticleId').value, title = document.getElementById('artTitle').value.trim(), category = document.getElementById('artCategory').value, summary = document.getElementById('artSummary').value.trim(), body = document.getElementById('artBody').value.trim();
    if (!title) { toast('Başlık zorunludur!', 'error'); return; } if (!category) { toast('Kategori seçiniz!', 'error'); return; } if (!summary) { toast('Özet zorunludur!', 'error'); return; }
    const status = statusOverride || document.getElementById('artStatus').value;
    const article = { title, category, summary, body, status, author: document.getElementById('artAuthor').value.trim() || 'Editör', featured: parseInt(document.getElementById('artFeatured').value) || 0, image: document.getElementById('artImage').value.trim(), source: document.getElementById('artSource').value.trim(), tags: document.getElementById('artTags').value.trim(), date: id ? (db.articles.find(a => a.id === id) || {}).date || new Date().toISOString() : new Date().toISOString(), views: id ? (db.articles.find(a => a.id === id) || {}).views || 0 : 0 };
    if (id) { const idx = db.articles.findIndex(a => a.id === id); if (idx >= 0) db.articles[idx] = { ...db.articles[idx], ...article }; addLog('Haber güncellendi: ' + title); toast('Haber güncellendi ✅'); }
    else { article.id = uid(); db.articles.unshift(article); addLog('Yeni haber eklendi: ' + title); toast('Haber eklendi ✅'); }
    saveDB(db); showAdminPage('articles');
}
function editArticle(id) { showAdminPage('newArticle'); renderArticleForm(id); }
function toggleStatus(id) { const art = db.articles.find(a => a.id === id); if (!art) return; art.status = art.status === 'published' ? 'draft' : 'published'; saveDB(db); addLog(`Haber durumu değiştirildi: ${art.title}`); toast(art.status === 'published' ? 'Yayına alındı ✅' : 'Taslağa alındı'); filterArticles(); }
function deleteArticle(id) { openModal('Haberi Sil', '<p>Bu haberi silmek istediğinize emin misiniz?</p>', `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-danger" onclick="confirmDelete('${id}')">Sil</button>`); }
function confirmDelete(id) { const art = db.articles.find(a => a.id === id); db.articles = db.articles.filter(a => a.id !== id); saveDB(db); closeModal(); addLog('Haber silindi: ' + (art ? art.title : '')); toast('Haber silindi 🗑️'); filterArticles(); }
