<?php

require_once __DIR__ . '/app/Config/App.php';
require_once __DIR__ . '/app/Core/Database.php';
require_once __DIR__ . '/app/Helpers.php';

$db = new Database();
$produtos = $db->getActive();
$settings = $db->getSettings();
$categorias = Config::getCategorias();

// Filtro por categoria via GET
$categoriaAtiva = $_GET['cat'] ?? 'todas';
if ($categoriaAtiva !== 'todas') {
    $produtos = array_filter($produtos, function($p) use ($categoriaAtiva) {
        return $p['categoria'] === $categoriaAtiva;
    });
}

// Meta Tags Dinâmicas
$metaTitle = Config::SITE_NAME . ' - ' . Config::SITE_TAGLINE;
$metaDesc = "Peça o melhor do Abará e Acarajé em Salvador. Sabores autênticos da Bahia entregues com carinho.";

// Carrega a View
require_once __DIR__ . '/views/frontend/home.php';
