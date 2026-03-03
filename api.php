<?php
// api.php
header('Content-Type: application/json');

$dbFile = __DIR__ . '/data/db.json';

// Create data directory if it doesn't exist
if (!file_exists(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0755, true);
}

// Get the action
$action = $_GET['action'] ?? '';

if ($action === 'save') {
    // Read JSON from input stream
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data) {
        // Save to file
        $success = file_put_contents($dbFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        if ($success !== false) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to write data']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    }
} elseif ($action === 'load') {
    if (file_exists($dbFile)) {
        echo file_get_contents($dbFile);
    } else {
        echo json_encode(['empty' => true]);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
