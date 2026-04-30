<?php

require_once __DIR__ . '/../app/Config/App.php';
require_once __DIR__ . '/../app/Core/Database.php';
require_once __DIR__ . '/../app/Core/Auth.php';
require_once __DIR__ . '/../app/Helpers.php';

$db = new Database();
$acao = $_POST['acao'] ?? $_GET['acao'] ?? 'dashboard';

// Processa Logout
if ($acao === 'logout') {
    Auth::logout();
    header('Location: index.php');
    exit;
}

// Verifica Login
if ($acao === 'login' && isset($_POST['senha'])) {
    if (Auth::login($_POST['senha'])) {
        header('Location: index.php');
        exit;
    } else {
        $erro = "Senha incorreta!";
    }
}

if (!Auth::check()) {
    require_once __DIR__ . '/../views/admin/login.php';
    exit;
}

// Se logado, gerencia as rotas do dashboard
switch ($acao) {
    case 'dashboard':
        $produtos = $db->getAll();
        require_once __DIR__ . '/../views/admin/dashboard.php';
        break;

    case 'editar':
        $id = $_GET['id'] ?? null;
        $produto = $id ? $db->getById($id) : null;
        require_once __DIR__ . '/../views/admin/editor.php';
        break;

    case 'salvar':
        // Lógica de upload e salvamento
        $id = $_POST['id'] ?? null;
        $produto = [
            'id' => $id ?: 'p_' . uniqid(),
            'titulo' => $_POST['titulo'],
            'descricao' => $_POST['descricao'],
            'preco_atual' => $_POST['preco_atual'],
            'preco_antigo' => $_POST['preco_antigo'],
            'categoria' => $_POST['categoria'],
            'badge' => $_POST['badge'],
            'ativo' => isset($_POST['ativo']),
            'imagem' => $_POST['imagem_atual'] // Placeholder para manter imagem se não subir nova
        ];

        // Upload de Imagem (Simplificado)
        if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
            $newName = uniqid('img_') . '.' . $ext;
            $dest = __DIR__ . '/../assets/images/uploads/' . $newName;
            if (move_uploaded_file($_FILES['imagem']['tmp_tmp'], $dest)) {
                $produto['imagem'] = 'assets/images/uploads/' . $newName;
            }
        }

        $db->save($produto);
        header('Location: index.php?msg=Salvo com sucesso');
        break;

    case 'excluir':
        $id = $_GET['id'];
        $db->delete($id);
        header('Location: index.php?msg=Excluído com sucesso');
        break;
}
