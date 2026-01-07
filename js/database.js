// IndexedDB Database Setup using Dexie
const db = new Dexie('DidactaXDB');

db.version(1).stores({
    users: '++id, email, password, name, createdAt, lastLogin, streak, createdAt',
    works: '++id, userId, type, title, content, metadata, createdAt, updatedAt, pageCount',
    files: '++id, workId, name, type, content, order, parentId, extension',
    folders: '++id, workId, name, parentId, order',
    inputs: '++id, fileId, section, label, value, order, type',
    payments: '++id, userId, amount, method, status, workId, pages, transactionId, createdAt',
    settings: '++id, userId, theme, fontSize, autoSave, autoCorrect'
});

// Auto-correct dictionary (expanded)
const dictionary = {
    // Common typos
    'teh': 'the',
    'adn': 'and',
    'taht': 'that',
    'recieve': 'receive',
    'seperate': 'separate',
    'occured': 'occurred',
    'definately': 'definitely',
    'accomodate': 'accommodate',
    'begining': 'beginning',
    'existance': 'existence',
    'neccessary': 'necessary',
    'occassion': 'occasion',
    'embarass': 'embarrass',
    'millenium': 'millennium',
    'occurence': 'occurrence',
    'seige': 'siege',
    'thier': 'their',
    'wierd': 'weird',
    'acheive': 'achieve',
    'beleive': 'believe',
    'calender': 'calendar',
    'cemetary': 'cemetery',
    'concieve': 'conceive',
    'definately': 'definitely',
    'existance': 'existence',
    'goverment': 'government',
    'grammer': 'grammar',
    'harrass': 'harass',
    'independant': 'independent',
    'liason': 'liaison',
    'maintainance': 'maintenance',
    'neccessary': 'necessary',
    'occured': 'occurred',
    'priviledge': 'privilege',
    'seperate': 'separate',
    'suprise': 'surprise',
    'untill': 'until',
    'writting': 'writing'
};

// Export database instance
window.db = db;
window.dictionary = dictionary;
