// Router System
let currentView = 'home';
let currentWorkId = null;

function router(view, workId = null) {
    // Hide all views
    document.querySelectorAll('[id$="-view"]').forEach(v => v.classList.add('hidden'));
    
    currentView = view;
    currentWorkId = workId;
    
    // Show target view
    const targetView = document.getElementById(`${view}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    
    // Special handling for different views
    switch(view) {
        case 'home':
            startCarousel();
            break;
        case 'dashboard':
            loadDashboard();
            break;
        case 'editor':
            if (workId) {
                loadEditor(workId);
            }
            break;
        case 'auth':
            // Reset auth form
            isLoginMode = true;
            toggleAuthMode();
            break;
        case 'services':
            loadServices();
            break;
        case 'profile':
            loadProfile();
            break;
    }
    
    // Update header navigation
    updateNavActive(view);
}

function updateNavActive(view) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-gray-700');
    });
    
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(link => {
        return link.textContent.toLowerCase().includes(view.toLowerCase());
    });
    
    if (activeLink) {
        activeLink.classList.add('bg-gray-700');
    }
}

// Export
window.router = router;
window.currentView = () => currentView;
window.currentWorkId = () => currentWorkId;
window.setCurrentWorkId = (id) => { currentWorkId = id; };
