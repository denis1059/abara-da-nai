<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $produto ? 'Editar' : 'Novo' ?> Produto - Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .admin-container { display: flex; min-height: 100vh; }
        .sidebar { width: 250px; background: var(--dark); color: #fff; padding: 2rem 1rem; }
        .sidebar a { display: block; color: #ccc; text-decoration: none; padding: 0.8rem; border-radius: 5px; margin-bottom: 0.5rem; }
        .sidebar a:hover { background: var(--primary); color: #fff; }
        .main-content { flex: 1; padding: 2rem; background: #f4f4f4; }
        .form-card { background: #fff; padding: 2rem; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); max-width: 800px; margin: 0 auto; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .checkbox-group { display: flex; align-items: center; gap: 10px; }
        .checkbox-group input { width: auto; }
        .btn-save { width: 100%; margin-top: 1rem; font-size: 1.1rem; }
        .preview-img { width: 150px; height: 150px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <h2>Admin Nai</h2>
            <a href="index.php"><i class="fas fa-arrow-left"></i> Voltar</a>
        </aside>

        <main class="main-content">
            <div class="form-card">
                <h1><?= $produto ? 'Editar Produto' : 'Cadastrar Novo Produto' ?></h1>
                <form action="index.php" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="acao" value="salvar">
                    <?php if ($produto): ?>
                        <input type="hidden" name="id" value="<?= $produto['id'] ?>">
                        <input type="hidden" name="imagem_atual" value="<?= $produto['imagem'] ?>">
                    <?php endif; ?>

                    <div class="form-group">
                        <label>Título do Produto</label>
                        <input type="text" name="titulo" value="<?= $produto ? e($produto['titulo']) : '' ?>" required placeholder="Ex: Abará Tradicional">
                    </div>

                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea name="descricao" rows="3" required placeholder="Descreva os ingredientes e o sabor..."><?= $produto ? e($produto['descricao']) : '' ?></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Preço Atual (R$)</label>
                            <input type="number" step="0.01" name="preco_atual" value="<?= $produto ? $produto['preco_atual'] : '' ?>" required placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Preço Antigo (R$ - Opcional)</label>
                            <input type="number" step="0.01" name="preco_antigo" value="<?= $produto ? $produto['preco_antigo'] : '' ?>" placeholder="0.00">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Categoria</label>
                            <select name="categoria" required>
                                <?php foreach (Config::getCategorias() as $slug => $nome): ?>
                                    <option value="<?= $slug ?>" <?= ($produto && $produto['categoria'] === $slug) ? 'selected' : '' ?>><?= e($nome) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Selo / Badge (Opcional)</label>
                            <input type="text" name="badge" value="<?= $produto ? e($produto['badge']) : '' ?>" placeholder="Ex: -15%, Destaque, Novo">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Imagem do Produto</label>
                        <?php if ($produto && $produto['imagem']): ?>
                            <img src="../<?= $produto['imagem'] ?>" class="preview-img" id="preview">
                        <?php endif; ?>
                        <input type="file" name="imagem" accept="image/*" onchange="previewFile()">
                    </div>

                    <div class="form-group checkbox-group">
                        <input type="checkbox" name="ativo" id="ativo" <?= (!$produto || $p['ativo']) ? 'checked' : '' ?>>
                        <label for="ativo">Produto Ativo (Visível no site)</label>
                    </div>

                    <button type="submit" class="btn btn-primary btn-save">
                        <i class="fas fa-save"></i> Salvar Produto
                    </button>
                </form>
            </div>
        </main>
    </div>

    <script>
        function previewFile() {
            const preview = document.getElementById('preview') || document.createElement('img');
            const file = document.querySelector('input[type=file]').files[0];
            const reader = new FileReader();

            reader.addEventListener("load", function () {
                preview.src = reader.result;
                preview.className = 'preview-img';
                if (!document.getElementById('preview')) {
                    document.querySelector('.form-group:nth-child(8)').prepend(preview);
                    preview.id = 'preview';
                }
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    </script>
</body>
</html>
