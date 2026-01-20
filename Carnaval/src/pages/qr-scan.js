import { Html5QrcodeScanner } from 'html5-qrcode';
import { router } from '../utils/router.js';

export const renderQRScan = async () => {
    const app = document.getElementById('app');

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
                <h1 class="page-title text-gradient">Escanear Código</h1>
                <p class="page-subtitle mb-xl">Aponte a câmera para o QR Code de outra pessoa para conectar.</p>
                
                <div class="card flex flex-col items-center p-0 overflow-hidden">
                    <div id="reader" style="width: 100%; min-height: 300px; background: black;"></div>
                </div>
            </div>
        </div>
    `;

    // Initialize scanner
    // Initialize scanner
    const onScanSuccess = (decodedText, decodedResult) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);

        let targetPath = null;

        // Support new HTTP format (deep link)
        if (decodedText.includes('/connect/')) {
            // Extract the path relative to the app
            try {
                const url = new URL(decodedText);
                if (url.pathname.startsWith('/connect/')) {
                    targetPath = url.pathname + url.search;
                }
            } catch (e) {
                // If not a full URL, maybe it's already a path?
                if (decodedText.startsWith('/connect/')) {
                    targetPath = decodedText;
                }
            }
        }
        // Support legacy schema (backwards compatibility)
        else if (decodedText.startsWith('dale://')) {
            const parts = decodedText.replace('dale://', '').split('/');
            const type = parts[0]; // 'user' or 'temp'
            const targetUserId = parts[1];
            targetPath = `/connect/${targetUserId}`;
        }

        if (targetPath) {
            try {
                html5QrcodeScanner.clear();
            } catch (e) {
                console.error("Failed to clear scanner", e);
            }
            router.navigate(targetPath);
        } else {
            alert("QR Code inválido: " + decodedText);
        }
    };

    const onScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        /* verbose= */ false);

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    // Style override for library injected elements (ugly hack but needed for this lib sometimes if not custom implementing)
    // We can't easily style the internal elements of html5-qrcode from here without deep selectors or custom UI logic.
    // Ideally we would build custom UI using the html5-qrcode library APIs rather than the Scanner UI widget for full control.
};
