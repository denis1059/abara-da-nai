# AGENTS.md — Guia para Agentes de IA

> Este arquivo é destinado a agentes de IA (como o Gemini, Claude, GPT ou similares) que venham a trabalhar neste projeto. Leia completamente antes de fazer qualquer modificação.

---

## 🧠 O Que É Este Projeto

**O Que Vale Comprar** (`oquevalecomprar.com.br`) é um site de recomendações de produtos afiliados do Mercado Livre, hospedado na Hostinger, construído em PHP puro + HTML/CSS/JS. Não usa frameworks como Laravel, Symfony ou WordPress.

O objetivo principal é exibir produtos ao visitante, e esses produtos são gerenciados pelo dono do site por meio de um painel admin protegido por senha.

---

## 📁 Estrutura de Pastas

```
/ (raiz = public_html da Hostinger)
├── index.php                   # Ponto de entrada do site público
├── admin/
│   └── index.php               # Ponto de entrada do painel admin
├── app/
│   ├── Config/
│   │   └── App.php             # Constantes globais e lista de categorias
│   ├── Core/
│   │   ├── Database.php        # CRUD do arquivo JSON (banco de dados)
│   │   └── Auth.php            # Autenticação de sessão do admin
│   └── Helpers.php             # Funções utilitárias (formatarPreco, gerarId, etc)
├── views/
│   ├── frontend/
│   │   └── home.php            # HTML do site público
│   └── admin/
│       ├── login.php           # Tela de login
│       ├── dashboard.php       # Listagem de produtos no painel
│       ├── editor.php          # Formulário de cadastro/edição
│       └── partials/
│           ├── sidebar.php     # Sidebar reutilizável do admin
│           └── head_styles.php # CSS inline das telas admin
├── data/
│   ├── produtos.json           # Banco de dados de produtos
│   ├── posts.json              # Banco de dados de artigos (Blog)
│   ├── config.json             # Configurações globais (Pixel, Adsense)
│   └── .htaccess               # Bloqueia acesso HTTP direto aos arquivos
├── sitemap.php                 # Gerador dinâmico de Sitemap (Produtos + Blog)
├── blog.php                    # Vitrine do Blog
├── artigo.php                  # Página de leitura/artigo
├── diagnostico.php             # Script de teste de servidor e permissões (apagar após o uso)
├── robots.txt                  # Instruções para buscadores
├── .htaccess                   # Regras de SEO e Segurança na raiz
├── assets/
│   ├── css/style.css           # CSS do site público
│   ├── js/script.js            # JS do site público (filtros, drag, menu)
│   └── images/
│       └── uploads/            # Imagens enviadas pelo painel admin
├── AGENTS.md                   # Este arquivo
├── ARCHITECTURE.md
├── DATABASE.md
├── ADMIN_PANEL.md
└── SETUP.md
```

---

## ✅ Boas Práticas

- **Siga o padrão existente.** Novos recursos devem seguir a mesma convenção de nomes, estrutura de arquivos e estilo de código já presentes.
- **Toda lógica de negócio fica em `app/`.** Views não devem conter lógica complexa.
- **FLUXO DE TRABALHO (IMPORTANTE):** Nunca faça upload manual de arquivos para a Hostinger (exceto `App.php` e `produtos.json`). Todas as alterações de código (HTML/CSS/JS/PHP) devem ser enviadas via **Git Commit + Push** para o GitHub. O deploy é automático.
- **Toda as variáveis passadas para views são preparadas em `admin/index.php` ou `index.php`.** Nunca acesse `$_POST` ou `$_GET` diretamente dentro de views.
- **Use `htmlspecialchars()` ao renderizar dados do usuário** para evitar XSS.
- **Use `LOCK_EX` ao gravar o arquivo JSON** para evitar race conditions.
- **Sempre use `file_put_contents(..., LOCK_EX)` via o método `$db->save()`** — nunca escreva diretamente no JSON.

---

## ❌ O Que NÃO Fazer

- **NÃO instale Composer, Laravel, Symfony ou qualquer framework.** O projeto é PHP puro intencionalmente para ser leve e fácil de manter na Hostinger via upload manual.
- **NÃO use banco de dados MySQL.** O "banco de dados" é o arquivo `data/produtos.json`.
- **NÃO crie arquivos PHP fora da estrutura definida** sem atualizar este documento.
- **NÃO adicione lógica de roteamento complexa.** O projeto usa dois entry points: `index.php` e `admin/index.php`.
- **NÃO exponha a senha do admin** em logs, comentários ou outputs de debug.
- **NÃO apague o arquivo `data/.htaccess`** — ele protege o JSON de acesso externo.
- **NÃO mova a pasta `assets/`** — os caminhos CSS/JS/imagens do site dependem da posição atual.

---

## 🔐 Autenticação

- **1 usuário administrador único**, sem banco de dados de usuários.
- A senha está definida como constante em `app/Config/App.php`:  `define('ADMIN_PASSWORD', 'SUA_SENHA');`
- A autenticação é gerenciada pela classe `app/Core/Auth.php` via `$_SESSION`.
- Para trocar a senha: altere o valor em `App.php` e faça o upload.

---

## 🏷️ Categorias

As categorias são definidas em `app/Config/App.php` dentro de `Config::getCategorias()`. Cada categoria tem um **slug** (chave) e um **nome legível** (valor). 

Para adicionar uma nova categoria:
1. Adicione uma entrada no array em `Config::getCategorias()`.
2. Faça upload do `App.php` atualizado.
3. Ao criar produtos no painel, a nova categoria aparecerá automaticamente.

---

## 📦 Estrutura de um Produto (JSON)

```json
{
    "id": "p_66fe0b1a2c3d4",
    "titulo": "Nome do Produto",
    "preco_atual": "389.90",
    "preco_antigo": "459.00",
    "parcelas": "em até 12x sem juros",
    "imagem": "assets/images/uploads/img_abc123.jpg",
    "link": "https://meli.la/seu-link-de-afiliado",
    "categoria": "eletronicos",
    "destaque": "mais-vendido", // 'mais-vendido' ou 'desconto' ativam o Slider do topo
    "badge": "-15%",           // Texto que aparece no selo do produto
    "ativo": true
}
```

---

## 🚀 Funcionalidades Especiais

### 🔍 Busca Inteligente
Funciona em tempo real via `assets/js/script.js`. Filtra por título e categoria.

### 🎡 Hero Slider
Localizado no topo da página inicial. Exibe automaticamente até 5 produtos que possuem o campo `destaque` preenchido. Possui rotação automática a cada 5 segundos.

### 🟢 Botão WhatsApp
Gera automaticamente um link `wa.me` com mensagem personalizada contendo nome, preço e link do produto.

### 🔄 Sincronização Automática (API Mercado Livre)
Permite atualizar preços e disponibilidade de todos os produtos ativos com um clique. Resolve links curtos (`meli.la`) e usa o OAuth 2.0 oficial.

### 📈 Rastreamento e SEO Dinâmico
- O título e a descrição da página mudam dinamicamente baseados na categoria (`index.php`).
- O Sitemap é gerado via `sitemap.php` e indexado pelo Google.
- O Pixel e o Analytics são injetados nas páginas via `data/config.json`.

### 🏢 Seção Sobre Nós (Home)
Destaca o objetivo e a missão do site com foco em conversão e confiança (Prova Social), detalhando o processo de filtragem de ofertas para os usuários.

---

## 🛠️ Estabilidade e Compatibilidade (REGRAS CRÍTICAS)

Para evitar que o site saia do ar em atualizações futuras, siga estas regras:

1.  **PHP 7.4+ Compatibility:** Não use recursos do PHP 8.0+ (como `str_contains`, `str_starts_with` ou Union Types `int|string`). Use as alternativas compatíveis (`strpos`, `substr`, etc).
2.  **Case Sensitivity:** O servidor Hostinger (Linux) diferencia Maiúsculas de Minúsculas. Respeite exatamente os nomes de arquivos (ex: `Database.php` com D maiúsculo).
3.  **Integridade do Banco (JSON):** Nunca altere o formato da chave `id` (prefixo `p_`). Se mudar o formato do ID, o sistema de edição pode parar de encontrar os produtos.
4.  **Encoding:** Salve sempre os arquivos com codificação **UTF-8 (sem BOM)** para evitar caracteres estranhos () em emojis ou acentos.
5.  **Hospedagem:** O projeto é otimizado para o diretório raiz (`public_html`). Se mover para uma subpasta, o `BASE_PATH` em `App.php` deve ser revisado.
