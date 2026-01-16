const state = { db: null, view: 'auth', user: null, currentItemId: null, editorType: 'Summary', dashboardFilter: 'Summary', currentPage: 1, itemsPerPage: 5 };
        const DB_NAME = 'DidactaxV2';
        
        /* --- DB & AUTH --- */
        function initDB() {
            return new Promise((resolve) => {
                const req = indexedDB.open(DB_NAME, 1);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('auth')) db.createObjectStore('auth', { keyPath: 'id' });
                    if (!db.objectStoreNames.contains('user')) db.createObjectStore('user', { keyPath: 'id' });
                    if (!db.objectStoreNames.contains('items')) {
                        const store = db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
                        store.createIndex('type', 'type', { unique: false });
                    }
                };
                req.onsuccess = (e) => {
                    state.db = e.target.result;
                    checkAuthStatus();
                    resolve(state.db);
                };
            });
        }
        function dbTx(store, mode) { return state.db.transaction(store, mode).objectStore(store); }

        let isRegisterMode = false;
        function checkAuthStatus() {
            dbTx('auth', 'readonly').get('creds').onsuccess = (e) => {
                if (!e.target.result) {
                    toggleAuthMode(true); 
                    document.getElementById('auth-subtext').classList.add('hidden');
                    showModal('Welcome', 'Please create a secure passkey to encrypt your local vault.');
                }
            };
        }
        function toggleAuthMode(forceRegister = false) {
            isRegisterMode = forceRegister || !isRegisterMode;
            document.querySelector('#view-auth h1').textContent = isRegisterMode ? "Create Access Key" : "Didactax.";
            document.getElementById('auth-btn').textContent = isRegisterMode ? "Register System" : "Unlock System";
            document.getElementById('auth-subtext').textContent = isRegisterMode ? "Already registered? Login." : "First time? Create access key.";
            document.getElementById('reg-fields').classList.toggle('hidden', !isRegisterMode);
            document.getElementById('auth-subtext').classList.toggle('hidden', forceRegister);
        }
        function handleAuth() {
            const pass = document.getElementById('auth-pass').value;
            if(!pass) return showModal('Error', 'Password required');
            const tx = dbTx('auth', 'readwrite');
            if (isRegisterMode) {
                const confirm = document.getElementById('auth-pass-confirm').value;
                if(pass !== confirm) return showModal('Error', 'Passwords do not match');
                tx.put({ id: 'creds', key: btoa(pass) }); 
                dbTx('user', 'readwrite').put({ id: 'profile', name: 'New User', role: 'Explorer', bio: 'Ready to learn', streak: 0, lastLogin: null, logs: [] });
                showModal('Success', 'System initialized. Please login.', () => { toggleAuthMode(false); document.getElementById('auth-pass').value = ''; });
            } else {
                tx.get('creds').onsuccess = (e) => {
                    if(e.target.result && e.target.result.key === btoa(pass)) enterApp();
                    else showModal('Access Denied', 'Incorrect Passkey');
                };
            }
        }
        function handleLogout() {
            document.getElementById('app-wrapper').classList.add('hidden');
            document.getElementById('view-auth').classList.remove('hidden');
            document.getElementById('auth-pass').value = '';
            state.user = null;
        }
        function enterApp() {
            document.getElementById('view-auth').classList.add('hidden');
            document.getElementById('app-wrapper').classList.remove('hidden');
            document.getElementById('app-wrapper').classList.add('flex');
            loadUserProfile();
            router('home');
        }

        /* --- USER & LOGS --- */
        function loadUserProfile() {
            dbTx('user', 'readwrite').get('profile').onsuccess = (e) => {
                state.user = e.target.result;
                const today = new Date().toDateString();
                if (state.user.lastLogin !== today) {
                    state.user.streak = (state.user.lastLogin === new Date(Date.now() - 864e5).toDateString()) ? state.user.streak + 1 : 1;
                    state.user.lastLogin = today;
                    logAction('Daily Login');
                    dbTx('user', 'readwrite').put(state.user);
                }
                updateUserUI();
            };
        }
        function updateUserUI() {
            document.getElementById('profile-name').textContent = state.user.name;
            document.getElementById('profile-role').textContent = state.user.role;
            document.getElementById('profile-bio').textContent = state.user.bio;
            document.getElementById('profile-avatar').textContent = state.user.name.charAt(0).toUpperCase();
            document.getElementById('streak-count').textContent = state.user.streak;
            document.getElementById('activity-log').innerHTML = state.user.logs.map(l => `<li class="border-b border-slate-100 pb-1 flex justify-between"><span>${l.action}</span><span class="text-xs text-slate-300">${l.time}</span></li>`).join('');
        }
        function logAction(action) {
            if(!state.user.logs) state.user.logs = [];
            state.user.logs.unshift({ action, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
            if(state.user.logs.length > 20) state.user.logs.pop();
        }
        function editProfile() {
            const html = `<div class="space-y-2 text-left"><input id="edit-name" value="${state.user.name}" class="modern-input w-full p-2 rounded" placeholder="Name"><input id="edit-role" value="${state.user.role}" class="modern-input w-full p-2 rounded" placeholder="Role"><input id="edit-bio" value="${state.user.bio}" class="modern-input w-full p-2 rounded" placeholder="Bio"></div>`;
            showModal('Edit Profile', '', () => {
                state.user.name = document.getElementById('edit-name').value;
                state.user.role = document.getElementById('edit-role').value;
                state.user.bio = document.getElementById('edit-bio').value;
                dbTx('user', 'readwrite').put(state.user);
                updateUserUI();
                document.getElementById('modal-overlay').classList.add('hidden');
            }, true);
            document.getElementById('modal-msg').innerHTML = html;
        }

        /* --- EDITOR CORE --- */
        function setEditorType(type) {
            state.editorType = type;
            document.getElementById('type-summary').classList.toggle('active', type === 'Summary');
            document.getElementById('type-note').classList.toggle('active', type === 'Note');
        }
        function askFieldType() {
            const html = `<div class="grid grid-cols-2 gap-4"><button onclick="addDynamicField('','','input'); closeModal()" class="p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition"><div class="font-bold text-slate-700">Short Text</div></button><button onclick="addDynamicField('','','textarea'); closeModal()" class="p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition"><div class="font-bold text-slate-700">Long Text</div></button></div>`;
            document.getElementById('modal-title').textContent = "Select Data Type";
            document.getElementById('modal-msg').innerHTML = html;
            document.getElementById('modal-ok').classList.add('hidden');
            document.getElementById('modal-cancel').classList.remove('hidden');
            document.getElementById('modal-cancel').onclick = closeModal;
            document.getElementById('modal-overlay').classList.remove('hidden');
        }
        function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); document.getElementById('modal-ok').classList.remove('hidden'); }

        function addDynamicField(key = '', val = '', type = 'input') {
            const container = document.getElementById('dynamic-fields-container');
            const div = document.createElement('div');
            div.className = "flex gap-2 animate-slide-up dynamic-field-row items-start";
            const inputHtml = type === 'textarea' ? `<textarea oninput="updatePreview()" class="dyn-val modern-input w-2/3 p-2 rounded-xl text-xs min-h-[60px]" placeholder="Value">${val}</textarea>` : `<input type="text" value="${val}" oninput="updatePreview()" class="dyn-val modern-input w-2/3 p-2 rounded-xl text-xs" placeholder="Value">`;
            div.innerHTML = `<input type="text" value="${key}" oninput="updatePreview()" class="dyn-key modern-input w-1/3 p-2 rounded-xl text-xs font-bold h-10" placeholder="Key"><input type="hidden" class="dyn-type" value="${type}">${inputHtml}<button onclick="removeField(this)" class="text-red-400 hover:text-red-600 px-1 pt-2"><i class="fas fa-times"></i></button>`;
            container.appendChild(div);
            updatePreview();
        }
        function removeField(btn) { btn.parentElement.remove(); updatePreview(); }

        function formatDoc(cmd, val=null) { document.execCommand(cmd, false, val); document.getElementById('editor-content').focus(); }
        function modifyFontSize(action) {
            const sel = window.getSelection();
            if (sel.rangeCount) {
                const size = action === 'increase' ? '120%' : '80%';
                if (sel.toString().length > 0) document.execCommand('insertHTML', false, `<span style="font-size: ${size}">${sel.toString()}</span>`);
            }
        }
        function changePageColor(color) { document.getElementById('editor-content').style.backgroundColor = color; }
        function downloadPDF() {
            html2pdf().set({ margin:0.5, filename:`didactax_${Date.now()}.pdf`, image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2}, jsPDF:{unit:'in',format:'letter',orientation:'portrait'} }).from(document.getElementById('editor-content')).save();
        }

        /* --- LOGIC UPDATE: Labels separate + Metadata in Body --- */
        function updatePreview() {
            const title = document.getElementById('note-title').value || 'Untitled';
            const labelInput = document.getElementById('note-label').value;
            const promptText = document.getElementById('note-prompt').value;
            
            // 1. Process Labels (Multi)
            let metaHeaderHtml = '';
            if(labelInput) {
                // Split by comma, trim whitespace, ignore empty
                const tags = labelInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
                tags.forEach(tag => {
                    metaHeaderHtml += `<span class="preview-badge">${tag}</span>`;
                });
            }

            // 2. Process Custom Fields (Into Body Block)
            let customFieldsHtml = '';
            const fields = document.querySelectorAll('.dynamic-field-row');
            if(fields.length > 0) {
                let rows = '';
                fields.forEach(row => {
                    const k = row.querySelector('.dyn-key').value;
                    const v = row.querySelector('.dyn-val').value;
                    if(k && v) {
                        rows += `<div class="metadata-row"><span class="meta-key">${k}</span><span class="meta-val">${v}</span></div>`;
                    }
                });
                if(rows) customFieldsHtml = `<div class="metadata-block">${rows}</div>`;
            }

            // 3. Process Body
            const bodyHtml = promptText.length > 0 ? promptText.replace(/\n/g, '<br>') : '<p class="text-slate-400 italic">Start typing content...</p>';
            const currentBg = document.getElementById('editor-content').style.backgroundColor;

            // 4. Construct
            const fullHtml = `
                <h1 class="preview-title">${title}</h1>
                <div class="preview-meta">${metaHeaderHtml}</div>
                ${customFieldsHtml} 
                <div class="preview-body">${bodyHtml}</div>
            `;

            const editor = document.getElementById('editor-content');
            editor.innerHTML = fullHtml;
            if(currentBg) editor.style.backgroundColor = currentBg;
            
            document.getElementById('sync-status').className = "text-xs text-emerald-600 font-bold mr-2 animate-pulse";
            setTimeout(() => { document.getElementById('sync-status').className = "text-xs text-slate-400 font-medium mr-2"; }, 500);
        }

        function saveItem() {
            const title = document.getElementById('note-title').value;
            if(!title) return showModal('Error', 'Title is required');
            const dynFields = [];
            document.querySelectorAll('.dynamic-field-row').forEach(div => {
                const k = div.querySelector('.dyn-key').value;
                const v = div.querySelector('.dyn-val').value;
                const t = div.querySelector('.dyn-type').value;
                if(k) dynFields.push({key: k, value: v, type: t});
            });
            const contentDiv = document.getElementById('editor-content');
            const item = {
                title,
                label: document.getElementById('note-label').value,
                prompt: document.getElementById('note-prompt').value,
                content: contentDiv.innerHTML,
                bgColor: contentDiv.style.backgroundColor || '#ffffff',
                customFields: dynFields,
                type: state.editorType,
                date: new Date().toISOString()
            };
            const tx = dbTx('items', 'readwrite');
            if(state.currentItemId) {
                item.id = state.currentItemId;
                tx.put(item).onsuccess = () => { logAction(`Updated ${item.type}`); dbTx('user', 'readwrite').put(state.user); router('dashboard'); };
            } else {
                tx.add(item).onsuccess = () => { logAction(`Created ${item.type}`); dbTx('user', 'readwrite').put(state.user); router('dashboard'); };
            }
        }
        function clearEditor() {
            document.getElementById('note-title').value = '';
            document.getElementById('note-label').value = '';
            document.getElementById('note-prompt').value = '';
            const ed = document.getElementById('editor-content');
            ed.innerHTML = '<p class="text-slate-400 mt-10 text-center">Start typing...</p>';
            ed.style.backgroundColor = '#ffffff';
            document.getElementById('dynamic-fields-container').innerHTML = '';
            state.currentItemId = null;
        }

        /* --- DASHBOARD & ROUTING --- */
        function createQuick(type) { setEditorType(type); router('editor'); }
        function router(view) {
            ['view-home', 'view-dashboard', 'view-editor'].forEach(v => document.getElementById(v).classList.add('hidden'));
            document.getElementById(`view-${view}`).classList.remove('hidden');
            if(view === 'dashboard') { state.currentPage = 1; loadDashboardItems(); }
            if(view === 'editor' && !state.currentItemId) clearEditor();
            window.scrollTo(0,0);
        }
        function filterDashboard(type) {
            state.dashboardFilter = type; state.currentPage = 1;
            document.getElementById('tab-summary').className = type === 'Summary' ? 'pb-3 text-lg font-bold text-emerald-600 border-b-2 border-emerald-600 transition' : 'pb-3 text-lg font-bold text-slate-400 hover:text-emerald-600 transition';
            document.getElementById('tab-note').className = type === 'Note' ? 'pb-3 text-lg font-bold text-emerald-600 border-b-2 border-emerald-600 transition' : 'pb-3 text-lg font-bold text-slate-400 hover:text-emerald-600 transition';
            loadDashboardItems();
        }
        function loadDashboardItems() {
            dbTx('items', 'readonly').getAll().onsuccess = (e) => {
                let items = (e.target.result || []).filter(i => i.type === state.dashboardFilter).sort((a,b) => new Date(b.date) - new Date(a.date));
                renderPagination(items);
            };
        }
        function renderPagination(allItems) {
            const listContainer = document.getElementById('content-list');
            const paginationContainer = document.getElementById('pagination-controls');
            listContainer.innerHTML = ''; paginationContainer.innerHTML = '';
            if(allItems.length === 0) { listContainer.innerHTML = `<div class="text-center py-10 text-slate-400">No ${state.dashboardFilter}s found. Create one.</div>`; return; }
            const startIndex = (state.currentPage - 1) * state.itemsPerPage;
            const pageItems = allItems.slice(startIndex, startIndex + state.itemsPerPage);
            pageItems.forEach(item => {
                const date = new Date(item.date).toLocaleDateString();
                const labels = item.label ? item.label.split(',').slice(0,2).join(', ') : 'General';
                listContainer.innerHTML += `
                    <div class="dashboard-row glass-card p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-100">
                        <div class="w-full md:w-5/12 flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg ${item.type === 'Summary' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center text-sm"><i class="fas ${item.type === 'Summary' ? 'fa-book-open' : 'fa-sticky-note'}"></i></div>
                            <span class="font-bold text-slate-700 truncate">${item.title}</span>
                        </div>
                        <div class="w-full md:w-3/12"><span class="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">${labels}</span></div>
                        <div class="hidden md:block md:w-2/12 text-xs text-slate-400">${date}</div>
                        <div class="w-full md:w-2/12 flex justify-end gap-2">
                            <button class="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition" onclick="editItem(${item.id})"><i class="fas fa-pen"></i></button>
                            <button class="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
            });
            const totalPages = Math.ceil(allItems.length / state.itemsPerPage);
            if(totalPages > 1) {
                paginationContainer.innerHTML = `
                    <button onclick="changePage(-1)" ${state.currentPage === 1 ? 'disabled class="opacity-50"' : ''} class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600">Prev</button>
                    <span class="text-xs text-slate-400">Page ${state.currentPage} of ${totalPages}</span>
                    <button onclick="changePage(1)" ${state.currentPage === totalPages ? 'disabled class="opacity-50"' : ''} class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600">Next</button>`;
            }
        }
        function changePage(d) { state.currentPage += d; loadDashboardItems(); }
        function editItem(id) {
            dbTx('items', 'readonly').get(id).onsuccess = (e) => {
                const item = e.target.result;
                state.currentItemId = item.id;
                setEditorType(item.type);
                document.getElementById('note-title').value = item.title;
                document.getElementById('note-label').value = item.label;
                document.getElementById('note-prompt').value = item.prompt;
                document.getElementById('editor-content').innerHTML = item.content || ''; 
                if(item.bgColor) document.getElementById('editor-content').style.backgroundColor = item.bgColor;
                document.getElementById('dynamic-fields-container').innerHTML = '';
                if(item.customFields) item.customFields.forEach(f => addDynamicField(f.key, f.value, f.type || 'input'));
                router('editor');
            };
        }
        function deleteItem(id) { showModal('Delete Item', 'Are you sure?', () => { dbTx('items', 'readwrite').delete(id).onsuccess = () => { logAction('Deleted Item'); loadDashboardItems(); document.getElementById('modal-overlay').classList.add('hidden'); } }, true); }
        function showModal(title, msg, onOk = null, showCancel = false) {
            const el = document.getElementById('modal-overlay');
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-msg').innerHTML = msg; 
            const btnOk = document.getElementById('modal-ok');
            const btnCancel = document.getElementById('modal-cancel');
            btnCancel.classList.toggle('hidden', !showCancel);
            const newOk = btnOk.cloneNode(true);
            btnOk.parentNode.replaceChild(newOk, btnOk);
            newOk.onclick = () => { if(onOk) onOk(); el.classList.add('hidden'); };
            if(showCancel) btnCancel.onclick = () => el.classList.add('hidden');
            el.classList.remove('hidden');
        }

        /* --- 3D BG --- */
        function initThree() {
            const canvas = document.getElementById('three-canvas');
            const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf8fafc); 
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); camera.position.z = 30;
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(15, 2), new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.08 }));
            scene.add(sphere);
            const pGeo = new THREE.BufferGeometry(); const pArr = new Float32Array(900);
            for(let i=0; i<900; i++) pArr[i] = (Math.random() - 0.5) * 80;
            pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
            const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.15, color: 0x059669 }));
            scene.add(particles);
            function animate() { requestAnimationFrame(animate); sphere.rotation.y+=0.002; sphere.rotation.x+=0.001; particles.rotation.y-=0.001; renderer.render(scene, camera); }
            animate();
            window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
        }

        window.onload = () => { initThree(); initDB(); };