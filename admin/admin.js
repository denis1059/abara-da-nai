let products = [];
let categories = [];
let githubToken = localStorage.getItem('gh_token') || '';
let repoOwner = 'denis1059';
let repoName = 'abara-da-nai';
let filePath = 'data/produtos.json';
let categoriesFilePath = 'data/categorias.json';
let branch = 'master';

// Imagens pendentes de upload para o GitHub { "assets/images/uploads/img_xxx.jpg": "base64..." }
let pendingImages = {};
try {
    pendingImages = JSON.parse(sessionStorage.getItem('pending_images') || '{}');
} catch (_) {
    pendingImages = {};
}

// Senha simples para o painel estático
const ADMIN_PASS = 'admin'; 

/**
 * Retorna caminho válido de imagem para a área admin
 */
function getAdminImgSrc(img) {
    if (!img || img.trim() === '') return '../assets/images/uploads/1.jpeg';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
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
        statusEl.innerHTML = `<span style="color: #2e7d32; font-weight: bold;"><i class="fas fa-check-circle"></i> Token conectado (${masked}) &bull; Repositório: ${repoOwner}/${repoName}</span>`;
    } else {
        statusEl.innerHTML = `<span style="color: #c62828; font-weight: bold;"><i class="fas fa-exclamation-triangle"></i> Token NÃO configurado. Clique ao lado para conectar.</span>`;
    }
}

/**
 * Alterna visualização de texto/senha no campo do painel
 */
function togglePasswordVisibility() {
    const input = document.getElementById('admin-pass');
    const icon = document.getElementById('pass-eye-icon');
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Intercepta o envio do formulário de login no teclado do celular (tecla 'Ir' / 'Enter') ou botão
 */
function handleLoginSubmit(event) {
    if (event) {
        event.preventDefault();
    }
    checkLogin();
}

/**
 * Verifica login inicial (otimizado para celular e desktop)
 */
function checkLogin() {
    const input = document.getElementById('admin-pass');
    const errorEl = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');
    const submitBtn = document.getElementById('btn-login-submit');

    if (!input) return;

    // Remove espaços acidentais comuns no teclado de smartphones
    const pass = (input.value || '').trim();

    if (!pass) {
        if (errorEl) {
            if (errorText) errorText.innerText = 'Por favor, digite a senha.';
            errorEl.style.display = 'block';
        }
        input.focus();
        return;
    }

    // Aceita 'admin' mesmo com maiúscula acidental do corretor do celular (ex: 'Admin')
    if (pass.toLowerCase() === ADMIN_PASS.toLowerCase() || pass === ADMIN_PASS) {
        if (errorEl) errorEl.style.display = 'none';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Entrando...</span>';
        }

        try {
            sessionStorage.setItem('admin_logged', 'true');
        } catch (_) {}

        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }

        init();
    } else {
        if (errorEl) {
            if (errorText) errorText.innerText = 'Senha incorreta! Dica: a senha é admin';
            errorEl.style.display = 'block';
        }
        input.focus();
    }
}

// Verifica se já estava logado na sessão ativa
function checkExistingSession() {
    try {
        if (sessionStorage.getItem('admin_logged') === 'true') {
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.style.display = 'none';
            }
            init();
        }
    } catch (_) {}
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkExistingSession);
} else {
    checkExistingSession();
}

/**
 * Inicialização do Painel
 */
async function init() {
    updateGitHubStatusUI();
    await loadCategories();
    await loadProducts();
}

/**
 * Carrega categorias do JSON
 */
async function loadCategories() {
    try {
        const url = `../${categoriesFilePath}?t=${Date.now()}`;
        const response = await fetch(url);
        if (response.ok) {
            categories = await response.json();
        } else {
            categories = [
                { id: 'abara', nome: 'Abará' },
                { id: 'acaraje', nome: 'Acarajé' },
                { id: 'porcoes', nome: 'Porções' },
                { id: 'bebidas', nome: 'Bebidas' }
            ];
        }
    } catch (_) {
        categories = [
            { id: 'abara', nome: 'Abará' },
            { id: 'acaraje', nome: 'Acarajé' },
            { id: 'porcoes', nome: 'Porções' },
            { id: 'bebidas', nome: 'Bebidas' }
        ];
    }
    populateCategorySelect();
    renderCategoriesTable();
}

/**
 * Preenche o select de categorias no modal de produtos
 */
function populateCategorySelect(selectedId = '') {
    const select = document.getElementById('p-categoria');
    if (!select) return;

    select.innerHTML = '';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.innerText = cat.nome;
        if (cat.id === selectedId) opt.selected = true;
        select.appendChild(opt);
    });
}

/**
 * Renderiza tabela do modal de categorias
 */
function renderCategoriesTable() {
    const tbody = document.getElementById('category-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    categories.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${cat.nome}</strong></td>
            <td><code style="background:#eee; padding:2px 6px; border-radius:4px;">${cat.id}</code></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="handleEditCategory('${cat.id}')" title="Editar Nome"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" style="background:#ff5252; color:#fff;" onclick="handleDeleteCategory('${cat.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Abre modal de categorias
 */
function showCategoryModal() {
    renderCategoriesTable();
    document.getElementById('category-modal').classList.add('active');
}

/**
 * Fecha modal de categorias
 */
function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
    populateCategorySelect();
}

/**
 * Adiciona nova categoria
 */
function handleAddCategory() {
    const input = document.getElementById('new-cat-name');
    const name = input.value.trim();
    if (!name) {
        alert('Digite o nome da categoria.');
        return;
    }

    // Gera slug amigável
    const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    if (categories.some(c => c.id === slug)) {
        alert('Já existe uma categoria com esse código/nome.');
        return;
    }

    categories.push({ id: slug, nome: name });
    input.value = '';
    renderCategoriesTable();
    populateCategorySelect(slug);
    alert(`✅ Categoria "${name}" adicionada!\n\nClique em "Salvar no GitHub" na tela principal para publicar a nova categoria no site.`);
}

/**
 * Edita o nome de uma categoria
 */
function handleEditCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const newName = prompt(`Novo nome para a categoria "${cat.nome}":`, cat.nome);
    if (newName && newName.trim() !== '') {
        cat.nome = newName.trim();
        renderCategoriesTable();
        populateCategorySelect();
        renderAdminProducts();
        alert('Nome da categoria atualizado. Clique em "Salvar no GitHub" para publicar.');
    }
}

/**
 * Exclui uma categoria
 */
function handleDeleteCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    const inUse = products.filter(p => p.categoria === id).length;
    let msg = `Deseja realmente excluir a categoria "${cat.nome}"?`;
    if (inUse > 0) {
        msg += `\n\nAtenção: Existem ${inUse} produto(s) cadastrado(s) nesta categoria.`;
    }

    if (confirm(msg)) {
        categories = categories.filter(c => c.id !== id);
        renderCategoriesTable();
        populateCategorySelect();
        renderAdminProducts();
        alert('Categoria removida da lista. Clique em "Salvar no GitHub" para confirmar a exclusão no site.');
    }
}

/**
 * Carrega produtos do repositório
 */
async function loadProducts() {
    const tbody = document.getElementById('admin-product-list');
    try {
        const url = `../${filePath}?t=${Date.now()}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Arquivo produtos.json não encontrado');
        
        products = await response.json();
        renderAdminProducts();
    } catch (e) {
        console.error('Erro detalhado:', e);
        if (tbody && (!products || products.length === 0)) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #c62828;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem;"></i><br><br>
                        <strong>Erro ao carregar produtos:</strong> ${e.message}<br>
                        <small style="color: #666;">Verifique se o arquivo data/produtos.json existe no repositório.</small>
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * Retorna o nome amigável da categoria
 */
function getCategoryName(catId) {
    const found = categories.find(c => c.id === catId);
    return found ? found.nome : catId;
}

/**
 * Renderiza lista na tabela de produtos
 */
function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-list');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${getAdminImgSrc(p.imagem)}" class="thumb" onerror="this.src='../assets/images/uploads/1.jpeg'"></td>
            <td><strong>${p.titulo}</strong></td>
            <td><span style="background: #fff3e0; color: #ff6b00; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${getCategoryName(p.categoria)}</span></td>
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
 * Abre modal para novo/editar produto
 */
function showProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const statusInd = document.getElementById('upload-status-indicator');
    const fileInput = document.getElementById('p-file-input');
    
    if (fileInput) fileInput.value = '';
    if (statusInd) {
        statusInd.style.display = 'none';
        statusInd.innerHTML = '';
    }

    if (product) {
        title.innerText = 'Editar Produto';
        document.getElementById('p-id').value = product.id;
        document.getElementById('p-titulo').value = product.titulo;
        document.getElementById('p-descricao').value = product.descricao;
        document.getElementById('p-preco-atual').value = product.preco_atual;
        document.getElementById('p-preco-antigo').value = product.preco_antigo || '';
        populateCategorySelect(product.categoria);
        document.getElementById('p-imagem').value = product.imagem || '';
        document.getElementById('p-badge').value = product.badge || '';
        document.getElementById('image-preview').src = getAdminImgSrc(product.imagem);
    } else {
        title.innerText = 'Novo Produto';
        document.getElementById('product-form').reset();
        document.getElementById('p-id').value = '';
        populateCategorySelect(categories[0]?.id || 'abara');
        document.getElementById('p-imagem').value = 'assets/images/uploads/1.jpeg';
        document.getElementById('image-preview').src = '../assets/images/uploads/1.jpeg';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
}

/**
 * Redimensiona e comprime uma imagem usando Canvas para upload super leve
 */
function compressImage(dataUrl, maxWidth = 1000, quality = 0.85) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = dataUrl;
    });
}

/**
 * Usuário escolhe foto da galeria do celular ou computador
 */
async function handleImageFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
    }

    const statusInd = document.getElementById('upload-status-indicator');
    if (statusInd) {
        statusInd.style.display = 'block';
        statusInd.innerHTML = '<span style="color:#666;"><i class="fas fa-spinner fa-spin"></i> Processando foto da galeria...</span>';
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const rawDataUrl = e.target.result;
        
        // Comprime para ficar ultra leve e rápido no celular
        const compressedDataUrl = await compressImage(rawDataUrl, 1000, 0.85);
        
        // Atualiza a pré-visualização instantaneamente
        document.getElementById('image-preview').src = compressedDataUrl;

        // Gera nome de arquivo único
        const cleanName = 'img_' + Date.now() + '.jpg';
        const targetPath = `assets/images/uploads/${cleanName}`;
        
        document.getElementById('p-imagem').value = targetPath;

        // Extrai o Base64 puro
        const base64Pure = compressedDataUrl.split(',')[1];
        pendingImages[targetPath] = base64Pure;
        
        try {
            sessionStorage.setItem('pending_images', JSON.stringify(pendingImages));
        } catch (_) {}

        const sizeKb = (base64Pure.length * 0.75 / 1024).toFixed(0);
        if (statusInd) {
            statusInd.innerHTML = `<span class="badge-upload-status"><i class="fas fa-check"></i> Foto pronta da galeria (${sizeKb} KB) &bull; ${cleanName}</span>`;
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Seleciona uma imagem de exemplo já existente
 */
function selectPresetImage(path) {
    document.getElementById('p-imagem').value = path;
    document.getElementById('image-preview').src = `../${path}`;
    const statusInd = document.getElementById('upload-status-indicator');
    if (statusInd) {
        statusInd.style.display = 'block';
        statusInd.innerHTML = `<span class="badge-upload-status"><i class="fas fa-check"></i> Foto selecionada</span>`;
    }
}

/**
 * Atualiza o preview caso o usuário digite/cole um link
 */
function updateImagePreviewFromInput() {
    const val = document.getElementById('p-imagem').value.trim();
    document.getElementById('image-preview').src = getAdminImgSrc(val);
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
        imagem: document.getElementById('p-imagem').value.trim() || 'assets/images/uploads/1.jpeg',
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
    alert('✅ Produto salvo na lista local!\n\nLembre-se de clicar em "Salvar no GitHub" no topo para publicar as alterações no site.');
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
        'Insira seu GitHub Personal Access Token (com permissão "repo"):\n\n' +
        'O token é salvo apenas no navegador local (localStorage).',
        githubToken
    );
    
    if (token !== null) {
        githubToken = token.trim();
        localStorage.setItem('gh_token', githubToken);
        updateGitHubStatusUI();
        if (githubToken) {
            alert('✅ Token salvo com sucesso!\nAgora você pode publicar fotos, categorias e produtos.');
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
 * Função utilitária para atualizar ou criar um arquivo no GitHub via Contents API
 */
async function putFileToGitHub(path, contentBase64, commitMsg) {
    let sha = null;
    try {
        const getRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}?ref=${branch}`, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        }
    } catch (_) {}

    const body = {
        message: commitMsg,
        content: contentBase64,
        branch: branch
    };
    if (sha) body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Erro ao salvar ${path}: ${err.message || 'Erro desconhecido'}`);
    }
}

/**
 * SALVAR NO GITHUB (API) — Fotos da Galeria + Categorias + Cardápio
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
        btn.disabled = true;
    }

    try {
        const imagePaths = Object.keys(pendingImages);
        const totalImages = imagePaths.length;

        // 1. Upload das fotos pendentes da galeria
        if (totalImages > 0) {
            for (let i = 0; i < totalImages; i++) {
                const imgPath = imagePaths[i];
                if (btn) {
                    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando foto (${i + 1}/${totalImages})...`;
                }
                await putFileToGitHub(imgPath, pendingImages[imgPath], `Upload imagem ${imgPath} via Admin [skip ci]`);
            }
            pendingImages = {};
            try { sessionStorage.removeItem('pending_images'); } catch (_) {}
        }

        // 2. Salvar categorias.json
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando categorias...';
        }
        const categoriesJsonStr = JSON.stringify(categories, null, 4);
        await putFileToGitHub(categoriesFilePath, utf8ToBase64(categoriesJsonStr), 'Update categorias.json via Admin [skip ci]');

        // 3. Salvar produtos.json
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando cardápio...';
        }
        const productsJsonStr = JSON.stringify(products, null, 4);
        await putFileToGitHub(filePath, utf8ToBase64(productsJsonStr), 'Update produtos.json via Admin [skip ci]');

        alert('🎉 Sucesso total!\n\nFotos, categorias e produtos foram publicados no GitHub.\nA Vercel iniciou a atualização automática e o site estará atualizado em instantes!');
    } catch (e) {
        alert('❌ Erro durante a publicação no GitHub:\n' + e.message);
    } finally {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

function logout() {
    try {
        sessionStorage.removeItem('admin_logged');
    } catch (_) {}
    location.reload();
}
