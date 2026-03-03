// ============================================================
// ADMIN FEATURES - Categories, RSS, Settings, Comments, etc.
// ============================================================

// CATEGORIES
function renderCategories() { db = getDB(); const grid = document.getElementById('categoriesGrid'); grid.innerHTML = db.categories.map(cat => { const count = db.articles.filter(a => a.category === cat.id).length; return `<div class="category-card" style="border-top-color:${cat.color}"><div class="category-name">${esc(cat.name)}</div><div class="category-count">${count} haber</div><div class="color-picker-wrap"><div class="color-swatch" style="background:${cat.color}"></div><span style="font-size:12px;color:var(--gray-500)">${cat.color}</span></div><div class="category-actions"><button class="btn btn-sm btn-secondary" onclick="editCategoryModal('${cat.id}')">✏️ Düzenle</button><button class="btn btn-sm btn-danger" onclick="deleteCategoryConfirm('${cat.id}')">${count > 0 ? '⚠️' : '🗑️'} Sil</button></div></div>`; }).join(''); }
function showAddCategoryModal() { openModal('Yeni Kategori', `<div class="form-group"><label class="form-label">Kategori Adı</label><input type="text" class="form-control" id="newCatName" placeholder="Örn: Eğitim"></div><div class="form-group"><label class="form-label">Renk</label><input type="color" class="form-control" id="newCatColor" value="#e74c3c" style="height:44px;cursor:pointer"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-primary" onclick="addCategory()">Ekle</button>`); }
function addCategory() { const name = document.getElementById('newCatName').value.trim(), color = document.getElementById('newCatColor').value; if (!name) { toast('Ad gerekli', 'error'); return; } const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9çğıöşü-]/g, ''); if (db.categories.find(c => c.id === id)) { toast('Zaten var', 'error'); return; } db.categories.push({ id, name, color }); saveDB(db); closeModal(); buildNav(); renderCategories(); addLog('Kategori eklendi: ' + name); toast('Kategori eklendi ✅'); }
function editCategoryModal(id) { const cat = db.categories.find(c => c.id === id); if (!cat) return; openModal('Kategori Düzenle', `<div class="form-group"><label class="form-label">Ad</label><input type="text" class="form-control" id="editCatName" value="${esc(cat.name)}"></div><div class="form-group"><label class="form-label">Renk</label><input type="color" class="form-control" id="editCatColor" value="${cat.color}" style="height:44px;cursor:pointer"></div>`, `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-primary" onclick="updateCategory('${id}')">Kaydet</button>`); }
function updateCategory(id) { const cat = db.categories.find(c => c.id === id); if (!cat) return; cat.name = document.getElementById('editCatName').value.trim() || cat.name; cat.color = document.getElementById('editCatColor').value; saveDB(db); closeModal(); buildNav(); renderCategories(); toast('Kategori güncellendi ✅'); }
function deleteCategoryConfirm(id) { const count = db.articles.filter(a => a.category === id).length; openModal('Kategoriyi Sil', `<p>Bu kategoriyi silmek istediğinize emin misiniz?</p>${count > 0 ? `<p style="color:var(--red);font-size:13px">⚠️ Bu kategoride ${count} haber var.</p>` : ''}`, `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-danger" onclick="deleteCategory('${id}')">Sil</button>`); }
function deleteCategory(id) { db.categories = db.categories.filter(c => c.id !== id); saveDB(db); closeModal(); buildNav(); renderCategories(); toast('Kategori silindi'); }

// RSS
function renderRSSPage() { db = getDB(); const sel = document.getElementById('rssCategory'); sel.innerHTML = '<option value="">Seç</option>' + db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join(''); document.getElementById('rssLog').classList.add('hidden'); document.getElementById('rssPreview').innerHTML = ''; }
async function fetchRSS() { const url = document.getElementById('rssUrl').value.trim(), catId = document.getElementById('rssCategory').value, limit = parseInt(document.getElementById('rssLimit').value) || 10, sourceName = document.getElementById('rssName').value.trim() || 'RSS'; if (!url) { toast('URL giriniz', 'error'); return; } if (!catId) { toast('Kategori seçiniz', 'error'); return; } const logEl = document.getElementById('rssLog'), previewEl = document.getElementById('rssPreview'); logEl.classList.remove('hidden'); logEl.textContent = '[RSS] İstek gönderiliyor...\n'; previewEl.innerHTML = '<div class="spinner"></div>'; try { const resp = await fetch(`rss_proxy.php?url=${encodeURIComponent(url)}`); if (!resp.ok) throw new Error(`HTTP ${resp.status}`); const xmlStr = await resp.text(); if (!xmlStr) throw new Error('Boş içerik'); logEl.textContent += `[RSS] İçerik alındı\n`; const parser = new DOMParser(); const xmlDoc = parser.parseFromString(xmlStr, 'text/xml'); const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, limit); if (!items.length) throw new Error('Haber bulunamadı'); logEl.textContent += `[RSS] ${items.length} haber bulundu\n`; const parsed = items.map(item => ({ title: item.querySelector('title')?.textContent?.trim() || 'Başlıksız', summary: (item.querySelector('description')?.textContent || '').replace(/<[^>]+>/g, '').trim().slice(0, 300), link: item.querySelector('link')?.textContent?.trim() || '', pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(), image: extractRSSImage(item) })); renderRSSPreview(parsed, catId, sourceName); } catch (e) { logEl.textContent += `[HATA] ${e.message}\n`; previewEl.innerHTML = `<div style="background:#fff8e1;border:1px solid #ffd54f;padding:16px;border-radius:8px;margin-top:12px"><strong>⚠️ RSS çekilemedi:</strong> ${esc(e.message)}</div>`; } }
function extractRSSImage(item) { const enc = item.querySelector('enclosure[type*="image"]'); if (enc) return enc.getAttribute('url') || ''; const media = item.querySelector('thumbnail') || item.querySelector('content'); if (media) return media.getAttribute('url') || ''; const desc = item.querySelector('description')?.textContent || ''; const match = desc.match(/src="([^"]+\.(jpg|jpeg|png|webp))/i); return match ? match[1] : ''; }
function renderRSSPreview(items, catId, sourceName) { const el = document.getElementById('rssPreview'); let html = `<div style="margin-top:16px"><div style="font-weight:700;margin-bottom:12px">${items.length} haber bulundu:</div><button class="btn btn-primary" style="margin-bottom:14px" onclick="importAllRSSItems()">✅ Tümünü İçe Aktar</button><div class="articles-table table-wrap"><table class="table"><thead><tr><th>#</th><th>Başlık</th><th>Özet</th><th>İşlem</th></tr></thead><tbody>`; items.forEach((item, i) => { html += `<tr><td>${i + 1}</td><td style="max-width:200px;font-weight:600;font-size:13px">${esc(item.title)}</td><td style="max-width:250px;font-size:12px;color:var(--gray-500)">${esc(item.summary.slice(0, 100))}</td><td><button class="btn btn-sm btn-success" onclick="importSingleRSSItem(${i})">+ Ekle</button></td></tr>`; }); html += `</tbody></table></div></div>`; el.innerHTML = html; el._data = { items, catId, sourceName }; }
function importSingleRSSItem(idx) { const el = document.getElementById('rssPreview'); const { items, catId, sourceName } = el._data; addRSSArticle(items[idx], catId, sourceName); toast('Haber eklendi ✅'); }
function importAllRSSItems() { const el = document.getElementById('rssPreview'); const { items, catId, sourceName } = el._data; items.forEach(item => addRSSArticle(item, catId, sourceName)); addLog(`RSS'den ${items.length} haber eklendi`); toast(`${items.length} haber eklendi ✅`); }
function addRSSArticle(item, catId, sourceName) { db.articles.unshift({ id: uid(), title: item.title, summary: item.summary || item.title, body: item.summary + (item.link ? `\n\nKaynak: ${item.link}` : ''), category: catId, author: sourceName, status: 'published', featured: 0, image: item.image || '', source: sourceName, tags: '', date: new Date(item.pubDate).toString() !== 'Invalid Date' ? new Date(item.pubDate).toISOString() : new Date().toISOString(), views: 0 }); saveDB(db); }

// SETTINGS
function renderSettings() { db = getDB(); document.getElementById('setSiteName').value = db.settings.siteName || ''; document.getElementById('setSiteSlogan').value = db.settings.slogan || ''; document.getElementById('setTicker').value = db.settings.ticker || ''; document.getElementById('setUsername').value = db.settings.username || ''; document.getElementById('setPassword').value = ''; }
function saveSettings() { db.settings.siteName = document.getElementById('setSiteName').value.trim() || 'HaberAkış'; db.settings.slogan = document.getElementById('setSiteSlogan').value.trim(); db.settings.ticker = document.getElementById('setTicker').value.trim(); saveDB(db); addLog('Site ayarları güncellendi'); toast('Ayarlar kaydedildi ✅'); }
function saveSecuritySettings() { const user = document.getElementById('setUsername').value.trim(), pass = document.getElementById('setPassword').value; if (!user) { toast('Kullanıcı adı boş olamaz', 'error'); return; } if (pass && pass.length < 6) { toast('Şifre en az 6 karakter olmalı', 'error'); return; } db.settings.username = user; if (pass) db.settings.password = pass; saveDB(db); addLog('Güvenlik ayarları güncellendi'); toast('Güvenlik güncellendi ✅'); document.getElementById('setPassword').value = ''; }
function checkPwStrength(pw) { const bar = document.getElementById('pwStrengthBar'), txt = document.getElementById('pwStrengthText'); if (!pw) { bar.style.width = '0'; txt.textContent = ''; return; } let score = 0; if (pw.length >= 8) score++; if (pw.length >= 12) score++; if (/[A-Z]/.test(pw)) score++; if (/[0-9]/.test(pw)) score++; if (/[^A-Za-z0-9]/.test(pw)) score++; const levels = [['Çok Zayıf', '#e74c3c'], ['Zayıf', '#e67e22'], ['Orta', '#f1c40f'], ['Güçlü', '#27ae60'], ['Çok Güçlü', '#1abc9c']]; const level = levels[Math.min(score, 4)]; bar.style.cssText = `height:4px;border-radius:2px;margin-top:4px;background:${level[1]};width:${(score / 5 * 100)}%;transition:all 0.3s`; txt.textContent = `Şifre gücü: ${level[0]}`; }

// DATA MANAGEMENT
function exportData() { const json = JSON.stringify(db, null, 2); const blob = new Blob([json], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `haberakis-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); toast('Veriler dışa aktarıldı 📤'); }
function importData(input) { const file = input.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = e => { try { const data = JSON.parse(e.target.result); if (!data.articles || !data.categories) throw new Error('Geçersiz format'); db = data; saveDB(db); buildNav(); renderSettings(); toast(`${data.articles.length} haber içe aktarıldı ✅`); } catch (err) { toast('Dosya okunamadı: ' + err.message, 'error'); } }; reader.readAsText(file); input.value = ''; }
function confirmClearData() { openModal('Tüm Verileri Sil', '<p style="color:var(--red);font-weight:600">⚠️ DİKKAT!</p><p>Tüm veriler silinecek!</p>', `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-danger" onclick="clearAllData()">Sil</button>`); }
function clearAllData() { localStorage.removeItem(DB_KEY); db = getDefaultDB(); saveDB(db); closeModal(); buildNav(); toast('Veriler sıfırlandı', 'warning'); renderSettings(); }

// ============================================================
// NEW ADMIN FEATURES (1-15)
// ============================================================

// 1. COMMENT MANAGEMENT
function renderAdminComments() { db = getDB(); const el = document.getElementById('page-comments'); const comments = db.comments || []; el.innerHTML = `<div class="page-actions"><div><span style="font-size:14px;font-weight:600">Toplam: ${comments.length} yorum · Bekleyen: ${comments.filter(c => c.status === 'pending').length}</span></div></div><div class="articles-table table-wrap"><table class="table"><thead><tr><th>Yazar</th><th>Yorum</th><th>Haber</th><th>Durum</th><th>Tarih</th><th>İşlemler</th></tr></thead><tbody>${comments.length ? comments.map(c => { const art = db.articles.find(a => a.id === c.articleId); return `<tr><td><strong>${esc(c.name)}</strong><br><span style="font-size:11px;color:var(--gray-500)">${esc(c.email)}</span></td><td style="max-width:200px;font-size:13px">${esc(c.text).slice(0, 100)}</td><td style="font-size:12px">${art ? esc(art.title).slice(0, 30) + '...' : 'Silinmiş'}</td><td><span class="comment-status ${c.status === 'approved' ? 'comment-approved' : 'comment-pending'}">${c.status === 'approved' ? '✅ Onaylı' : '⏳ Bekliyor'}</span></td><td style="font-size:12px;font-family:var(--font-mono)">${timeAgo(c.date)}</td><td><div class="table-actions">${c.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="approveComment('${c.id}')">✅</button>` : ''}<button class="btn btn-sm btn-danger" onclick="deleteComment('${c.id}')">🗑️</button></div></td></tr>`; }).join('') : `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💬</div><div class="empty-title">Henüz yorum yok</div></div></td></tr>`}</tbody></table></div>`; }
function approveComment(id) { const c = (db.comments || []).find(x => x.id === id); if (c) { c.status = 'approved'; saveDB(db); addLog('Yorum onaylandı'); toast('Yorum onaylandı ✅'); renderAdminComments(); } }
function deleteComment(id) { db.comments = (db.comments || []).filter(c => c.id !== id); saveDB(db); addLog('Yorum silindi'); toast('Yorum silindi'); renderAdminComments(); }

// 2. MEDIA LIBRARY
function renderMediaLibrary() { const el = document.getElementById('page-media'); const images = new Set(); db.articles.forEach(a => { if (a.image) images.add(a.image); }); const list = [...images]; el.innerHTML = `<div class="page-actions"><div><span style="font-size:14px;font-weight:600">${list.length} görsel</span></div></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px">${list.map(img => `<div style="background:white;border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)"><img src="${esc(img)}" style="width:100%;height:120px;object-fit:cover" loading="lazy" onerror="this.style.display='none'"><div style="padding:10px;font-size:11px;color:var(--gray-500);word-break:break-all">${esc(img).slice(0, 50)}...</div></div>`).join('') || '<div class="empty-state"><div class="empty-icon">🖼️</div><div class="empty-title">Görsel bulunamadı</div></div>'}</div>`; }

// 3. ANALYTICS
function renderAnalytics() { const el = document.getElementById('page-analytics'); const published = db.articles.filter(a => a.status === 'published'); const top10 = [...published].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10); const maxViews = top10[0]?.views || 1; el.innerHTML = `<div class="admin-card" style="margin-bottom:24px"><div class="admin-card-header"><div class="admin-card-title">📊 En Çok Okunan 10 Haber</div></div><div class="admin-card-body">${top10.map((art, i) => `<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span><strong>${i + 1}.</strong> ${esc(art.title).slice(0, 50)}</span><span style="font-weight:700;color:var(--red)">${(art.views || 0).toLocaleString()}</span></div><div style="height:8px;background:var(--gray-100);border-radius:4px"><div style="height:100%;width:${Math.round((art.views || 0) / maxViews * 100)}%;background:linear-gradient(90deg,var(--red),var(--red-light));border-radius:4px;transition:width 0.5s"></div></div></div>`).join('')}</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:18px"><div class="admin-card"><div class="admin-card-header"><div class="admin-card-title">Kategori Bazlı</div></div><div class="admin-card-body">${db.categories.map(cat => { const arts = published.filter(a => a.category === cat.id); const views = arts.reduce((s, a) => s + (a.views || 0), 0); return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13px"><span style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:${cat.color}"></span>${cat.name}</span><span>${arts.length} haber · ${views.toLocaleString()} okuma</span></div>`; }).join('')}</div></div><div class="admin-card"><div class="admin-card-header"><div class="admin-card-title">Genel İstatistikler</div></div><div class="admin-card-body"><div style="display:flex;flex-direction:column;gap:12px"><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)"><span>Toplam Haber</span><strong>${db.articles.length}</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)"><span>Yorumlar</span><strong>${(db.comments || []).length}</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)"><span>Aboneler</span><strong>${(db.newsletter || []).length}</strong></div><div style="display:flex;justify-content:space-between;padding:8px 0"><span>Kategoriler</span><strong>${db.categories.length}</strong></div></div></div></div></div>`; }

// 4. SEO MANAGER
function renderSEO() { const el = document.getElementById('page-seo'); el.innerHTML = `<div class="settings-section"><div class="settings-title">🔍 SEO Ayarları</div><div class="form-grid-2"><div class="form-group"><label class="form-label">Sitemap URL</label><input type="text" class="form-control" value="/sitemap.xml" disabled><div class="form-hint">Otomatik oluşturulur</div></div><div class="form-group"><label class="form-label">Robots.txt</label><input type="text" class="form-control" value="User-agent: * Allow: /" disabled></div><div class="form-group form-full"><label class="form-label">Meta Açıklama (Ana Sayfa)</label><textarea class="form-control" id="seoDesc" rows="3" placeholder="Site açıklaması...">${esc(db.settings.seoDescription || 'HaberAkış - Türkiye\'nin güvenilir haber kaynağı. Güncel haberler, son dakika gelişmeleri.')}</textarea></div><div class="form-group form-full"><label class="form-label">Meta Anahtar Kelimeler</label><input type="text" class="form-control" id="seoKeywords" value="${esc(db.settings.seoKeywords || 'haber, son dakika, güncel, türkiye, dünya')}" placeholder="haber, son dakika..."></div></div><button class="btn btn-primary" style="margin-top:16px" onclick="saveSEO()">💾 Kaydet</button></div>`; }
function saveSEO() { db.settings.seoDescription = document.getElementById('seoDesc').value.trim(); db.settings.seoKeywords = document.getElementById('seoKeywords').value.trim(); saveDB(db); addLog('SEO ayarları güncellendi'); toast('SEO ayarları kaydedildi ✅'); }

// 5. ADS MANAGER
function renderAdsManager() { const el = document.getElementById('page-ads'); el.innerHTML = `<div class="settings-section"><div class="settings-title">📢 Reklam Yönetimi</div><div class="toggle-row"><div><div class="toggle-label">Reklamları Göster</div><div class="toggle-sub">Tüm reklam alanlarını aç/kapa</div></div><label class="toggle"><input type="checkbox" id="adsToggle" ${db.settings.adsEnabled ? 'checked' : ''} onchange="toggleAds()"><span class="toggle-slider"></span></label></div><div class="form-group" style="margin-top:20px"><label class="form-label">AdSense Publisher ID</label><input type="text" class="form-control" id="adsenseId" value="${esc(db.settings.adSenseCode || '')}" placeholder="ca-pub-XXXXXXXXXXXXXXXX"></div><button class="btn btn-primary" style="margin-top:12px" onclick="saveAds()">💾 Kaydet</button></div>`; }
function toggleAds() { db.settings.adsEnabled = document.getElementById('adsToggle').checked; saveDB(db); toast(db.settings.adsEnabled ? 'Reklamlar açıldı' : 'Reklamlar kapatıldı'); }
function saveAds() { db.settings.adSenseCode = document.getElementById('adsenseId').value.trim(); saveDB(db); addLog('Reklam ayarları güncellendi'); toast('Reklam ayarları kaydedildi ✅'); }

// 6. USERS
function renderUsers() { const el = document.getElementById('page-users'); const users = db.users || []; el.innerHTML = `<div class="page-actions"><div></div><button class="btn btn-primary" onclick="showAddUserModal()">+ Kullanıcı Ekle</button></div><div class="articles-table table-wrap"><table class="table"><thead><tr><th>Ad</th><th>Kullanıcı Adı</th><th>Rol</th><th>İşlem</th></tr></thead><tbody>${users.map(u => `<tr><td><strong>${esc(u.name)}</strong></td><td>${esc(u.username)}</td><td><span class="badge badge-blue">${u.role}</span></td><td>${u.username !== 'admin' ? `<button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')">🗑️</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`; }
function showAddUserModal() { openModal('Yeni Kullanıcı', `<div class="form-group"><label class="form-label">Ad Soyad</label><input type="text" class="form-control" id="newUserName" placeholder="Ad Soyad"></div><div class="form-group"><label class="form-label">Kullanıcı Adı</label><input type="text" class="form-control" id="newUserUsername"></div><div class="form-group"><label class="form-label">Şifre</label><input type="password" class="form-control" id="newUserPass"></div><div class="form-group"><label class="form-label">Rol</label><select class="form-control" id="newUserRole"><option value="admin">Admin</option><option value="editor">Editör</option></select></div>`, `<button class="btn btn-secondary" onclick="closeModal()">İptal</button><button class="btn btn-primary" onclick="addUser()">Ekle</button>`); }
function addUser() { const name = document.getElementById('newUserName').value.trim(), username = document.getElementById('newUserUsername').value.trim(), pass = document.getElementById('newUserPass').value, role = document.getElementById('newUserRole').value; if (!name || !username || !pass) { toast('Tüm alanlar zorunlu', 'error'); return; } if (!db.users) db.users = []; db.users.push({ id: uid(), name, username, password: pass, role }); saveDB(db); closeModal(); addLog('Kullanıcı eklendi: ' + username); toast('Kullanıcı eklendi ✅'); renderUsers(); }
function deleteUser(id) { db.users = (db.users || []).filter(u => u.id !== id); saveDB(db); addLog('Kullanıcı silindi'); toast('Kullanıcı silindi'); renderUsers(); }

// 16. MENUS
function renderMenus() { db = getDB(); const el = document.getElementById('page-menus'); if (!db.settings.headerLinks) db.settings.headerLinks = [{ label: 'Hakkımızda', url: '#hakkimizda' }, { label: 'İletişim', url: '#iletisim' }]; if (!db.settings.footerLinks) db.settings.footerLinks = [{ label: 'Gizlilik', url: '#gizlilik' }, { label: 'Şartlar', url: '#sartlar' }]; el.innerHTML = `<div class="settings-section"><div class="settings-title">🔗 Header Menü Linkleri</div><div id="headerLinksContainer" style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px"></div><button class="btn btn-sm btn-secondary" onclick="addMenuLink('header')">+ Link Ekle</button></div><div class="settings-section"><div class="settings-title">🔗 Footer Alt Linkleri</div><div id="footerLinksContainer" style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px"></div><button class="btn btn-sm btn-secondary" onclick="addMenuLink('footer')">+ Link Ekle</button></div><button class="btn btn-primary" onclick="saveMenus()">💾 Menüleri Kaydet</button>`; drawMenuLinks(); }
function drawMenuLinks() { const h = document.getElementById('headerLinksContainer'), f = document.getElementById('footerLinksContainer'); h.innerHTML = db.settings.headerLinks.map((l, i) => `<div style="display:flex;gap:10px;align-items:center"><span style="cursor:move;color:var(--gray-500)">☰</span><input type="text" class="form-control" placeholder="Başlık" value="${esc(l.label)}" onchange="db.settings.headerLinks[${i}].label=this.value"><input type="text" class="form-control" placeholder="URL" value="${esc(l.url)}" onchange="db.settings.headerLinks[${i}].url=this.value"><button class="btn btn-sm btn-danger" onclick="removeMenuLink('header', ${i})">X</button></div>`).join(''); f.innerHTML = db.settings.footerLinks.map((l, i) => `<div style="display:flex;gap:10px;align-items:center"><span style="cursor:move;color:var(--gray-500)">☰</span><input type="text" class="form-control" placeholder="Başlık" value="${esc(l.label)}" onchange="db.settings.footerLinks[${i}].label=this.value"><input type="text" class="form-control" placeholder="URL" value="${esc(l.url)}" onchange="db.settings.footerLinks[${i}].url=this.value"><button class="btn btn-sm btn-danger" onclick="removeMenuLink('footer', ${i})">X</button></div>`).join(''); }
function addMenuLink(type) { if (type === 'header') db.settings.headerLinks.push({ label: 'Yeni Link', url: '#' }); else db.settings.footerLinks.push({ label: 'Yeni Link', url: '#' }); drawMenuLinks(); }
function removeMenuLink(type, idx) { if (type === 'header') db.settings.headerLinks.splice(idx, 1); else db.settings.footerLinks.splice(idx, 1); drawMenuLinks(); }
function saveMenus() { saveDB(db); toast('Menüler kaydedildi ✅'); }

// 7. NOTIFICATIONS
function renderNotifications() { const el = document.getElementById('page-notifications'); el.innerHTML = `<div class="settings-section"><div class="settings-title">🔔 Bildirim Gönder</div><div class="form-group"><label class="form-label">Bildirim Metni</label><input type="text" class="form-control" id="notifText" placeholder="Bildirim mesajı..."></div><div class="form-group"><label class="form-label">Tür</label><select class="form-control" id="notifType"><option value="info">Bilgi</option><option value="warning">Uyarı</option><option value="success">Başarı</option></select></div><button class="btn btn-primary" onclick="sendNotification()">📤 Gönder</button></div><div class="admin-card" style="margin-top:24px"><div class="admin-card-header"><div class="admin-card-title">Son Bildirimler</div></div><div class="admin-card-body">${(db.notifications || []).slice(0, 10).map(n => `<div style="padding:10px 0;border-bottom:1px solid var(--gray-100);font-size:13px"><strong>${n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}</strong> ${esc(n.text)} <span style="float:right;font-size:11px;color:var(--gray-500)">${timeAgo(n.date)}</span></div>`).join('') || '<div style="text-align:center;color:var(--gray-500);padding:20px">Bildirim yok</div>'}</div></div>`; }
function sendNotification() { const text = document.getElementById('notifText').value.trim(), type = document.getElementById('notifType').value; if (!text) { toast('Metin gerekli', 'error'); return; } if (!db.notifications) db.notifications = []; db.notifications.unshift({ id: uid(), text, type, date: new Date().toISOString() }); saveDB(db); toast('Bildirim gönderildi ✅'); document.getElementById('notifText').value = ''; renderNotifications(); }

// 8. THEME SETTINGS
function renderThemeSettings() { const el = document.getElementById('page-theme'); el.innerHTML = `<div class="settings-section"><div class="settings-title">🎨 Tema Ayarları</div><div class="form-grid-2"><div class="form-group"><label class="form-label">Ana Renk</label><input type="color" class="form-control" id="themeColor" value="${db.settings.themeColor || '#c0392b'}" style="height:44px;cursor:pointer"></div><div class="form-group"><label class="form-label">Font Boyutu (px)</label><input type="number" class="form-control" id="themeFontSize" value="${db.settings.fontSize || 18}" min="14" max="24"></div></div><div class="toggle-row"><div><div class="toggle-label">Karanlık Mod (Varsayılan)</div><div class="toggle-sub">Site varsayılan olarak karanlık modda açılsın</div></div><label class="toggle"><input type="checkbox" id="themeDarkDefault" ${db.settings.darkMode ? 'checked' : ''}><span class="toggle-slider"></span></label></div><button class="btn btn-primary" style="margin-top:20px" onclick="saveTheme()">💾 Kaydet</button></div>`; }
function saveTheme() { db.settings.themeColor = document.getElementById('themeColor').value; db.settings.fontSize = parseInt(document.getElementById('themeFontSize').value) || 18; db.settings.darkMode = document.getElementById('themeDarkDefault').checked; saveDB(db); addLog('Tema ayarları güncellendi'); toast('Tema kaydedildi ✅'); }

// 9. SCHEDULED ARTICLES
function renderScheduled() { const el = document.getElementById('page-scheduled'); const scheduled = db.articles.filter(a => a.scheduledDate && new Date(a.scheduledDate) > new Date()); el.innerHTML = `<div class="page-actions"><div><span style="font-size:14px;font-weight:600">${scheduled.length} zamanlanmış haber</span></div></div><div class="articles-table table-wrap"><table class="table"><thead><tr><th>Başlık</th><th>Kategori</th><th>Yayın Tarihi</th><th>İşlem</th></tr></thead><tbody>${scheduled.length ? scheduled.map(a => `<tr><td><strong>${esc(a.title)}</strong></td><td><span class="badge" style="background:${getCatColor(a.category)};color:white">${getCatName(a.category)}</span></td><td style="font-family:var(--font-mono);font-size:12px">${formatDate(a.scheduledDate)}</td><td><button class="btn btn-sm btn-success" onclick="publishNow('${a.id}')">▶ Şimdi Yayınla</button></td></tr>`).join('') : `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">Zamanlanmış haber yok</div></div></td></tr>`}</tbody></table></div>`; }
function publishNow(id) { const art = db.articles.find(a => a.id === id); if (art) { art.status = 'published'; art.date = new Date().toISOString(); delete art.scheduledDate; saveDB(db); addLog('Haber yayınlandı: ' + art.title); toast('Haber yayınlandı ✅'); renderScheduled(); } }

// 10. ACTIVITY LOG
function renderActivityLog() { const el = document.getElementById('page-activityLog'); const logs = db.activityLog || []; el.innerHTML = `<div class="page-actions"><div><span style="font-size:14px;font-weight:600">${logs.length} kayıt</span></div><button class="btn btn-danger btn-sm" onclick="clearLogs()">🗑️ Temizle</button></div><div class="admin-card"><div class="admin-card-body">${logs.slice(0, 50).map(l => `<div style="padding:10px 0;border-bottom:1px solid var(--gray-100);display:flex;justify-content:space-between;font-size:13px"><span>👤 <strong>${esc(l.user)}</strong> — ${esc(l.action)}</span><span style="font-size:11px;color:var(--gray-500);font-family:var(--font-mono)">${timeAgo(l.date)}</span></div>`).join('') || '<div style="text-align:center;padding:30px;color:var(--gray-500)">Kayıt yok</div>'}</div></div>`; }
function clearLogs() { db.activityLog = []; saveDB(db); toast('Günlük temizlendi'); renderActivityLog(); }

// 11. LANGUAGE (placeholder)
// 12. SOCIAL MEDIA SETTINGS
function renderSocialSettings() { const el = document.getElementById('page-socialSettings'); const social = db.settings.socialLinks || {}; el.innerHTML = `<div class="settings-section"><div class="settings-title">📱 Sosyal Medya Hesapları</div><div class="form-grid-2"><div class="form-group"><label class="form-label">Twitter / X</label><input type="text" class="form-control" id="socialTwitter" value="${esc(social.twitter || '')}" placeholder="https://twitter.com/..."></div><div class="form-group"><label class="form-label">Instagram</label><input type="text" class="form-control" id="socialInstagram" value="${esc(social.instagram || '')}" placeholder="https://instagram.com/..."></div><div class="form-group"><label class="form-label">Facebook</label><input type="text" class="form-control" id="socialFacebook" value="${esc(social.facebook || '')}" placeholder="https://facebook.com/..."></div><div class="form-group"><label class="form-label">YouTube</label><input type="text" class="form-control" id="socialYoutube" value="${esc(social.youtube || '')}" placeholder="https://youtube.com/..."></div><div class="form-group"><label class="form-label">RSS</label><input type="text" class="form-control" id="socialRss" value="${esc(social.rss || '')}" placeholder="/rss.xml"></div></div><button class="btn btn-primary" style="margin-top:16px" onclick="saveSocial()">💾 Kaydet</button></div><div class="settings-section"><div class="settings-title">📢 Duyuru Barı</div><div class="toggle-row"><div><div class="toggle-label">Duyuru Barını Göster</div></div><label class="toggle"><input type="checkbox" id="announceToggle" ${db.settings.announcementActive ? 'checked' : ''}><span class="toggle-slider"></span></label></div><div class="form-group" style="margin-top:12px"><label class="form-label">Duyuru Metni</label><input type="text" class="form-control" id="announceText" value="${esc(db.settings.announcement || '')}" placeholder="Duyuru metni..."></div><button class="btn btn-primary" style="margin-top:12px" onclick="saveAnnouncement()">💾 Kaydet</button></div>`; }
function saveSocial() { db.settings.socialLinks = { twitter: document.getElementById('socialTwitter').value.trim(), instagram: document.getElementById('socialInstagram').value.trim(), facebook: document.getElementById('socialFacebook').value.trim(), youtube: document.getElementById('socialYoutube').value.trim(), rss: document.getElementById('socialRss').value.trim() }; saveDB(db); addLog('Sosyal medya ayarları güncellendi'); toast('Sosyal medya kaydedildi ✅'); }
function saveAnnouncement() { db.settings.announcementActive = document.getElementById('announceToggle').checked; db.settings.announcement = document.getElementById('announceText').value.trim(); saveDB(db); addLog('Duyuru güncellendi'); toast('Duyuru kaydedildi ✅'); }

// 13. BULK OPERATIONS
function renderBulkOps() { const el = document.getElementById('page-bulkOps'); el.innerHTML = `<div class="settings-section"><div class="settings-title">⚡ Toplu Haber İşlemleri</div><p style="font-size:13px;color:var(--gray-500);margin-bottom:16px">Haberler sayfasında checkbox ile seçim yapın, ardından buradan toplu işlem uygulayın.</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px"><button class="btn btn-success" onclick="bulkAction('publish')">▶ Seçilenleri Yayınla (${selectedArticles.size})</button><button class="btn btn-secondary" onclick="bulkAction('draft')">↩ Seçilenleri Taslağa Al (${selectedArticles.size})</button><button class="btn btn-danger" onclick="bulkAction('delete')">🗑️ Seçilenleri Sil (${selectedArticles.size})</button></div><div class="form-hint">Seçili haber sayısı: <strong>${selectedArticles.size}</strong></div></div>`; }
function bulkAction(action) { if (!selectedArticles.size) { toast('Haber seçin', 'error'); return; } if (action === 'delete') { db.articles = db.articles.filter(a => !selectedArticles.has(a.id)); addLog(`${selectedArticles.size} haber silindi (toplu)`); } else { db.articles.forEach(a => { if (selectedArticles.has(a.id)) a.status = action === 'publish' ? 'published' : 'draft'; }); addLog(`${selectedArticles.size} haber ${action === 'publish' ? 'yayınlandı' : 'taslağa alındı'} (toplu)`); } saveDB(db); selectedArticles.clear(); toast('Toplu işlem tamamlandı ✅'); showAdminPage('articles'); }

// 14. CONTENT CALENDAR
function renderContentCalendar() { const el = document.getElementById('page-contentCalendar'); const now = new Date(); const year = now.getFullYear(), month = now.getMonth(); const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate(); const monthName = now.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }); const artByDay = {}; db.articles.forEach(a => { const d = new Date(a.date); if (d.getFullYear() === year && d.getMonth() === month) { const day = d.getDate(); if (!artByDay[day]) artByDay[day] = []; artByDay[day].push(a); } }); const startDay = (firstDay + 6) % 7; let cal = '';['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach(d => { cal += `<div class="calendar-day-name">${d}</div>`; }); for (let i = 0; i < startDay; i++)cal += `<div class="calendar-day empty"></div>`; for (let d = 1; d <= daysInMonth; d++) { const arts = artByDay[d] || []; cal += `<div class="calendar-day ${arts.length ? 'has-articles' : ''}" title="${arts.length} haber" style="position:relative">${d}${arts.length ? `<div style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:6px;height:6px;border-radius:50%;background:var(--red)"></div>` : ''}</div>`; } el.innerHTML = `<div class="admin-card"><div class="admin-card-header"><div class="admin-card-title">📅 ${monthName} — İçerik Takvimi</div></div><div class="admin-card-body"><div class="calendar-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">${cal}</div></div></div>`; }

// 15. LIVE PREVIEW
function renderLivePreview() { const el = document.getElementById('page-livePreview'); const title = document.getElementById('artTitle')?.value || 'Örnek Başlık'; const summary = document.getElementById('artSummary')?.value || 'Haber özeti burada görünecek...'; const image = document.getElementById('artImage')?.value || 'https://picsum.photos/800/450'; el.innerHTML = `<div class="settings-section"><div class="settings-title">👁️ Canlı Önizleme</div><p style="font-size:13px;color:var(--gray-500);margin-bottom:20px">Haber yazma sayfasındaki içerik burada önizlenir.</p><div style="max-width:600px;border:2px solid var(--gray-300);border-radius:8px;overflow:hidden"><img src="${esc(image)}" style="width:100%;height:250px;object-fit:cover" onerror="this.style.display='none'"><div style="padding:20px"><div style="font-family:var(--font-display);font-size:24px;font-weight:900;margin-bottom:8px">${esc(title)}</div><div style="font-size:14px;color:var(--gray-700);line-height:1.6">${esc(summary)}</div><div style="margin-top:12px;font-size:12px;color:var(--gray-500);font-family:var(--font-mono)">Editör · Az önce · 📖 1 dk</div></div></div></div>`; }

// ============================================================
// NEW ADMIN FEATURES (5 new: 16-20)
// ============================================================

// 16. SYSTEM HEALTH MONITOR
function renderSystemHealth() {
  const el = document.getElementById('page-systemHealth');
  if (!el) return;
  const dbSize = new Blob([JSON.stringify(db)]).size;
  const maxSize = 5 * 1024 * 1024; // 5MB localStorage limit
  const usagePct = Math.round(dbSize / maxSize * 100);
  const rssFeeds = db.rssFeeds || [];
  const activeFeeds = rssFeeds.filter(f => f.active).length;
  const errorFeeds = rssFeeds.filter(f => f.lastError).length;
  const totalViews = db.articles.reduce((s, a) => s + (a.views || 0), 0);
  const avgViews = db.articles.length ? Math.round(totalViews / db.articles.length) : 0;
  const autoFetched = db.articles.filter(a => a.autoFetched).length;

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">💾</div><div class="stat-value">${(dbSize / 1024).toFixed(1)} KB</div><div class="stat-label">Veritabanı Boyutu</div></div>
      <div class="stat-card blue"><div class="stat-icon">📡</div><div class="stat-value">${activeFeeds}/${rssFeeds.length}</div><div class="stat-label">Aktif RSS Kaynağı</div></div>
      <div class="stat-card ${errorFeeds ? '' : 'green'}"><div class="stat-icon">${errorFeeds ? '⚠️' : '✅'}</div><div class="stat-value">${errorFeeds}</div><div class="stat-label">RSS Hata</div></div>
      <div class="stat-card orange"><div class="stat-icon">🤖</div><div class="stat-value">${autoFetched}</div><div class="stat-label">Otomatik Çekilen</div></div>
    </div>
    <div class="settings-section"><div class="settings-title">💾 Depolama Durumu</div>
      <div style="margin-bottom:4px;font-size:13px;display:flex;justify-content:space-between"><span>localStorage Kullanım (${(dbSize / 1024).toFixed(1)} KB / ${(maxSize / 1024 / 1024).toFixed(0)} MB)</span><span>${usagePct}%</span></div>
      <div style="height:12px;background:var(--gray-100);border-radius:6px;overflow:hidden"><div style="height:100%;width:${usagePct}%;background:${usagePct > 80 ? 'var(--red)' : usagePct > 50 ? 'var(--accent)' : 'var(--green)'};border-radius:6px;transition:width 0.5s"></div></div>
      ${usagePct > 80 ? '<div style="color:var(--red);font-size:12px;margin-top:8px">⚠️ Depolama dolmak üzere! Eski haberleri arşivleyiniz.</div>' : ''}
    </div>
    <div class="settings-section"><div class="settings-title">📊 Genel Sağlık</div>
      <div class="toggle-row"><span>Toplam Haber</span><strong>${db.articles.length}</strong></div>
      <div class="toggle-row"><span>Ortalama Görüntülenme</span><strong>${avgViews}</strong></div>
      <div class="toggle-row"><span>Toplam Yorum</span><strong>${(db.comments || []).length}</strong></div>
      <div class="toggle-row"><span>Abone Sayısı</span><strong>${(db.newsletter || []).length}</strong></div>
      <div class="toggle-row"><span>Favori Sayısı</span><strong>${(db.favorites || []).length}</strong></div>
      <div class="toggle-row"><span>Okuma Geçmişi</span><strong>${(db.readingHistory || []).length}</strong></div>
    </div>`;
}

// 17. ARTICLE ARCHIVER — eski haberleri arşivle
function renderArchiver() {
  const el = document.getElementById('page-archiver');
  if (!el) return;
  const now = Date.now();
  const day30 = 30 * 24 * 60 * 60 * 1000;
  const oldArticles = db.articles.filter(a => (now - new Date(a.date).getTime()) > day30);
  const lowViewArticles = db.articles.filter(a => (a.views || 0) < 10 && a.status === 'published');

  el.innerHTML = `
    <div class="settings-section"><div class="settings-title">🗄️ Haber Arşivleyici</div>
      <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px">Eski ve az okunan haberleri arşivleyerek depolama alanı açın.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        <div class="admin-card"><div class="admin-card-body" style="text-align:center;padding:20px">
          <div style="font-size:36px;margin-bottom:8px">📦</div>
          <div style="font-size:32px;font-weight:900;font-family:var(--font-display)">${oldArticles.length}</div>
          <div style="font-size:13px;color:var(--gray-500)">30 günden eski haber</div>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px" onclick="archiveOldArticles(30)">🗑️ Taslağa Al</button>
        </div></div>
        <div class="admin-card"><div class="admin-card-body" style="text-align:center;padding:20px">
          <div style="font-size:36px;margin-bottom:8px">👀</div>
          <div style="font-size:32px;font-weight:900;font-family:var(--font-display)">${lowViewArticles.length}</div>
          <div style="font-size:13px;color:var(--gray-500)">10'dan az okunan haber</div>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px" onclick="archiveLowViewArticles(10)">🗑️ Taslağa Al</button>
        </div></div>
      </div>
    </div>`;
}
function archiveOldArticles(days) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  let count = 0;
  db.articles.forEach(a => { if (new Date(a.date).getTime() < cutoff && a.status === 'published') { a.status = 'draft'; count++; } });
  saveDB(db); addLog(`${count} eski haber arşivlendi`); toast(`${count} haber taslağa alındı`); renderArchiver();
}
function archiveLowViewArticles(minViews) {
  let count = 0;
  db.articles.forEach(a => { if ((a.views || 0) < minViews && a.status === 'published') { a.status = 'draft'; count++; } });
  saveDB(db); addLog(`${count} az okunan haber arşivlendi`); toast(`${count} haber taslağa alındı`); renderArchiver();
}

// 18. DUPLICATE DETECTION
function renderDuplicateDetector() {
  const el = document.getElementById('page-duplicates');
  if (!el) return;
  const clean = t => (t || '').toLowerCase().replace(/[^a-zçğıöşü0-9]/g, '');
  const duplicates = [];
  const seen = {};
  db.articles.forEach(a => {
    const key = clean(a.title).slice(0, 50);
    if (seen[key]) { duplicates.push({ original: seen[key], duplicate: a }); }
    else { seen[key] = a; }
  });

  el.innerHTML = `<div class="settings-section"><div class="settings-title">🔍 Duplicate Haber Tespit</div>
    <p style="font-size:13px;color:var(--gray-500);margin-bottom:16px">Benzer başlıklı haberleri tespit eder.</p>
    ${duplicates.length ? `<div style="margin-bottom:12px;color:var(--red);font-weight:600">⚠️ ${duplicates.length} olası kopya bulundu</div>` : '<div style="color:var(--green);font-weight:600;margin-bottom:16px">✅ Kopya haber tespit edilmedi</div>'}
    <div class="articles-table table-wrap"><table class="table"><thead><tr><th>Orijinal</th><th>Kopya</th><th>İşlem</th></tr></thead><tbody>
    ${duplicates.map(d => `<tr>
      <td style="font-size:12px">${esc(d.original.title).slice(0, 40)}... <span style="color:var(--gray-500)">(${timeAgo(d.original.date)})</span></td>
      <td style="font-size:12px">${esc(d.duplicate.title).slice(0, 40)}... <span style="color:var(--gray-500)">(${timeAgo(d.duplicate.date)})</span></td>
      <td><button class="btn btn-sm btn-danger" onclick="confirmDelete('${d.duplicate.id}');renderDuplicateDetector()">🗑️ Kopyayı Sil</button></td>
    </tr>`).join('') || '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gray-500)">Kopya bulunamadı ✅</td></tr>'}
    </tbody></table></div>
    <button class="btn btn-primary" style="margin-top:16px" onclick="renderDuplicateDetector()">🔄 Tekrar Tara</button>
  </div>`;
}

// 19. READER STATS DASHBOARD
function renderReaderStats() {
  const el = document.getElementById('page-readerStats');
  if (!el) return;
  const history = db.readingHistory || [];
  const favCount = (db.favorites || []).length;
  const subscribers = (db.newsletter || []).length;
  const catViews = {};
  db.articles.forEach(a => { catViews[a.category] = (catViews[a.category] || 0) + (a.views || 0); });
  const topCat = Object.entries(catViews).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topAuthors = {};
  db.articles.forEach(a => { const n = a.author || 'Editör'; topAuthors[n] = (topAuthors[n] || 0) + (a.views || 0); });
  const topAuth = Object.entries(topAuthors).sort((a, b) => b[1] - a[1]).slice(0, 5);

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📖</div><div class="stat-value">${history.length}</div><div class="stat-label">Okuma Geçmişi</div></div>
      <div class="stat-card green"><div class="stat-icon">❤️</div><div class="stat-value">${favCount}</div><div class="stat-label">Favori</div></div>
      <div class="stat-card blue"><div class="stat-icon">📧</div><div class="stat-value">${subscribers}</div><div class="stat-label">E-posta Abonesi</div></div>
      <div class="stat-card orange"><div class="stat-icon">🗳️</div><div class="stat-value">${(db.polls || []).reduce((s, p) => s + p.votes.reduce((a, b) => a + b, 0), 0)}</div><div class="stat-label">Anket Katılımı</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      <div class="admin-card"><div class="admin-card-header"><div class="admin-card-title">📊 Kategori Bazlı Okunma</div></div><div class="admin-card-body">
        ${topCat.map(([cat, views]) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13px"><span>${getCatName(cat)}</span><strong>${views.toLocaleString()}</strong></div>`).join('')}
      </div></div>
      <div class="admin-card"><div class="admin-card-header"><div class="admin-card-title">✍ En Çok Okunan Yazarlar</div></div><div class="admin-card-body">
        ${topAuth.map(([name, views]) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100);font-size:13px"><span>${esc(name)}</span><strong>${views.toLocaleString()}</strong></div>`).join('')}
      </div></div>
    </div>`;
}

// 20. KEYBOARD SHORTCUTS HELP
function renderShortcuts() {
  const el = document.getElementById('page-shortcuts');
  if (!el) return;
  el.innerHTML = `<div class="settings-section"><div class="settings-title">⌨️ Kısayollar & Yardım</div>
    <p style="font-size:13px;color:var(--gray-500);margin-bottom:20px">Admin paneli kısayolları ve hızlı eylemler</p>
    <div class="articles-table"><table class="table"><thead><tr><th>Kısayol</th><th>İşlev</th></tr></thead><tbody>
      <tr><td><kbd>D</kbd></td><td>Dashboard'a git</td></tr>
      <tr><td><kbd>N</kbd></td><td>Yeni haber yaz</td></tr>
      <tr><td><kbd>A</kbd></td><td>Haber listesine git</td></tr>
      <tr><td><kbd>R</kbd></td><td>RSS sayfasına git</td></tr>
      <tr><td><kbd>S</kbd></td><td>Ayarlara git</td></tr>
      <tr><td><kbd>Esc</kbd></td><td>Modal kapat</td></tr>
    </tbody></table></div>
    <div style="margin-top:20px"><button class="btn btn-primary" onclick="window.location.href='index.php'">🌐 Siteye Git</button>
    <button class="btn btn-secondary" onclick="exportData()">📤 Yedek Al</button></div>
  </div>`;
}

// Keyboard shortcuts for admin
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (!adminLoggedIn) return;
  const shortcuts = { d: 'dash', n: 'newArticle', a: 'articles', r: 'rss', s: 'settings' };
  if (shortcuts[e.key.toLowerCase()] && !e.ctrlKey && !e.altKey) { e.preventDefault(); showAdminPage(shortcuts[e.key.toLowerCase()]); }
});
