<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($metaTitle) ?></title>
    <meta name="description" content="<?= e($metaDesc) ?>">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
</head>
<body>

    <!-- Header -->
    <header>
        <div class="container">
            <div class="logo">
                <h1><?= e(Config::SITE_NAME) ?></h1>
                <p><?= e(Config::SITE_TAGLINE) ?></p>
            </div>
            <div class="cart-icon" onclick="toggleCart()">
                <i class="fas fa-shopping-basket"></i>
                <span id="cart-count">0</span>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h2>O sabor da Bahia na sua mesa</h2>
                <p>Feito com carinho, tradição e os melhores ingredientes selecionados.</p>
                <a href="#cardapio" class="btn btn-primary">Ver Cardápio</a>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="about">
        <div class="container">
            <div class="section-title">
                <h2>Nossa História</h2>
            </div>
            <p>O Abará da Nai nasceu com o objetivo de levar o verdadeiro sabor da culinária baiana até você. Com ingredientes selecionados, tempero caseiro e muito carinho, oferecemos abará e acarajé fresquinhos, feitos com tradição e qualidade.</p>
        </div>
    </section>

    <!-- Menu Section -->
    <section id="cardapio" class="menu">
        <div class="container">
            <div class="section-title">
                <h2>Nosso Cardápio</h2>
            </div>

            <!-- Categories Filter -->
            <div class="categories">
                <a href="?cat=todas#cardapio" class="cat-btn <?= $categoriaAtiva === 'todas' ? 'active' : '' ?>">Todos</a>
                <?php foreach ($categorias as $slug => $nome): ?>
                    <a href="?cat=<?= $slug ?>#cardapio" class="cat-btn <?= $categoriaAtiva === $slug ? 'active' : '' ?>"><?= e($nome) ?></a>
                <?php endforeach; ?>
            </div>

            <div class="product-grid">
                <?php foreach ($produtos as $p): ?>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="<?= asset($p['imagem']) ?>" alt="<?= e($p['titulo']) ?>">
                            <?php if (!empty($p['badge'])): ?>
                                <span class="badge"><?= e($p['badge']) ?></span>
                            <?php endif; ?>
                        </div>
                        <div class="product-info">
                            <h3><?= e($p['titulo']) ?></h3>
                            <p><?= e($p['descricao']) ?></p>
                            <div class="price">
                                <?php if (!empty($p['preco_antigo'])): ?>
                                    <span class="old-price"><?= formatarPreco($p['preco_antigo']) ?></span>
                                <?php endif; ?>
                                <span class="current-price"><?= formatarPreco($p['preco_atual']) ?></span>
                            </div>
                            <button class="btn btn-add" onclick="addToCart(<?= htmlspecialchars(json_encode($p)) ?>)">
                                <i class="fas fa-plus"></i> Adicionar ao Pedido
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Info Section -->
    <section class="info-extra">
        <div class="container">
            <div class="info-grid">
                <div class="info-item">
                    <i class="fas fa-leaf"></i>
                    <h3>Artesanal</h3>
                    <p>Produção 100% manual e artesanal.</p>
                </div>
                <div class="info-item">
                    <i class="fas fa-utensils"></i>
                    <h3>Fresquinho</h3>
                    <p>Ingredientes frescos todos os dias.</p>
                </div>
                <div class="info-item">
                    <i class="fas fa-truck"></i>
                    <h3>Sob Encomenda</h3>
                    <p>Aceitamos pedidos para eventos e festas.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h3>Contato</h3>
                    <p><i class="fab fa-whatsapp"></i> (71) 98405-2279</p>
                    <p><i class="fab fa-instagram"></i> @abara.da.Nai</p>
                    <p><i class="fas fa-map-marker-alt"></i> Salvador - BA</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?= date('Y') ?> <?= e(Config::SITE_NAME) ?>. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>

    <!-- Cart Sidebar -->
    <div id="cart-sidebar" class="cart-sidebar">
        <div class="cart-header">
            <h3>Seu Pedido</h3>
            <button class="close-cart" onclick="toggleCart()">&times;</button>
        </div>
        <div id="cart-items" class="cart-items">
            <!-- Items via JS -->
        </div>
        <div class="cart-footer">
            <div class="total">
                <span>Total:</span>
                <span id="cart-total">R$ 0,00</span>
            </div>
            <button class="btn btn-checkout" onclick="checkout()">
                <i class="fab fa-whatsapp"></i> Finalizar no WhatsApp
            </button>
        </div>
    </div>
    <div id="cart-overlay" class="cart-overlay" onclick="toggleCart()"></div>

    <!-- Floating WhatsApp -->
    <a href="https://wa.me/<?= Config::WHATSAPP_NUMBER ?>" class="whatsapp-float" target="_blank">
        <i class="fab fa-whatsapp"></i>
    </a>

    <script src="assets/js/script.js"></script>
</body>
</html>
