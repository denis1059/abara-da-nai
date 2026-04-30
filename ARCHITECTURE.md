# ARCHITECTURE.md — Arquitetura do Sistema

## Visão Geral

O projeto segue uma arquitetura **MVC Simplificado** (Model-View-Controller) sem framework, adaptada para um ambiente de hospedagem compartilhada (Hostinger) com **Deploy Automático via Git**.

---

## Camadas da Aplicação

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR DO USUÁRIO                  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP Request
                         ▼
┌─────────────────────────────────────────────────────────┐
│               ENTRY POINTS (Controllers)                 │
│                                                         │
│   index.php          admin/index.php                    │
│   (site público)     (painel admin)                     │
└────────┬─────────────────────┬───────────────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE LÓGICA (app/)               │
│                                                         │
│   Config/App.php     Core/Database.php   Core/Auth.php  │
│   MercadoLivre.php   (Banco de dados)    (Autenticação) │
│   (Integração ML)    Helpers.php                        │
└────────┬─────────────────────┬───────────────────────────┘
         │                     │
         ▼                     ▼
├── data/
│   ├── produtos.json           # Banco de dados de produtos
│   ├── posts.json              # Banco de dados de artigos (Blog)
│   ├── config.json             # Configurações globais (Pixel, Adsense)
│   └── .htaccess               # Proteção de acesso
├── sitemap.php                 # Gerador dinâmico de Sitemap (Produtos + Blog)
├── blog.php                    # Vitrine do Blog
├── artigo.php                  # Página de leitura (Otimizada para Adsense)
├── diagnostico.php             # Script de teste de permissões e erros (apagar após uso)
├── robots.txt                  # Instruções para buscadores
└── .htaccess                   # Regras de URL amigável e segurança

---

## 🛠️ Tecnologias e Fluxos

### 1. Blog & CMS
Utiliza o arquivo `posts.json` para armazenar artigos. No Admin, integra o **Quill.js** como editor WYSIWYG, permitindo formatação rica sem necessidade de HTML manual.

### 2. SEO e Sitemaps
O `sitemap.php` lê dinamicamente as categorias de produtos e os slugs dos artigos do blog, gerando um mapa XML completo para indexação no Google.

### 3. Lógica de Desconto
O sistema calcula automaticamente a porcentagem de desconto (`(Antigo - Atual) / Antigo`) sempre que os dois valores estão presentes, injetando o badge "-X% OFF" se nenhum texto manual for definido.
```

---

## Fluxo: Site Público

```
Visitante → GET /
  → index.php
    → require app/Config/App.php (constantes)
    → require app/Core/Database.php (classe Database)
    → require app/Helpers.php (funções)
    → $db->getActive() lê data/produtos.json e filtra ativo=true
    → $db->getSettings() lê data/config.json (Pixel/Analytics)
    → Gera $metaTitle e $metaDesc dinâmicos com base na categoria
    → Separa itens com `destaque` para o Hero Slider
    → require views/frontend/home.php (renderiza HTML com os dados, incluindo Hero, Lista de Produtos e Seção Sobre Nós)
  → Resposta HTML ao navegador
```

## Fluxo: SEO & Sitemaps

```
Google Bot → GET /sitemap.xml
  → .htaccess (rewrite) → sitemap.php
    → Config::getCategorias()
    → Gera XML dinâmico com todas as categorias
  → Resposta XML
```

## Fluxo: Painel Admin — Login

```
Admin → POST /admin/ {acao: login, senha: ...}
  → admin/index.php
    → Auth::login($senha) verifica contra ADMIN_PASSWORD
    → Se correto: $_SESSION['admin_logado'] = true → redirect /admin/
    → Se errado: $erroLogin = "..." → renderiza views/admin/login.php
```

## Fluxo: Painel Admin — Publicar Produto

```
Admin → POST /admin/ {acao: salvar, titulo: ..., preco: ..., ...}
  → admin/index.php
    → Auth::check() → ok
    → Upload da imagem para assets/images/uploads/
    → Monta array $produto com os dados do formulário
    → $db->save($produto) → grava em data/produtos.json
    → redirect /admin/?msg=Produto publicado com sucesso!
```

## Fluxo: Sincronização de Preços (Mercado Livre)

```
Admin → POST /admin/ {acao: ml_sync}
  → admin/index.php
    → Instancia MercadoLivre.php
    → $ml->ensureAccessToken() (Atualiza via Refresh Token se necessário)
    → Loop em todos os produtos ativos:
      → $ml->resolveUrl($link) (Segue redirecionamentos meli.la)
      → $ml->extractItemId($finalUrl) (Extrai MLBXXXXX)
      → $ml->getItem($id) (Consulta API oficial do ML)
      → Atualiza preco_atual e preco_antigo no array do produto
      → $db->save($produto)
  → redirect /admin/?msg=Sincronização concluída!
```

---

## Decisões de Arquitetura

| Decisão | Motivo |
|---|---|
| PHP puro sem framework | Compatível com qualquer hospedagem; leve e rápido |
| JSON como banco de dados | Sem necessidade de MySQL; fácil de visualizar e editar manualmente |
| Dois entry points (index + admin) | Clareza de responsabilidades; sem roteador complexo |
| Deploy via Git/GitHub | Elimina erros de upload manual; controle de versão profissional |
| Views em pasta separada | Separação clara entre lógica e apresentação |
