// Profile page with Firebase

import { auth } from '../modules/auth.js';
import { router } from '../utils/router.js';

export function renderProfile() {
  const app = document.querySelector('#app');
  const currentUser = auth.getCurrentUser();

  if (!currentUser) {
    router.navigate('/login');
    return;
  }

  // Mock settings - in real app, these would come from user profile
  const defaults = {
    instagram: currentUser.instagram || '',
    phone: currentUser.phone || '',
    shareInstagram: currentUser.shareInstagram ?? true, // Default true
    sharePhone: currentUser.sharePhone ?? false
  };

  app.innerHTML = `
    <div class="navbar">
      <div class="container">
        <div class="navbar-content">
          <div class="navbar-brand">🎭 Carnaval</div>
          <button id="back-btn" class="btn btn-ghost btn-sm">← Voltar</button>
        </div>
      </div>
    </div>

    <div class="page">
      <div class="container container-sm">
        <div class="page-header">
          <h1 class="page-title">Meu Perfil</h1>
          <p class="page-subtitle">Gerencie suas informações e privacidade</p>
        </div>

        <div class="card">
          <div class="text-center mb-xl">
            ${currentUser.photoURL
      ? `<img src="${currentUser.photoURL}" class="avatar avatar-xl" alt="${currentUser.name}" style="margin: 0 auto;" />`
      : `<div class="avatar avatar-xl flex items-center justify-center" style="background: var(--gradient-primary); font-size: 3rem; margin: 0 auto;">
                  ${currentUser.name.charAt(0).toUpperCase()}
                </div>`
    }
          </div>

          <form id="profile-form">
            <h3 class="text-lg font-bold mb-md">Informações Pessoais</h3>
            
            <div class="form-group">
              <label class="form-label" for="name">Nome</label>
              <input 
                type="text" 
                id="name" 
                class="form-input" 
                placeholder="Seu nome completo"
                value="${currentUser.name}"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-input" 
                value="${currentUser.email}"
                disabled
                style="opacity: 0.6; cursor: not-allowed;"
              />
               <p class="text-sm text-secondary mt-xs">O email não pode ser alterado</p>
            </div>

            <div class="form-group">
               <label class="form-label">Foto de Perfil</label>
               <div class="file-upload">
                 <input 
                   type="file" 
                   id="photo" 
                   class="file-upload-input"
                   accept="image/*"
                 />
                 <label for="photo" class="file-upload-label">
                   <span style="font-size: 2rem;">📸</span>
                   <span class="text-secondary">Clique para alterar a foto</span>
                 </label>
               </div>
               <img 
                 id="photo-preview" 
                 class="file-upload-preview ${currentUser.photoURL ? '' : 'hidden'}" 
                 src="${currentUser.photoURL || ''}"
                 alt="Preview" 
               />
            </div>

            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: var(--spacing-xl) 0;">

            <h3 class="text-lg font-bold mb-md">Privacidade & Contato</h3>
            <p class="text-sm text-secondary mb-lg">Escolha quais informações compartilhar via QR Code.</p>

            <div class="form-group">
                <label class="form-label" for="instagram">Instagram (sem @)</label>
                <input 
                    type="text" 
                    id="instagram" 
                    class="form-input" 
                    placeholder="ex: seunome"
                    value="${defaults.instagram}"
                />
            </div>
             <div class="form-group flex justify-between items-center bg-bg-secondary p-sm rounded-md" style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                <div>
                    <span class="font-medium text-text-primary">Compartilhar Instagram</span>
                    <p class="text-xs text-secondary mt-xs">Incluir no QR Code</p>
                </div>
                 <input type="checkbox" id="share-instagram" ${defaults.shareInstagram ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
            </div>

            <div class="form-group mt-lg">
                <label class="form-label" for="phone">Telefone / WhatsApp</label>
                <input 
                    type="tel" 
                    id="phone" 
                    class="form-input" 
                    placeholder="(XX) 9XXXX-XXXX"
                    value="${defaults.phone}"
                />
            </div>
             <div class="form-group flex justify-between items-center bg-bg-secondary p-sm rounded-md" style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                <div>
                    <span class="font-medium text-text-primary">Compartilhar Telefone</span>
                     <p class="text-xs text-secondary mt-xs">Incluir no QR Code</p>
                </div>
                <input type="checkbox" id="share-phone" ${defaults.sharePhone ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
            </div>

            <div id="error-message" class="form-error hidden"></div>
            <div id="success-message" class="text-sm mt-sm hidden" style="color: #10b981;"></div>

            <button type="submit" class="btn btn-primary btn-lg mt-xl" id="submit-btn" style="width: 100%;">
              Salvar Alterações
            </button>
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
  const form = document.querySelector('#profile-form');
  const errorMessage = document.querySelector('#error-message');
  const successMessage = document.querySelector('#success-message');
  const submitBtn = document.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    const name = document.querySelector('#name').value;
    const instagram = document.querySelector('#instagram').value;
    const phone = document.querySelector('#phone').value;
    const shareInstagram = document.querySelector('#share-instagram').checked;
    const sharePhone = document.querySelector('#share-phone').checked;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
      // Update using existing auth module (assumed to handle custom claims or user doc update internally or we extend it)
      // Ideally auth.updateProfile should accept additional fields or we use a separate userService
      const result = await auth.updateProfile({
        name,
        photoFile,
        // Passing extra fields - ensure auth.js handles this or use Firestore directly here
        instagram,
        phone,
        shareInstagram,
        sharePhone
      });

      if (result.success) {
        successMessage.textContent = 'Perfil atualizado com sucesso!';
        successMessage.classList.remove('hidden');

        setTimeout(() => {
          renderProfile();
        }, 1500);
      } else {
        errorMessage.textContent = result.error;
        errorMessage.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Salvar Alterações';
      }
    } catch (error) {
      console.error(error);
      errorMessage.textContent = 'Erro inesperado. Tente novamente.';
      errorMessage.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar Alterações';
    }
  });

  // Handle back button
  document.querySelector('#back-btn').addEventListener('click', () => {
    router.navigate('/dashboard');
  });
}
