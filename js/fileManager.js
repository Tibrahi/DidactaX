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
    
    const workId = window.currentWorkId ? window.currentWorkId() : currentWorkId;
    if (!workId) {
        showError('Please create or open a work first');
        return;
    }
    
    // Prompt for file type and pages
    const type = await showFileTypePrompt();
    if (!type) return;
    
    let pageCount = 1;
    if (type === 'book') {
        // Show popup for page count
        const pages = await showPageCountPrompt();
        if (!pages) return;
        pageCount = parseInt(pages) || 1;
        if (pageCount < 1) pageCount = 1;
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

// Show page count prompt
function showPageCountPrompt() {
    return new Promise((resolve) => {
        const popup = document.getElementById('custom-popup');
        const content = document.getElementById('popup-content');
        
        content.innerHTML = `
            <h3 class="text-xl font-bold mb-4">How many pages?</h3>
            <div class="mb-4">
                <input type="number" id="page-count-input" value="10" min="1" max="1000" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">
                <p class="text-sm text-gray-400 mt-2">Pages will be created automatically</p>
            </div>
            <div class="flex gap-3">
                <button onclick="confirmPageCount()" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">
                    Create Pages
                </button>
                <button onclick="cancelPageCount()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                    Cancel
                </button>
            </div>
        `;
        
        popup.classList.remove('hidden');
        
        window.confirmPageCount = () => {
            const count = document.getElementById('page-count-input').value;
            popup.classList.add('hidden');
            resolve(count);
        };
        
        window.cancelPageCount = () => {
            popup.classList.add('hidden');
            resolve(null);
        };
    });
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
    const workId = window.currentWorkId ? window.currentWorkId() : currentWorkId;
    if (!workId) return;
    
    const files = await db.files.where('workId').equals(workId).toArray();
    const folders = await db.folders.where('workId').equals(workId).toArray();
    
    fileTree = { files, folders };
    window.fileTree = fileTree;
    renderFileTree();
}

// Render file tree with hierarchy
function renderFileTree() {
    const container = document.getElementById('file-tree');
    if (!container) return;
    
    let html = '';
    const activeFileId = window.currentFileId ? window.currentFileId() : currentFileId;
    
    // Helper function to render folder and its contents
    function renderFolder(folder, level = 0) {
        const indent = level * 20;
        const children = fileTree.folders.filter(f => f.parentId === folder.id);
        const folderFiles = fileTree.files.filter(f => f.parentId === folder.id);
        const isExpanded = true; // Can add expand/collapse functionality later
        
        html += `
            <div class="file-tree-item" style="padding-left: ${indent}px;" onclick="event.stopPropagation(); selectFolder(${folder.id})">
                <i class="fas fa-folder${isExpanded ? '-open' : ''} text-yellow-400"></i>
                <span class="flex-1">${folder.name}</span>
                <div class="flex gap-1">
                    <button onclick="event.stopPropagation(); renameItem(${folder.id}, 'folder')" class="text-gray-500 hover:text-blue-400" title="Rename">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteItem(${folder.id}, 'folder')" class="text-gray-500 hover:text-red-400" title="Delete">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `;
        
        if (isExpanded) {
            // Render files in this folder
            folderFiles.forEach(file => {
                const isActive = activeFileId === file.id;
                const fileIcon = file.extension === '.pdf' ? 'fa-file-pdf' : file.extension === '.docx' ? 'fa-file-word' : 'fa-file';
                html += `
                    <div class="file-tree-item ${isActive ? 'active' : ''}" style="padding-left: ${indent + 20}px;" onclick="event.stopPropagation(); loadFile(${file.id})">
                        <i class="fas ${fileIcon} text-blue-400"></i>
                        <span class="flex-1">${file.name}</span>
                        <div class="flex gap-1">
                            <button onclick="event.stopPropagation(); renameItem(${file.id}, 'file')" class="text-gray-500 hover:text-blue-400" title="Rename">
                                <i class="fas fa-edit text-xs"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteItem(${file.id}, 'file')" class="text-gray-500 hover:text-red-400" title="Delete">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            // Render subfolders
            children.forEach(child => renderFolder(child, level + 1));
        }
    }
    
    // Render root folders
    if (fileTree.folders) {
        fileTree.folders.filter(f => !f.parentId).forEach(folder => {
            renderFolder(folder, 0);
        });
    }
    
    // Render root files (not in any folder)
    if (fileTree.files) {
        fileTree.files.filter(f => !f.parentId).forEach(file => {
            const isActive = activeFileId === file.id;
            const fileIcon = file.extension === '.pdf' ? 'fa-file-pdf' : file.extension === '.docx' ? 'fa-file-word' : 'fa-file';
            html += `
                <div class="file-tree-item ${isActive ? 'active' : ''}" onclick="loadFile(${file.id})">
                    <i class="fas ${fileIcon} text-blue-400"></i>
                    <span class="flex-1">${file.name}</span>
                    <div class="flex gap-1">
                        <button onclick="event.stopPropagation(); renameItem(${file.id}, 'file')" class="text-gray-500 hover:text-blue-400" title="Rename">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deleteItem(${file.id}, 'file')" class="text-gray-500 hover:text-red-400" title="Delete">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
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
    
    // Reset to first page for books
    if (file.type === 'book') {
        const pageNumbers = [...new Set(inputs.map(i => i.pageNum || 1).filter(Boolean))].sort((a, b) => a - b);
        if (window.currentPageNum !== undefined) {
            window.currentPageNum = pageNumbers[0] || 1;
        }
    }
    
    if (file.type === 'single') {
        if (window.renderSinglePageForm) {
            window.renderSinglePageForm(inputs);
        }
    } else if (file.type === 'book') {
        if (window.renderBookForm) {
            window.renderBookForm(inputs, file);
        }
    }
    
    // Update preview
    if (window.updatePreview) {
        window.updatePreview(inputs);
    }
    
    // Reload file tree to show active state
    await loadFileTree();
    
    return Promise.resolve();
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
