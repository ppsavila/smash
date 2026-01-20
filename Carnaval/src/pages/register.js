// Register page with Firebase

import { auth } from '../modules/auth.js';
import { router } from '../utils/router.js';

export function renderRegister() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="page flex items-center justify-center">
      <div class="container container-sm">
        <div class="card fade-in">
          <div class="text-center mb-xl">
            <h1 class="text-gradient">🎭 Smash</h1>
            <p class="text-secondary">Crie sua conta</p>
          </div>

          <form id="register-form">
            <div class="form-group">
              <label class="form-label" for="name">Nome</label>
              <input 
                type="text" 
                id="name" 
                class="form-input" 
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-input" 
                placeholder="seu@email.com"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Senha</label>
              <input 
                type="password" 
                id="password" 
                class="form-input" 
                placeholder="Mínimo 6 caracteres"
                required
                minlength="6"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Foto de Perfil (opcional)</label>
              <div class="file-upload">
                <input 
                  type="file" 
                  id="photo" 
                  class="file-upload-input"
                  accept="image/*"
                />
                <label for="photo" class="file-upload-label">
                  <span style="font-size: 2rem;">📸</span>
                  <span class="text-secondary">Clique para adicionar uma foto</span>
                </label>
              </div>
              <img id="photo-preview" class="file-upload-preview hidden" alt="Preview" />
            </div>

            <div id="error-message" class="form-error hidden"></div>

            <button type="submit" class="btn btn-primary btn-lg" id="submit-btn" style="width: 100%;">
              Criar Conta
            </button>
          </form>

          <div class="text-center mt-lg">
            <p class="text-secondary">
              Já tem uma conta? 
              <a href="#" id="login-link" class="text-primary">Entrar</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Handle photo preview
  const photoInput = document.querySelector('#photo');
  const photoPreview = document.querySelector('#photo-preview');
  let photoFile = null;

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      photoFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        photoPreview.src = event.target.result;
        photoPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle form submission
  const form = document.querySelector('#register-form');
  const errorMessage = document.querySelector('#error-message');
  const submitBtn = document.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');

    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Criando conta...';

    try {
      const result = await auth.register(email, password, name, photoFile);

      if (result.success) {
        router.navigate('/dashboard');
      } else {
        errorMessage.textContent = result.error;
        errorMessage.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Criar Conta';
      }
    } catch (error) {
      errorMessage.textContent = 'Erro inesperado. Tente novamente.';
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Criar Conta';
    }
  });

  // Handle login link
  document.querySelector('#login-link').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/login');
  });
}
