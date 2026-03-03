<?php
// rss_proxy.php
// A secure proxy to fetch RSS XML bypassing CORS, no 3rd parties.
header('Content-Type: application/xml; charset=utf-8');

$url = $_GET['url'] ?? '';

if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo "<?xml version=\"1.0\"?><error>Invalid URL</error>";
    exit;
}

// User-Agent is sometimes required by news sites
$options = [
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n"
    ]
];
$context = stream_context_create($options);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(502);
    echo "<?xml version=\"1.0\"?><error>Failed to fetch RSS</error>";
    exit;
}

echo $response;
