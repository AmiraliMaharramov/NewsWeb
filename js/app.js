// ============================================================
// SHARED DATABASE & UTILITIES
// ============================================================
const DB_KEY = 'haberakis_db';

function getDB() {
    if (db) return db;
    // Server'dan (PHP) gönderilen data varsa önceliğimiz olur
    if (window.SERVER_DB) {
        db = window.SERVER_DB;
        return db;
    }
    // Yoksa (ilk kurulum anı vb.) localStorage'a bak
    const local = localStorage.getItem(DB_KEY);
    if (local) {
        db = JSON.parse(local);
        saveDB(db); // PHP'ye de gönder
        return db;
    }
    db = getDefaultDB();
    saveDB(db);
    return db;
}

function saveDB(newDb) {
    db = newDb;
    // Yerel önbellek
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
        console.error("LocalStorage Save Error: ", e);
    }

    // PHP'ye senkronize et
    fetch('api.php?action=save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(db)
    }).catch(err => console.error("API Save Error: ", err));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
function esc(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

function getDefaultDB() {
    return {
        settings: { siteName: 'HaberAkış', slogan: 'Güvenilir · Hızlı · Bağımsız', ticker: 'Güncel haberleri takip edin | Son dakika gelişmeleri için sayfamızı ziyaret edin', username: 'habereditor', password: 'HaberAkis2026!', darkMode: false, announcement: '', announcementActive: false, socialLinks: { twitter: '#', instagram: 'https://instagram.com/seninolsun', facebook: '#', youtube: '#', rss: '#' }, adSenseCode: '', adsEnabled: false, language: 'tr', fontSize: 18, autoRSS: true, rssFetchInterval: 15 },
        categories: [
            { id: 'siyaset', name: 'Siyaset', color: '#c0392b' },
            { id: 'ekonomi', name: 'Ekonomi', color: '#2980b9' },
            { id: 'spor', name: 'Spor', color: '#27ae60' },
            { id: 'teknoloji', name: 'Teknoloji', color: '#8e44ad' },
            { id: 'dünya', name: 'Dünya', color: '#e67e22' },
            { id: 'yaşam', name: 'Yaşam', color: '#16a085' },
            { id: 'kültür', name: 'Kültür & Sanat', color: '#d35400' },
            { id: 'sağlık', name: 'Sağlık', color: '#1abc9c' }
        ],
        articles: getSampleArticles(),
        comments: [],
        polls: [{ id: 'poll1', question: 'Sizce en önemli gündem maddesi hangisi?', options: ['Ekonomi', 'Siyaset', 'Teknoloji', 'Spor'], votes: [42, 28, 55, 31], active: true }],
        newsletter: [],
        favorites: [],
        activityLog: [],
        users: [{ id: 'admin1', username: 'habereditor', password: 'HaberAkis2026!', role: 'admin', name: 'Baş Editör' }],
        rssFeeds: [],
        readingHistory: [],
        notifications: [],
        mediaLibrary: [],
        scheduledArticles: []
    };
}

function getSampleArticles() {
    const now = new Date();
    return [
        { id: uid(), title: 'Yapay Zeka Teknolojisi Yeni Bir Çağ Başlatıyor', summary: 'Dünyanın önde gelen teknoloji şirketleri, yapay zeka alanındaki son gelişmeleri paylaştı. Uzmanlar, bu gelişmelerin hayatımızı köklü biçimde değiştireceğini öngörüyor.', body: 'Yapay zeka dünyasında yaşanan hızlı gelişmeler, teknoloji dünyasında büyük bir heyecan yaratıyor.\n\nH3:Sektördeki Yeni Gelişmeler\n\nBüyük teknoloji şirketleri, milyarlarca dolarlık yatırımlarla yapay zeka altyapılarını genişletiyor.\n\n>Yapay zeka, sadece bir araç değil; düşünce şeklimizi değiştiren yeni bir paradigma.\n\nH3:Toplumsal Etkileri\n\nUzmanlar, yapay zekanın iş dünyasından eğitime kadar pek çok alanda köklü değişimlere neden olacağını vurguluyor.', category: 'teknoloji', author: 'Teknoloji Masası', status: 'published', featured: 1, image: 'https://picsum.photos/seed/ai1/800/450', source: 'HaberAkış Teknoloji', tags: 'yapay zeka,teknoloji,inovasyon', date: new Date(now - 3600000).toISOString(), views: 1240 },
        { id: uid(), title: 'Küresel Ekonomide Yeni Dengeler Oluşuyor', summary: 'Dünya ekonomisinde yaşanan değişimler, ülkelerin ticaret politikalarını yeniden şekillendiriyor.', body: 'Küresel ekonomi, pandemi sonrası dönemde yeni bir yapılanma sürecine girdi.\n\nH3:Ticaret İlişkilerinde Değişim\n\nÜlkeler arası ticaret ilişkileri köklü bir dönüşüm geçirirken, yeni ekonomik bloklar oluşmaya başladı.\n\n>Önümüzdeki 5 yıl, küresel ekonominin yeniden yapılanma dönemi olarak tarihe geçecek.', category: 'ekonomi', author: 'Ekonomi Editörü', status: 'published', featured: 0, image: 'https://picsum.photos/seed/eco1/800/450', source: 'Reuters', tags: 'ekonomi,ticaret,küresel', date: new Date(now - 7200000).toISOString(), views: 856 },
        { id: uid(), title: 'Milli Takım Büyük Zaferle Döndü', summary: 'Uluslararası turnuvada oynanan kritik maçta milli takımımız rakibini 3-0 mağlup ederek finale yükseldi.', body: 'Milli takımımız, dün gece oynanan maçta üstün bir performans sergiledi.\n\nH3:Maçın Özeti\n\nİlk yarıda 2 gol bulan milli takımımız, ikinci yarıda da oyuna hakimiyetini sürdürerek 3. golü buldu.\n\n>Oyuncularım bugün gerçek karakterlerini ortaya koydu. Bu zafer hak edilmişti.', category: 'spor', author: 'Spor Masası', status: 'published', featured: 1, image: 'https://picsum.photos/seed/sport1/800/450', source: 'AA Spor', tags: 'futbol,milli takım,zafer', date: new Date(now - 10800000).toISOString(), views: 3421 },
        { id: uid(), title: 'İklim Zirvesinde Tarihi Anlaşma İmzalandı', summary: 'Dünya liderlerinin katıldığı iklim zirvesinde, karbon salınımının azaltılması için bağlayıcı hedefler belirlendi.', body: 'Uluslararası iklim konferansında yeni bir dönemin kapıları aralandı.\n\nH3:Anlaşmanın Kapsamı\n\nİmzalanan anlaşmayla birlikte 190 ülke, 2030 yılına kadar karbon salınımını yüzde 45 azaltmayı taahhüt etti.\n\n>İklim krizi artık bir gelecek meselesi değil, bugünün acil sorunudur.', category: 'dünya', author: 'Dünya Haberleri', status: 'published', featured: 0, image: 'https://picsum.photos/seed/world1/800/450', source: 'BBC Türkçe', tags: 'iklim,çevre,dünya', date: new Date(now - 14400000).toISOString(), views: 2109 },
        { id: uid(), title: 'Sağlıklı Yaşamın Sırrı Yeni Araştırmada Ortaya Çıktı', summary: 'Bilim insanları, uzun ve sağlıklı bir yaşam için kritik öneme sahip alışkanlıkları belirledi.', body: 'Dünyaca ünlü üniversitelerde yürütülen kapsamlı araştırma, sağlıklı yaşamın sırlarını gün yüzüne çıkardı.\n\nH3:Araştırmanın Bulguları\n\n20 yıl boyunca 100 bin kişiyi inceleyen araştırmacılar, uyku düzeni ve beslenme alışkanlıklarının yaşam kalitesini doğrudan etkilediğini kanıtladı.\n\n>Sağlıklı yaşam bir hedef değil, her gün alınan küçük kararların toplamıdır.', category: 'sağlık', author: 'Sağlık Editörü', status: 'published', featured: 0, image: 'https://picsum.photos/seed/health1/800/450', source: 'Nature Medicine', tags: 'sağlık,yaşam,araştırma', date: new Date(now - 18000000).toISOString(), views: 1876 },
        { id: uid(), title: 'Yeni Kültür Merkezi Kapılarını Açtı', summary: 'Şehrin en büyük kültür merkezi, görkemli bir törenle ziyaretçilere açıldı.', body: 'Yıllarca beklenen kültür merkezi, bugün kapılarını açtı.\n\nH3:Muhteşem Açılış\n\nBinlerce sanatseverin katıldığı açılış töreninde özel gösteriler, konserler ve sergi açılışları yer aldı.\n\nH3:Neler Var?\n\nMerkezde modern sanat galerisi, konser salonu, sinema kompleksi ve çocuk aktivite alanları bulunuyor.', category: 'kültür', author: 'Kültür Sanat', status: 'published', featured: 0, image: 'https://picsum.photos/seed/culture1/800/450', source: 'Kültür Bakanlığı', tags: 'kültür,sanat,sergi', date: new Date(now - 21600000).toISOString(), views: 543 },
        { id: uid(), title: 'Seçim Anketi Sonuçları Açıklandı', summary: 'Son yapılan seçim anketleri, partiler arası dengede kritik değişimlere işaret ediyor.', body: 'Kamuoyu araştırma şirketlerinin son anketleri, siyasi dengelerde önemli kırılmalara işaret ediyor.\n\nH3:Anket Detayları\n\nAnkete 10 bin kişi katıldı. Sonuçlar partiler arası oy geçişlerini net biçimde ortaya koyuyor.\n\n>Seçmenin nabzı her zamankinden farklı atıyor.', category: 'siyaset', author: 'Siyaset Masası', status: 'published', featured: 0, image: 'https://picsum.photos/seed/pol1/800/450', source: 'AA', tags: 'siyaset,seçim,anket', date: new Date(now - 25200000).toISOString(), views: 2890 },
        { id: uid(), title: 'Yeni Nesil Elektrikli Araçlar Tanıtıldı', summary: 'Otomobil fuarında tanıtılan yeni elektrikli modeller, menzil ve fiyat performansıyla dikkat çekiyor.', body: 'Uluslararası otomobil fuarında yeni nesil elektrikli araçlar görücüye çıktı.\n\nH3:Öne Çıkan Modeller\n\nBirçok üretici, 800 km üzeri menzil sunan yeni modellerini dünya ile paylaştı.\n\n>Elektrikli araç devrimi artık durdurulamaz bir ivme kazandı.', category: 'teknoloji', author: 'Otomotiv Editörü', status: 'published', featured: 1, image: 'https://picsum.photos/seed/car1/800/450', source: 'TechCrunch', tags: 'otomobil,elektrikli araç,teknoloji', date: new Date(now - 28800000).toISOString(), views: 1567 }
    ];
}

// ============================================================
// UTILITIES
// ============================================================
function getCatName(id) { const c = db.categories.find(c => c.id === id); return c ? c.name : id; }
function getCatColor(id) { const c = db.categories.find(c => c.id === id); return c ? c.color : '#7f8c8d'; }
function catBadge(catId) { return `<span class="badge" style="background:${getCatColor(catId)};color:white">${getCatName(catId)}</span>`; }
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Az önce'; if (m < 60) return `${m} dk önce`;
    const h = Math.floor(m / 60); if (h < 24) return `${h} saat önce`;
    return `${Math.floor(h / 24)} gün önce`;
}
function formatDate(dateStr) { return new Date(dateStr).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function readingTime(text) { const words = (text || '').split(/\s+/).length; return Math.max(1, Math.ceil(words / 200)); }
function isFavorite(articleId) { return (db.favorites || []).includes(articleId); }
function toggleFavorite(articleId, ev) {
    if (ev) ev.stopPropagation();
    if (!db.favorites) db.favorites = [];
    const idx = db.favorites.indexOf(articleId);
    if (idx >= 0) { db.favorites.splice(idx, 1); toast('Favorilerden çıkarıldı'); }
    else { db.favorites.push(articleId); toast('Favorilere eklendi ❤️'); }
    saveDB(db);
    if (currentPage === 'home') showPage('home');
}

// Toast
function toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3500);
}

// Modal
function openModal(title, body, footer) {
    document.getElementById('modalTitle').innerHTML = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer;
    document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

// ============================================================
// FRONTEND ROUTER & STATE
// ============================================================
let currentPage = 'home';
let currentCategory = null;
let db = getDB();

function init() {
    db = getDB();
    applyDarkMode();
    applyFontSize();
    updateTopbar();
    buildNav();
    buildFooterLinks();
    showAnnouncement();
    showCookieConsent();
    showPage('home');
    setTimeout(showNewsletter, 15000);
    // RSS otomatik çekme başlat
    if (typeof startAutoFetch === 'function') startAutoFetch();
}

// Okuma geçmişi
function addToHistory(articleId) {
    if (!db.readingHistory) db.readingHistory = [];
    db.readingHistory = db.readingHistory.filter(h => h.id !== articleId);
    db.readingHistory.unshift({ id: articleId, date: new Date().toISOString() });
    if (db.readingHistory.length > 50) db.readingHistory = db.readingHistory.slice(0, 50);
    saveDB(db);
}

function applyDarkMode() {
    if (db.settings.darkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    const btn = document.getElementById('darkToggle');
    if (btn) btn.textContent = db.settings.darkMode ? '☀️' : '🌙';
}
function toggleDarkMode() {
    db.settings.darkMode = !db.settings.darkMode;
    saveDB(db); applyDarkMode();
}
function applyFontSize() {
    const size = db.settings.fontSize || 18;
    document.documentElement.style.setProperty('--detail-font-size', size + 'px');
}
function changeFontSize(delta) {
    let size = (db.settings.fontSize || 18) + delta;
    size = Math.max(14, Math.min(24, size));
    db.settings.fontSize = size;
    saveDB(db); applyFontSize();
    document.querySelectorAll('.detail-body').forEach(el => el.style.fontSize = size + 'px');
}

function updateTopbar() {
    const d = new Date();
    const el = document.getElementById('topbarDate');
    if (el) el.textContent = d.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const ticker = document.getElementById('tickerText');
    if (ticker) ticker.textContent = db.settings.ticker || 'Güncel haberleri takip edin';
    const breaking = db.articles.filter(a => a.status === 'published' && a.featured).slice(0, 3);
    const bt = document.getElementById('breakingText');
    if (bt && breaking.length) bt.textContent = breaking.map(a => a.title).join(' · ');
    renderFinanceTicker();
}

function renderFinanceTicker() {
    const el = document.getElementById('financeTicker');
    if (!el) return;
    const data = [
        { name: 'USD/TRY', val: '38.45', change: '+0.12', dir: 'up' },
        { name: 'EUR/TRY', val: '41.23', change: '-0.08', dir: 'down' },
        { name: 'GBP/TRY', val: '48.90', change: '+0.25', dir: 'up' },
        { name: 'BIST 100', val: '11,245', change: '+1.2%', dir: 'up' },
        { name: 'Altın', val: '₺3,125', change: '+0.8%', dir: 'up' },
        { name: 'Bitcoin', val: '$97,450', change: '-1.5%', dir: 'down' }
    ];
    el.innerHTML = data.map(d => `<span class="finance-item finance-${d.dir}">${d.name}: <strong>${d.val}</strong> ${d.dir === 'up' ? '▲' : '▼'}${d.change}</span>`).join('');
}

function buildNav() { const nav = document.getElementById('siteNav'); if (!nav) return; let html = `<li id="nav-home"><a onclick="showPage('home')">Ana Sayfa</a></li>`; db.categories.forEach(cat => { html += `<li id="nav-cat-${cat.id}"><a onclick="showPage('category','${cat.id}')">${cat.name}</a></li>`; }); if (db.settings.headerLinks && db.settings.headerLinks.length > 0) { db.settings.headerLinks.forEach(l => { const isPage = l.url.startsWith('#'); const action = isPage ? `showPage('${l.url.substring(1)}')` : ''; html += `<li><a ${isPage ? `onclick="${action}"` : `href="${esc(l.url)}" target="_blank"`}>${esc(l.label)}</a></li>`; }); } else { html += `<li><a onclick="showPage('authors')">Yazarlar</a></li><li><a onclick="showPage('archive')">Arşiv</a></li><li><a onclick="showPage('contact')">İletişim</a></li>`; } nav.innerHTML = html; }
function buildFooterLinks() { const el = document.getElementById('footerCatLinks'); if (el) el.innerHTML = db.categories.map(c => `<li><a onclick="showPage('category','${c.id}')">${c.name}</a></li>`).join(''); const customFooterEl = document.getElementById('footerCustomLinks'); if (customFooterEl && db.settings.footerLinks && db.settings.footerLinks.length > 0) { customFooterEl.innerHTML = db.settings.footerLinks.map(l => { const isPage = l.url.startsWith('#'); const action = isPage ? `showPage('${l.url.substring(1)}')` : ''; return `<li><a ${isPage ? `onclick="${action}"` : `href="${esc(l.url)}" target="_blank"`}>${esc(l.label)}</a></li>`; }).join(''); } else if (customFooterEl) { customFooterEl.innerHTML = `<li><a onclick="showPage('about')">Hakkımızda</a></li><li><a onclick="showPage('contact')">İletişim</a></li><li><a onclick="showPage('privacy')">Gizlilik Politikası</a></li><li><a onclick="showPage('terms')">Kullanım Şartları</a></li><li><a onclick="showPage('advertise')">Reklam</a></li><li><a onclick="showPage('bookmarks')">Favorilerim</a></li><li><a onclick="showPage('history')">Okuma Geçmişi</a></li>`; } const social = db.settings.socialLinks || {}; const setLink = (id, url) => { const a = document.getElementById(id); if (a) a.href = url || '#'; }; setLink('footerTwitter', social.twitter); setLink('footerInstagram', social.instagram); setLink('footerFacebook', social.facebook); setLink('footerYoutube', social.youtube); setLink('footerRss', social.rss); }

function showAnnouncement() {
    const bar = document.getElementById('announcementBar');
    if (!bar) return;
    if (db.settings.announcementActive && db.settings.announcement) {
        bar.classList.remove('hidden');
        document.getElementById('announcementText').textContent = db.settings.announcement;
    } else { bar.classList.add('hidden'); }
}
function closeAnnouncement() { document.getElementById('announcementBar').classList.add('hidden'); }

function showCookieConsent() {
    if (localStorage.getItem('haberakis_cookie_ok')) return;
    const el = document.getElementById('cookieBanner');
    if (el) el.classList.remove('hidden');
}
function acceptCookies() {
    localStorage.setItem('haberakis_cookie_ok', '1');
    document.getElementById('cookieBanner').classList.add('hidden');
}

function showNewsletter() {
    if (localStorage.getItem('haberakis_newsletter_closed') || localStorage.getItem('haberakis_newsletter_sub')) return;
    const el = document.getElementById('newsletterPopup');
    if (el) el.classList.remove('hidden');
}
function closeNewsletter() {
    localStorage.setItem('haberakis_newsletter_closed', '1');
    document.getElementById('newsletterPopup').classList.add('hidden');
}
function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value.trim();
    if (!email || !email.includes('@')) { toast('Geçerli bir e-posta girin', 'error'); return; }
    if (!db.newsletter) db.newsletter = [];
    db.newsletter.push({ email, date: new Date().toISOString() });
    saveDB(db);
    toast('Bültene kaydoldunuz! 📧');
    closeNewsletter();
    localStorage.setItem('haberakis_newsletter_sub', '1');
}

// ============================================================
// PAGE ROUTER
// ============================================================
function showPage(page, param) {
    currentPage = page;
    currentCategory = param || null;
    document.querySelectorAll('.nav-list li').forEach(li => li.classList.remove('active'));
    if (page === 'home') { const el = document.getElementById('nav-home'); if (el) el.classList.add('active'); }
    else if (page === 'category' && param) { const el = document.getElementById('nav-cat-' + param); if (el) el.classList.add('active'); }
    const main = document.getElementById('frontendMain');
    switch (page) {
        case 'home': renderHome(main); break;
        case 'category': renderCategory(main, param); break;
        case 'article': renderArticleDetail(main, param); break;
        case 'search': renderSearch(main, param); break;
        case 'about': renderAbout(main); break;
        case 'contact': renderContact(main); break;
        case 'privacy': renderPrivacy(main); break;
        case 'terms': renderTerms(main); break;
        case 'advertise': renderAdvertise(main); break;
        case 'authors': renderAuthors(main); break;
        case 'archive': renderArchive(main); break;
        case 'history': renderHistory(main); break;
        case 'bookmarks': renderBookmarks(main); break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function doSearch() {
    const q = document.getElementById('siteSearch').value.trim();
    if (!q) return;
    showPage('search', q);
}

function doLiveSearch(val) {
    const el = document.getElementById('liveSearchResults');
    if (!val || val.length < 2) { el.classList.add('hidden'); return; }
    const q = val.toLowerCase();
    const results = db.articles.filter(a => a.status === 'published' && (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))).slice(0, 5);

    if (!results.length) {
        el.innerHTML = `<div style="padding:16px;text-align:center;font-size:12px;color:var(--gray-500)">Sonuç bulunamadı</div>`;
        el.classList.remove('hidden');
        return;
    }

    el.innerHTML = results.map(art => {
        const cat = db.categories.find(c => c.id === art.category);
        return `<div class="live-search-item" onclick="showPage('article','${art.id}'); document.getElementById('liveSearchResults').classList.add('hidden'); document.getElementById('siteSearch').value='';">
            ${art.image ? `<img src="${esc(art.image)}" class="live-search-img" onerror="this.style.display='none'">` : `<div class="live-search-img" style="background:var(--gray-200)"></div>`}
            <div style="overflow:hidden">
                <div class="live-search-text">${esc(art.title)}</div>
                <div class="live-search-cat">${cat ? cat.name : ''}</div>
            </div>
        </div>`;
    }).join('');
    el.classList.remove('hidden');
}
