# Abará da Nai — Catálogo Online & Pedidos via WhatsApp

Landing page comercial estilo catálogo interativo com carrinho de compras, finalização direta via WhatsApp e painel administrativo integrado ao GitHub e Vercel.

**Link em Produção:** [https://abara-da-qypsinaaw-denis1059s-projects.vercel.app](https://abara-da-qypsinaaw-denis1059s-projects.vercel.app)  
**Repositório GitHub:** [https://github.com/denis1059/abara-da-nai](https://github.com/denis1059/abara-da-nai)

---

## 🚀 Como Funciona a Integração GitHub + Vercel

O site funciona com um fluxo de **Deploy Contínuo (CI/CD)**:

```
┌─────────────────────────────────┐
│     Painel Admin (/admin/)      │
│  Edição visual dos produtos     │
└────────────────┬────────────────┘
                 │ 1. Clicar em "Salvar no GitHub"
                 │    (usa GitHub Personal Access Token)
                 ▼
┌─────────────────────────────────┐
│    GitHub (branch master)       │
│    denis1059/abara-da-nai       │
│    Atualiza data/produtos.json  │
└────────────────┬────────────────┘
                 │ 2. Webhook dispara Deploy Automático
                 ▼
┌─────────────────────────────────┐
│           Vercel                │
│  Deploy atualizado no ar!       │
│  abara-da-qypsinaaw...          │
└─────────────────────────────────┘
```

Toda alteração feita (seja pelo Painel Admin no navegador ou via Git) é salva na branch `master` do GitHub. A Vercel detecta o novo commit e atualiza o site automaticamente em menos de 1 minuto!

---

## 🔑 Como Conectar o Painel Admin ao GitHub (Passo a Passo)

Para que o dono do site consiga cadastrar, editar e excluir produtos diretamente pelo navegador no painel administrativo sem precisar de código:

### 1. Gerar o Token de Acesso no GitHub (PAT)
1. Acesse sua conta no GitHub e vá em **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)** (ou acesse direto: [https://github.com/settings/tokens](https://github.com/settings/tokens)).
2. Clique em **Generate new token** (Generate new token (classic)).
3. No campo **Note**, digite: `Painel Admin Abara da Nai`.
4. Em **Expiration**, selecione um prazo (ou `No expiration`).
5. Nas caixas de seleção de escopo, marque a opção **`repo`** (Full control of private/public repositories).
6. Role até o final da página e clique em **Generate token**.
7. Copie o token gerado (começa com `ghp_...`). **Atenção:** Guarde-o em local seguro, pois o GitHub só mostra ele uma vez.

### 2. Configurar o Token no Painel
1. Acesse o painel admin:
   `https://abara-da-qypsinaaw-denis1059s-projects.vercel.app/admin/`
2. Digite a senha do painel: `admin`
3. Na barra azul de aviso no topo, clique em **"Configurar Token"**.
4. Cole o seu token do GitHub e confirme.
5. Pronto! O status mudará para verde: `Token configurado`.

### 3. Salvar Produtos e Publicar
1. Adicione, edite ou remova produtos na lista.
2. Ao terminar, clique no botão azul **"Salvar no GitHub"** no topo da página.
3. Aguarde o aviso de confirmação.
4. A Vercel iniciará o build automático e seu site estará atualizado em instantes!

---

## 💻 Como Subir Alterações Locais de Código para o GitHub

Se você alterou os arquivos de código (HTML, CSS ou JS) no seu computador e deseja enviar para o GitHub:

### Opção A: Pelo GitHub Web (Mais fácil)
1. Acesse o repositório: [https://github.com/denis1059/abara-da-nai](https://github.com/denis1059/abara-da-nai)
2. Clique no botão **"Add file"** > **"Upload files"**.
3. Arraste os arquivos alterados (`index.html`, `assets/`, `admin/`, `vercel.json`, etc.).
4. Clique em **"Commit changes"**.
5. A Vercel atualizará o site automaticamente!

### Opção B: Pelo GitHub Desktop
1. Abra o [GitHub Desktop](https://desktop.github.com/).
2. Abra o repositório `abara-da-nai`.
3. Escreva uma mensagem de commit (ex: "Atualização da landing page e admin").
4. Clique em **Commit to master** e depois em **Push origin**.

### Opção C: Pelo Terminal Git
```bash
git add .
git commit -m "Atualizações de layout, WhatsApp e admin"
git push origin master
```

---

## 📁 Estrutura de Arquivos

```
/
├── index.html               # Página inicial (Landing page e catálogo)
├── vercel.json              # Configurações de rotas e cache da Vercel
├── base.md                  # Especificação original do projeto
├── README.md                # Este manual
├── admin/
│   ├── index.html           # Interface do painel de controle
│   └── admin.js             # Lógica de CRUD e integração com a API do GitHub
├── data/
│   └── produtos.json        # Base de dados em JSON com os produtos e preços
└── assets/
    ├── css/
    │   └── style.css        # Folha de estilo moderna, responsiva e com paleta baiana
    ├── js/
    │   └── script.js        # Filtros, carrinho dinâmico e integração WhatsApp
    └── images/
        └── uploads/         # Imagens dos produtos
```

---

## 📱 Contato & Encomendas

- **WhatsApp:** (71) 98405-2279
- **Instagram:** [@abara.da.Nai](https://instagram.com/abara.da.Nai)
- **Localização:** Salvador - BA
