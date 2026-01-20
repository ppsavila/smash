# 🎭 Carnaval

Uma aplicação web moderna para gerenciar usuários e suas "ficadas" do Carnaval, com upload de fotos e uma interface premium em dark mode.

**Agora com Firebase! ☁️** Dados salvos na nuvem, não apenas no navegador.

## 🔥 Configuração do Firebase

**IMPORTANTE:** Antes de executar o aplicativo, você precisa configurar o Firebase.

Siga as instruções detalhadas em: **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

Resumo rápido:
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Email/Password)
3. Crie um banco Firestore
4. Ative o Storage
5. Copie as credenciais para o arquivo `.env`

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Configurar Firebase (veja FIREBASE_SETUP.md)
# Edite o arquivo .env com suas credenciais

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse: **http://localhost:5173/**

## ✨ Funcionalidades

- ✅ **Autenticação de Usuários**
  - Cadastro com email, senha, nome e foto
  - Login e logout
  - Gerenciamento de perfil

- ✅ **Gerenciamento de Ficadas**
  - Criar ficadas com nome, Instagram, telefone e foto
  - Visualizar todas as ficadas em grid
  - Editar informações das ficadas
  - Excluir ficadas

- ✅ **Design Premium**
  - Dark mode moderno
  - Efeitos glassmorphism
  - Gradientes vibrantes (roxo/rosa)
  - Animações suaves
  - Totalmente responsivo

## 🛠️ Tecnologias

- **Firebase** - Backend completo (Auth, Firestore, Storage)
- **Vite** - Build tool rápido
- **Vanilla JavaScript** - Sem frameworks
- **CSS3** - Design system completo
- **Google Fonts** - Tipografia Inter

## 📁 Estrutura do Projeto

```
src/
├── firebase.js          # Configuração do Firebase
├── main.js              # Entry point e configuração de rotas
├── style.css            # Sistema de design completo
├── modules/
│   ├── auth.js          # Autenticação com Firebase Auth
│   └── ficadas.js       # CRUD com Firestore
├── pages/
│   ├── login.js         # Página de login
│   ├── register.js      # Página de cadastro
│   ├── dashboard.js     # Dashboard principal
│   ├── profile.js       # Perfil do usuário
│   └── ficada-form.js   # Formulário de ficada
└── utils/
    ├── router.js        # Roteamento client-side
    ├── storage.js       # Wrapper do localStorage (legado)
    └── upload.js        # Upload para Firebase Storage
```

## ☁️ Firebase Backend

Esta aplicação usa **Firebase** como backend completo:

- **Firebase Authentication** - Autenticação segura com email/senha
- **Cloud Firestore** - Banco de dados NoSQL em tempo real
- **Firebase Storage** - Armazenamento de imagens na nuvem
- **Security Rules** - Regras de segurança para proteger dados

Todos os dados são salvos na nuvem e sincronizados automaticamente!

## 📝 Licença

MIT

---

Desenvolvido com 💜 para o Carnaval
