<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Painel Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        body { display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--light); }
        .login-card { background: #fff; padding: 2rem; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        .login-card h2 { color: var(--primary); margin-bottom: 1.5rem; text-align: center; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
        .form-group input { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; }
        .btn-login { width: 100%; margin-top: 1rem; }
        .error { color: var(--accent); font-size: 0.9rem; margin-bottom: 1rem; text-align: center; }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>Acesso Administrativo</h2>
        <?php if (isset($erro)): ?>
            <p class="error"><?= $erro ?></p>
        <?php endif; ?>
        <form action="index.php" method="POST">
            <input type="hidden" name="acao" value="login">
            <div class="form-group">
                <label>Senha do Painel</label>
                <input type="password" name="senha" required autofocus>
            </div>
            <button type="submit" class="btn btn-primary btn-login">Entrar no Painel</button>
        </form>
    </div>
</body>
</html>
