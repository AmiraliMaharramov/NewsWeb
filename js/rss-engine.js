// ============================================================
// RSS AUTO-FETCH ENGINE — rss-engine.js
// Otomatik haber çekme, duplicate kontrolü, kategoriye yerleştirme
// ============================================================

const RSS_FETCH_INTERVAL = 15 * 60 * 1000; // 15 dakika
let rssFetchTimer = null;

// Varsayılan RSS kaynakları
function getDefaultRSSFeeds() {
    return [
        { id: uid(), name: 'BBC Türkçe', url: 'https://feeds.bbci.co.uk/turkce/rss.xml', category: 'dünya', active: true, lastFetch: null },
        { id: uid(), name: 'NTV Son Dakika', url: 'https://www.ntv.com.tr/son-dakika.rss', category: 'siyaset', active: true, lastFetch: null },
        { id: uid(), name: 'TRT Haber', url: 'https://www.trthaber.com/sondakika.rss', category: 'siyaset', active: true, lastFetch: null },
        { id: uid(), name: 'Sözcü', url: 'https://www.sozcu.com.tr/rss/tum-haberler.xml', category: 'siyaset', active: true, lastFetch: null },
        { id: uid(), name: 'Hürriyet Ekonomi', url: 'https://www.hurriyet.com.tr/rss/ekonomi', category: 'ekonomi', active: true, lastFetch: null },
        { id: uid(), name: 'NTV Spor', url: 'https://www.ntv.com.tr/spor.rss', category: 'spor', active: true, lastFetch: null },
        { id: uid(), name: 'Hürriyet Teknoloji', url: 'https://www.hurriyet.com.tr/rss/teknoloji', category: 'teknoloji', active: true, lastFetch: null },
        { id: uid(), name: 'Cumhuriyet', url: 'https://www.cumhuriyet.com.tr/rss/son_dakika.xml', category: 'siyaset', active: true, lastFetch: null },
        { id: uid(), name: 'NTV Sağlık', url: 'https://www.ntv.com.tr/saglik.rss', category: 'sağlık', active: true, lastFetch: null },
        { id: uid(), name: 'NTV Yaşam', url: 'https://www.ntv.com.tr/yasam.rss', category: 'yaşam', active: true, lastFetch: null }
    ];
}

// RSS kaynaklarını DB'den al
function getRSSFeeds() {
    if (!db.rssFeeds || !db.rssFeeds.length) {
        db.rssFeeds = getDefaultRSSFeeds();
        saveDB(db);
    }
    return db.rssFeeds;
}

// Duplicate kontrolü — başlık benzerliği
function isDuplicate(title) {
    const clean = t => (t || '').toLowerCase().replace(/[^a-zçğıöşü0-9]/g, '').slice(0, 60);
    const ct = clean(title);
    return db.articles.some(a => clean(a.title) === ct);
}

// Tek bir RSS kaynağını çek
async function fetchSingleRSS(feed) {
    const proxyUrl = `rss_proxy.php?url=${encodeURIComponent(feed.url)}`;
    try {
        const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const xmlText = await resp.text();
        if (!xmlText) throw new Error('Boş içerik');

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) throw new Error('XML parse hatası');

        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, 15);
        let addedCount = 0;

        items.forEach(item => {
            const title = (item.querySelector('title')?.textContent || '').trim();
            if (!title || isDuplicate(title)) return;

            const desc = (item.querySelector('description')?.textContent || '').replace(/<[^>]+>/g, '').trim();
            const link = (item.querySelector('link')?.textContent || '').trim();
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const image = extractImageFromRSSItem(item);

            const article = {
                id: uid(),
                title: title,
                summary: desc.slice(0, 300) || title,
                body: desc + (link ? `\n\nKaynak: ${link}` : ''),
                category: feed.category,
                author: feed.name,
                status: 'published',
                featured: 0,
                image: image,
                source: feed.name,
                sourceUrl: link,
                tags: feed.category,
                date: pubDate && new Date(pubDate).toString() !== 'Invalid Date' ? new Date(pubDate).toISOString() : new Date().toISOString(),
                views: 0,
                autoFetched: true
            };

            db.articles.unshift(article);
            addedCount++;
        });

        // Feed'in son çekme zamanını güncelle
        feed.lastFetch = new Date().toISOString();
        feed.lastError = null;
        feed.lastCount = addedCount;
        saveDB(db);

        return { success: true, feed: feed.name, added: addedCount, total: items.length };
    } catch (err) {
        feed.lastError = err.message;
        feed.lastFetch = new Date().toISOString();
        feed.lastCount = 0;
        saveDB(db);
        return { success: false, feed: feed.name, error: err.message };
    }
}

// RSS item'dan görsel çıkar
function extractImageFromRSSItem(item) {
    // enclosure
    const enc = item.querySelector('enclosure[type*="image"]');
    if (enc && enc.getAttribute('url')) return enc.getAttribute('url');
    // media:thumbnail or media:content
    const mediaNS = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0]
        || item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0];
    if (mediaNS && mediaNS.getAttribute('url')) return mediaNS.getAttribute('url');
    // description içinden img src
    const desc = item.querySelector('description')?.textContent || '';
    const imgMatch = desc.match(/src=["']([^"']+\.(jpg|jpeg|png|webp|gif))/i);
    if (imgMatch) return imgMatch[1];
    return '';
}

// Tüm aktif RSS kaynaklarını çek
async function fetchAllRSSFeeds(silent = true) {
    const feeds = getRSSFeeds().filter(f => f.active);
    if (!feeds.length) return [];

    const results = [];
    let totalAdded = 0;

    for (const feed of feeds) {
        const result = await fetchSingleRSS(feed);
        results.push(result);
        if (result.success) totalAdded += result.added;
        // Rate limiting — kaynaklar arası 2 saniye bekle
        await new Promise(r => setTimeout(r, 2000));
    }

    if (totalAdded > 0 && !silent) {
        toast(`🔄 ${totalAdded} yeni haber çekildi!`);
    }

    // Eğer sayfadaysa yenile
    if (totalAdded > 0 && typeof currentPage !== 'undefined' && currentPage === 'home') {
        const main = document.getElementById('frontendMain');
        if (main && typeof renderHome === 'function') renderHome(main);
    }

    return results;
}

// Otomatik çekmeyi başlat
function startAutoFetch() {
    stopAutoFetch();
    const autoEnabled = db.settings.autoRSS !== false;
    if (!autoEnabled) return;

    // İlk çekme: sayfa yüklendikten 10sn sonra
    setTimeout(() => {
        fetchAllRSSFeeds(true);
    }, 10000);

    // Periyodik çekme
    const interval = (db.settings.rssFetchInterval || 15) * 60 * 1000;
    rssFetchTimer = setInterval(() => {
        fetchAllRSSFeeds(true);
    }, interval);

    console.log(`[RSS Engine] Otomatik çekme başlatıldı (${db.settings.rssFetchInterval || 15} dk)`);
}

function stopAutoFetch() {
    if (rssFetchTimer) {
        clearInterval(rssFetchTimer);
        rssFetchTimer = null;
    }
}

// ============================================================
// ADMIN: RSS KAYNAK YÖNETİMİ
// ============================================================

function renderRSSManager() {
    db = getDB();
    const feeds = getRSSFeeds();
    const el = document.getElementById('page-rss');
    if (!el) return;

    let html = `<div class="settings-section">
    <div class="settings-title">📡 RSS Kaynak Yönetimi</div>
    <div class="toggle-row">
      <div><div class="toggle-label">Otomatik Çekme</div><div class="toggle-sub">Haberleri otomatik olarak çek</div></div>
      <label class="toggle"><input type="checkbox" id="autoRSSToggle" ${db.settings.autoRSS !== false ? 'checked' : ''} onchange="toggleAutoRSS()"><span class="toggle-slider"></span></label>
    </div>
    <div class="form-group" style="margin-top:12px">
      <label class="form-label">Çekme Aralığı (dakika)</label>
      <select class="form-control" id="rssFetchInterval" onchange="saveRSSInterval()" style="width:150px">
        <option value="5" ${(db.settings.rssFetchInterval || 15) == 5 ? 'selected' : ''}>5 dk</option>
        <option value="10" ${(db.settings.rssFetchInterval || 15) == 10 ? 'selected' : ''}>10 dk</option>
        <option value="15" ${(db.settings.rssFetchInterval || 15) == 15 ? 'selected' : ''}>15 dk</option>
        <option value="30" ${(db.settings.rssFetchInterval || 15) == 30 ? 'selected' : ''}>30 dk</option>
        <option value="60" ${(db.settings.rssFetchInterval || 15) == 60 ? 'selected' : ''}>60 dk</option>
      </select>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-primary" onclick="manualFetchAll()">🔄 Şimdi Tümünü Çek</button>
      <button class="btn btn-secondary" onclick="showAddRSSModal()">+ Kaynak Ekle</button>
    </div>
  </div>`;

    // Kaynak Listesi
    html += `<div class="settings-section"><div class="settings-title">📋 RSS Kaynakları (${feeds.length})</div>
    <div class="articles-table table-wrap"><table class="table"><thead><tr>
      <th>Kaynak</th><th>URL</th><th>Kategori</th><th>Durum</th><th>Son Çekme</th><th>İşlem</th>
    </tr></thead><tbody>`;

    feeds.forEach(f => {
        const statusIcon = f.lastError ? '❌' : f.lastFetch ? '✅' : '⏳';
        html += `<tr>
      <td><strong>${esc(f.name)}</strong></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;font-size:11px;font-family:var(--font-mono);color:var(--gray-500)">${esc(f.url)}</td>
      <td><span class="badge" style="background:${getCatColor(f.category)};color:white">${getCatName(f.category)}</span></td>
      <td>${f.active ? '<span style="color:var(--green)">● Aktif</span>' : '<span style="color:var(--gray-500)">○ Pasif</span>'} ${statusIcon}${f.lastCount > 0 ? ` <span style="font-size:11px;color:var(--green)">+${f.lastCount}</span>` : ''}</td>
      <td style="font-size:11px;font-family:var(--font-mono)">${f.lastFetch ? timeAgo(f.lastFetch) : 'Hiç'}</td>
      <td><div class="table-actions">
        <button class="btn btn-sm btn-primary" onclick="testRSSFeed('${f.id}')" title="Test Et">🧪</button>
        <button class="btn btn-sm btn-secondary" onclick="editRSSFeed('${f.id}')" title="Düzenle">✏️</button>
        <button class="btn btn-sm ${f.active ? 'btn-secondary' : 'btn-success'}" onclick="toggleRSSFeed('${f.id}')">${f.active ? '⏸' : '▶'}</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRSSFeed('${f.id}')" title="Sil">🗑️</button>
      </div></td>
    </tr>`;
        if (f.lastError) html += `<tr><td colspan="6" style="padding:4px 16px;font-size:11px;color:var(--red);background:#fff5f5">⚠️ ${esc(f.lastError)}</td></tr>`;
    });

    html += `</tbody></table></div></div>`;

    // Manuel RSS Çekme (eski arayüz)
    html += `<div class="settings-section"><div class="settings-title">🔗 Tek Seferlik RSS Çek</div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Kaynak Adı</label><input type="text" class="form-control" id="rssName" placeholder="BBC Türkçe"></div>
      <div class="form-group"><label class="form-label">Kategori</label><select class="form-control" id="rssCategory"><option value="">Seç</option>${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
      <div class="form-group form-full"><label class="form-label">RSS URL</label>
        <div style="display:flex;gap:10px"><input type="text" class="form-control" id="rssUrl" placeholder="https://..."><button class="btn btn-primary" onclick="fetchRSS()">📡 Çek</button></div>
      </div>
    </div>
    <div class="form-group"><label class="form-label">Maks. Haber</label><select class="form-control" id="rssLimit" style="width:120px"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div>
    <div id="rssLog" class="rss-log hidden"></div>
    <div id="rssPreview"></div>
  </div>`;

    el.innerHTML = html;
}

function toggleAutoRSS() {
    db.settings.autoRSS = document.getElementById('autoRSSToggle').checked;
    saveDB(db);
    if (db.settings.autoRSS) startAutoFetch();
    else stopAutoFetch();
    toast(db.settings.autoRSS ? 'Otomatik çekme açıldı ✅' : 'Otomatik çekme kapatıldı');
}

function saveRSSInterval() {
    db.settings.rssFetchInterval = parseInt(document.getElementById('rssFetchInterval').value) || 15;
    saveDB(db);
    if (db.settings.autoRSS !== false) startAutoFetch();
    toast('Çekme aralığı güncellendi');
}

async function manualFetchAll() {
    toast('🔄 RSS kaynakları çekiliyor...');
    const results = await fetchAllRSSFeeds(false);
    const total = results.reduce((s, r) => s + (r.added || 0), 0);
    const errors = results.filter(r => !r.success).length;
    toast(errors ? `${total} haber eklendi, ${errors} kaynak başarısız` : `${total} yeni haber eklendi ✅`);
    renderRSSManager();
}

function showAddRSSModal() {
    openModal('Yeni RSS Kaynağı', `
    <div class="form-group"><label class="form-label">Kaynak Adı *</label><input type="text" class="form-control" id="addRssName" placeholder="Örn: NTV Dünya"></div>
    <div class="form-group"><label class="form-label">RSS URL *</label><input type="text" class="form-control" id="addRssUrl" placeholder="https://www.ntv.com.tr/dunya.rss"></div>
    <div class="form-group"><label class="form-label">Kategori *</label><select class="form-control" id="addRssCat">${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-primary" onclick="addRSSFeed()">Ekle</button>`);
}

function addRSSFeed() {
    const name = document.getElementById('addRssName').value.trim();
    const url = document.getElementById('addRssUrl').value.trim();
    const category = document.getElementById('addRssCat').value;
    if (!name || !url) { toast('Ad ve URL zorunlu', 'error'); return; }
    db.rssFeeds.push({ id: uid(), name, url, category, active: true, lastFetch: null });
    saveDB(db);
    closeModal();
    addLog('RSS kaynağı eklendi: ' + name);
    toast('Kaynak eklendi ✅');
    renderRSSManager();
}

function editRSSFeed(id) {
    const feed = db.rssFeeds.find(f => f.id === id);
    if (!feed) return;
    openModal('RSS Kaynağı Düzenle', `
    <div class="form-group"><label class="form-label">Kaynak Adı</label><input type="text" class="form-control" id="editRssName" value="${esc(feed.name)}"></div>
    <div class="form-group"><label class="form-label">RSS URL</label><input type="text" class="form-control" id="editRssUrl" value="${esc(feed.url)}"></div>
    <div class="form-group"><label class="form-label">Kategori</label><select class="form-control" id="editRssCat">${db.categories.map(c => `<option value="${c.id}" ${c.id === feed.category ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-primary" onclick="updateRSSFeed('${id}')">Kaydet</button>`);
}

function updateRSSFeed(id) {
    const feed = db.rssFeeds.find(f => f.id === id);
    if (!feed) return;
    feed.name = document.getElementById('editRssName').value.trim() || feed.name;
    feed.url = document.getElementById('editRssUrl').value.trim() || feed.url;
    feed.category = document.getElementById('editRssCat').value || feed.category;
    saveDB(db);
    closeModal();
    toast('Kaynak güncellendi ✅');
    renderRSSManager();
}

function toggleRSSFeed(id) {
    const feed = db.rssFeeds.find(f => f.id === id);
    if (!feed) return;
    feed.active = !feed.active;
    saveDB(db);
    toast(feed.active ? 'Kaynak aktifleştirildi' : 'Kaynak pasifleştirildi');
    renderRSSManager();
}

function deleteRSSFeed(id) {
    db.rssFeeds = db.rssFeeds.filter(f => f.id !== id);
    saveDB(db);
    addLog('RSS kaynağı silindi');
    toast('Kaynak silindi');
    renderRSSManager();
}

async function testRSSFeed(id) {
    const feed = db.rssFeeds.find(f => f.id === id);
    if (!feed) return;
    toast(`🧪 ${feed.name} test ediliyor...`);
    const result = await fetchSingleRSS(feed);
    if (result.success) {
        toast(`✅ ${feed.name}: ${result.added} yeni haber (${result.total} bulundu)`);
    } else {
        toast(`❌ ${feed.name}: ${result.error}`, 'error');
    }
    renderRSSManager();
}
