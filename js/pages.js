// ============================================================
// PAGE RENDERERS - Part 2
// ============================================================

function renderArticleCard(art) {
    const favClass = isFavorite(art.id) ? 'active' : '';
    const rt = readingTime(art.body);
    return `<div class="article-card" onclick="showPage('article','${art.id}')">
    <button class="fav-btn ${favClass}" onclick="toggleFavorite('${art.id}',event)" title="Favorilere Ekle">${isFavorite(art.id) ? '❤️' : '🤍'}</button>
    <div class="card-img-wrap">
      ${art.image ? `<img class="card-img" src="${esc(art.image)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-no-img>📰</div>'">` : `<div class="card-no-img">📰</div>`}
    </div>
    <div class="card-content">
      <div class="card-category">${catBadge(art.category)}</div>
      <div class="card-title">${esc(art.title)}</div>
      <div class="card-summary">${esc(art.summary)}</div>
      <div class="card-meta"><span>${esc(art.author || 'Editör')}</span><span>${timeAgo(art.date)}</span><span class="reading-time">📖 ${rt} dk</span></div>
    </div>
  </div>`;
}

function renderHome(main) {
    const published = db.articles.filter(a => a.status === 'published').sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!published.length) { main.innerHTML = `<div class="container" style="padding:80px 20px;text-align:center"><div class="empty-icon">📰</div><div class="empty-title">Henüz haber yok</div><div class="empty-desc">Admin panelinden haber ekleyin.</div></div>`; return; }
    const featured = published.filter(a => a.featured);
    const heroMain = featured[0] || published[0];
    const heroSide = (featured.length > 1 ? featured.slice(1, 3) : published.slice(1, 3));
    const recent = published.slice(0, 8);
    const popular = [...published].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const catGroups = {};
    db.categories.forEach(cat => { const arts = published.filter(a => a.category === cat.id).slice(0, 3); if (arts.length) catGroups[cat.id] = arts; });

    let html = '<div class="container">';
    // Ad slot - header
    if (db.settings.adsEnabled) html += '<div class="ad-slot ad-slot-header">📢 Reklam Alanı (728x90)</div>';
    // Hero
    html += `<div class="hero-section"><div class="hero-grid">`;
    html += `<div class="hero-main" onclick="showPage('article','${heroMain.id}')">`;
    if (heroMain.image) html += `<img class="hero-main-img" src="${esc(heroMain.image)}" alt="${esc(heroMain.title)}" loading="lazy" onerror="this.style.background='var(--gray-100)';this.src=''">`;
    else html += `<div class="hero-main-img" style="background:var(--dark);display:flex;align-items:center;justify-content:center;font-size:60px">📰</div>`;
    html += `<div class="hero-main-overlay"><div class="hero-main-category">${catBadge(heroMain.category)}</div>
    <div class="hero-main-title">${esc(heroMain.title)}</div>
    <div class="hero-main-meta">${esc(heroMain.author || 'Editör')} · ${timeAgo(heroMain.date)} · 📖 ${readingTime(heroMain.body)} dk</div>
  </div></div>`;
    if (heroSide.length) {
        html += `<div class="hero-sidebar">`;
        heroSide.forEach(art => {
            html += `<div class="hero-side-item" onclick="showPage('article','${art.id}')">`;
            if (art.image) html += `<img class="hero-side-img" src="${esc(art.image)}" alt="" loading="lazy" onerror="this.style.display='none'">`;
            else html += `<div class="hero-side-img" style="background:var(--gray-900)"></div>`;
            html += `<div class="hero-side-overlay"><div class="hero-side-title">${esc(art.title)}</div><div class="hero-side-meta">${timeAgo(art.date)}</div></div></div>`;
        });
        html += `</div>`;
    }
    html += `</div></div>`;

    // Main + Sidebar
    html += `<div class="main-with-sidebar" style="margin-top:32px"><div>`;
    // Son Haberler
    html += `<div class="section-header"><div class="section-title">Son Haberler</div><div class="section-line"></div></div>`;
    html += `<div class="articles-grid">`; recent.forEach(art => { html += renderArticleCard(art); }); html += `</div>`;
    // Ad slot in-content
    if (db.settings.adsEnabled) html += '<div class="ad-slot ad-slot-in-article">📢 Reklam Alanı (Sayfa İçi)</div>';
    // Category sections
    Object.entries(catGroups).slice(0, 3).forEach(([catId, arts]) => {
        html += `<div style="margin-top:40px"><div class="section-header"><div class="section-title">${getCatName(catId)}</div><div class="section-line"></div><span class="section-more" onclick="showPage('category','${catId}')">Tümü »</span></div>`;
        html += `<div class="articles-grid">`; arts.forEach(art => { html += renderArticleCard(art); }); html += `</div></div>`;
    });
    html += `</div>`;

    // Sidebar
    html += `<aside class="sidebar">`;
    // Weather
    html += renderWeatherWidget();
    // Popular
    html += `<div class="sidebar-widget"><div class="sidebar-title">En Çok Okunanlar</div>`;
    popular.forEach((art, i) => {
        html += `<div class="popular-item" onclick="showPage('article','${art.id}')"><div class="popular-num">${i + 1}</div><div><div class="popular-title">${esc(art.title)}</div><div class="popular-time">${timeAgo(art.date)}</div></div></div>`;
    });
    html += `</div>`;
    // Ad slot sidebar
    if (db.settings.adsEnabled) html += '<div class="ad-slot ad-slot-sidebar">📢 Reklam (300x250)</div>';
    // Poll
    html += renderPollWidget();
    // Trending Tags
    html += renderTrendingTags(published);
    // Categories
    html += `<div class="sidebar-widget"><div class="sidebar-title">Kategoriler</div>`;
    db.categories.forEach(cat => {
        const count = published.filter(a => a.category === cat.id).length;
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--gray-100);cursor:pointer" onclick="showPage('category','${cat.id}')"><span style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:50%;background:${cat.color};display:inline-block"></span>${cat.name}</span><span style="font-size:12px;font-weight:700;color:var(--gray-500)">${count}</span></div>`;
    });
    html += `</div></aside></div></div>`;
    main.innerHTML = html;
}

function renderWeatherWidget() {
    return `<div class="sidebar-widget"><div class="weather-widget"><div class="weather-city">📍 İstanbul</div><div class="weather-temp">18°</div><div class="weather-desc">☁️ Parçalı Bulutlu</div><div class="weather-details"><span>💧 %62</span><span>💨 15 km/s</span><span>🌡 Hissedilen: 16°</span></div></div></div>`;
}

function renderPollWidget() {
    const poll = (db.polls || []).find(p => p.active);
    if (!poll) return '';
    const totalVotes = poll.votes.reduce((s, v) => s + v, 0);
    const voted = localStorage.getItem('poll_voted_' + poll.id);
    let html = `<div class="sidebar-widget"><div class="sidebar-title">Anket</div><div class="poll-widget"><div class="poll-question">${esc(poll.question)}</div>`;
    poll.options.forEach((opt, i) => {
        const pct = totalVotes ? Math.round(poll.votes[i] / totalVotes * 100) : 0;
        html += `<div class="poll-option ${voted ? 'voted' : ''}" onclick="votePoll('${poll.id}',${i})"><div class="poll-bar" style="width:${voted ? pct : 0}%"></div><span class="poll-label">${esc(opt)}</span>${voted ? `<span class="poll-pct">${pct}%</span>` : ''}</div>`;
    });
    html += `<div class="poll-total">${totalVotes} oy</div></div></div>`;
    return html;
}

function votePoll(pollId, optIdx) {
    if (localStorage.getItem('poll_voted_' + pollId)) return;
    const poll = db.polls.find(p => p.id === pollId);
    if (!poll) return;
    poll.votes[optIdx]++;
    saveDB(db);
    localStorage.setItem('poll_voted_' + pollId, '1');
    toast('Oyunuz kaydedildi! 🗳️');
    showPage('home');
}

function renderTrendingTags(published) {
    const tagMap = {};
    published.forEach(a => { (a.tags || '').split(',').forEach(t => { t = t.trim(); if (t) tagMap[t] = (tagMap[t] || 0) + 1; }); });
    const sorted = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 12);
    if (!sorted.length) return '';
    let html = `<div class="sidebar-widget"><div class="sidebar-title">Gündem</div><div class="trending-tags">`;
    sorted.forEach(([tag, count]) => {
        html += `<span class="trending-tag" onclick="showPage('search','${esc(tag)}')">#${esc(tag)} <span class="tag-count">${count}</span></span>`;
    });
    html += `</div></div>`;
    return html;
}

function renderCategory(main, catId) {
    const cat = db.categories.find(c => c.id === catId);
    const articles = db.articles.filter(a => a.status === 'published' && a.category === catId).sort((a, b) => new Date(b.date) - new Date(a.date));
    let html = `<div class="container" style="padding:28px 20px"><div style="border-left:5px solid ${cat ? cat.color : 'var(--red)'};padding-left:16px;margin-bottom:28px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--gray-500);margin-bottom:4px">KATEGORİ</div><div style="font-family:var(--font-display);font-size:32px;font-weight:900">${cat ? cat.name : catId}</div><div style="font-size:13px;color:var(--gray-500);margin-top:4px">${articles.length} haber bulundu</div></div>`;
    if (!articles.length) html += `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Bu kategoride haber yok</div></div>`;
    else { html += `<div class="articles-grid">`; articles.forEach(art => { html += renderArticleCard(art); }); html += `</div>`; }
    html += `</div>`; main.innerHTML = html;
}

function renderSearch(main, query) {
    const q = (query || '').toLowerCase();
    const results = db.articles.filter(a => a.status === 'published' && (a.title.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q) || (a.tags || '').toLowerCase().includes(q)));
    let html = `<div class="container" style="padding:28px 20px"><div style="margin-bottom:24px"><div style="font-family:var(--font-display);font-size:24px;font-weight:700">Arama: "<em>${esc(query)}</em>"</div><div style="font-size:13px;color:var(--gray-500);margin-top:4px">${results.length} sonuç bulundu</div></div>`;
    if (!results.length) html += `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Sonuç bulunamadı</div></div>`;
    else { html += `<div class="articles-grid">`; results.forEach(art => { html += renderArticleCard(art); }); html += `</div>`; }
    html += `</div>`; main.innerHTML = html;
}

// ============================================================
// NEW FRONTEND FEATURES (5)
// ============================================================

// 1. SCROLL-TO-TOP BUTTON
(function initScrollToTop() {
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.createElement('button');
        btn.id = 'scrollTopBtn';
        btn.innerHTML = '⬆';
        btn.title = 'Sayfa Başına Dön';
        btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:48px;height:48px;border-radius:50%;background:var(--red);color:white;border:none;font-size:20px;cursor:pointer;z-index:800;box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:0;transform:translateY(20px);transition:all 0.3s;display:flex;align-items:center;justify-content:center';
        document.body.appendChild(btn);
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) { btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; }
            else { btn.style.opacity = '0'; btn.style.transform = 'translateY(20px)'; }
        });
    });
})();

// 2. PRINT ARTICLE BUTTON (added in detail.js share bar)
function printArticle() {
    window.print();
}

// 3. NOTIFICATION COUNTER (admin bildirim rozetleri göster)
function getNotificationCount() {
    const pending = (db.comments || []).filter(c => c.status === 'pending').length;
    const unread = (db.notifications || []).filter(n => !n.read).length;
    return pending + unread;
}
function updateNotificationBadge() {
    const count = getNotificationCount();
    const badge = document.getElementById('notifBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

// 4. QUICK READ MODE — haber özetlerini modal'da göster
function quickRead(artId, ev) {
    if (ev) ev.stopPropagation();
    const art = db.articles.find(a => a.id === artId);
    if (!art) return;
    // Okumaya sayıl
    art.views = (art.views || 0) + 1;
    saveDB(db);
    openModal(esc(art.title), `
    <div style="margin-bottom:12px">${catBadge(art.category)} <span style="font-size:12px;color:var(--gray-500);margin-left:8px">${timeAgo(art.date)} · ${esc(art.author || 'Editör')} · 📖 ${readingTime(art.body)} dk</span></div>
    ${art.image ? `<img src="${esc(art.image)}" style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;margin-bottom:16px" onerror="this.style.display='none'">` : ''}
    <p style="font-size:15px;line-height:1.7;color:var(--gray-700)">${esc(art.summary)}</p>
    ${art.source ? `<div style="margin-top:12px;font-size:12px;color:var(--gray-500)">📰 ${esc(art.source)}</div>` : ''}
  `, `<button class="btn btn-secondary" onclick="closeModal()">Kapat</button><button class="btn btn-primary" onclick="closeModal();showPage('article','${art.id}')">Tam Haber →</button>`);
}

// 5. READING PROGRESS BAR
(function initReadingProgress() {
    document.addEventListener('DOMContentLoaded', () => {
        const bar = document.createElement('div');
        bar.id = 'readingProgressBar';
        bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--red),var(--accent));z-index:9999;transition:width 0.1s;width:0';
        document.body.appendChild(bar);
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        });
    });
})();

// Enhance article card with quick-read button
const _originalRenderCard = renderArticleCard;
renderArticleCard = function (art) {
    let card = _originalRenderCard(art);
    card = card.replace('</div>\n    </div>', `<button class="btn btn-sm btn-secondary" style="margin-top:12px;font-size:11px;width:100%;justify-content:center" onclick="quickRead('${art.id}',event)">⚡ Hızlı Oku</button></div>\n    </div>`);
    return card;
};
