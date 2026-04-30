<?php

class Database {
    private $filePath;
    private $configPath;

    public function __construct() {
        $this->filePath = __DIR__ . '/../../data/produtos.json';
        $this->configPath = __DIR__ . '/../../data/config.json';
        
        // Garante que o arquivo exista
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([]), LOCK_EX);
        }
        if (!file_exists($this->configPath)) {
            file_put_contents($this->configPath, json_encode([
                'pixel_id' => '',
                'analytics_id' => '',
                'whatsapp_msg' => 'Olá, gostaria de fazer um pedido!'
            ]), LOCK_EX);
        }
    }

    /**
     * Retorna todos os produtos
     */
    public function getAll() {
        $data = file_get_contents($this->filePath);
        return json_decode($data, true) ?: [];
    }

    /**
     * Retorna apenas produtos ativos
     */
    public function getActive() {
        $produtos = $this->getAll();
        return array_filter($produtos, function($p) {
            return isset($p['ativo']) && $p['ativo'] === true;
        });
    }

    /**
     * Busca um produto por ID
     */
    public function getById($id) {
        $produtos = $this->getAll();
        foreach ($produtos as $p) {
            if ($p['id'] === $id) return $p;
        }
        return null;
    }

    /**
     * Salva ou atualiza um produto
     */
    public function save($produto) {
        $produtos = $this->getAll();
        $index = -1;

        if (isset($produto['id'])) {
            foreach ($produtos as $i => $p) {
                if ($p['id'] === $produto['id']) {
                    $index = $i;
                    break;
                }
            }
        } else {
            $produto['id'] = 'p_' . uniqid();
        }

        if ($index !== -1) {
            $produtos[$index] = $produto;
        } else {
            $produtos[] = $produto;
        }

        return file_put_contents($this->filePath, json_encode($produtos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    /**
     * Exclui um produto
     */
    public function delete($id) {
        $produtos = $this->getAll();
        $filtered = array_filter($produtos, function($p) use ($id) {
            return $p['id'] !== $id;
        });
        return file_put_contents($this->filePath, json_encode(array_values($filtered), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    /**
     * Retorna as configurações globais
     */
    public function getSettings() {
        $data = file_get_contents($this->configPath);
        return json_decode($data, true) ?: [];
    }

    /**
     * Salva as configurações globais
     */
    public function saveSettings($settings) {
        return file_put_contents($this->configPath, json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
}
