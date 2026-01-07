// Book Metadata Management System

// Global book metadata structure
let bookMetadata = {
    identity: {
        bookTitle: '',
        subtitle: '',
        seriesName: '',
        edition: '',
        language: 'en'
    },
    author: {
        authorNames: '',
        authorBios: '',
        publisherName: '',
        publicationYear: new Date().getFullYear(),
        isbn: ''
    },
    design: {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#ec4899',
        bodyFont: 'Oswald',
        headingFont: 'Oswald',
        codeFont: 'Courier New',
        pageSize: 'A4',
        mode: 'print'
    },
    cover: {
        front: {
            mainTitle: '',
            subtitle: '',
            authorName: '',
            editionLabel: '',
            coverImage: '',
            imageType: 'photo',
            backgroundColor: '#1a1a2e',
            textColor: '#ffffff',
            fontSelection: 'Oswald',
            alignment: 'center',
            overlayOpacity: 0.5
        },
        spine: {
            shortTitle: '',
            authorName: '',
            publisherLogo: '',
            autoWidth: true
        },
        back: {
            description: '',
            keyBenefits: '',
            authorShortBio: '',
            authorPhoto: '',
            publisherLogo: '',
            isbnBarcode: '',
            backgroundColor: '#1a1a2e',
            textColor: '#ffffff',
            layoutGrid: 'standard'
        }
    },
    frontMatter: {
        titlePage: true,
        copyright: true,
        rightsStatement: true,
        printingLocation: true,
        dedication: '',
        acknowledgments: '',
        foreword: '',
        preface: ''
    },
    backMatter: {
        conclusion: '',
        glossary: [],
        references: [],
        index: [],
        symbolIndex: [],
        appendices: []
    }
};

// Load book metadata
async function loadBookMetadata(workId) {
    const work = await db.works.get(workId);
    if (work && work.metadata) {
        bookMetadata = { ...bookMetadata, ...work.metadata };
    }
    return bookMetadata;
}

// Save book metadata
async function saveBookMetadata(workId) {
    await db.works.update(workId, {
        metadata: bookMetadata
    });
    showSuccess('Book metadata saved');
}

// Show book metadata editor
function showBookMetadataEditor(workId) {
    const popup = document.getElementById('custom-popup');
    const content = document.getElementById('popup-content');
    
    content.innerHTML = `
        <div class="max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h3 class="text-xl font-bold mb-4">Book Metadata</h3>
            
            <!-- Identity Section -->
            <div class="mb-6">
                <h4 class="font-semibold mb-3 text-indigo-400">Identity</h4>
                <div class="space-y-3">
                    <input type="text" id="meta-book-title" placeholder="Book Title" value="${bookMetadata.identity.bookTitle}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <input type="text" id="meta-subtitle" placeholder="Subtitle" value="${bookMetadata.identity.subtitle}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <input type="text" id="meta-series" placeholder="Series Name (optional)" value="${bookMetadata.identity.seriesName}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <input type="text" id="meta-edition" placeholder="Edition" value="${bookMetadata.identity.edition}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <select id="meta-language" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="en" ${bookMetadata.identity.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="fr" ${bookMetadata.identity.language === 'fr' ? 'selected' : ''}>French</option>
                        <option value="es" ${bookMetadata.identity.language === 'es' ? 'selected' : ''}>Spanish</option>
                    </select>
                </div>
            </div>
            
            <!-- Author Section -->
            <div class="mb-6">
                <h4 class="font-semibold mb-3 text-indigo-400">Author & Publisher</h4>
                <div class="space-y-3">
                    <input type="text" id="meta-author-names" placeholder="Author Name(s)" value="${bookMetadata.author.authorNames}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <textarea id="meta-author-bios" placeholder="Author Bio(s)" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[80px]">${bookMetadata.author.authorBios}</textarea>
                    <input type="text" id="meta-publisher" placeholder="Publisher Name" value="${bookMetadata.author.publisherName}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <input type="number" id="meta-year" placeholder="Publication Year" value="${bookMetadata.author.publicationYear}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <input type="text" id="meta-isbn" placeholder="ISBN" value="${bookMetadata.author.isbn}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                </div>
            </div>
            
            <!-- Design Section -->
            <div class="mb-6">
                <h4 class="font-semibold mb-3 text-indigo-400">Design Controls</h4>
                <div class="space-y-3">
                    <div class="flex gap-2">
                        <input type="color" id="meta-primary-color" value="${bookMetadata.design.primaryColor}" class="w-16 h-10">
                        <label class="flex-1 text-sm text-gray-400">Primary Color</label>
                    </div>
                    <div class="flex gap-2">
                        <input type="color" id="meta-secondary-color" value="${bookMetadata.design.secondaryColor}" class="w-16 h-10">
                        <label class="flex-1 text-sm text-gray-400">Secondary Color</label>
                    </div>
                    <div class="flex gap-2">
                        <input type="color" id="meta-accent-color" value="${bookMetadata.design.accentColor}" class="w-16 h-10">
                        <label class="flex-1 text-sm text-gray-400">Accent Color</label>
                    </div>
                    <select id="meta-page-size" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="A4" ${bookMetadata.design.pageSize === 'A4' ? 'selected' : ''}>A4</option>
                        <option value="A5" ${bookMetadata.design.pageSize === 'A5' ? 'selected' : ''}>A5</option>
                        <option value="Letter" ${bookMetadata.design.pageSize === 'Letter' ? 'selected' : ''}>Letter</option>
                    </select>
                    <select id="meta-mode" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        <option value="print" ${bookMetadata.design.mode === 'print' ? 'selected' : ''}>Print</option>
                        <option value="digital" ${bookMetadata.design.mode === 'digital' ? 'selected' : ''}>Digital</option>
                    </select>
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button onclick="saveBookMetadataForm(${workId})" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold">
                    Save Metadata
                </button>
                <button onclick="closePopup()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    popup.classList.remove('hidden');
}

// Save book metadata form
async function saveBookMetadataForm(workId) {
    bookMetadata.identity.bookTitle = document.getElementById('meta-book-title').value;
    bookMetadata.identity.subtitle = document.getElementById('meta-subtitle').value;
    bookMetadata.identity.seriesName = document.getElementById('meta-series').value;
    bookMetadata.identity.edition = document.getElementById('meta-edition').value;
    bookMetadata.identity.language = document.getElementById('meta-language').value;
    
    bookMetadata.author.authorNames = document.getElementById('meta-author-names').value;
    bookMetadata.author.authorBios = document.getElementById('meta-author-bios').value;
    bookMetadata.author.publisherName = document.getElementById('meta-publisher').value;
    bookMetadata.author.publicationYear = parseInt(document.getElementById('meta-year').value) || new Date().getFullYear();
    bookMetadata.author.isbn = document.getElementById('meta-isbn').value;
    
    bookMetadata.design.primaryColor = document.getElementById('meta-primary-color').value;
    bookMetadata.design.secondaryColor = document.getElementById('meta-secondary-color').value;
    bookMetadata.design.accentColor = document.getElementById('meta-accent-color').value;
    bookMetadata.design.pageSize = document.getElementById('meta-page-size').value;
    bookMetadata.design.mode = document.getElementById('meta-mode').value;
    
    await saveBookMetadata(workId);
    closePopup();
}

// Export
window.loadBookMetadata = loadBookMetadata;
window.saveBookMetadata = saveBookMetadata;
window.showBookMetadataEditor = showBookMetadataEditor;
window.saveBookMetadataForm = saveBookMetadataForm;
window.bookMetadata = bookMetadata;
