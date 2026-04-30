let products = [];
let githubToken = localStorage.getItem('gh_token') || '';
let repoOwner = 'denis1059';
let repoName = 'abara-da-nai';
let filePath = 'data/produtos.json';

// Senha simples para o painel estático
const ADMIN_PASS = 'admin'; 

/**
 * Verifica login inicial
 */
function checkLogin() {
    const pass = document.getElementById('admin-pass').value;
    console.log('Tentativa de login...'); // Log para debug
    if (pass === ADMIN_PASS) {
        document.getElementById('login-screen').style.display = 'none';
        init();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

// Permitir apertar Enter para logar
document.getElementById('admin-pass')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkLogin();
    }
});

/**
 * Inicialização do Painel
 */
async function init() {
    await loadProducts();
}

/**
 * Carrega produtos do repositório
 */
async function loadProducts() {
    try {
        const url = `../${filePath}?t=${Date.now()}`;
        console.log('Carregando produtos de:', url);
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Arquivo não encontrado');
        
        products = await response.json();
        console.log('Produtos carregados:', products);
        renderAdminProducts();
    } catch (e) {
        console.error('Erro detalhado:', e);
        alert('Erro ao carregar produtos: ' + e.message + '\nVerifique se o arquivo data/produtos.json existe no seu repositório.');
    }
}

/**
 * Renderiza lista na tabela
 */
function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-list');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="../${p.imagem}" class="thumb"></td>
            <td>${p.titulo}</td>
            <td>R$ ${parseFloat(p.preco_atual).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" style="background:#ff5252; color:#fff;" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Abre modal para novo/editar
 */
function showProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    
    if (product) {
        title.innerText = 'Editar Produto';
        document.getElementById('p-id').value = product.id;
        document.getElementById('p-titulo').value = product.titulo;
        document.getElementById('p-descricao').value = product.descricao;
        document.getElementById('p-preco-atual').value = product.preco_atual;
        document.getElementById('p-preco-antigo').value = product.preco_antigo || '';
        document.getElementById('p-categoria').value = product.categoria;
        document.getElementById('p-imagem').value = product.imagem;
        document.getElementById('p-badge').value = product.badge || '';
    } else {
        title.innerText = 'Novo Produto';
        document.getElementById('product-form').reset();
        document.getElementById('p-id').value = '';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
}

/**
 * Salva produto na memória (lista local)
 */
function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    
    const productData = {
        id: id || 'p_' + Date.now(),
        titulo: document.getElementById('p-titulo').value,
        descricao: document.getElementById('p-descricao').value,
        preco_atual: document.getElementById('p-preco-atual').value,
        preco_antigo: document.getElementById('p-preco-antigo').value,
        categoria: document.getElementById('p-categoria').value,
        imagem: document.getElementById('p-imagem').value,
        badge: document.getElementById('p-badge').value,
        ativo: true
    };

    if (id) {
        const index = products.findIndex(p => p.id === id);
        products[index] = productData;
    } else {
        products.push(productData);
    }

    renderAdminProducts();
    closeModal();
    alert('Alteração salva na lista. Não esqueça de "Salvar no GitHub" para publicar!');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    showProductModal(product);
}

function deleteProduct(id) {
    if (confirm('Deseja excluir este produto?')) {
        products = products.filter(p => p.id !== id);
        renderAdminProducts();
    }
}

/**
 * Configuração do Token do GitHub
 */
function setupGitHub() {
    const token = prompt('Insira seu GitHub Personal Access Token (com permissão de repo):', githubToken);
    if (token) {
        githubToken = token;
        localStorage.setItem('gh_token', token);
        alert('Token salvo localmente!');
    }
}

/**
 * SALVAR NO GITHUB (API)
 */
async function saveToGitHub() {
    if (!githubToken) {
        alert('Por favor, configure seu Token do GitHub primeiro.');
        setupGitHub();
        return;
    }

    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    btn.disabled = true;

    try {
        // 1. Pegar o SHA do arquivo atual (necessário para atualizar no GitHub)
        const getFile = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            headers: { 'Authorization': `token ${githubToken}` }
        });
        const fileData = await getFile.json();
        const sha = fileData.sha;

        // 2. Preparar conteúdo
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 4))));

        // 3. Fazer o PUT para atualizar
        const update = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update products via Admin Panel',
                content: content,
                sha: sha
            })
        });

        if (update.ok) {
            alert('✅ Cardápio publicado com sucesso no GitHub!');
        } else {
            const err = await update.json();
            alert('❌ Erro ao publicar: ' + err.message);
        }
    } catch (e) {
        alert('Erro de conexão com o GitHub: ' + e.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function logout() {
    location.reload();
}
