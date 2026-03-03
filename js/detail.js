// ============================================================
// ARTICLE DETAIL & COMMENTS
// ============================================================

function renderArticleDetail(main, id) {
    const art = db.articles.find(a => a.id === id);
    if (!art) { main.innerHTML = `<div class="container" style="padding:60px 0;text-align:center"><div class="empty-icon">😕</div><div class="empty-title">Haber bulunamadı</div></div>`; return; }
    art.views = (art.views || 0) + 1; saveDB(db);
    if (typeof addToHistory === 'function') addToHistory(art.id);
    const related = db.articles.filter(a => a.id !== id && a.category === art.category && a.status === 'published').slice(0, 3);
    const fontSize = db.settings.fontSize || 18;
    let bodyHtml = '';
    const lines = (art.body || '').split('\n');
    let inP = false;
    lines.forEach(line => {
        const t = line.trim();
        if (!t) { if (inP) { bodyHtml += '</p>'; inP = false; } return; }
        if (t.startsWith('H3:')) { if (inP) { bodyHtml += '</p>'; inP = false; } bodyHtml += `<h3>${esc(t.slice(3))}</h3>`; }
        else if (t.startsWith('>')) { if (inP) { bodyHtml += '</p>'; inP = false; } bodyHtml += `<blockquote>${esc(t.slice(1).trim())}</blockquote>`; }
        else { if (!inP) { bodyHtml += '<p>'; inP = true; } bodyHtml += esc(t) + ' '; }
    });
    if (inP) bodyHtml += '</p>';

    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(art.title);

    let html = `<div class="container" style="padding:28px 20px"><div class="main-with-sidebar"><div class="article-detail">`;
    html += `<div class="back-btn" onclick="showPage('home')">← Geri Dön</div>`;
    html += `<div class="detail-header"><div class="detail-category">${catBadge(art.category)}</div>
    <div class="detail-title">${esc(art.title)}</div>
    <div class="detail-meta">
      <span class="detail-author">✍ ${esc(art.author || 'Editör')}</span>
      <span class="detail-date">📅 ${formatDate(art.date)}</span>
      ${art.source ? `<span class="detail-source">📰 ${esc(art.source)}</span>` : ''}
      <span style="font-size:12px;color:var(--gray-500)">👁 ${(art.views || 0).toLocaleString()} okunma</span>
      <span style="font-size:12px;color:var(--gray-500)">📖 ${readingTime(art.body)} dk okuma</span>
    </div></div>`;
    // Font size controls
    html += `<div style="display:flex;gap:8px;margin-bottom:16px;align-items:center"><span style="font-size:12px;color:var(--gray-500)">Yazı Boyutu:</span><div class="fontsize-controls"><button class="fontsize-btn" onclick="changeFontSize(-2)">A-</button><button class="fontsize-btn" onclick="changeFontSize(2)">A+</button></div></div>`;
    if (art.image) html += `<img class="detail-img" src="${esc(art.image)}" alt="" loading="lazy" onerror="this.style.display='none'">`;
    // Ad before content
    if (db.settings.adsEnabled) html += '<div class="ad-slot ad-slot-in-article">📢 Reklam Alanı (Makale İçi)</div>';
    html += `<div class="detail-body" style="font-size:${fontSize}px">${bodyHtml}</div>`;
    if (art.source) html += `<div class="source-tag">📰 Kaynak: <strong>${esc(art.source)}</strong></div>`;
    if (art.tags) {
        html += `<div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">`;
        art.tags.split(',').forEach(tag => { html += `<span style="padding:4px 12px;background:var(--gray-100);border-radius:20px;font-size:12px;color:var(--gray-700);cursor:pointer" onclick="showPage('search','${esc(tag.trim())}')">#${esc(tag.trim())}</span>`; });
        html += `</div>`;
    }
    // Social Share
    html += `<div class="share-bar"><span class="share-label">Paylaş:</span>
    <a class="share-btn share-twitter" href="https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}" target="_blank" rel="noopener">𝕏 Twitter</a>
    <a class="share-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener">f Facebook</a>
    <a class="share-btn share-whatsapp" href="https://wa.me/?text=${shareTitle}%20${shareUrl}" target="_blank" rel="noopener">💬 WhatsApp</a>
    <a class="share-btn share-telegram" href="https://t.me/share/url?url=${shareUrl}&text=${shareTitle}" target="_blank" rel="noopener">✈ Telegram</a>
    <button class="share-btn share-copy" onclick="copyLink()">🔗 Kopyala</button>
  </div>`;
    // Ad after content
    if (db.settings.adsEnabled) html += '<div class="ad-slot ad-slot-in-article">📢 Reklam Alanı</div>';
    // Comments
    html += renderCommentsSection(art.id);
    html += `</div>`;
    // Sidebar
    html += `<aside class="sidebar">`;
    if (related.length) {
        html += `<div class="sidebar-widget"><div class="sidebar-title">İlgili Haberler</div>`;
        related.forEach(r => {
            html += `<div class="popular-item" onclick="showPage('article','${r.id}')">
        ${r.image ? `<img src="${esc(r.image)}" style="width:60px;height:45px;object-fit:cover;border-radius:4px;flex-shrink:0" loading="lazy" onerror="this.style.display='none'">` : ''}
        <div><div class="popular-title">${esc(r.title)}</div><div class="popular-time">${timeAgo(r.date)}</div></div></div>`;
        });
        html += `</div>`;
    }
    if (db.settings.adsEnabled) html += '<div class="ad-slot ad-slot-sidebar">📢 Reklam (300x250)</div>';
    html += `</aside></div></div>`;
    main.innerHTML = html;
}

function copyLink() { navigator.clipboard.writeText(window.location.href).then(() => toast('Link kopyalandı! 📋')).catch(() => toast('Kopyalanamadı', 'error')); }

function renderCommentsSection(articleId) {
    const comments = (db.comments || []).filter(c => c.articleId === articleId && c.status === 'approved');
    let html = `<div class="comments-section"><div class="comments-title">Yorumlar (${comments.length})</div>`;
    html += `<div class="comment-form"><div class="form-grid"><input type="text" id="commentName" placeholder="Adınız *"><input type="email" id="commentEmail" placeholder="E-posta *"></div><textarea id="commentText" placeholder="Yorumunuzu yazın..."></textarea><div style="margin-top:10px;display:flex;justify-content:flex-end"><button class="btn btn-primary" onclick="submitComment('${articleId}')">💬 Yorum Yap</button></div></div>`;
    comments.forEach(c => {
        html += `<div class="comment-item"><div class="comment-header"><span class="comment-author">${esc(c.name)}</span><span class="comment-date">${timeAgo(c.date)}</span></div><div class="comment-text">${esc(c.text)}</div></div>`;
    });
    if (!comments.length) html += `<div style="text-align:center;color:var(--gray-500);padding:20px;font-size:14px">Henüz yorum yapılmamış. İlk yorumu siz yapın!</div>`;
    html += `</div>`;
    return html;
}

function submitComment(articleId) {
    const name = document.getElementById('commentName').value.trim();
    const email = document.getElementById('commentEmail').value.trim();
    const text = document.getElementById('commentText').value.trim();
    if (!name || !email || !text) { toast('Tüm alanları doldurun', 'error'); return; }
    if (!db.comments) db.comments = [];
    db.comments.push({ id: uid(), articleId, name, email, text, date: new Date().toISOString(), status: 'pending' });
    saveDB(db);
    toast('Yorumunuz onay bekliyor 📝');
    showPage('article', articleId);
}

// ============================================================
// STATIC PAGES
// ============================================================

function renderAbout(main) {
    main.innerHTML = `<div class="container"><div class="static-page">
    <h1>Hakkımızda</h1><p class="page-subtitle">HaberAkış — Türkiye'nin güvenilir ve bağımsız haber kaynağı</p>
    <h2>Misyonumuz</h2><p>HaberAkış olarak amacımız, okuyucularımıza doğru, tarafsız ve hızlı habercilik sunmaktır. 2024 yılında kurulan platformumuz, gazetecilik etiğine bağlı kalarak güncel gelişmeleri en doğru şekilde aktarmayı hedeflemektedir.</p>
    <h2>Vizyonumuz</h2><p>Dijital medya alanında Türkiye'nin en güvenilir ve en çok okunan haber platformu olmayı hedefliyoruz. Okuyucu odaklı yaklaşımımız ve yenilikçi teknoloji altyapımızla haberciliğin geleceğini şekillendirmek istiyoruz.</p>
    <h2>Editör Ekibimiz</h2><p>Deneyimli gazeteciler, yazarlar ve analistlerden oluşan ekibimiz, 7/24 çalışarak sizlere en güncel haberleri sunmaya devam ediyor.</p>
    <div class="info-box"><p>📧 Bize ulaşın: <strong>info@haberakis.com</strong></p></div>
    <h2>İlkelerimiz</h2>
    <ul><li><strong>Doğruluk:</strong> Her haberi birden fazla kaynaktan doğrularız</li>
    <li><strong>Tarafsızlık:</strong> Herhangi bir siyasi görüşe yakın durmayız</li>
    <li><strong>Hız:</strong> Gelişmeleri anında okuyucuya ulaştırırız</li>
    <li><strong>Şeffaflık:</strong> Kaynaklarımızı daima belirtiriz</li>
    <li><strong>Gizlilik:</strong> Okuyucu verilerini koruruz</li></ul>
  </div></div>`;
}

function renderContact(main) {
    main.innerHTML = `<div class="container"><div class="static-page">
    <h1>İletişim</h1><p class="page-subtitle">Bize her konuda ulaşabilirsiniz</p>
    <div class="contact-grid">
      <div><div class="contact-form">
        <div class="form-group"><label class="form-label">Adınız Soyadınız *</label><input type="text" class="form-control" id="contactName" placeholder="Adınız"></div>
        <div class="form-group"><label class="form-label">E-Posta *</label><input type="email" class="form-control" id="contactEmail" placeholder="ornek@mail.com"></div>
        <div class="form-group"><label class="form-label">Konu *</label><select class="form-control" id="contactSubject"><option>Genel Bilgi</option><option>Haber İhbarı</option><option>Reklam Talebi</option><option>Şikayet/Öneri</option><option>Teknik Destek</option></select></div>
        <div class="form-group"><label class="form-label">Mesajınız *</label><textarea class="form-control" id="contactMessage" rows="5" placeholder="Mesajınızı yazın..."></textarea></div>
        <button class="btn btn-primary" onclick="sendContact()">📨 Gönder</button>
      </div></div>
      <div><div class="contact-info-card">
        <div class="contact-info-item"><span class="contact-info-icon">📍</span><div class="contact-info-text"><strong>Adres</strong>İstanbul, Türkiye</div></div>
        <div class="contact-info-item"><span class="contact-info-icon">📧</span><div class="contact-info-text"><strong>E-Posta</strong>info@haberakis.com</div></div>
        <div class="contact-info-item"><span class="contact-info-icon">📞</span><div class="contact-info-text"><strong>Telefon</strong>+90 (212) 000 00 00</div></div>
        <div class="contact-info-item"><span class="contact-info-icon">🕐</span><div class="contact-info-text"><strong>Çalışma Saatleri</strong>7/24 Haber Merkezi</div></div>
      </div></div>
    </div>
  </div></div>`;
}
function sendContact() {
    const n = document.getElementById('contactName').value.trim(), e = document.getElementById('contactEmail').value.trim(), m = document.getElementById('contactMessage').value.trim();
    if (!n || !e || !m) { toast('Tüm alanları doldurun', 'error'); return; }
    toast('Mesajınız gönderildi! Teşekkürler 📨');['contactName', 'contactEmail', 'contactMessage'].forEach(id => document.getElementById(id).value = '');
}

function renderPrivacy(main) {
    main.innerHTML = `<div class="container"><div class="static-page">
    <h1>Gizlilik Politikası</h1><p class="page-subtitle">Son güncelleme: Mart 2026</p>
    <h2>1. Toplanan Veriler</h2><p>HaberAkış olarak, sitemizi ziyaret ettiğinizde bazı bilgiler otomatik olarak toplanabilir: IP adresi, tarayıcı türü, ziyaret edilen sayfalar, ziyaret süresi ve cihaz bilgileri.</p>
    <h2>2. Çerezler (Cookies)</h2><p>Sitemizde kullanıcı deneyimini iyileştirmek ve analitik veriler toplamak amacıyla çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.</p>
    <h2>3. Verilerin Kullanımı</h2><p>Toplanan veriler; site performansını iyileştirmek, içerik önerileri sunmak ve reklam hizmetleri sağlamak amacıyla kullanılır. Kişisel verileriniz üçüncü taraflarla paylaşılmaz.</p>
    <h2>4. Google AdSense</h2><p>Sitemizde Google AdSense reklam hizmetleri kullanılmaktadır. Google, kişiselleştirilmiş reklamlar göstermek için çerezler kullanabilir. Detaylı bilgi için Google'ın gizlilik politikasını inceleyebilirsiniz.</p>
    <h2>5. Haklarınız</h2><p>KVKK kapsamında kişisel verilerinizle ilgili bilgi alma, düzeltme ve silme haklarına sahipsiniz. Bu haklarınızı kullanmak için info@haberakis.com adresinden bize ulaşabilirsiniz.</p>
    <h2>6. İletişim</h2><p>Gizlilik politikamızla ilgili sorularınız için: <strong>info@haberakis.com</strong></p>
  </div></div>`;
}

function renderTerms(main) {
    main.innerHTML = `<div class="container"><div class="static-page">
    <h1>Kullanım Şartları</h1><p class="page-subtitle">Son güncelleme: Mart 2026</p>
    <h2>1. Genel Koşullar</h2><p>HaberAkış web sitesini kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. Bu şartları kabul etmiyorsanız siteyi kullanmayınız.</p>
    <h2>2. Fikri Mülkiyet</h2><p>Sitedeki tüm içerikler, görseller, logolar ve tasarımlar HaberAkış'a aittir. İzinsiz kopyalama, çoğaltma veya dağıtma yasaktır.</p>
    <h2>3. Kullanıcı Sorumlulukları</h2><ul><li>Yasa dışı içerik paylaşmamak</li><li>Diğer kullanıcıların haklarına saygı göstermek</li><li>Yanıltıcı bilgi paylaşmamak</li><li>Spam veya zararlı içerik yayınlamamak</li></ul>
    <h2>4. Yorum Politikası</h2><p>Haberlere yapılan yorumlar editör onayından geçer. Hakaret, nefret söylemi veya argo içeren yorumlar yayınlanmaz.</p>
    <h2>5. Sorumluluk Sınırı</h2><p>HaberAkış, harici kaynaklardan alınan haberlerin doğruluğu konusunda nihai sorumluluk kabul etmez. Kaynak belirtilen haberlerde sorumluluk ilgili kaynağa aittir.</p>
    <h2>6. Değişiklikler</h2><p>HaberAkış bu kullanım şartlarını önceden bildirmeksizin güncelleme hakkını saklı tutar.</p>
  </div></div>`;
}

function renderAdvertise(main) {
    main.innerHTML = `<div class="container"><div class="static-page">
    <h1>Reklam</h1><p class="page-subtitle">HaberAkış'ta reklam verin, hedef kitlenize ulaşın</p>
    <h2>Neden HaberAkış?</h2>
    <ul><li><strong>Geniş Okuyucu Kitlesi:</strong> Günlük binlerce aktif ziyaretçi</li><li><strong>Hedefli Reklam:</strong> Kategori bazlı reklam gösterimi</li><li><strong>Mobil Uyumlu:</strong> Tüm cihazlarda optimum görüntüleme</li><li><strong>SEO Dostu:</strong> Google'da üst sıralarda yer alan içerikler</li></ul>
    <h2>Reklam Alanları</h2>
    <div class="info-box"><p>🖥️ <strong>Header Banner (728x90):</strong> Tüm sayfalarda görünür<br>📱 <strong>Mobil Banner (320x100):</strong> Mobil cihazlarda<br>📰 <strong>Makale İçi (300x250):</strong> Haber detay sayfalarında<br>📊 <strong>Sidebar (300x250):</strong> Kenar çubuğunda</p></div>
    <h2>İletişim</h2><p>Reklam fiyatları ve detaylı bilgi için: <strong>reklam@haberakis.com</strong></p>
    <button class="btn btn-primary" onclick="showPage('contact')" style="margin-top:16px">📨 Reklam Teklifi Al</button>
  </div></div>`;
}

function renderAuthors(main) {
    const authorMap = {};
    db.articles.filter(a => a.status === 'published').forEach(a => {
        const name = a.author || 'Editör';
        if (!authorMap[name]) authorMap[name] = { name, count: 0, views: 0, cats: new Set() };
        authorMap[name].count++;
        authorMap[name].views += (a.views || 0);
        authorMap[name].cats.add(a.category);
    });
    const authors = Object.values(authorMap).sort((a, b) => b.count - a.count);
    let html = `<div class="container" style="padding:28px 20px"><h1 style="font-family:var(--font-display);font-size:32px;font-weight:900;margin-bottom:8px">Yazarlarımız</h1><p style="color:var(--gray-500);margin-bottom:28px">Deneyimli editör kadromuz</p><div class="authors-grid">`;
    authors.forEach(a => {
        html += `<div class="author-card" onclick="showPage('search','${esc(a.name)}')"><div class="author-avatar">${a.name[0].toUpperCase()}</div><div class="author-name">${esc(a.name)}</div><div class="author-role">Editör</div><div class="author-stats"><div><div class="author-stat-num">${a.count}</div><div class="author-stat-label">Haber</div></div><div><div class="author-stat-num">${a.views.toLocaleString()}</div><div class="author-stat-label">Okunma</div></div></div></div>`;
    });
    html += `</div></div>`;
    main.innerHTML = html;
}

function renderArchive(main) {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    let html = `<div class="container" style="padding:28px 20px"><h1 style="font-family:var(--font-display);font-size:32px;font-weight:900;margin-bottom:8px">Arşiv</h1><p style="color:var(--gray-500);margin-bottom:28px">Tüm haberlerimize tarihe göre ulaşın</p>`;
    html += renderCalendar(year, month);
    // Monthly grouped articles
    const published = db.articles.filter(a => a.status === 'published').sort((a, b) => new Date(b.date) - new Date(a.date));
    const months = {};
    published.forEach(a => { const d = new Date(a.date); const key = d.getFullYear() + '-' + (d.getMonth() + 1); if (!months[key]) months[key] = { label: d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }), articles: [] }; months[key].articles.push(a); });
    Object.values(months).slice(0, 6).forEach(m => {
        html += `<div style="margin-top:32px"><div class="section-header"><div class="section-title">${m.label}</div><div class="section-line"></div><span style="font-size:12px;color:var(--gray-500)">${m.articles.length} haber</span></div>`;
        html += `<div class="articles-grid">`; m.articles.slice(0, 6).forEach(art => { html += renderArticleCard(art); }); html += `</div></div>`;
    });
    html += `</div>`;
    main.innerHTML = html;
}

function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
    const today = new Date();
    const articleDays = new Set();
    db.articles.filter(a => a.status === 'published').forEach(a => { const d = new Date(a.date); if (d.getFullYear() === year && d.getMonth() === month) articleDays.add(d.getDate()); });

    let html = `<div class="archive-calendar"><div class="calendar-header"><div class="calendar-title">${monthName}</div></div><div class="calendar-grid">`;
    ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach(d => { html += `<div class="calendar-day-name">${d}</div>`; });
    const startDay = (firstDay + 6) % 7;
    for (let i = 0; i < startDay; i++) html += `<div class="calendar-day empty"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const hasArt = articleDays.has(d);
        html += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasArt ? 'has-articles' : ''}">${d}</div>`;
    }
    html += `</div></div>`;
    return html;
}

// ============================================================
// NEW PAGES: READING HISTORY & BOOKMARKS
// ============================================================

function renderHistory(main) {
    const history = (db.readingHistory || []).slice(0, 30);
    let html = `<div class="container" style="padding:28px 20px"><h1 style="font-family:var(--font-display);font-size:32px;font-weight:900;margin-bottom:8px">📖 Okuma Geçmişi</h1><p style="color:var(--gray-500);margin-bottom:28px">Son okuduğunuz haberler</p>`;
    if (!history.length) {
        html += `<div class="empty-state"><div class="empty-icon">📖</div><div class="empty-title">Henüz haber okumadınız</div></div>`;
    } else {
        html += `<div style="display:flex;justify-content:flex-end;margin-bottom:16px"><button class="btn btn-danger btn-sm" onclick="clearHistory()">🗑️ Geçmişi Temizle</button></div>`;
        html += `<div class="articles-grid">`;
        history.forEach(h => {
            const art = db.articles.find(a => a.id === h.id);
            if (art) html += renderArticleCard(art);
        });
        html += `</div>`;
    }
    html += `</div>`;
    main.innerHTML = html;
}

function clearHistory() {
    db.readingHistory = [];
    saveDB(db);
    toast('Geçmiş temizlendi');
    showPage('history');
}

function renderBookmarks(main) {
    const favIds = db.favorites || [];
    let html = `<div class="container" style="padding:28px 20px"><h1 style="font-family:var(--font-display);font-size:32px;font-weight:900;margin-bottom:8px">❤️ Favorilerim</h1><p style="color:var(--gray-500);margin-bottom:28px">Kaydettiğiniz haberler</p>`;
    if (!favIds.length) {
        html += `<div class="empty-state"><div class="empty-icon">❤️</div><div class="empty-title">Favori haberiniz yok</div><div class="empty-desc">Haberlerdeki ❤️ butonuna tıklayarak favorilere ekleyin</div></div>`;
    } else {
        html += `<div class="articles-grid">`;
        favIds.forEach(id => {
            const art = db.articles.find(a => a.id === id);
            if (art) html += renderArticleCard(art);
        });
        html += `</div>`;
    }
    html += `</div>`;
    main.innerHTML = html;
}
