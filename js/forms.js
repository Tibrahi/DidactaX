// Form Rendering and Management
let currentInputs = [];
let currentPageNum = 1;
let currentFileId = null; // Will be set from fileManager

// Render single page form
function renderSinglePageForm(inputs) {
    const container = document.getElementById('single-page-form');
    const editor = document.getElementById('rich-editor');
    const bookForm = document.getElementById('book-form');
    
    container.classList.remove('hidden');
    editor.classList.add('hidden');
    bookForm.classList.add('hidden');
    
    currentInputs = inputs.sort((a, b) => a.order - b.order);
    window.currentInputs = currentInputs;
    
    let html = '<div class="space-y-6 animate-fade-in">';
    
    currentInputs.forEach((input, index) => {
        const placeholder = input.placeholder || '';
        const description = input.description || '';
        const isCompleted = input.value && input.value.trim().length > 0;
        
        html += `
            <div class="input-section ${isCompleted ? 'border-green-500' : ''}" data-input-id="${input.id}" data-order="${input.order}">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-indigo-400">${index + 1}</span>
                        <label class="text-sm font-semibold text-gray-300 uppercase tracking-wider">${input.label}</label>
                        ${description ? `<i class="fas fa-info-circle text-gray-500 cursor-help" title="${description}"></i>` : ''}
                    </div>
                    <div class="input-controls">
                        <button onclick="renameInput(${input.id})" class="btn-rename" title="Rename">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="removeInput(${input.id})" class="btn-remove" title="Remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${input.type === 'textarea' ? 
                    `<textarea 
                        id="input-${input.id}" 
                        oninput="handleInputChange(${input.id}, this.value, ${index})" 
                        onkeydown="handleInputKeydown(event, ${index})"
                        placeholder="${placeholder}"
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white resize-y min-h-[120px]">${input.value || ''}</textarea>` :
                    `<input 
                        type="text" 
                        id="input-${input.id}" 
                        oninput="handleInputChange(${input.id}, this.value, ${index})" 
                        onkeydown="handleInputKeydown(event, ${index})"
                        value="${input.value || ''}" 
                        placeholder="${placeholder}"
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">`
                }
                ${isCompleted ? '<div class="mt-2 text-xs text-green-400"><i class="fas fa-check-circle mr-1"></i>Completed</div>' : ''}
            </div>
        `;
    });
    
    html += `
        <div class="mt-6 flex gap-3">
            <button onclick="addNewInput()" class="btn-add">
                <i class="fas fa-plus mr-2"></i>Add New Input
            </button>
        </div>
    `;
    
    html += '</div>';
    container.innerHTML = html;
    
    // Auto-focus first empty input
    autoFocusNextInput();
    
    // Update preview
    updatePreview(currentInputs);
}

// Render book form
function renderBookForm(inputs, file) {
    const container = document.getElementById('book-form');
    const singleForm = document.getElementById('single-page-form');
    const editor = document.getElementById('rich-editor');
    
    container.classList.remove('hidden');
    singleForm.classList.add('hidden');
    editor.classList.add('hidden');
    
    currentInputs = inputs.sort((a, b) => {
        if (a.pageNum !== b.pageNum) return a.pageNum - b.pageNum;
        return a.order - b.order;
    });
    window.currentInputs = currentInputs;
    
    // Group inputs by page
    const pages = {};
    currentInputs.forEach(input => {
        const page = input.pageNum || 1;
        if (!pages[page]) pages[page] = [];
        pages[page].push(input);
    });
    
    let html = '<div class="space-y-8">';
    
    // Page navigation
    const pageNumbers = Object.keys(pages).map(Number).sort((a, b) => a - b);
    html += `
        <div class="flex items-center justify-between mb-6 bg-gray-800 p-4 rounded-lg">
            <button onclick="navigatePage(-1)" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded" ${currentPageNum === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="font-semibold">Page ${currentPageNum} of ${pageNumbers.length}</span>
            <button onclick="navigatePage(1)" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded" ${currentPageNum === pageNumbers.length ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
    
    // Render current page inputs
    const currentPageInputs = pages[currentPageNum] || [];
    currentPageInputs.forEach(input => {
        html += `
            <div class="input-section" data-input-id="${input.id}">
                <div class="flex items-center justify-between mb-3">
                    <label>${input.label}</label>
                    <div class="input-controls">
                        <button onclick="renameInput(${input.id})" class="btn-rename">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="removeInput(${input.id})" class="btn-remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${input.type === 'textarea' || input.type === 'richtext' ? 
                    `<div id="input-${input.id}" contenteditable="true" oninput="updateInput(${input.id}, this.innerHTML)" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white min-h-[150px]">${input.value || ''}</div>` :
                    `<input type="text" id="input-${input.id}" oninput="updateInput(${input.id}, this.value)" value="${input.value || ''}" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">`
                }
            </div>
        `;
    });
    
    html += `
        <div class="mt-6">
            <button onclick="addNewInput()" class="btn-add">
                <i class="fas fa-plus mr-2"></i>Add New Input
            </button>
        </div>
    `;
    
    html += '</div>';
    container.innerHTML = html;
    
    autoFocusNextInput();
}

// Navigate between pages
function navigatePage(direction) {
    const pageNumbers = [...new Set(currentInputs.map(i => i.pageNum || 1).filter(Boolean))].sort((a, b) => a - b);
    if (pageNumbers.length === 0) return;
    
    const currentIndex = pageNumbers.indexOf(currentPageNum);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < pageNumbers.length) {
        currentPageNum = pageNumbers[newIndex];
        updateCurrentFileId();
        const fileId = getCurrentFileId();
        const file = (window.fileTree && window.fileTree.files) ? window.fileTree.files.find(f => f.id === fileId) : null;
        if (file) {
            renderBookForm(currentInputs, file);
        }
    }
}

// Handle input change with auto-move functionality
async function handleInputChange(inputId, value, index) {
    await updateInput(inputId, value);
    
    // Check if input is completed and auto-move to next
    if (value && value.trim().length > 0) {
        const inputEl = document.getElementById(`input-${inputId}`);
        if (inputEl) {
            inputEl.closest('.input-section').classList.add('border-green-500');
        }
        
        // Auto-move to next empty input after a delay
        setTimeout(() => {
            autoMoveToNextEmptyInput(index);
        }, 500);
    }
}

// Handle keyboard events for input navigation
function handleInputKeydown(event, currentIndex) {
    // Tab to move to next input
    if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        const nextIndex = currentIndex + 1;
        if (nextIndex < currentInputs.length) {
            const nextInput = document.getElementById(`input-${currentInputs[nextIndex].id}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }
    
    // Shift+Tab to move to previous input
    if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            const prevInput = document.getElementById(`input-${currentInputs[prevIndex].id}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    }
}

// Auto-move to next empty input
function autoMoveToNextEmptyInput(currentIndex) {
    for (let i = currentIndex + 1; i < currentInputs.length; i++) {
        const input = currentInputs[i];
        const inputEl = document.getElementById(`input-${input.id}`);
        if (inputEl) {
            const value = inputEl.value || inputEl.textContent || inputEl.innerHTML || '';
            if (!value || value.trim() === '') {
                inputEl.focus();
                if (inputEl.scrollIntoView) {
                    inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                break;
            }
        }
    }
}

// Update input value
async function updateInput(inputId, value) {
    await db.inputs.update(inputId, { value });
    updatePreview();
    updateCounters();
}

// Add new input
async function addNewInput() {
    updateCurrentFileId();
    const fileId = getCurrentFileId();
    if (!fileId) return;
    
    const label = prompt('Enter input label:');
    if (!label) return;
    
    const type = confirm('Is this a textarea? (OK for Yes, Cancel for Text)') ? 'textarea' : 'text';
    
    const maxOrder = currentInputs.length > 0 ? Math.max(...currentInputs.map(i => i.order)) : -1;
    
    const inputId = await db.inputs.add({
        fileId: fileId,
        section: 'custom',
        label,
        value: '',
        order: maxOrder + 1,
        type,
        pageNum: currentPageNum || null
    });
    
    currentInputs.push(await db.inputs.get(inputId));
    
    const fileTree = window.fileTree || { files: [] };
    if (fileTree.files && fileTree.files.find(f => f.id === currentFileId)?.type === 'single') {
        renderSinglePageForm(currentInputs);
    } else {
        const file = fileTree.files ? fileTree.files.find(f => f.id === currentFileId) : null;
        if (file) {
            renderBookForm(currentInputs, file);
        }
    }
    
    showSuccess('Input added');
}

// Remove input
async function removeInput(inputId) {
    if (!confirm('Delete this input?')) return;
    
    await db.inputs.delete(inputId);
    currentInputs = currentInputs.filter(i => i.id !== inputId);
    
    updateCurrentFileId();
    const fileId = getCurrentFileId();
    const fileTree = window.fileTree || { files: [] };
    if (fileTree.files && fileTree.files.find(f => f.id === fileId)?.type === 'single') {
        renderSinglePageForm(currentInputs);
    } else {
        const file = fileTree.files ? fileTree.files.find(f => f.id === currentFileId) : null;
        if (file) {
            renderBookForm(currentInputs, file);
        }
    }
    
    showSuccess('Input removed');
}

// Rename input
async function renameInput(inputId) {
    const input = await db.inputs.get(inputId);
    const newLabel = prompt('Enter new label:', input.label);
    if (!newLabel) return;
    
    await db.inputs.update(inputId, { label: newLabel });
    input.label = newLabel;
    
    updateCurrentFileId();
    const fileId = getCurrentFileId();
    const fileTree = window.fileTree || { files: [] };
    if (fileTree.files && fileTree.files.find(f => f.id === fileId)?.type === 'single') {
        renderSinglePageForm(currentInputs);
    } else {
        const file = fileTree.files ? fileTree.files.find(f => f.id === currentFileId) : null;
        if (file) {
            renderBookForm(currentInputs, file);
        }
    }
    
    showSuccess('Input renamed');
}

// Auto-focus next empty input
function autoFocusNextInput() {
    const inputs = document.querySelectorAll('[id^="input-"]');
    for (const input of inputs) {
        const value = input.value || input.textContent || input.innerHTML;
        if (!value || value.trim() === '') {
            input.focus();
            break;
        }
    }
}

// Update preview panel
function updatePreview(inputs = currentInputs) {
    const container = document.getElementById('preview-content');
    if (!container) return;
    
    // Check if this is a book with pages
    const hasPages = inputs.some(i => i.pageNum);
    
    if (hasPages) {
        // Group by page
        const pages = {};
        inputs.forEach(input => {
            const page = input.pageNum || 1;
            if (!pages[page]) pages[page] = [];
            pages[page].push(input);
        });
        
        const pageNumbers = Object.keys(pages).map(Number).sort((a, b) => a - b);
        const currentPage = currentPageNum || 1;
        
        let html = `
            <div class="space-y-4">
                <div class="bg-gray-700 p-3 rounded-lg mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-sm">Page ${currentPage} of ${pageNumbers.length}</span>
                        <div class="flex gap-2">
                            <button onclick="navigatePage(-1)" class="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs" ${currentPage === 1 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button onclick="navigatePage(1)" class="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs" ${currentPage === pageNumbers.length ? 'disabled' : ''}>
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex gap-1 flex-wrap">
                        ${pageNumbers.map(p => `
                            <button onclick="jumpToPage(${p})" class="px-2 py-1 text-xs rounded ${p === currentPage ? 'bg-indigo-600' : 'bg-gray-600 hover:bg-gray-500'}">
                                ${p}
                            </button>
                        `).join('')}
                    </div>
                </div>
        `;
        
        // Show current page inputs
        const currentPageInputs = pages[currentPage] || [];
        currentPageInputs.forEach(input => {
            if (input.value) {
                const displayValue = input.value.replace(/<[^>]*>/g, '').substring(0, 200);
                html += `
                    <div class="preview-item">
                        <h4 class="text-indigo-400 font-semibold mb-2">${input.label}</h4>
                        <p class="text-sm text-gray-300">${displayValue}${input.value.length > 200 ? '...' : ''}</p>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        container.innerHTML = html;
    } else {
        // Single page preview
        let html = '<div class="space-y-4">';
        
        inputs.forEach(input => {
            if (input.value) {
                const displayValue = input.value.replace(/<[^>]*>/g, '').substring(0, 150);
                html += `
                    <div class="preview-item">
                        <h4 class="text-indigo-400 font-semibold mb-2">${input.label}</h4>
                        <p class="text-sm text-gray-300">${displayValue}${input.value.length > 150 ? '...' : ''}</p>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        container.innerHTML = html || '<p class="text-gray-500 text-sm">No content to preview</p>';
    }
}

// Jump to specific page
function jumpToPage(pageNum) {
    currentPageNum = pageNum;
    window.currentPageNum = currentPageNum;
    updateCurrentFileId();
    const fileId = getCurrentFileId();
    const fileTree = window.fileTree || { files: [] };
    const file = fileTree.files ? fileTree.files.find(f => f.id === fileId) : null;
    if (file) {
        loadFile(fileId).then(() => {
            updatePreview(currentInputs);
        });
    }
}

// Get currentFileId from fileManager
function getCurrentFileId() {
    if (window.currentFileId) {
        return window.currentFileId();
    }
    return currentFileId;
}

// Update currentFileId reference
function updateCurrentFileId() {
    if (window.currentFileId) {
        currentFileId = window.currentFileId();
    }
}

// Export
window.renderSinglePageForm = renderSinglePageForm;
window.renderBookForm = renderBookForm;
window.navigatePage = navigatePage;
window.jumpToPage = jumpToPage;
window.updateInput = updateInput;
window.handleInputChange = handleInputChange;
window.handleInputKeydown = handleInputKeydown;
window.autoMoveToNextEmptyInput = autoMoveToNextEmptyInput;
window.addNewInput = addNewInput;
window.removeInput = removeInput;
window.renameInput = renameInput;
window.updatePreview = updatePreview;
window.getCurrentFileId = getCurrentFileId;
window.updateCurrentFileId = updateCurrentFileId;
