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
    <!-- AdSense Meta Tags -->
    <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
    <title>HaberAkış - Güncel Haberler, Son Dakika Gelişmeleri</title>
    <meta name="description"
        content="HaberAkış - Türkiye'nin güvenilir haber kaynağı. Güncel haberler, son dakika gelişmeleri ve derinlemesine analizler.">
    <meta name="keywords" content="haber, son dakika, güncel, türkiye, dünya, ekonomi, spor, teknoloji">
    <meta name="robots" content="index, follow">
    <meta name="author" content="HaberAkış">
    <meta property="og:title" content="HaberAkış - Güncel Haberler">
    <meta property="og:description" content="Türkiye'nin güvenilir haber kaynağı">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="/">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Serif+4:opsz,wght@8..60,300;400;600&family=JetBrains+Mono:wght@400;600&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>

<body>

    <!-- TOAST CONTAINER -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- MODAL OVERLAY -->
    <div class="modal-overlay hidden" id="modalOverlay">
        <div class="modal" id="modalBox">
            <div class="modal-header">
                <div class="modal-title" id="modalTitle">Başlık</div>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer" id="modalFooter"></div>
        </div>
    </div>

    <!-- COOKIE CONSENT -->
    <div class="cookie-banner hidden" id="cookieBanner">
        <div>🍪 Bu site, deneyiminizi iyileştirmek için çerezler kullanmaktadır.
            <a onclick="showPage('privacy')">Gizlilik Politikası</a>
        </div>
        <div class="cookie-buttons">
            <button class="btn btn-primary btn-sm" onclick="acceptCookies()">Kabul Et</button>
        </div>
    </div>

    <!-- NEWSLETTER POPUP -->
    <div class="newsletter-popup hidden" id="newsletterPopup">
        <button class="newsletter-close" onclick="closeNewsletter()">✕</button>
        <div class="newsletter-title">📧 Bültene Abone Ol</div>
        <div class="newsletter-desc">Son dakika haberleri ve özel içerikler için e-posta listemize katılın.</div>
        <div class="newsletter-form">
            <input type="email" id="newsletterEmail" placeholder="E-posta adresiniz">
            <button class="btn btn-primary" onclick="subscribeNewsletter()">Abone Ol</button>
        </div>
    </div>

    <!-- ANNOUNCEMENT BAR -->
    <div class="announcement-bar hidden" id="announcementBar">
        <span id="announcementText"></span>
        <button class="close-announce" onclick="closeAnnouncement()">✕</button>
    </div>

    <!-- FRONTEND PAGE -->
    <div id="page-frontend">

        <!-- TOP BAR -->
        <div class="topbar">
            <div class="container">
                <div class="topbar-inner">
                    <span class="topbar-date" id="topbarDate"></span>
                    <div class="topbar-ticker">
                        <span class="ticker-label">SON DAKİKA</span>
                        <span class="ticker-text" id="tickerText">Güncel haberleri takip edin...</span>
                    </div>
                    <div class="topbar-right">
                        <div class="finance-ticker" id="financeTicker"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- HEADER -->
        <header class="site-header">
            <div class="container">
                <div class="header-top">
                    <div class="site-logo" onclick="showPage('home')">
                        <div class="logo-name">Haber<span>Akış</span></div>
                        <div class="logo-tagline">Güvenilir · Hızlı · Bağımsız</div>
                    </div>
                    <div class="header-actions">
                        <button class="dark-toggle" id="darkToggle" onclick="toggleDarkMode()"
                            title="Karanlık Mod">🌙</button>
                        <div class="header-search">
                            <input type="text" class="search-input" placeholder="Haber ara..." id="siteSearch" autocomplete="off"
                                oninput="doLiveSearch(this.value)" onkeydown="if(event.key==='Enter')doSearch()" onblur="setTimeout(()=>document.getElementById('liveSearchResults').classList.add('hidden'), 200)">
                            <button class="search-btn" onclick="doSearch()">🔍</button>
                            <div id="liveSearchResults" class="live-search-results hidden"></div>
                        </div>
                    </div>
                </div>
            </div>
            <nav class="site-nav">
                <div class="container">
                    <ul class="nav-list" id="siteNav">
                        <li class="active" id="nav-home"><a onclick="showPage('home')">Ana Sayfa</a></li>
                    </ul>
                </div>
            </nav>
        </header>

        <!-- BREAKING NEWS -->
        <div class="breaking-bar" id="breakingBar">
            <div class="container">
                <div class="breaking-inner">
                    <span class="breaking-label">🔴 CANLI</span>
                    <span class="breaking-text" id="breakingText">Haberler yükleniyor...</span>
                </div>
            </div>
        </div>

        <!-- MAIN CONTENT -->
        <main id="frontendMain"></main>

        <!-- FOOTER -->
        <footer class="site-footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <div class="site-logo">
                            <div class="logo-name">Haber<span>Akış</span></div>
                        </div>
                        <p class="footer-desc">Türkiye'nin güvenilir haber kaynağı. Güncel haberler, son dakika
                            gelişmeleri ve derinlemesine analizler.</p>
                    </div>
                    <div>
                        <div class="footer-col-title">Kategoriler</div>
                        <ul class="footer-links" id="footerCatLinks"></ul>
                    </div>
                    <div>
                        <div class="footer-col-title">Kurumsal</div>
                        <ul class="footer-links" id="footerCustomLinks">
                            <li><a onclick="showPage('about')">Hakkımızda</a></li>
                            <li><a onclick="showPage('contact')">İletişim</a></li>
                            <li><a onclick="showPage('privacy')">Gizlilik Politikası</a></li>
                            <li><a onclick="showPage('terms')">Kullanım Şartları</a></li>
                            <li><a onclick="showPage('advertise')">Reklam</a></li>
                            <li><a onclick="showPage('bookmarks')">Favorilerim</a></li>
                            <li><a onclick="showPage('history')">Okuma Geçmişi</a></li>
                        </ul>
                    </div>
                    <div>
                        <div class="footer-col-title">Takip Et</div>
                        <ul class="footer-links">
                            <li><a id="footerTwitter" href="#" target="_blank" rel="noopener">Twitter / X</a></li>
                            <li><a id="footerInstagram" href="https://instagram.com/seninolsun" target="_blank"
                                    rel="noopener">Instagram</a></li>
                            <li><a id="footerFacebook" href="#" target="_blank" rel="noopener">Facebook</a></li>
                            <li><a id="footerYoutube" href="#" target="_blank" rel="noopener">YouTube</a></li>
                            <li><a id="footerRss" href="#" target="_blank" rel="noopener">RSS Beslemesi</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>© 2026 HaberAkış · Tüm hakları saklıdır.</span>
                    <span><a onclick="showPage('privacy')">Gizlilik</a> · <a onclick="showPage('terms')">Kullanım
                            Şartları</a></span>
                </div>
            </div>
        </footer>

    </div>

    <script src="js/app.js"></script>
    <script src="js/pages.js"></script>
    <script src="js/detail.js"></script>
    <script src="js/rss-engine.js"></script>
    <script>
        document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>

</html>