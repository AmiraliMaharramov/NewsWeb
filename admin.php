<?php
$dbFile = __DIR__ . '/data/db.json';
$serverDb = '{}';
if (file_exists($dbFile)) {
    $serverDb = file_get_contents($dbFile);
}
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HaberAkış — Yönetici Paneli</title>
    <!-- Admin PHP Data Injection -->
    <script>
        try {
            window.SERVER_DB = <?php echo $serverDb ?: "null"; ?>;
            if (Object.keys(window.SERVER_DB || {}).length === 0) window.SERVER_DB = null;
            // Prevent caching issues
            window.SERVER_FETCH_TIME = Date.now();
        } catch(e) { window.SERVER_DB = null; }
    </script>
    <meta name="robots" content="noindex, nofollow">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Serif+4:opsz,wght@8..60,300;400;600&family=JetBrains+Mono:wght@400;600&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* Admin-specific overrides */
        #page-admin {
            min-height: 100vh;
        }

        .admin-login {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .admin-login::before {
            content: ''; position: absolute; width: 500px; height: 500px;
            background: rgba(192, 57, 43, 0.3); border-radius: 50%;
            filter: blur(100px); top: -150px; left: -150px; z-index: 1;
        }
        .admin-login::after {
            content: ''; position: absolute; width: 400px; height: 400px;
            background: rgba(52, 152, 219, 0.3); border-radius: 50%;
            filter: blur(80px); bottom: -100px; right: -100px; z-index: 1;
        }

        .login-box {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 24px;
            padding: 48px 40px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 16px 40px 0 rgba(31, 38, 135, 0.1);
            position: relative;
            z-index: 2;
        }

        .login-logo {
            font-family: var(--font-display);
            font-size: 34px;
            font-weight: 900;
            color: var(--black);
            margin-bottom: 6px;
            text-align: center;
        }

        .login-logo span {
            color: var(--red);
        }

        .login-sub {
            font-size: 13px;
            color: var(--gray-500);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 32px;
            text-align: center;
        }

        .form-group {
            margin-bottom: 18px;
        }

        .form-label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--gray-700);
            margin-bottom: 6px;
        }

        .form-control {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid var(--gray-300);
            border-radius: var(--radius);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
            font-family: inherit;
        }

        .form-control:focus {
            border-color: var(--red);
        }

        textarea.form-control {
            resize: vertical;
            min-height: 100px;
        }

        .form-hint {
            font-size: 11px;
            color: var(--gray-500);
            margin-top: 4px;
        }

        .form-error {
            font-size: 12px;
            color: var(--red);
            margin-top: 8px;
        }

        .login-error {
            background: #ffeaea;
            border: 1px solid #ffaaaa;
            color: var(--red);
            padding: 10px 14px;
            border-radius: var(--radius);
            font-size: 13px;
            margin-bottom: 16px;
        }

        .admin-layout {
            display: flex;
            min-height: 100vh;
            background: #f4f6f8;
        }

        .admin-sidebar {
            width: 250px;
            background: #111827;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
        }

        .admin-logo {
            padding: 20px 20px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-logo-text {
            font-family: var(--font-display);
            font-size: 20px;
            font-weight: 900;
            color: white;
        }

        .admin-logo-text span {
            color: var(--red);
        }

        .admin-logo-sub {
            font-size: 10px;
            color: var(--gray-500);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .admin-nav {
            flex: 1;
            padding: 12px 0;
            overflow-y: auto;
        }

        .admin-nav-section {
            font-size: 10px;
            color: var(--gray-500);
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px 20px 6px;
        }

        .admin-nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            color: var(--gray-300);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .admin-nav-item:hover {
            background: rgba(255, 255, 255, 0.08);
            color: white;
        }

        .admin-nav-item.active {
            background: var(--red);
            color: white;
        }

        .admin-nav-item .nav-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
        }

        .admin-nav-item .nav-badge {
            margin-left: auto;
            background: var(--red);
            color: white;
            font-size: 10px;
            padding: 1px 6px;
            border-radius: 10px;
        }

        .admin-nav-item.active .nav-badge {
            background: rgba(255, 255, 255, 0.3);
        }

        .admin-footer-nav {
            padding: 12px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-content {
            flex: 1;
            overflow: auto;
        }

        .admin-topbar {
            background: white;
            padding: 0 28px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--gray-100);
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: var(--shadow-sm);
        }

        .admin-topbar-title {
            font-family: var(--font-display);
            font-size: 20px;
            font-weight: 700;
            color: var(--black);
        }

        .admin-topbar-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .admin-user {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .admin-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: var(--red);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
        }

        .admin-username {
            font-size: 13px;
            font-weight: 600;
            color: var(--gray-700);
        }

        .admin-page {
            padding: 28px;
            display: none;
        }

        .admin-page.active {
            display: block;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 18px;
            margin-bottom: 28px;
        }

        .stat-card {
            background: white;
            border-radius: var(--radius-lg);
            padding: 24px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.03);
            border-left: 4px solid var(--red);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 24px rgba(0,0,0,0.06);
        }

        .stat-card.blue {
            border-left-color: var(--blue);
        }

        .stat-card.green {
            border-left-color: var(--green);
        }

        .stat-card.orange {
            border-left-color: var(--accent);
        }

        .stat-icon {
            font-size: 28px;
            margin-bottom: 8px;
        }

        .stat-value {
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 900;
            color: var(--black);
            line-height: 1;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 13px;
            color: var(--gray-500);
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 24px;
        }

        .admin-card {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 16px rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.03);
            overflow: hidden;
        }

        .admin-card-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--gray-100);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .admin-card-title {
            font-family: var(--font-display);
            font-size: 16px;
            font-weight: 700;
            color: var(--black);
        }

        .admin-card-body {
            padding: 16px 20px;
        }

        .recent-article {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid var(--gray-100);
        }

        .recent-article:last-child {
            border-bottom: none;
        }

        .recent-img {
            width: 56px;
            height: 42px;
            object-fit: cover;
            border-radius: var(--radius);
            background: var(--gray-100);
            flex-shrink: 0;
        }

        .recent-info {
            flex: 1;
        }

        .recent-title {
            font-size: 13px;
            font-weight: 600;
            line-height: 1.3;
            color: var(--black);
            margin-bottom: 3px;
        }

        .recent-meta {
            font-size: 11px;
            color: var(--gray-500);
            font-family: var(--font-mono);
        }

        .page-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
        }

        .search-filter {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }

        .filter-select {
            padding: 8px 12px;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius);
            font-size: 13px;
            outline: none;
            background: white;
            cursor: pointer;
        }

        .filter-input {
            padding: 8px 14px;
            border: 1px solid var(--gray-300);
            border-radius: var(--radius);
            font-size: 13px;
            outline: none;
            width: 200px;
            background: white;
        }

        .filter-input:focus,
        .filter-select:focus {
            border-color: var(--red);
        }

        .articles-table {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            overflow: hidden;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th {
            background: var(--gray-100);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--gray-700);
            padding: 12px 16px;
            text-align: left;
        }

        .table td {
            padding: 14px 16px;
            border-bottom: 1px solid var(--gray-100);
            font-size: 13px;
            vertical-align: middle;
        }

        .table tr:hover td {
            background: #fafafa;
        }

        .table-title {
            font-weight: 600;
            color: var(--black);
            max-width: 240px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .table-actions {
            display: flex;
            gap: 6px;
            white-space: nowrap;
        }

        .table-thumb {
            width: 52px;
            height: 38px;
            object-fit: cover;
            border-radius: var(--radius);
            background: var(--gray-100);
        }

        .status-dot {
            display: inline-block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            margin-right: 5px;
        }

        .status-published .status-dot {
            background: var(--green);
        }

        .status-draft .status-dot {
            background: var(--accent);
        }

        .status-text {
            font-size: 12px;
            font-weight: 600;
        }

        .status-published .status-text {
            color: var(--green);
        }

        .status-draft .status-text {
            color: var(--accent);
        }

        .article-form {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            padding: 28px;
        }

        .form-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
        }

        .form-full {
            grid-column: 1 / -1;
        }

        .image-preview {
            width: 100%;
            height: 200px;
            background: var(--gray-100);
            border-radius: var(--radius);
            border: 2px dashed var(--gray-300);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 8px;
            color: var(--gray-500);
            font-size: 13px;
            overflow: hidden;
            margin-top: 8px;
            cursor: pointer;
        }

        .image-preview:hover {
            border-color: var(--red);
        }

        .image-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .rss-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--black);
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .rss-info {
            font-size: 12px;
            color: var(--gray-700);
            margin-bottom: 14px;
        }

        .rss-warning {
            background: #fff8e1;
            border: 1px solid #ffd54f;
            border-radius: var(--radius);
            padding: 10px 14px;
            font-size: 12px;
            color: #795548;
            margin-bottom: 14px;
        }

        .rss-feed-row {
            display: flex;
            gap: 10px;
            align-items: flex-end;
            margin-bottom: 12px;
        }

        .rss-feed-row .form-group {
            flex: 1;
            margin: 0;
        }

        .rss-log {
            font-family: var(--font-mono);
            font-size: 11px;
            background: var(--dark);
            color: #00ff88;
            padding: 12px;
            border-radius: var(--radius);
            max-height: 120px;
            overflow-y: auto;
            margin-top: 12px;
            white-space: pre-wrap;
        }

        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
        }

        .category-card {
            background: white;
            border-radius: var(--radius-lg);
            padding: 20px;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            gap: 10px;
            border-top: 3px solid var(--red);
        }

        .category-name {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
        }

        .category-count {
            font-size: 13px;
            color: var(--gray-500);
        }

        .category-actions {
            display: flex;
            gap: 8px;
        }

        .color-picker-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .color-swatch {
            width: 32px;
            height: 32px;
            border-radius: var(--radius);
            border: 2px solid var(--gray-300);
            cursor: pointer;
        }

        .settings-section {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            padding: 24px;
            margin-bottom: 24px;
        }

        .settings-title {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: var(--black);
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--gray-100);
        }

        .toggle-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--gray-100);
        }

        .toggle-label {
            font-size: 14px;
            color: var(--black);
            font-weight: 500;
        }

        .toggle-sub {
            font-size: 12px;
            color: var(--gray-500);
        }

        .toggle {
            position: relative;
            width: 44px;
            height: 24px;
            flex-shrink: 0;
        }

        .toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toggle-slider {
            position: absolute;
            inset: 0;
            background: var(--gray-300);
            border-radius: 24px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .toggle-slider::before {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            left: 3px;
            top: 3px;
            background: white;
            border-radius: 50%;
            transition: transform 0.2s;
        }

        .toggle input:checked+.toggle-slider {
            background: var(--green);
        }

        .toggle input:checked+.toggle-slider::before {
            transform: translateX(20px);
        }

        .password-strength {
            height: 4px;
            border-radius: 2px;
            margin-top: 4px;
        }

        .mobile-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }

        .mobile-overlay.active {
            display: block;
        }

        .article-checkbox {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        @media (max-width: 1024px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .admin-sidebar {
                position: fixed;
                left: -240px;
                top: 0;
                bottom: 0;
                z-index: 1000;
                transition: left 0.3s;
            }

            .admin-sidebar.open {
                left: 0;
            }

            .admin-layout {
                flex-direction: column;
            }

            .admin-content {
                width: 100%;
            }

            .form-grid-2 {
                grid-template-columns: 1fr;
            }

            .page-actions {
                flex-direction: column;
                align-items: stretch;
            }

            .search-filter {
                flex-direction: column;
            }

            .filter-input {
                width: 100%;
            }

            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }

            .admin-page {
                padding: 16px;
            }
        }

        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }

            .categories-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>

    <div class="toast-container" id="toastContainer"></div>
    <div class="modal-overlay hidden" id="modalOverlay">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title" id="modalTitle"></div><button class="modal-close"
                    onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer" id="modalFooter"></div>
        </div>
    </div>

    <div id="page-admin">
        <!-- LOGIN -->
        <div id="admin-login">
            <div class="admin-login">
                <div class="login-box">
                    <div class="login-logo">Haber<span>Akış</span></div>
                    <div class="login-sub">Yönetici Paneli</div>
                    <div id="loginError" class="login-error hidden"></div>
                    <div class="form-group"><label class="form-label">Kullanıcı Adı</label><input type="text"
                            class="form-control" id="loginUser" placeholder="admin"></div>
                    <div class="form-group"><label class="form-label">Şifre</label><input type="password"
                            class="form-control" id="loginPass" placeholder="••••••••"
                            onkeydown="if(event.key==='Enter')doLogin()"></div>
                    <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="doLogin()">Giriş
                        Yap</button>
                    <div style="margin-top:16px;text-align:center;font-size:12px;color:var(--gray-500)">Varsayılan:
                        <code>habereditor</code> / <code>HaberAkis2026!</code>
                    </div>
                </div>
            </div>
        </div>

        <!-- DASHBOARD -->
        <div id="admin-dashboard" class="hidden">
            <div class="admin-layout">
                <div class="admin-sidebar" id="adminSidebar">
                    <div class="admin-logo">
                        <div class="admin-logo-text">Haber<span>Akış</span></div>
                        <div class="admin-logo-sub">Yönetici Paneli</div>
                    </div>
                    <nav class="admin-nav">
                        <div class="admin-nav-section">GENEL</div>
                        <div class="admin-nav-item active" onclick="showAdminPage('dash')"><span
                                class="nav-icon">📊</span> Dashboard</div>
                        <div class="admin-nav-section">İÇERİK</div>
                        <div class="admin-nav-item" onclick="showAdminPage('articles')"><span class="nav-icon">📰</span>
                            Haberler <span class="nav-badge" id="navBadgeArticles">0</span></div>
                        <div class="admin-nav-item" onclick="showAdminPage('newArticle')"><span
                                class="nav-icon">✏️</span> Yeni Haber</div>
                        <div class="admin-nav-item" onclick="showAdminPage('categories')"><span
                                class="nav-icon">🏷️</span> Kategoriler</div>
                        <div class="admin-nav-item" onclick="showAdminPage('comments')"><span class="nav-icon">💬</span>
                            Yorumlar <span class="nav-badge" id="navBadgeComments">0</span></div>
                        <div class="admin-nav-item" onclick="showAdminPage('media')"><span class="nav-icon">🖼️</span>
                            Medya</div>
                        <div class="admin-nav-section">ARAÇLAR</div>
                        <div class="admin-nav-item" onclick="showAdminPage('rss')"><span class="nav-icon">📡</span> RSS
                            Çek</div>
                        <div class="admin-nav-item" onclick="showAdminPage('bulkOps')"><span class="nav-icon">⚡</span>
                            Toplu İşlem</div>
                        <div class="admin-nav-item" onclick="showAdminPage('contentCalendar')"><span
                                class="nav-icon">📅</span> İçerik Takvimi</div>
                        <div class="admin-nav-item" onclick="showAdminPage('scheduled')"><span class="nav-icon">⏰</span>
                            Zamanlanmış</div>
                        <div class="admin-nav-item" onclick="showAdminPage('livePreview')"><span
                                class="nav-icon">👁️</span> Canlı Önizleme</div>
                        <div class="admin-nav-section">ANALİTİK</div>
                        <div class="admin-nav-item" onclick="showAdminPage('analytics')"><span
                                class="nav-icon">📈</span> Analitik</div>
                        <div class="admin-nav-section">SİSTEM</div>
                        <div class="admin-nav-item" onclick="showAdminPage('settings')"><span class="nav-icon">⚙️</span>
                            Ayarlar</div>
                        <div class="admin-nav-item" onclick="showAdminPage('seo')"><span class="nav-icon">🔍</span> SEO
                        </div>
                        <div class="admin-nav-item" onclick="showAdminPage('ads')"><span class="nav-icon">📢</span>
                            Reklamlar</div>
                        <div class="admin-nav-item" onclick="showAdminPage('users')"><span class="nav-icon">👥</span>
                            Kullanıcılar</div>
                        <div class="admin-nav-item" onclick="showAdminPage('notifications')"><span
                                class="nav-icon">🔔</span> Bildirimler</div>
                        <div class="admin-nav-item" onclick="showAdminPage('theme')"><span class="nav-icon">🎨</span>
                            Tema</div>
                        <div class="admin-nav-item" onclick="showAdminPage('menus')"><span class="nav-icon">🔗</span>
                            Menü & Linkler</div>
                        <div class="admin-nav-item" onclick="showAdminPage('socialSettings')"><span
                                class="nav-icon">📱</span> Sosyal Medya</div>
                        <div class="admin-nav-item" onclick="showAdminPage('activityLog')"><span
                                class="nav-icon">📋</span> Aktivite Günlüğü</div>
                        <div class="admin-nav-section">V2 ARAÇLAR</div>
                        <div class="admin-nav-item" onclick="showAdminPage('systemHealth')"><span
                                class="nav-icon">🩺</span> Sistem Sağlığı</div>
                        <div class="admin-nav-item" onclick="showAdminPage('archiver')"><span
                                class="nav-icon">🗄️</span> Arşivleyici</div>
                        <div class="admin-nav-item" onclick="showAdminPage('duplicates')"><span
                                class="nav-icon">🔍</span> Kopya Tespit</div>
                        <div class="admin-nav-item" onclick="showAdminPage('readerStats')"><span
                                class="nav-icon">📊</span> Okuyucu İstatistik</div>
                        <div class="admin-nav-item" onclick="showAdminPage('shortcuts')"><span
                                class="nav-icon">⌨️</span> Kısayollar</div>
                    </nav>
                    <div class="admin-footer-nav">
                        <div class="admin-nav-item" onclick="window.location.href='index.html'"><span
                                class="nav-icon">🌐</span> Siteye Git</div>
                        <div class="admin-nav-item" onclick="doLogout()"><span class="nav-icon">🚪</span> Çıkış Yap
                        </div>
                    </div>
                </div>
                <div class="mobile-overlay" id="mobileOverlay" onclick="closeMobileSidebar()"></div>
                <div class="admin-content">
                    <div class="admin-topbar">
                        <div style="display:flex;align-items:center;gap:12px"><button class="mobile-menu-btn"
                                onclick="toggleSidebar()">☰</button>
                            <div class="admin-topbar-title" id="adminPageTitle">Dashboard</div>
                        </div>
                        <div class="admin-topbar-right">
                            <div class="admin-user">
                                <div class="admin-avatar" id="adminAvatar">A</div><span class="admin-username"
                                    id="adminUsernameDisplay">admin</span>
                            </div>
                        </div>
                    </div>

                    <!-- ALL ADMIN PAGES -->
                    <div class="admin-page active" id="page-dash">
                        <div class="stats-grid" id="statsGrid"></div>
                        <div class="dashboard-grid">
                            <div class="admin-card">
                                <div class="admin-card-header">
                                    <div class="admin-card-title">Son Eklenen Haberler</div><button
                                        class="btn btn-sm btn-primary" onclick="showAdminPage('newArticle')">+
                                        Yeni</button>
                                </div>
                                <div class="admin-card-body" id="dashRecentArticles"></div>
                            </div>
                            <div class="admin-card">
                                <div class="admin-card-header">
                                    <div class="admin-card-title">Kategori Dağılımı</div>
                                </div>
                                <div class="admin-card-body" id="dashCatStats"></div>
                            </div>
                        </div>
                    </div>

                    <div class="admin-page" id="page-articles">
                        <div class="page-actions">
                            <div class="search-filter"><input type="text" class="filter-input"
                                    placeholder="Haber ara..." id="articleFilter" oninput="filterArticles()"><select
                                    class="filter-select" id="articleCatFilter" onchange="filterArticles()">
                                    <option value="">Tüm Kategoriler</option>
                                </select><select class="filter-select" id="articleStatusFilter"
                                    onchange="filterArticles()">
                                    <option value="">Tüm Durumlar</option>
                                    <option value="published">Yayında</option>
                                    <option value="draft">Taslak</option>
                                </select></div><button class="btn btn-primary" onclick="showAdminPage('newArticle')">✏️
                                Yeni Haber</button>
                        </div>
                        <div class="articles-table table-wrap">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th style="width:30px">☐</th>
                                        <th>Görsel</th>
                                        <th>Başlık</th>
                                        <th>Kategori</th>
                                        <th>Durum</th>
                                        <th>Tarih</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody id="articlesTableBody"></tbody>
                            </table>
                        </div>
                        <div id="articlesPagination"></div>
                    </div>

                    <div class="admin-page" id="page-newArticle">
                        <div class="article-form"><input type="hidden" id="editArticleId">
                            <div class="form-grid-2">
                                <div class="form-group form-full"><label class="form-label">Haber Başlığı
                                        *</label><input type="text" class="form-control" id="artTitle"
                                        placeholder="Dikkat çekici bir başlık girin..."></div>
                                <div class="form-group"><label class="form-label">Kategori *</label><select
                                        class="form-control" id="artCategory">
                                        <option value="">Kategori Seç</option>
                                    </select></div>
                                <div class="form-group"><label class="form-label">Durum</label><select
                                        class="form-control" id="artStatus">
                                        <option value="published">Yayında</option>
                                        <option value="draft">Taslak</option>
                                    </select></div>
                                <div class="form-group"><label class="form-label">Yazar</label><input type="text"
                                        class="form-control" id="artAuthor" placeholder="Editör adı"></div>
                                <div class="form-group"><label class="form-label">Öne Çıkan</label><select
                                        class="form-control" id="artFeatured">
                                        <option value="0">Hayır</option>
                                        <option value="1">Evet (Hero)</option>
                                    </select></div>
                                <div class="form-group form-full"><label class="form-label">Özet *</label><textarea
                                        class="form-control" id="artSummary" rows="2"
                                        placeholder="Haberin kısa özeti..."></textarea></div>
                                <div class="form-group form-full"><label class="form-label">İçerik *</label><textarea
                                        class="form-control" id="artBody" rows="12"
                                        placeholder="Haber metnini yazın. H3:Başlık ile ara başlık, >Metin ile alıntı ekleyin."></textarea>
                                    <div class="form-hint">H3:Başlık = bölüm başlığı · >Metin = alıntı · Boş satır =
                                        paragraf</div>
                                </div>
                                <div class="form-group form-full"><label class="form-label">Görsel URL</label><input
                                        type="text" class="form-control" id="artImage"
                                        placeholder="https://resim-adresi.com/gorsel.jpg"
                                        oninput="updateImagePreview(this.value)">
                                    <div class="image-preview" id="imagePreview"
                                        onclick="document.getElementById('artImage').focus()">
                                        <div class="image-preview-text">
                                            <div style="font-size:32px">🖼️</div>
                                            <div>Görsel URL girin</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group form-full"><label class="form-label">Kaynak</label><input
                                        type="text" class="form-control" id="artSource"
                                        placeholder="Reuters, AA, BBC Türkçe..."></div>
                                <div class="form-group form-full"><label class="form-label">Etiketler</label><input
                                        type="text" class="form-control" id="artTags"
                                        placeholder="teknoloji, yapay zeka (virgülle ayırın)"></div>
                            </div>
                            <div
                                style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;border-top:1px solid var(--gray-100);padding-top:20px">
                                <button class="btn btn-secondary"
                                    onclick="showAdminPage('articles')">İptal</button><button class="btn btn-secondary"
                                    onclick="saveArticle('draft')">📝 Taslak</button><button class="btn btn-primary"
                                    onclick="saveArticle('published')">🚀 Yayınla</button>
                            </div>
                        </div>
                    </div>

                    <div class="admin-page" id="page-categories">
                        <div class="page-actions">
                            <div></div><button class="btn btn-primary" onclick="showAddCategoryModal()">+ Kategori
                                Ekle</button>
                        </div>
                        <div class="categories-grid" id="categoriesGrid"></div>
                    </div>

                    <div class="admin-page" id="page-rss">
                        <div class="article-form">
                            <div class="rss-title">📡 RSS / Kaynak Çekme Aracı</div>
                            <div class="rss-info">Harici haber sitelerinden RSS beslemesi üzerinden haber
                                çekebilirsiniz.</div>
                            <div class="rss-warning">⚠️ <strong>Önemli:</strong> RSS çekme işlemi, hedef sitenin CORS
                                politikasına bağlıdır.</div>
                            <div class="form-grid-2">
                                <div class="form-group"><label class="form-label">Kaynak Adı</label><input type="text"
                                        class="form-control" id="rssName" placeholder="BBC Türkçe"></div>
                                <div class="form-group"><label class="form-label">Kategori</label><select
                                        class="form-control" id="rssCategory">
                                        <option value="">Seç</option>
                                    </select></div>
                                <div class="form-group form-full"><label class="form-label">RSS URL</label>
                                    <div class="rss-feed-row">
                                        <div class="form-group"><input type="text" class="form-control" id="rssUrl"
                                                placeholder="https://www.bbc.com/turkish/index.xml"></div><button
                                            class="btn btn-primary" onclick="fetchRSS()">📡 Çek</button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group"><label class="form-label">Maks. Haber</label><select
                                    class="form-control" id="rssLimit" style="width:120px">
                                    <option>5</option>
                                    <option selected>10</option>
                                    <option>15</option>
                                    <option>20</option>
                                </select></div>
                            <div id="rssLog" class="rss-log hidden"></div>
                            <div id="rssPreview"></div>
                        </div>
                    </div>

                    <div class="admin-page" id="page-settings">
                        <div class="settings-section">
                            <div class="settings-title">🌐 Site Ayarları</div>
                            <div class="form-grid-2">
                                <div class="form-group"><label class="form-label">Site Adı</label><input type="text"
                                        class="form-control" id="setSiteName" placeholder="HaberAkış"></div>
                                <div class="form-group"><label class="form-label">Slogan</label><input type="text"
                                        class="form-control" id="setSiteSlogan"
                                        placeholder="Güvenilir · Hızlı · Bağımsız"></div>
                                <div class="form-group form-full"><label class="form-label">Son Dakika
                                        Metni</label><input type="text" class="form-control" id="setTicker"
                                        placeholder="Son dakika haberleri..."></div>
                            </div><button class="btn btn-primary" style="margin-top:16px" onclick="saveSettings()">💾
                                Kaydet</button>
                        </div>
                        <div class="settings-section">
                            <div class="settings-title">🔒 Güvenlik</div>
                            <div class="form-grid-2">
                                <div class="form-group"><label class="form-label">Kullanıcı Adı</label><input
                                        type="text" class="form-control" id="setUsername" placeholder="admin"></div>
                                <div class="form-group"><label class="form-label">Yeni Şifre</label><input
                                        type="password" class="form-control" id="setPassword"
                                        placeholder="Değiştirmek için girin" oninput="checkPwStrength(this.value)">
                                    <div class="password-strength" id="pwStrengthBar"></div>
                                    <div class="form-hint" id="pwStrengthText"></div>
                                </div>
                            </div><button class="btn btn-primary" style="margin-top:16px"
                                onclick="saveSecuritySettings()">🔒 Güncelle</button>
                        </div>
                        <div class="settings-section">
                            <div class="settings-title">🗂️ Veri Yönetimi</div>
                            <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-secondary"
                                    onclick="exportData()">📤 Dışa Aktar</button><button class="btn btn-secondary"
                                    onclick="document.getElementById('importFile').click()">📥 İçe Aktar</button><input
                                    type="file" id="importFile" accept=".json" style="display:none"
                                    onchange="importData(this)"><button class="btn btn-danger"
                                    onclick="confirmClearData()">🗑️ Tümünü Sil</button></div>
                        </div>
                    </div>

                    <!-- New Feature Pages -->
                    <div class="admin-page" id="page-comments"></div>
                    <div class="admin-page" id="page-media"></div>
                    <div class="admin-page" id="page-analytics"></div>
                    <div class="admin-page" id="page-seo"></div>
                    <div class="admin-page" id="page-ads"></div>
                    <div class="admin-page" id="page-users"></div>
                    <div class="admin-page" id="page-notifications"></div>
                    <div class="admin-page" id="page-theme"></div>
                    <div class="admin-page" id="page-menus"></div>
                    <div class="admin-page" id="page-scheduled"></div>
                    <div class="admin-page" id="page-activityLog"></div>
                    <div class="admin-page" id="page-socialSettings"></div>
                    <div class="admin-page" id="page-bulkOps"></div>
                    <div class="admin-page" id="page-contentCalendar"></div>
                    <div class="admin-page" id="page-livePreview"></div>
                    <div class="admin-page" id="page-systemHealth"></div>
                    <div class="admin-page" id="page-archiver"></div>
                    <div class="admin-page" id="page-duplicates"></div>
                    <div class="admin-page" id="page-readerStats"></div>
                    <div class="admin-page" id="page-shortcuts"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="js/app.js"></script>
    <script src="js/admin.js"></script>
    <script src="js/admin-features.js"></script>
    <script src="js/rss-engine.js"></script>
    <script>
        document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
        document.addEventListener('DOMContentLoaded', () => { db = getDB(); });
    </script>
</body>

</html>