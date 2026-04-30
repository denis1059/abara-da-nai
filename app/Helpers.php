<?php

/**
 * Formata um preço para o padrão brasileiro
 */
function formatarPreco($valor) {
    return 'R$ ' . number_format((float)$valor, 2, ',', '.');
}

/**
 * Gera uma URL limpa para o ativo
 */
function asset($path) {
    // Se BASE_URL estiver vazia, tenta detectar o caminho relativo
    $baseUrl = Config::BASE_URL ?: '';
    return $baseUrl . '/' . ltrim($path, '/');
}

/**
 * Limpa uma string para evitar XSS
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Debug amigável
 */
function dd($data) {
    echo '<pre>';
    print_r($data);
    echo '</pre>';
    die();
}
