// Dashboard page - List all ficadas with Firebase

import { auth } from '../modules/auth.js';
import { ficadas } from '../modules/ficadas.js';
import { router } from '../utils/router.js';

export async function renderDashboard() {
  const app = document.querySelector('#app');
  const currentUser = auth.getCurrentUser();

  // Show loading state
  app.innerHTML = `
    <div class="page flex items-center justify-center">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const userFicadas = await ficadas.getAll();

    app.innerHTML = `
      <div class="navbar">
        <div class="container">
          <div class="navbar-content">
            <div class="navbar-brand">🎭 Carnaval</div>
            <div class="navbar-menu">
              <button id="profile-btn" class="btn btn-ghost btn-sm">
                ${currentUser?.photoURL ? `<img src="${currentUser.photoURL}" class="avatar avatar-sm" alt="${currentUser.name}" />` : '👤'}
                ${currentUser?.name || 'Perfil'}
              </button>
              <button id="logout-btn" class="btn btn-ghost btn-sm">Sair</button>
            </div>
          </div>
        </div>
      </div>

      <div class="page">
        <div class="container">
          <!-- Notifications Section -->
          <div id="notifications-container" class="mb-md"></div>

          <div class="flex justify-between items-center mb-lg">
            <div>
              <h1 class="page-title" style="margin-bottom: 0;">Minhas Ficadas</h1>
              <p class="page-subtitle">Gerencie suas conexões</p>
            </div>
            
            <div class="flex gap-sm">
                <button id="scan-qr-btn" class="btn btn-primary btn-sm">
                  📷 Escanear
                </button>
                <button id="show-qr-btn" class="btn btn-secondary btn-sm">
                  📱 Meu QR
                </button>
            </div>
          </div>

          <!-- Big Tabs Section -->
          <div class="grid grid-2 gap-md mb-xl">
             <button id="tab-ficadas" class="card card-compact flex flex-col items-center justify-center text-center transition-base hover:scale-105" style="border: 2px solid var(--primary-400); background: rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1);">
                <span class="text-2xl mb-xs">💘</span>
                <span class="font-bold text-lg">Ficadas</span>
                <span class="text-sm text-secondary">${userFicadas.length} conexões</span>
             </button>

             <button id="tab-rolos" class="card card-compact flex flex-col items-center justify-center text-center transition-base hover:scale-105" style="border: 1px solid var(--border-color);">
                <span class="text-2xl mb-xs">🔥</span>
                <span class="font-bold text-lg">Ranking</span>
                <span class="text-sm text-secondary">Top Rolos</span>
             </button>
          </div>

          <h3 id="current-view-title" class="text-xl font-bold mb-md">Suas Conexões</h3>

          <div id="ficadas-list" class="grid grid-2">
            ${renderFicadasList(userFicadas)}
          </div>
        </div>
      </div>
    `;

    // Notifications Logic
    const { notifications } = await import('../modules/notifications.js');
    const notifContainer = document.querySelector('#notifications-container');

    // Subscribe to notifications
    notifications.subscribe((notifs) => {
      const unreadParams = notifs.filter(n => !n.read);

      if (unreadParams.length === 0) {
        notifContainer.innerHTML = '';
        return;
      }

      notifContainer.innerHTML = unreadParams.map(n => `
            <div class="card p-sm mb-sm flex justify-between items-center" style="background: rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.15); border: 1px solid var(--primary-color);">
                <div>
                     <span class="font-bold text-primary">🔔 ${n.title}</span>
                     <p class="text-sm">${n.message}</p>
                </div>
                <button class="btn btn-sm btn-primary notif-action-btn" data-link="${n.link}" data-id="${n.id}">
                    Conectar de volta
                </button>
            </div>
        `).join('');

      // Attach listeners
      document.querySelectorAll('.notif-action-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const link = e.target.dataset.link;
          const id = e.target.dataset.id;

          // Mark as read
          await notifications.markAsRead(id);

          // Navigate
          router.navigate(link);
        });
      });
    });

    // Tab Logic
    const tabFicadas = document.querySelector('#tab-ficadas');
    const tabRolos = document.querySelector('#tab-rolos');
    const listContainer = document.querySelector('#ficadas-list');
    const viewTitle = document.querySelector('#current-view-title');

    function setActiveTab(active, inactive) {
      // Active Style
      active.style.border = '2px solid var(--primary-400)';
      active.style.background = 'rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1)';

      // Inactive Style
      inactive.style.border = '1px solid var(--border-color)';
      inactive.style.background = 'var(--glass-bg)';
    }

    // Define attach listener function to be reused
    function attachCardListeners() {
      document.querySelectorAll('.edit-ficada-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ficadaId = e.target.dataset.id;
          router.navigate(`/ficada/edit/${ficadaId}`);
        });
      });

      document.querySelectorAll('.delete-ficada-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const ficadaId = e.target.dataset.id;
          if (confirm('Tem certeza que deseja excluir esta ficada?')) {
            e.target.disabled = true;
            e.target.textContent = '⏳';
            await ficadas.delete(ficadaId);
            renderDashboard();
          }
        });
      });
    }

    tabFicadas.addEventListener('click', () => {
      setActiveTab(tabFicadas, tabRolos);
      viewTitle.textContent = 'Suas Conexões';
      listContainer.innerHTML = renderFicadasList(userFicadas);
      attachCardListeners();
    });

    tabRolos.addEventListener('click', () => {
      setActiveTab(tabRolos, tabFicadas);
      viewTitle.textContent = 'Ranking de Rolos';
      const rolos = groupAndRankFicadas(userFicadas);
      listContainer.innerHTML = renderRolosList(rolos);
    });

    // Event listeners
    document.querySelector('#logout-btn').addEventListener('click', async () => {
      await auth.logout();
      router.navigate('/login');
    });

    document.querySelector('#profile-btn').addEventListener('click', () => {
      router.navigate('/profile');
    });

    document.querySelector('#scan-qr-btn').addEventListener('click', () => {
      router.navigate('/qr-scan');
    });

    document.querySelector('#show-qr-btn').addEventListener('click', () => {
      router.navigate('/qr-generate');
    });

    // Initial attach
    attachCardListeners();

  } catch (error) {
    console.error('Error rendering dashboard:', error);
    app.innerHTML = `
      <div class="page flex items-center justify-center">
        <div class="text-center">
          <p class="text-error">Erro ao carregar ficadas</p>
          <button class="btn btn-primary mt-lg" onclick="location.reload()">Tentar novamente</button>
        </div>
      </div>
    `;
  }
}

function renderEmptyState() {
  return `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <div class="empty-state-icon">🎉</div>
      <h3 class="empty-state-title">Nenhuma ficada ainda</h3>
      <p class="empty-state-description">
        Comece adicionando suas conexões do Carnaval!
      </p>
    </div>
  `;
}

function renderFicadaCard(ficada) {
  return `
    <div class="card fade-in">
      <div class="flex gap-md mb-md">
        ${ficada.photoURL
      ? `<img src="${ficada.photoURL}" class="avatar avatar-xl" alt="${ficada.name}" />`
      : `<div class="avatar avatar-xl flex items-center justify-center" style="background: var(--gradient-primary); font-size: 2rem;">
              ${ficada.name.charAt(0).toUpperCase()}
            </div>`
    }
        <div class="flex-1">
          <h3 class="mb-sm">${ficada.name}</h3>
          ${ficada.instagram ? `<p class="text-sm text-secondary mb-xs">📱 @${ficada.instagram}</p>` : ''}
          ${ficada.phone ? `<p class="text-sm text-secondary">📞 ${ficada.phone}</p>` : ''}
        </div>
      </div>
      
      <div class="flex gap-sm mt-lg">
        <button class="btn btn-secondary btn-sm flex-1 edit-ficada-btn" data-id="${ficada.id}">
          ✏️ Editar
        </button>
        <button class="btn btn-ghost btn-sm delete-ficada-btn" data-id="${ficada.id}">
          🗑️
        </button>
      </div>
    </div>
  `;
}

function renderFicadasList(list) {
  if (list.length === 0) return renderEmptyState();
  return list.map(renderFicadaCard).join('');
}

function groupAndRankFicadas(ficadasList) {
  const groups = {};
  ficadasList.forEach(f => {
    const key = f.name.toLowerCase();
    if (!groups[key]) {
      groups[key] = { ...f, count: 0, instances: [] };
    }
    groups[key].count++;
    groups[key].instances.push(f);
  });

  return Object.values(groups).sort((a, b) => b.count - a.count);
}

function renderRolosList(list) {
  if (list.length === 0) return renderEmptyState();
  return list.map((item, index) => `
        <div class="card fade-in flex items-center justify-between">
             <div class="flex items-center gap-4">
                <div class="text-2xl font-bold text-primary w-8 text-center">#${index + 1}</div>
                ${item.photoURL
      ? `<img src="${item.photoURL}" class="avatar avatar-md" alt="${item.name}" />`
      : `<div class="avatar avatar-md flex items-center justify-center" style="background: var(--gradient-primary);">
                        ${item.name.charAt(0).toUpperCase()}
                    </div>`
    }
                <div>
                    <h3 class="font-bold text-lg">${item.name}</h3>
                    <p class="text-sm text-text-muted">${item.count} ficada${item.count > 1 ? 's' : ''}</p>
                </div>
            </div>
             <div class="text-xs text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                ${item.instagram ? '@' + item.instagram : 'Sem insta'}
            </div>
        </div>
    `).join('');
}
