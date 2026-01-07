// Rich Text Editor Functionality
let autoCorrectEnabled = true;

// Format text using execCommand
function formatText(command, value = null) {
    const editor = document.getElementById('editor');
    if (!editor) {
        // Try to find any contenteditable element
        const activeElement = document.activeElement;
        if (activeElement && activeElement.contentEditable === 'true') {
            document.execCommand(command, false, value);
            activeElement.focus();
            updateCounters();
            return;
        }
        return;
    }
    
    editor.focus();
    document.execCommand(command, false, value);
    updateCounters();
}

// Set font size
function setFontSize(size) {
    formatText('fontSize', size);
    // Apply actual font size
    const editor = document.getElementById('editor');
    if (editor) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = size + 'px';
            try {
                range.surroundContents(span);
            } catch (e) {
                // Fallback
                document.execCommand('fontSize', false, '7');
                const fontElements = editor.querySelectorAll('font[size="7"]');
                fontElements.forEach(el => {
                    el.style.fontSize = size + 'px';
                    el.removeAttribute('size');
                });
            }
        }
    }
    updateCounters();
}

// Auto-correct functionality
function applyAutoCorrect(text) {
    if (!autoCorrectEnabled) return text;
    
    let corrected = text;
    Object.keys(dictionary).forEach(wrong => {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        corrected = corrected.replace(regex, dictionary[wrong]);
    });
    
    return corrected;
}

// Initialize editor with auto-correct
function initEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    editor.addEventListener('input', function(e) {
        if (autoCorrectEnabled) {
            const text = this.textContent || this.innerText;
            const corrected = applyAutoCorrect(text);
            if (corrected !== text) {
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const start = range.startOffset;
                
                this.textContent = corrected;
                
                // Restore cursor position
                const newRange = document.createRange();
                newRange.setStart(this.firstChild || this, Math.min(start, corrected.length));
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
        updateCounters();
    });
    
    editor.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const corrected = applyAutoCorrect(text);
        document.execCommand('insertText', false, corrected);
        updateCounters();
    });
}

// Update word/character/paragraph/page counters
function updateCounters() {
    const editor = document.getElementById('editor');
    let text = '';
    
    if (editor) {
        text = editor.textContent || editor.innerText || '';
    } else {
        // Get text from all inputs
        const inputs = document.querySelectorAll('[id^="input-"]');
        inputs.forEach(input => {
            text += (input.value || input.textContent || input.innerHTML || '') + ' ';
        });
    }
    
    // Count words
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    // Count characters
    const charCount = text.length;
    
    // Count paragraphs
    const paragraphs = text.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 0);
    const paraCount = paragraphs.length || 1;
    
    // Estimate pages (assuming ~250 words per page)
    const pageCount = Math.ceil(wordCount / 250) || 1;
    
    // Update UI
    const wordEl = document.getElementById('word-count');
    const charEl = document.getElementById('char-count');
    const paraEl = document.getElementById('para-count');
    const pageEl = document.getElementById('page-count');
    
    if (wordEl) wordEl.textContent = wordCount;
    if (charEl) charEl.textContent = charCount;
    if (paraEl) paraEl.textContent = paraCount;
    if (pageEl) pageEl.textContent = pageCount;
}

// Save current work
async function saveCurrentWork() {
    if (!currentUser || !currentWorkId) {
        showError('Please login and create/open a work first');
        return;
    }
    
    const editor = document.getElementById('editor');
    let content = '';
    let fileId = null;
    
    if (window.currentFileId) {
        fileId = window.currentFileId();
    }
    
    if (editor && !editor.classList.contains('hidden')) {
        content = editor.innerHTML;
    } else if (fileId) {
        // Save all inputs
        const inputs = await db.inputs.where('fileId').equals(fileId).toArray();
        content = JSON.stringify(inputs);
    }
    
    // Update file content
    if (fileId) {
        await db.files.update(fileId, {
            content,
            updatedAt: new Date()
        });
    }
    
    // Update work
    await db.works.update(currentWorkId, {
        updatedAt: new Date()
    });
    
    showSuccess('Work saved successfully');
}

// Download work as PDF or DOCX
async function downloadWork() {
    if (!currentUser || !currentWorkId) {
        showError('Please login first');
        router('auth');
        return;
    }
    
    const work = await db.works.get(currentWorkId);
    if (!work) {
        showError('Work not found');
        return;
    }
    
    // Check payment status
    const hasPayment = await checkPaymentStatus(currentWorkId);
    if (!hasPayment) {
        showError('Payment required to download. Please visit Services page.');
        router('services');
        return;
    }
    
    // Get all files and content
    const files = await db.files.where('workId').equals(currentWorkId).toArray();
    let fullContent = '';
    
    for (const file of files) {
        const inputs = await db.inputs.where('fileId').equals(file.id).toArray();
        fullContent += `<h2>${file.name}</h2>`;
        inputs.forEach(input => {
            if (input.value) {
                fullContent += `<h3>${input.label}</h3><p>${input.value}</p>`;
            }
        });
    }
    
    // Calculate page count
    const wordCount = fullContent.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const pageCount = Math.ceil(wordCount / 250);
    
    // Prompt for format
    const format = confirm('Download as PDF? (OK for PDF, Cancel for DOCX)') ? 'pdf' : 'docx';
    
    if (format === 'pdf') {
        downloadAsPDF(fullContent, work.title);
    } else {
        downloadAsDOCX(fullContent, work.title);
    }
}

// Download as PDF (simplified - would need proper PDF library in production)
function downloadAsPDF(content, filename) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${filename}</title>
            <style>
                body { font-family: 'Oswald', sans-serif; padding: 40px; }
                h2 { color: #6366f1; margin-top: 30px; }
                h3 { color: #8b5cf6; margin-top: 20px; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
    showSuccess('PDF download initiated');
}

// Download as DOCX (simplified - would need proper DOCX library in production)
function downloadAsDOCX(content, filename) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${filename}</title>
        </head>
        <body>${content}</body>
        </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.docx';
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('DOCX download initiated');
}

// Export
window.formatText = formatText;
window.setFontSize = setFontSize;
window.initEditor = initEditor;
window.updateCounters = updateCounters;
window.saveCurrentWork = saveCurrentWork;
window.downloadWork = downloadWork;
