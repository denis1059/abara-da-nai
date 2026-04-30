<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - <?= e(Config::SITE_NAME) ?></title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .admin-container { display: flex; min-height: 100vh; }
        .sidebar { width: 250px; background: var(--dark); color: #fff; padding: 2rem 1rem; }
        .sidebar h2 { font-size: 1.2rem; margin-bottom: 2rem; border-bottom: 1px solid #444; padding-bottom: 1rem; }
        .sidebar a { display: block; color: #ccc; text-decoration: none; padding: 0.8rem; border-radius: 5px; margin-bottom: 0.5rem; }
        .sidebar a:hover, .sidebar a.active { background: var(--primary); color: #fff; }
        
        .main-content { flex: 1; padding: 2rem; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f8f8; font-weight: 600; }
        
        .thumb { width: 50px; height: 50px; border-radius: 5px; object-fit: cover; }
        .status { padding: 4px 8px; border-radius: 20px; font-size: 0.8rem; }
        .status-active { background: #e8f5e9; color: #2e7d32; }
        .status-inactive { background: #ffebee; color: #c62828; }
        
        .actions a { color: var(--grey); margin-right: 10px; transition: color 0.3s; }
        .actions a:hover { color: var(--primary); }
        .actions a.delete:hover { color: var(--accent); }
    </style>
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <h2>Admin Nai</h2>
            <a href="index.php" class="active"><i class="fas fa-home"></i> Dashboard</a>
            <a href="index.php?acao=editar"><i class="fas fa-plus"></i> Novo Produto</a>
            <a href="index.php?acao=logout" style="margin-top: 2rem; color: #ff5252;"><i class="fas fa-sign-out-alt"></i> Sair</a>
        </aside>

        <main class="main-content">
            <div class="top-bar">
                <h1>Gerenciar Produtos</h1>
                <a href="index.php?acao=editar" class="btn btn-primary"><i class="fas fa-plus"></i> Adicionar</a>
            </div>

            <?php if (isset($_GET['msg'])): ?>
                <div style="background: #e3f2fd; color: #1976d2; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <?= e($_GET['msg']) ?>
                </div>
            <?php endif; ?>

            <table>
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Título</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($produtos as $p): ?>
                        <tr>
                            <td><img src="../<?= $p['imagem'] ?>" class="thumb"></td>
                            <td><?= e($p['titulo']) ?></td>
                            <td><?= e(Config::getCategorias()[$p['categoria']] ?? $p['categoria']) ?></td>
                            <td><?= formatarPreco($p['preco_atual']) ?></td>
                            <td>
                                <span class="status <?= $p['ativo'] ? 'status-active' : 'status-inactive' ?>">
                                    <?= $p['ativo'] ? 'Ativo' : 'Inativo' ?>
                                </span>
                            </td>
                            <td class="actions">
                                <a href="index.php?acao=editar&id=<?= $p['id'] ?>" title="Editar"><i class="fas fa-edit"></i></a>
                                <a href="index.php?acao=excluir&id=<?= $p['id'] ?>" class="delete" title="Excluir" onclick="return confirm('Tem certeza?')"><i class="fas fa-trash"></i></a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </main>
    </div>
</body>
</html>
