# 🛡️ Correção de Permissões (Storage Rules)

O erro `storage/unauthorized` significa que as regras de segurança do Firebase Storage estão bloqueando o upload.

Isso acontece porque, por padrão, o Firebase bloqueia todos os uploads se você não configurar quem pode salvar arquivos.

## Como Corrigir

1. Vá ao **[Firebase Console](https://console.firebase.google.com/)**
2. Clique no seu projeto "Carnaval"
3. No menu lateral esquerdo, vá em **Build** → **Storage**
4. Clique na aba **Rules** (Regras)
5. Apague tudo que estiver lá e cole este código:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permite que qualquer usuário autenticado leia/veja fotos
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }

    // Regras para foto de perfil (apenas o dono pode editar)
    match /users/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para fotos de ficadas (qualquer autenticado pode criar, dono pode editar)
    match /ficadas/{ficadaId}/{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

6. Clique em **Publish** (Publicar).

## Teste

Assim que publicar (leva uns segundos), tente cadastrar o usuário novamente (ou apenas reenviar o formulário). O erro deve desaparecer!
