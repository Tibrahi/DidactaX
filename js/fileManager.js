// File and Folder Management System
let currentFileId = null;
let currentFolderId = null;
let fileTree = { files: [], folders: [] };

// Create a new folder
async function createFolder() {
    if (!currentUser) {
        showError('Please login first');
        if (window.router) window.router('auth');
        return;
    }
    
    const name = prompt('Enter folder name:');
    if (!name) return;
    
    const workId = window.currentWorkId ? window.currentWorkId() : null;
    if (!workId) {
        showError('Please create or open a work first');
        return;
    }
    
    const folderId = await db.folders.add({
        workId: workId,
        name,
        parentId: currentFolderId || null,
        order: 0
    });
    
    await loadFileTree();
    showSuccess('Folder created');
}

// Create a new file
async function createFile() {
    if (!currentUser) {
        showError('Please login first');
        if (window.router) window.router('auth');
        return;
    }
    
    const workId = window.currentWorkId ? window.currentWorkId() : null;
    if (!workId) {
        showError('Please create or open a work first');
        return;
    }
    
    // Prompt for file type and pages
    const type = await showFileTypePrompt();
    if (!type) return;
    
    let pageCount = 1;
    if (type === 'book') {
        const pages = prompt('How many pages do you want?', '10');
        if (!pages) return;
        pageCount = parseInt(pages) || 1;
    }
    
    const name = prompt('Enter file name:', `New ${type === 'book' ? 'Book' : 'Page'}`);
    if (!name) return;
    
    const extension = type === 'book' ? '.docx' : '.docx';
    
    // Create file
    const fileId = await db.files.add({
        workId: workId,
        name: name + extension,
        type,
        content: '',
        order: 0,
        parentId: currentFolderId || null,
        extension
    });
    
    // Create inputs for each page if it's a book
    if (type === 'book' && pageCount > 1) {
        for (let i = 0; i < pageCount; i++) {
            await createBookPageInputs(fileId, i + 1, pageCount);
        }
    } else {
        // Create single page inputs
        await createSinglePageInputs(fileId);
    }
    
    await loadFileTree();
    loadFile(fileId);
    showSuccess(`File created with ${pageCount} page(s)`);
}

// Show file type selection prompt
function showFileTypePrompt() {
    return new Promise((resolve) => {
        const popup = document.getElementById('custom-popup');
        const content = document.getElementById('popup-content');
        
        content.innerHTML = `
            <h3 class="text-xl font-bold mb-4">Select File Type</h3>
            <div class="space-y-3">
                <button onclick="selectFileType('single')" class="w-full p-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-left">
                    <i class="fas fa-file-alt mr-2"></i>Single Page
                </button>
                <button onclick="selectFileType('book')" class="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-left">
                    <i class="fas fa-book mr-2"></i>Book (Multiple Pages)
                </button>
            </div>
            <button onclick="closePopup()" class="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">Cancel</button>
        `;
        
        popup.classList.remove('hidden');
        
        window.selectFileType = (type) => {
            popup.classList.add('hidden');
            resolve(type);
        };
        
        window.closePopup = () => {
            popup.classList.add('hidden');
            resolve(null);
        };
    });
}

// Create single page inputs
async function createSinglePageInputs(fileId) {
    const sections = [
        { section: 'title', label: 'Title', type: 'text' },
        { section: 'objective', label: 'Objective', type: 'textarea' },
        { section: 'keywords', label: 'Keywords', type: 'textarea' },
        { section: 'keyConcepts', label: 'Key Concepts', type: 'textarea' },
        { section: 'vocabulary', label: 'Other Words (Vocabulary)', type: 'textarea' },
        { section: 'examples', label: 'Examples', type: 'textarea' },
        { section: 'questions', label: 'Questions', type: 'textarea' },
        { section: 'summary', label: 'Summary', type: 'textarea' },
        { section: 'practice', label: 'Practice / Action', type: 'textarea' },
        { section: 'references', label: 'References', type: 'textarea' }
    ];
    
    for (let i = 0; i < sections.length; i++) {
        await db.inputs.add({
            fileId,
            section: sections[i].section,
            label: sections[i].label,
            value: '',
            order: i,
            type: sections[i].type
        });
    }
}

// Create book page inputs
async function createBookPageInputs(fileId, pageNum, totalPages) {
    // For first page: title page inputs
    if (pageNum === 1) {
        await db.inputs.add({
            fileId,
            section: 'pageTitle',
            label: 'Page Title',
            value: '',
            order: 0,
            type: 'text',
            pageNum: 1
        });
    }
    
    // For last page: summary inputs
    if (pageNum === totalPages) {
        await db.inputs.add({
            fileId,
            section: 'pageSummary',
            label: 'Page Summary',
            value: '',
            order: 0,
            type: 'textarea',
            pageNum: totalPages
        });
    }
    
    // Body content for each page
    await db.inputs.add({
        fileId,
        section: 'body',
        label: 'Body Content',
        value: '',
        order: 1,
        type: 'richtext',
        pageNum: pageNum
    });
}

// Load file tree
async function loadFileTree() {
    if (!currentWorkId) return;
    
    const files = await db.files.where('workId').equals(currentWorkId).toArray();
    const folders = await db.folders.where('workId').equals(workId).toArray();
    
    fileTree = { files, folders };
    window.fileTree = fileTree;
    renderFileTree();
}

// Render file tree
function renderFileTree() {
    const container = document.getElementById('file-tree');
    if (!container) return;
    
    let html = '';
    const activeFileId = window.currentFileId ? window.currentFileId() : null;
    
    // Render folders
    if (fileTree.folders) {
        fileTree.folders.filter(f => !f.parentId).forEach(folder => {
            html += `
                <div class="file-tree-item" onclick="selectFolder(${folder.id})">
                    <i class="fas fa-folder"></i>
                    <span>${folder.name}</span>
                </div>
            `;
        });
    }
    
    // Render files
    if (fileTree.files) {
        fileTree.files.filter(f => !f.parentId).forEach(file => {
            const isActive = activeFileId === file.id;
            html += `
                <div class="file-tree-item ${isActive ? 'active' : ''}" onclick="loadFile(${file.id})">
                    <i class="fas fa-file${file.extension === '.pdf' ? '-pdf' : ''}"></i>
                    <span>${file.name}</span>
                </div>
            `;
        });
    }
    
    container.innerHTML = html || '<p class="text-gray-500 text-sm p-4">No files yet. Create one!</p>';
}

// Load a file
async function loadFile(fileId) {
    currentFileId = fileId;
    if (window.setCurrentFileId) {
        window.setCurrentFileId(fileId);
    }
    const file = await db.files.get(fileId);
    
    if (!file) return;
    
    // Load inputs for this file
    const inputs = await db.inputs.where('fileId').equals(fileId).toArray();
    
    if (file.type === 'single') {
        renderSinglePageForm(inputs);
    } else if (file.type === 'book') {
        renderBookForm(inputs, file);
    }
    
    // Update preview
    updatePreview(inputs);
    
    // Reload file tree to show active state
    await loadFileTree();
}

// Select folder
function selectFolder(folderId) {
    currentFolderId = folderId;
    // Filter and show files in this folder
    loadFileTree();
}

// Rename file/folder
async function renameItem(id, type) {
    const newName = prompt('Enter new name:');
    if (!newName) return;
    
    if (type === 'file') {
        await db.files.update(id, { name: newName });
    } else {
        await db.folders.update(id, { name: newName });
    }
    
    await loadFileTree();
    showSuccess('Renamed successfully');
}

// Delete file/folder
async function deleteItem(id, type) {
    if (!confirm('Are you sure you want to delete this?')) return;
    
    if (type === 'file') {
        // Delete all inputs for this file
        await db.inputs.where('fileId').equals(id).delete();
        await db.files.delete(id);
    } else {
        // Delete folder and its contents
        const folderFiles = await db.files.where('parentId').equals(id).toArray();
        for (const file of folderFiles) {
            await db.inputs.where('fileId').equals(file.id).delete();
            await db.files.delete(file.id);
        }
        await db.folders.delete(id);
    }
    
    await loadFileTree();
    showSuccess('Deleted successfully');
}

// Export
window.createFolder = createFolder;
window.createFile = createFile;
window.loadFile = loadFile;
window.selectFolder = selectFolder;
window.renameItem = renameItem;
window.deleteItem = deleteItem;
window.loadFileTree = loadFileTree;
window.fileTree = fileTree;
window.currentFileId = () => currentFileId;
window.setCurrentFileId = (id) => { currentFileId = id; };
