let products = [];
let githubToken = localStorage.getItem('gh_token') || '';
let repoOwner = 'denis1059';
let repoName = 'abara-da-nai';
let filePath = 'data/produtos.json';
let branch = 'master';

// Senha simples para o painel estático
const ADMIN_PASS = 'admin'; 

/**
 * Retorna caminho válido de imagem para a área admin
 */
function getAdminImgSrc(img) {
    if (!img || img.trim() === '') return '../assets/images/uploads/1.jpeg';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `../${img}`;
}

/**
 * Atualiza o aviso de status do GitHub na tela
 */
function updateGitHubStatusUI() {
    const statusEl = document.getElementById('gh-status');
    if (!statusEl) return;

    if (githubToken && githubToken.trim() !== '') {
        const masked = githubToken.slice(0, 4) + '...' + githubToken.slice(-4);
        statusEl.innerHTML = `<span style="color: #2e7d32; font-weight: bold;"><i class="fas fa-check-circle"></i> Token configurado (${masked}) &bull; Repositório: ${repoOwner}/${repoName}</span>`;
    } else {
        statusEl.innerHTML = `<span style="color: #c62828; font-weight: bold;"><i class="fas fa-exclamation-triangle"></i> Token NÃO configurado. Clique ao lado para conectar.</span>`;
    }
}

/**
 * Verifica login inicial
 */
function checkLogin() {
    const pass = document.getElementById('admin-pass').value;
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
    updateGitHubStatusUI();
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
        
        if (!response.ok) throw new Error('Arquivo produtos.json não encontrado');
        
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
            <td><img src="${getAdminImgSrc(p.imagem)}" class="thumb" onerror="this.src='../assets/images/uploads/1.jpeg'"></td>
            <td><strong>${p.titulo}</strong></td>
            <td>R$ ${parseFloat(p.preco_atual).toFixed(2).replace('.', ',')}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${p.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" style="background:#ff5252; color:#fff;" onclick="deleteProduct('${p.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
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
        document.getElementById('p-imagem').value = product.imagem || '';
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
        titulo: document.getElementById('p-titulo').value.trim(),
        descricao: document.getElementById('p-descricao').value.trim(),
        preco_atual: document.getElementById('p-preco-atual').value.trim(),
        preco_antigo: document.getElementById('p-preco-antigo').value.trim(),
        categoria: document.getElementById('p-categoria').value,
        imagem: document.getElementById('p-imagem').value.trim(),
        badge: document.getElementById('p-badge').value.trim(),
        ativo: true
    };

    if (id) {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = productData;
        } else {
            products.push(productData);
        }
    } else {
        products.push(productData);
    }

    renderAdminProducts();
    closeModal();
    alert('Alteração salva na lista local!\n\nLembre-se de clicar em "Salvar no GitHub" no topo para publicar as alterações no site da Vercel.');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        showProductModal(product);
    }
}

function deleteProduct(id) {
    if (confirm('Deseja realmente excluir este produto?')) {
        products = products.filter(p => p.id !== id);
        renderAdminProducts();
        alert('Produto removido da lista local. Clique em "Salvar no GitHub" para confirmar a exclusão no site.');
    }
}

/**
 * Configuração do Token do GitHub
 */
function setupGitHub() {
    const token = prompt(
        'Insira seu GitHub Personal Access Token (classic com permissão "repo" ou fine-grained com acesso a Contents):\n\n' +
        'O token é salvo apenas no navegador local (localStorage).',
        githubToken
    );
    
    if (token !== null) {
        githubToken = token.trim();
        localStorage.setItem('gh_token', githubToken);
        updateGitHubStatusUI();
        if (githubToken) {
            alert('✅ Token salvo com sucesso!\nAgora você pode clicar em "Salvar no GitHub" para atualizar os produtos no site.');
        } else {
            alert('Token removido.');
        }
    }
}

/**
 * Codifica string para Base64 com suporte total a UTF-8 (acentos, emojis, etc.)
 */
function utf8ToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

/**
 * SALVAR NO GITHUB (API) E REFLETIR NA VERCEL
 */
async function saveToGitHub() {
    if (!githubToken) {
        alert('Por favor, configure seu Token do GitHub primeiro.');
        setupGitHub();
        return;
    }

    const btn = document.getElementById('btn-save-github') || document.querySelector('.card-header button');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        btn.disabled = true;
    }

    try {
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;
        
        // 1. Pegar o SHA do arquivo atual no GitHub
        const getFile = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getFile.ok) {
            let errorMsg = `Erro ${getFile.status}`;
            try {
                const errData = await getFile.json();
                errorMsg = errData.message || errorMsg;
            } catch (_) {}
            throw new Error(`Não foi possível obter dados do arquivo no GitHub: ${errorMsg}\n\nVerifique se o seu Token tem permissão de leitura e escrita (repo).`);
        }

        const fileData = await getFile.json();
        const sha = fileData.sha;

        // 2. Preparar conteúdo formatado em UTF-8 Base64
        const jsonString = JSON.stringify(products, null, 4);
        const content = utf8ToBase64(jsonString);

        // 3. Fazer o PUT para atualizar o data/produtos.json
        const update = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update produtos.json via Admin Painel [skip ci]',
                content: content,
                sha: sha,
                branch: branch
            })
        });

        if (update.ok) {
            alert('✅ Cardápio salvo com sucesso no GitHub!\n\nA Vercel foi notificada da alteração e está atualizando o site agora mesmo no link:\nhttps://abara-da-qypsinaaw-denis1059s-projects.vercel.app\n\n(Aguarde cerca de 30 a 60 segundos para visualizar a atualização)');
        } else {
            const err = await update.json();
            alert('❌ Erro ao publicar no GitHub: ' + (err.message || 'Erro desconhecido'));
        }
    } catch (e) {
        alert('❌ Erro de conexão com o GitHub:\n' + e.message);
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

function logout() {
    location.reload();
}
