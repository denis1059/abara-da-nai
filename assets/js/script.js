let cart = [];
let allProducts = [];
let activeCategory = 'todas';

/**
 * Inicialização
 */
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

/**
 * Carrega produtos do JSON
 */
async function loadProducts() {
    try {
        const response = await fetch('data/produtos.json');
        allProducts = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('product-grid').innerHTML = '<p>Erro ao carregar o cardápio. Tente novamente mais tarde.</p>';
    }
}

/**
 * Filtra por categoria
 */
function filterCategory(category) {
    activeCategory = category;
    
    // Atualiza botões
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => {
        if (btn.innerText.toLowerCase() === category || (category === 'todas' && btn.innerText.toLowerCase() === 'todos')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderProducts();
}

/**
 * Renderiza os produtos no grid
 */
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    const filtered = activeCategory === 'todas' 
        ? allProducts 
        : allProducts.filter(p => p.categoria === activeCategory);

    if (filtered.length === 0) {
        grid.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    filtered.forEach(p => {
        if (p.ativo === false) return;

        const card = document.createElement('div');
        card.className = 'product-card';
        
        const priceHtml = p.preco_antigo 
            ? `<span class="old-price">R$ ${parseFloat(p.preco_antigo).toFixed(2).replace('.', ',')}</span>` 
            : '';

        card.innerHTML = `
            <div class="product-image">
                <img src="${p.imagem}" alt="${p.titulo}">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${p.titulo}</h3>
                <p>${p.descricao}</p>
                <div class="price">
                    ${priceHtml}
                    <span class="current-price">R$ ${parseFloat(p.preco_atual).toFixed(2).replace('.', ',')}</span>
                </div>
                <button class="btn btn-add" onclick="addToCartById('${p.id}')">
                    <i class="fas fa-plus"></i> Adicionar ao Pedido
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Abre/Fecha o carrinho
 */
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

/**
 * Adiciona ao carrinho buscando pelo ID
 */
function addToCartById(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        addToCart(product);
    }
}

/**
 * Adiciona um produto ao carrinho
 */
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.titulo,
            price: parseFloat(product.preco_atual),
            image: product.imagem,
            quantity: 1
        });
    }
    updateCartUI();
    
    // Feedback visual (opcional)
    const btn = event.currentTarget;
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
        btn.style.background = '#25d366';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 1500);
    }
}

/**
 * Remove ou diminui a quantidade de um item
 */
function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
}

/**
 * Aumenta a quantidade de um item
 */
function increaseQty(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
    }
    updateCartUI();
}

/**
 * Atualiza a interface do carrinho
 */
function updateCartUI() {
    const container = document.getElementById('cart-items');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');
    
    container.innerHTML = '';
    let totalValue = 0;
    let totalItems = 0;

    cart.forEach(item => {
        totalValue += item.price * item.quantity;
        totalItems += item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.image}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="removeFromCart('${item.id}')">-</button>
                <span>${item.quantity}</span>
                <button onclick="increaseQty('${item.id}')">+</button>
            </div>
        `;
        container.appendChild(itemEl);
    });

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; padding: 20px;">Seu carrinho está vazio.</p>';
    }

    count.innerText = totalItems;
    total.innerText = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
}

/**
 * Finaliza o pedido e envia para o WhatsApp
 */
function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let message = "🍱 *Pedido - Abará da Nai*\n\n";
    message += "*Itens:*\n";
    
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• ${item.title} (${item.quantity}x) - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    message += `\n*Total do Pedido: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    message += "Olá, gostaria de fazer esse pedido!";

    const phone = "5571984052279";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
}
