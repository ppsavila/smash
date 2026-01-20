# 🛡️ Correção de Permissões do Banco de Dados (Firestore)

O erro `Missing or insufficient permissions` indica que as regras de segurança do **Firestore Database** estão bloqueando o acesso aos dados.

## Como Corrigir

1. Vá ao **[Firebase Console](https://console.firebase.google.com/)**
2. Clique no seu projeto "Carnaval"
3. No menu lateral esquerdo, vá em **Build** → **Firestore Database**
4. Clique na aba **Rules** (Regras)
5. Apague tudo que estiver lá e cole este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra para usuários: só o dono pode ler e escrever seus dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regra para ficadas: 
    // - Criar: qualquer usuário autenticado
    // - Ler/Editar/Apagar: apenas o dono (userId no documento match com auth.uid)
    match /ficadas/{ficadaId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

6. Clique em **Publish** (Publicar).

## Teste

Assim que publicar (leva uns segundos), recarregue seu aplicativo. O erro deve sumir e os dados devem carregar corretamente!
