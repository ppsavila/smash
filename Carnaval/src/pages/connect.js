import { router } from '../utils/router.js';
import { auth } from '../modules/auth.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { ficadas } from '../modules/ficadas.js';

export const renderConnect = async (targetUserId) => {
    // Wait for full auth initialization (including profile fetch)
    await auth.waitForAuth();

    // Auth Check
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
        // Save current path to return after login
        localStorage.setItem('pendingPath', window.location.pathname + window.location.search);
        router.navigate('/login');
        return;
    }

    const app = document.getElementById('app');

    // Validating targetUserId
    if (!targetUserId) {
        alert("Usuário inválido!");
        router.navigate('/dashboard');
        return;
    }

    // Show loading state
    app.innerHTML = `
        <div class="page flex items-center justify-center">
            <div class="spinner"></div>
        </div>
    `;

    try {
        // Fetch target user data
        const userDocRef = doc(db, 'users', targetUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            alert("Usuário não encontrado!");
            router.navigate('/dashboard');
            return;
        }

        const targetUser = userDocSnap.data();

        // Privacy checks
        const displayName = targetUser.name || 'Pessoa';
        const displayPhoto = targetUser.photoURL || null;

        // Defaults based on typical expected behavior if field missing
        // Default to TRUE for instagram if not explicitly false
        const shareInsta = targetUser.shareInstagram !== false;
        // Default to FALSE for phone if not explicitly true
        const sharePhone = targetUser.sharePhone === true;

        const displayInstagram = shareInsta ? targetUser.instagram : '';
        const displayPhone = sharePhone ? targetUser.phone : '';


        app.innerHTML = `
            <div class="navbar">
                 <div class="container">
                    <div class="navbar-content">
                        <div class="navbar-brand">🎭 Carnaval</div>
                         <a href="/dashboard" class="btn btn-ghost btn-sm">← Voltar</a>
                    </div>
                </div>
            </div>

            <div class="page">
                <div class="container container-sm">
                    <div class="page-header text-center">
                        <h1 class="page-title text-gradient">Conectar</h1>
                        <p class="page-subtitle">Você está se conectando com <span class="text-primary font-bold">${displayName}</span></p>
                    </div>
                    
                    <div class="card">
                         <div class="text-center mb-lg">
                            ${displayPhoto
                ? `<img src="${displayPhoto}" class="avatar avatar-xl mb-sm" style="margin: 0 auto;">`
                : `<div class="avatar avatar-xl flex items-center justify-center" style="background: var(--gradient-primary); font-size: 2rem; margin: 0 auto;">
                                      ${displayName.charAt(0).toUpperCase()}
                                   </div>`
            }
                         </div>

                         <form id="connect-form">
                            <div class="form-group">
                                <label for="comment" class="form-label">Comentário (Privado)</label>
                                <textarea 
                                    id="comment" 
                                    name="comment" 
                                    class="form-textarea" 
                                    placeholder="Ex: Conheci na fila do bar, estava de vermelho..."
                                ></textarea>
                                <p class="text-xs text-secondary mt-xs">Essa anotação só você consegue ver.</p>
                            </div>
                            
                            <div class="grid gap-md mt-xl">
                                <button type="submit" class="btn btn-primary btn-lg" id="submit-btn" style="width: 100%;">
                                    Salvar Conexão
                                </button>
                                <button type="button" id="cancel-btn" class="btn btn-ghost" style="width: 100%;">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('cancel-btn').addEventListener('click', () => {
            router.navigate('/dashboard');
        });

        document.getElementById('connect-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const comment = document.getElementById('comment').value;
            const submitBtn = document.getElementById('submit-btn');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';

            const connectionData = {
                name: displayName,
                targetUserId: targetUserId,
                instagram: displayInstagram,
                phone: displayPhone,
                photoURL: displayPhoto,
                comment: comment
            };

            const result = await ficadas.create(connectionData);

            if (result.success) {
                // alert(`Conexão salva com sucesso!`);
                router.navigate('/dashboard');
            } else {
                alert('Erro ao salvar conexão: ' + result.error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Salvar Conexão';
            }
        });

    } catch (error) {
        console.error("Error fetching target user:", error);
        alert("Erro ao carregar dados do usuário.");
        router.navigate('/dashboard');
    }
};
