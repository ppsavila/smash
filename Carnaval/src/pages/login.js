// Login page with Firebase

import { auth } from '../modules/auth.js';
import { router } from '../utils/router.js';

export function renderLogin() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="page flex items-center justify-center">
      <div class="container container-sm">
        <div class="card fade-in">
          <div class="text-center mb-xl">
            <h1 class="text-gradient">🎭 Carnaval</h1>
            <p class="text-secondary">Entre na sua conta</p>
          </div>

          <form id="login-form">
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
                placeholder="••••••••"
                required
              />
            </div>

            <div id="error-message" class="form-error hidden"></div>

            <button type="submit" class="btn btn-primary btn-lg" id="submit-btn" style="width: 100%;">
              Entrar
            </button>
          </form>

          <div class="text-center mt-lg">
            <p class="text-secondary">
              Não tem uma conta? 
              <a href="#" id="register-link" class="text-primary">Cadastre-se</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Handle form submission
  const form = document.querySelector('#login-form');
  const errorMessage = document.querySelector('#error-message');
  const submitBtn = document.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';

    try {
      const result = await auth.login(email, password);

      if (result.success) {
        const pendingPath = localStorage.getItem('pendingPath');
        if (pendingPath) {
          localStorage.removeItem('pendingPath');
          router.navigate(pendingPath);
        } else {
          router.navigate('/dashboard');
        }
      } else {
        errorMessage.textContent = result.error;
        errorMessage.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar';
      }
    } catch (error) {
      errorMessage.textContent = 'Erro inesperado. Tente novamente.';
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  });

  // Handle register link
  document.querySelector('#register-link').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/register');
  });
}
