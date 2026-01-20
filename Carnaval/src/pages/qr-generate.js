import QRCode from 'qrcode';
import { auth } from '../modules/auth.js';
import { router } from '../utils/router.js';

export const renderQRGenerate = async () => {
    const app = document.getElementById('app');

    // Get user from auth module
    const user = auth.getCurrentUser();

    if (!user) {
        router.navigate('/login');
        return;
    }

    const userId = user.id;

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
            <div class="container container-sm text-center">
                 <h1 class="page-title text-gradient">Meu Carnaval ID</h1>
                 <p class="page-subtitle">Peça para escanearem seu código para conectar.</p>
            
                <div class="card mt-xl flex flex-col items-center justify-center">
                    <canvas id="qr-canvas" style="width: 256px; height: 256px; border-radius: var(--radius-md); background: white; padding: 10px;"></canvas>
                    
                    <div class="mt-lg">
                         <span id="qr-type-label" class="btn btn-sm" style="background: rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.2); color: var(--primary-400); cursor: default;">Permanente</span>
                    </div>
                </div>

                 <div class="flex justify-center gap-md mt-lg">
                    <button id="toggle-qr-btn" class="btn btn-secondary">
                        Mudar para Temporário
                    </button>
                </div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('qr-canvas');
    const toggleBtn = document.getElementById('toggle-qr-btn');
    const typeLabel = document.getElementById('qr-type-label');

    let isTemporary = false;

    const generateQR = async () => {
        // Use current origin + /connect path for deep linking
        const baseUrl = window.location.origin + '/connect';
        let data = `${baseUrl}/${userId}`;

        if (isTemporary) {
            const timestamp = Date.now();
            data = `${baseUrl}/${userId}?temp=${timestamp}`;
        }

        try {
            await QRCode.toCanvas(canvas, data, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000',
                    light: '#FFF'
                }
            });
        } catch (err) {
            console.error(err);
        }
    };

    toggleBtn.addEventListener('click', () => {
        isTemporary = !isTemporary;
        typeLabel.textContent = isTemporary ? 'Temporário (5min)' : 'Permanente';
        toggleBtn.textContent = isTemporary ? 'Mudar para Permanente' : 'Mudar para Temporário';
        generateQR();
    });

    generateQR();
};
