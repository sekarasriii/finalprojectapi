// Dashboard JavaScript - Enhanced for Dark Mode UI
// Handle API Key Management dan Projects menggunakan Fetch API

// Cek apakah user sudah login
if (!isLoggedIn()) {
    window.location.href = 'login.html';
}

const user = getFromStorage('user');
let apiKey = getFromStorage('apiKey');

// Tampilkan informasi user
document.getElementById('userName').textContent = user.name;
document.getElementById('userRole').textContent = user.role;

// Set user avatar initial
const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
document.getElementById('userAvatar').textContent = initials;

// Load API Key saat halaman dimuat
window.addEventListener('DOMContentLoaded', async () => {
    await loadApiKey();
    if (apiKey) {
        await loadProjects();
    }
});

// Load API Key dari backend
async function loadApiKey() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/apikey/${user.id}`);
        const data = await response.json();

        if (data.success) {
            apiKey = data.data.api_key;
            saveToStorage('apiKey', apiKey);
            showApiKey();
        } else {
            showNoApiKey();
        }
    } catch (error) {
        console.error('Error loading API Key:', error);
        showNoApiKey();
    }
}

// Tampilkan API Key
function showApiKey() {
    document.getElementById('noApiKey').classList.add('hidden');
    document.getElementById('hasApiKey').classList.remove('hidden');
    document.getElementById('apiKeyDisplay').textContent = apiKey;
    document.getElementById('addProjectBtn').style.display = 'flex';
}

// Tampilkan pesan belum ada API Key
function showNoApiKey() {
    document.getElementById('noApiKey').classList.remove('hidden');
    document.getElementById('hasApiKey').classList.add('hidden');
    document.getElementById('addProjectBtn').style.display = 'none';
}

// Generate API Key baru
async function generateApiKey() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/apikey/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user.id })
        });

        const data = await response.json();

        if (data.success) {
            apiKey = data.data.api_key;
            saveToStorage('apiKey', apiKey);
            showApiKey();
            showNotification('success', 'API Key berhasil di-generate!');
            await loadProjects();
        } else {
            showNotification('error', 'Gagal generate API Key: ' + data.message);
        }
    } catch (error) {
        console.error('Error generating API Key:', error);
        showNotification('error', 'Terjadi kesalahan saat generate API Key.');
    }
}

// Regenerate API Key
async function regenerateApiKey() {
    if (!confirm('Regenerate API Key akan menonaktifkan API Key lama. Lanjutkan?')) {
        return;
    }
    await generateApiKey();
}
// Load Projects dari backend
async function loadProjects() {
    if (!apiKey) {
        document.getElementById('noProjects').classList.remove('hidden');
        document.getElementById('projectsList').innerHTML = '';
        updateStats(0, 0, 0);
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/projects`, {
            headers: {
                'x-api-key': apiKey
            }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('noProjects').classList.add('hidden');
            displayProjects(data.data);
            updateStats(data.data);
        } else {
            showNotification('error', 'Gagal memuat projects: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('error', 'Terjadi kesalahan saat memuat projects.');
    }
}

// Update statistics cards
function updateStats(projects) {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in_progress').length;

    document.getElementById('totalProjects').textContent = total;
    document.getElementById('completedProjects').textContent = completed;
    document.getElementById('activeProjects').textContent = inProgress;
}
// Tampilkan daftar projects
function displayProjects(projects) {
    const projectsList = document.getElementById('projectsList');

    if (projects.length === 0) {
        projectsList.innerHTML = '<div class="alert alert-info" style="grid-column: 1 / -1;">Belum ada proyek. Tambahkan proyek pertama Anda!</div>';
        return;
    }

    projectsList.innerHTML = projects.map(project => {
        const statusClass = project.status === 'completed' ? 'success' :
            project.status === 'in_progress' ? 'primary' : 'warning';
        const statusText = project.status === 'completed' ? 'Completed' :
            project.status === 'in_progress' ? 'In Progress' : 'Planning';

        // Calculate progress based on status
        const progress = project.status === 'completed' ? 100 :
            project.status === 'in_progress' ? 60 : 30;

        // Get project icon based on title
        const icon = getProjectIcon(project.title);

        return `
            <div class="project-card">
                <div class="project-thumbnail">
                    ${icon}
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description || 'Tidak ada deskripsi'}</p>
                    
                    <div style="margin: var(--spacing-md) 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                            <span style="font-size: 0.85rem; color: var(--text-muted);">Progress</span>
                            <span style="font-size: 0.85rem; color: var(--text-primary); font-weight: 600;">${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${statusClass === 'success' ? 'success' : statusClass === 'primary' ? '' : 'warning'}" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="project-meta">
                        <div class="project-budget">
                            <span>Budget:</span>
                            <strong>${project.budget ? 'Rp ' + parseInt(project.budget).toLocaleString('id-ID') : '-'}</strong>
                        </div>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                    
                    <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--border-light); font-size: 0.8rem; color: var(--text-muted);">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline; vertical-align: middle; margin-right: 4px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        ${new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get project icon based on title keywords
function getProjectIcon(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('rumah') || lowerTitle.includes('residential')) {
        return '🏠';
    } else if (lowerTitle.includes('kantor') || lowerTitle.includes('office')) {
        return '🏢';
    } else if (lowerTitle.includes('hotel') || lowerTitle.includes('resort')) {
        return '🏨';
    } else if (lowerTitle.includes('taman') || lowerTitle.includes('park')) {
        return '🌳';
    } else if (lowerTitle.includes('museum') || lowerTitle.includes('gallery')) {
        return '🏛️';
    } else if (lowerTitle.includes('mall') || lowerTitle.includes('shopping')) {
        return '🏬';
    } else {
        return '🏗️';
    }
}

// Show form tambah project
function showAddProjectForm() {
    document.getElementById('addProjectForm').classList.remove('hidden');
    document.getElementById('projectTitle').focus();
}

// Hide form tambah project
function hideAddProjectForm() {
    document.getElementById('addProjectForm').classList.add('hidden');
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectBudget').value = '';
}

// Create project baru
async function createProject(e) {
    e.preventDefault();

    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDescription').value;
    const budget = document.getElementById('projectBudget').value;

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ title, description, budget })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('success', 'Project berhasil ditambahkan!');
            hideAddProjectForm();
            await loadProjects();
        } else {
            showNotification('error', 'Gagal menambahkan project: ' + data.message);
        }
    } catch (error) {
        console.error('Error creating project:', error);
        showNotification('error', 'Terjadi kesalahan saat menambahkan project.');
    }
}
// Show notification (improved version)
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.minWidth = '300px';
    notification.style.animation = 'slideIn 0.3s ease';
    notification.innerHTML = `
        <strong>${type === 'success' ? '✓' : '✗'}</strong> ${message}
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
