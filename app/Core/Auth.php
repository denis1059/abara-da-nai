<?php

class Auth {
    /**
     * Inicia a sessão se ainda não foi iniciada
     */
    public static function init() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * Verifica se o administrador está logado
     */
    public static function check() {
        self::init();
        return isset($_SESSION['admin_logado']) && $_SESSION['admin_logado'] === true;
    }

    /**
     * Realiza o login
     */
    public static function login($password) {
        self::init();
        if ($password === Config::ADMIN_PASSWORD) {
            $_SESSION['admin_logado'] = true;
            return true;
        }
        return false;
    }

    /**
     * Realiza o logout
     */
    public static function logout() {
        self::init();
        unset($_SESSION['admin_logado']);
        session_destroy();
    }
}
