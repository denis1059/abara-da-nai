let products = [];
let githubToken = localStorage.getItem('gh_token') || '';
let repoOwner = 'denis1059';
let repoName = 'abara-da-nai';
let filePath = 'data/produtos.json';
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
        document.getElementById('p-categoria').value = product.categoria;
        document.getElementById('p-imagem').value = product.imagem || '';
        document.getElementById('p-badge').value = product.badge || '';
        
        document.getElementById('image-preview').src = getAdminImgSrc(product.imagem);
    } else {
        title.innerText = 'Novo Produto';
        document.getElementById('product-form').reset();
        document.getElementById('p-id').value = '';
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
        statusInd.innerHTML = '<span style="color:#666;"><i class="fas fa-spinner fa-spin"></i> Processando foto...</span>';
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const rawDataUrl = e.target.result;
        
        // Comprime para ficar ultra rápido no celular (~80KB a 120KB)
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
            statusInd.innerHTML = `<span class="badge-upload-status"><i class="fas fa-check"></i> Foto pronta (${sizeKb} KB) &bull; ${cleanName}</span>`;
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
        statusInd.innerHTML = `<span class="badge-upload-status"><i class="fas fa-check"></i> Foto existente selecionada</span>`;
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
    alert('✅ Produto salvo na lista local!\n\nLembre-se de clicar no botão "Salvar no GitHub" no topo para publicar as novas fotos e produtos no site da Vercel.');
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
            alert('✅ Token salvo com sucesso!\nAgora você pode fazer upload de fotos da galeria e salvar produtos.');
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
 * SALVAR NO GITHUB (API) — Faz upload das imagens pendentes e do cardápio
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

        // 1. Upload de cada imagem pendente da galeria para o GitHub
        if (totalImages > 0) {
            for (let i = 0; i < totalImages; i++) {
                const imgPath = imagePaths[i];
                const base64Content = pendingImages[imgPath];

                if (btn) {
                    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando foto (${i + 1}/${totalImages})...`;
                }

                // Verifica se já existe para obter o SHA se necessário
                let imgSha = null;
                try {
                    const checkRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imgPath}?ref=${branch}`, {
                        headers: {
                            'Authorization': `Bearer ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    if (checkRes.ok) {
                        const checkData = await checkRes.json();
                        imgSha = checkData.sha;
                    }
                } catch (_) {}

                const uploadBody = {
                    message: `Upload image ${imgPath} via Admin [skip ci]`,
                    content: base64Content,
                    branch: branch
                };
                if (imgSha) uploadBody.sha = imgSha;

                const uploadRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${imgPath}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(uploadBody)
                });

                if (!uploadRes.ok) {
                    const err = await uploadRes.json();
                    throw new Error(`Falha no upload da foto ${imgPath}: ${err.message || 'Erro desconhecido'}`);
                }
            }

            // Limpa as imagens pendentes já enviadas
            pendingImages = {};
            try { sessionStorage.removeItem('pending_images'); } catch (_) {}
        }

        // 2. Upload do arquivo data/produtos.json atualizado
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando cardápio...';
        }

        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;
        
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
            throw new Error(`Não foi possível ler o arquivo no GitHub: ${errorMsg}\n\nVerifique as permissões do seu token.`);
        }

        const fileData = await getFile.json();
        const sha = fileData.sha;

        const jsonString = JSON.stringify(products, null, 4);
        const content = utf8ToBase64(jsonString);

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
            alert('🎉 Fotos e cardápio publicados com sucesso no GitHub!\n\nA Vercel está atualizando o site agora mesmo.');
        } else {
            const err = await update.json();
            alert('❌ Erro ao publicar no GitHub: ' + (err.message || 'Erro desconhecido'));
        }
    } catch (e) {
        alert('❌ Erro durante o salvamento:\n' + e.message);
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
