// Ficada form page (create/edit) with Firebase

import { ficadas } from '../modules/ficadas.js';
import { router } from '../utils/router.js';

export async function renderFicadaForm(ficadaId = null) {
  const app = document.querySelector('#app');
  const isEdit = !!ficadaId;

  // Show loading if editing
  if (isEdit) {
    app.innerHTML = `
      <div class="page flex items-center justify-center">
        <div class="spinner"></div>
      </div>
    `;
  }

  let ficada = null;
  if (isEdit) {
    ficada = await ficadas.getById(ficadaId);
    if (!ficada) {
      router.navigate('/dashboard');
      return;
    }
  }

  app.innerHTML = `
    <div class="navbar">
      <div class="container">
        <div class="navbar-content">
          <div class="navbar-brand">🎭 Smash</div>
          <button id="back-btn" class="btn btn-ghost btn-sm">← Voltar</button>
        </div>
      </div>
    </div>

    <div class="page">
      <div class="container container-sm">
        <div class="page-header">
          <h1 class="page-title">${isEdit ? 'Editar Hook' : 'Novo Hook'}</h1>
          <p class="page-subtitle">Preencha as informações</p>
        </div>

        <div class="card">
          <form id="ficada-form">
            <div class="form-group">
              <label class="form-label" for="name">Nome *</label>
              <input 
                type="text" 
                id="name" 
                class="form-input" 
                placeholder="Nome da pessoa"
                value="${ficada?.name || ''}"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="instagram">Instagram</label>
              <input 
                type="text" 
                id="instagram" 
                class="form-input" 
                placeholder="@usuario (sem @)"
                value="${ficada?.instagram || ''}"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">Telefone</label>
              <input 
                type="tel" 
                id="phone" 
                class="form-input" 
                placeholder="(00) 00000-0000"
                value="${ficada?.phone || ''}"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Foto</label>
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
              <img 
                id="photo-preview" 
                class="file-upload-preview ${ficada?.photoURL ? '' : 'hidden'}" 
                src="${ficada?.photoURL || ''}"
                alt="Preview" 
              />
            </div>

            <div id="error-message" class="form-error hidden"></div>

            <div class="flex gap-md">
              <button type="button" id="cancel-btn" class="btn btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary flex-1" id="submit-btn">
                ${isEdit ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
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
  const form = document.querySelector('#ficada-form');
  const errorMessage = document.querySelector('#error-message');
  const submitBtn = document.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');

    const name = document.querySelector('#name').value;
    const instagram = document.querySelector('#instagram').value.replace('@', '');
    const phone = document.querySelector('#phone').value;

    const ficadaData = {
      name,
      instagram,
      phone,
      photoFile
    };

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = isEdit ? 'Salvando...' : 'Criando...';

    try {
      const result = isEdit
        ? await ficadas.update(ficadaId, ficadaData)
        : await ficadas.create(ficadaData);

      if (result.success) {
        router.navigate('/dashboard');
      } else {
        errorMessage.textContent = result.error;
        errorMessage.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'Salvar' : 'Criar';
      }
    } catch (error) {
      errorMessage.textContent = 'Erro inesperado. Tente novamente.';
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Salvar' : 'Criar';
    }
  });

  // Handle cancel and back buttons
  document.querySelector('#cancel-btn').addEventListener('click', () => {
    router.navigate('/dashboard');
  });

  document.querySelector('#back-btn').addEventListener('click', () => {
    router.navigate('/dashboard');
  });
}
