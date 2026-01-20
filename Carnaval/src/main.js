import './style.css';
import { router } from './utils/router.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProfile } from './pages/profile.js';
import { renderFicadaForm } from './pages/ficada-form.js';

// Register routes
router.register('/login', renderLogin, false);
router.register('/register', renderRegister, false);
router.register('/dashboard', renderDashboard, true);
router.register('/profile', renderProfile, true);
router.register('/ficada/new', () => renderFicadaForm(), true);
router.register('/qr-generate', () => import('./pages/qr-generate.js').then(m => m.renderQRGenerate()), true);
router.register('/qr-scan', () => import('./pages/qr-scan.js').then(m => m.renderQRScan()), true);
// router.register('/privacy', () => import('./pages/privacy.js').then(m => m.renderPrivacy()), true);

// Handle dynamic edit route
const originalNavigate = router.navigate.bind(router);
router.navigate = function (path) {
  // Check if it's an edit ficada route
  const editMatch = path.match(/^\/ficada\/edit\/(.+)$/);
  if (editMatch) {
    const ficadaId = editMatch[1];
    renderFicadaForm(ficadaId);
    window.history.pushState({}, '', path);
    return;
  }

  // Check if it's a connect route
  const connectMatch = path.match(/^\/connect\/([^/?]+)/);
  if (connectMatch) {
    const targetUserId = connectMatch[1];
    import('./pages/connect.js').then(m => m.renderConnect(targetUserId));
    window.history.pushState({}, '', path);
    return;
  }

  // Otherwise use normal navigation
  originalNavigate(path);
};

// Initialize router
router.init();
