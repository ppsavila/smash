# 🔧 Correção de Erro CORS (Upload de Imagens)

O erro `Access to XMLHttpRequest ... blocked by CORS policy` acontece porque o Firebase Storage precisa de permissão explícita para aceitar uploads vindos do navegador.

## Solução Rápida (Via Google Cloud Shell)

1. Acesse o **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Verifique se o projeto **"Carnaval"** (carnal-85bd6) está selecionado no topo da página.
3. Clique no botão **"Activate Cloud Shell"** (ícone de terminal no canto superior direito, ao lado do sino de notificações).
4. No terminal que aparecerá na parte inferior da tela, cole e execute os comandos abaixo (um de cada vez):

```bash
# Passo 1: Criar o arquivo de configuração
echo '[{"origin": ["*"],"method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],"responseHeader": ["Content-Type", "Authorization"],"maxAgeSeconds": 3600}]' > cors.json
```

```bash
# Passo 2: Aplicar a configuração ao seu bucket
gsutil cors set cors.json gs://carnal-85bd6.firebasestorage.app
```

**Se o Passo 2 der erro de "Bucket not found":**
Tente com este endereço alternativo (padrão antigo):
```bash
gsutil cors set cors.json gs://carnal-85bd6.appspot.com
```

## Verificação
Após executar o comando com sucesso, volte para sua aplicação (localhost) e tente fazer o upload novamente. Não precisa reiniciar o servidor.
