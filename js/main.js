// Main Application Initialization and Utilities

// Show success message
function showSuccess(message) {
    const toast = document.getElementById('success-toast');
    const messageEl = document.getElementById('toast-message');
    
    if (toast && messageEl) {
        messageEl.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Show error message
function showError(message) {
    alert(message); // Can be replaced with custom error toast
}

// Close popup
function closePopup() {
    const popup = document.getElementById('custom-popup');
    if (popup) {
        popup.classList.add('hidden');
    }
}

// Carousel functionality
let currentSlide = 0;
let carouselInterval = null;

function startCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Clear existing interval
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    
    // Start auto-slide
    carouselInterval = setInterval(nextSlide, 5000);
    showSlide(currentSlide);
}

function goToSlide(index) {
    currentSlide = index;
    startCarousel();
}

// Load dashboard
async function loadDashboard() {
    if (!currentUser) {
        router('auth');
        return;
    }
    
    const works = await db.works.where('userId').equals(currentUser.id).toArray();
    const container = document.getElementById('works-list');
    
    if (!container) return;
    
    if (works.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-book text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 mb-6">No works yet. Create your first one!</p>
                <button onclick="showCreatePrompt()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">
                    Create New Work
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    works.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).forEach(work => {
        html += `
            <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition cursor-pointer" onclick="openWork(${work.id})">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold mb-2">${work.title}</h3>
                        <p class="text-gray-400 text-sm mb-2">${work.summary || 'No description'}</p>
                        <p class="text-gray-500 text-xs">${work.type === 'book' ? 'Book' : 'Single Page'}</p>
                    </div>
                    <button onclick="event.stopPropagation(); deleteWork(${work.id})" class="text-gray-500 hover:text-red-500">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Updated: ${new Date(work.updatedAt || work.createdAt).toLocaleDateString()}</span>
                    <span>${work.pageCount || 0} pages</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Show create prompt
function showCreatePrompt() {
    const popup = document.getElementById('custom-popup');
    const content = document.getElementById('popup-content');
    
    content.innerHTML = `
        <h3 class="text-xl font-bold mb-4">Create New Work</h3>
        <div class="space-y-4 mb-4">
            <div>
                <label class="block text-sm font-semibold text-gray-400 mb-2">Work Type</label>
                <select id="create-type" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">
                    <option value="single">Single Page</option>
                    <option value="book">Book</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-400 mb-2">Title</label>
                <input type="text" id="create-title" placeholder="Enter work title" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">
            </div>
            <div id="create-pages-container" class="hidden">
                <label class="block text-sm font-semibold text-gray-400 mb-2">Number of Pages</label>
                <input type="number" id="create-pages" value="10" min="1" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">
            </div>
        </div>
        <div class="flex gap-3">
            <button onclick="createNewWork()" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">
                Create
            </button>
            <button onclick="closePopup()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                Cancel
            </button>
        </div>
    `;
    
    popup.classList.remove('hidden');
    
    // Show/hide pages input based on type
    document.getElementById('create-type').addEventListener('change', function() {
        const pagesContainer = document.getElementById('create-pages-container');
        if (this.value === 'book') {
            pagesContainer.classList.remove('hidden');
        } else {
            pagesContainer.classList.add('hidden');
        }
    });
}

// Create new work
async function createNewWork() {
    if (!currentUser) {
        showError('Please login first');
        router('auth');
        return;
    }
    
    const type = document.getElementById('create-type').value;
    const title = document.getElementById('create-title').value;
    const pages = type === 'book' ? parseInt(document.getElementById('create-pages').value) || 10 : 1;
    
    if (!title) {
        showError('Please enter a title');
        return;
    }
    
    const workId = await db.works.add({
        userId: currentUser.id,
        type,
        title,
        content: '',
        metadata: {},
        pageCount: pages,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    
    closePopup();
    showSuccess('Work created successfully');
    
    // Open editor
    currentWorkId = workId;
    if (window.setCurrentWorkId) {
        window.setCurrentWorkId(workId);
    }
    router('editor', workId);
}

// Open work
async function openWork(workId) {
    currentWorkId = workId;
    if (window.setCurrentWorkId) {
        window.setCurrentWorkId(workId);
    }
    router('editor', workId);
    await loadEditor(workId);
}

// Load editor
async function loadEditor(workId) {
    currentWorkId = workId;
    if (window.setCurrentWorkId) {
        window.setCurrentWorkId(workId);
    }
    
    const work = await db.works.get(workId);
    if (!work) {
        showError('Work not found');
        return;
    }
    
    // Load book metadata if it's a book
    if (work.type === 'book' && window.loadBookMetadata) {
        try {
            await window.loadBookMetadata(workId);
        } catch (e) {
            console.error('Error loading book metadata:', e);
        }
    }
    
    // Update book representor
    const bookRep = document.getElementById('book-representor');
    const bookName = document.getElementById('current-book-name');
    if (bookRep && bookName) {
        if (work.type === 'book') {
            bookRep.classList.remove('hidden');
            bookName.textContent = work.title;
        } else {
            bookRep.classList.add('hidden');
        }
    }
    
    // Load file tree
    await loadFileTree();
    
    // Auto-create first file if none exists
    const files = await db.files.where('workId').equals(workId).toArray();
    if (files.length === 0) {
        // Auto-create a file
        try {
            await createFile();
        } catch (e) {
            console.error('Error creating file:', e);
        }
    } else {
        // Load first file
        try {
            await loadFile(files[0].id);
        } catch (e) {
            console.error('Error loading file:', e);
        }
    }
}

// Delete work
async function deleteWork(workId) {
    if (!confirm('Are you sure you want to delete this work? This action cannot be undone.')) {
        return;
    }
    
    // Delete all related data
    const files = await db.files.where('workId').equals(workId).toArray();
    for (const file of files) {
        await db.inputs.where('fileId').equals(file.id).delete();
    }
    await db.files.where('workId').equals(workId).delete();
    await db.folders.where('workId').equals(workId).delete();
    await db.works.delete(workId);
    
    showSuccess('Work deleted');
    loadDashboard();
}

// Load profile
async function loadProfile() {
    if (!currentUser) {
        router('auth');
        return;
    }
    
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    const payments = await db.payments.where('userId').equals(currentUser.id).toArray();
    
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold mb-4">Profile Information</h2>
                <div class="bg-gray-700 p-4 rounded-lg">
                    <p class="mb-2"><span class="font-semibold">Name:</span> ${currentUser.name || 'Not set'}</p>
                    <p class="mb-2"><span class="font-semibold">Email:</span> ${currentUser.email}</p>
                    <p class="mb-2"><span class="font-semibold">Member since:</span> ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
                    <p><span class="font-semibold">Current Streak:</span> ${currentUser.streak || 0} days</p>
                </div>
            </div>
            
            <div>
                <h2 class="text-2xl font-bold mb-4">Settings</h2>
                <div class="bg-gray-700 p-4 rounded-lg space-y-4">
                    <div class="flex items-center justify-between">
                        <span>Auto-correct</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" ${autoCorrectEnabled ? 'checked' : ''} onchange="toggleAutoCorrect(this.checked)" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div>
                <h2 class="text-2xl font-bold mb-4">Payment History</h2>
                <div class="bg-gray-700 p-4 rounded-lg">
                    ${payments.length === 0 ? '<p class="text-gray-400">No payment history</p>' : 
                        payments.map(p => `
                            <div class="border-b border-gray-600 py-2 mb-2">
                                <p class="font-semibold">${p.amount} - ${p.method.toUpperCase()}</p>
                                <p class="text-sm text-gray-400">${new Date(p.createdAt).toLocaleDateString()}</p>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
    `;
}

// Toggle auto-correct
function toggleAutoCorrect(enabled) {
    autoCorrectEnabled = enabled;
    showSuccess(`Auto-correct ${enabled ? 'enabled' : 'disabled'}`);
}

// Initialize application
async function init() {
    // Load theme
    loadTheme();
    
    // Check authentication
    const isAuthenticated = await checkAuth();
    
    // Initialize editor
    initEditor();
    
    // Set up auto-save interval
    setInterval(() => {
        if (currentWorkId && currentUser) {
            saveCurrentWork();
        }
    }, 30000); // Auto-save every 30 seconds
    
    // Set up counters update interval
    setInterval(updateCounters, 1000);
    
    // Start router
    if (isAuthenticated) {
        router('dashboard');
    } else {
        router('home');
    }
}

// Auto-slide to next page (for book navigation)
let autoSlideInterval = null;
let autoSlideEnabled = false;

function toggleAutoSlide() {
    autoSlideEnabled = !autoSlideEnabled;
    
    if (autoSlideEnabled) {
        startAutoSlide();
        showSuccess('Auto-slide enabled');
    } else {
        stopAutoSlide();
        showSuccess('Auto-slide disabled');
    }
    
    // Update button state
    const btn = document.getElementById('auto-slide-btn');
    if (btn) {
        btn.classList.toggle('bg-green-600', autoSlideEnabled);
        btn.classList.toggle('bg-gray-700', !autoSlideEnabled);
    }
}

function startAutoSlide() {
    stopAutoSlide(); // Clear any existing interval
    
    autoSlideInterval = setInterval(() => {
        if (currentView() === 'editor') {
            const fileId = window.currentFileId ? window.currentFileId() : null;
            if (fileId && window.fileTree && window.fileTree.files) {
                const file = window.fileTree.files.find(f => f.id === fileId);
                if (file && file.type === 'book' && window.navigatePage) {
                    try {
                        // Get current page number
                        const currentInputs = window.currentInputs || [];
                        if (currentInputs.length === 0) return;
                        
                        const pageNumbers = [...new Set(currentInputs.map(i => i.pageNum || 1).filter(Boolean))].sort((a, b) => a - b);
                        if (pageNumbers.length === 0) return;
                        
                        const currentPage = window.currentPageNum || pageNumbers[0];
                        const currentIndex = pageNumbers.indexOf(currentPage);
                        
                        if (currentIndex >= 0 && currentIndex < pageNumbers.length - 1) {
                            window.navigatePage(1);
                        } else if (currentIndex === pageNumbers.length - 1) {
                            // Loop back to first page
                            if (window.jumpToPage) {
                                window.jumpToPage(pageNumbers[0]);
                            }
                        }
                    } catch (e) {
                        console.error('Auto-slide error:', e);
                    }
                }
            }
        }
    }, 10000); // Auto-advance every 10 seconds
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);

// Theme toggle
let isDarkMode = true;

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light', !isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
    
    // Update icon
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = isDarkMode ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Save preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    showSuccess(`Switched to ${isDarkMode ? 'dark' : 'light'} mode`);
}

// Load theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        isDarkMode = false;
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    } else {
        isDarkMode = true;
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    }
    
    // Update icon
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = isDarkMode ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Export utilities
window.showSuccess = showSuccess;
window.showError = showError;
window.closePopup = closePopup;
window.startCarousel = startCarousel;
window.goToSlide = goToSlide;
window.loadDashboard = loadDashboard;
window.showCreatePrompt = showCreatePrompt;
window.createNewWork = createNewWork;
window.openWork = openWork;
window.loadEditor = loadEditor;
window.deleteWork = deleteWork;
window.loadProfile = loadProfile;
window.toggleAutoCorrect = toggleAutoCorrect;
window.toggleAutoSlide = toggleAutoSlide;
window.startAutoSlide = startAutoSlide;
window.stopAutoSlide = stopAutoSlide;
window.toggleTheme = toggleTheme;
window.loadTheme = loadTheme;
