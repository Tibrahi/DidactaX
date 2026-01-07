// Payment System
async function checkPaymentStatus(workId) {
    if (!currentUser) return false;
    
    const payment = await db.payments
        .where('userId').equals(currentUser.id)
        .and(p => p.workId === workId && p.status === 'completed')
        .first();
    
    return !!payment;
}

async function initiatePayment(method) {
    if (!currentUser) {
        showError('Please login first');
        router('auth');
        return;
    }
    
    if (!currentWorkId) {
        showError('Please create or open a work first');
        return;
    }
    
    const work = await db.works.get(currentWorkId);
    if (!work) {
        showError('Work not found');
        return;
    }
    
    // Calculate page count
    const files = await db.files.where('workId').equals(currentWorkId).toArray();
    let totalWords = 0;
    
    for (const file of files) {
        const inputs = await db.inputs.where('fileId').equals(file.id).toArray();
        inputs.forEach(input => {
            if (input.value) {
                totalWords += input.value.replace(/<[^>]*>/g, '').split(/\s+/).length;
            }
        });
    }
    
    const pageCount = Math.ceil(totalWords / 250) || 1;
    
    // Calculate amount
    let amount = 500; // Base price
    if (pageCount > 250) {
        amount = 1000 + ((pageCount - 250) * 2); // 2 per additional page
    }
    
    // Show payment form
    showPaymentForm(method, amount, pageCount);
}

function showPaymentForm(method, amount, pages) {
    const popup = document.getElementById('custom-popup');
    const content = document.getElementById('popup-content');
    
    const methodNames = {
        'mtn': 'MTN Mobile Money',
        'airtel': 'Airtel Money',
        'bk': 'Bank Transfer'
    };
    
    content.innerHTML = `
        <h3 class="text-xl font-bold mb-4">Payment: ${methodNames[method]}</h3>
        <div class="mb-4">
            <p class="text-gray-400 mb-2">Pages: ${pages}</p>
            <p class="text-2xl font-bold text-indigo-400">Amount: ${amount}</p>
        </div>
        <div class="space-y-3 mb-4">
            <input type="text" id="payment-phone" placeholder="Phone Number" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">
            ${method === 'bk' ? '<input type="text" id="payment-account" placeholder="Account Number" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">' : ''}
            <input type="text" id="payment-transaction" placeholder="Transaction ID" class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white">
        </div>
        <div class="flex gap-3">
            <button onclick="processPayment('${method}', ${amount}, ${pages})" class="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">
                Confirm Payment
            </button>
            <button onclick="closePopup()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                Cancel
            </button>
        </div>
    `;
    
    popup.classList.remove('hidden');
}

async function processPayment(method, amount, pages) {
    const phone = document.getElementById('payment-phone')?.value;
    const account = document.getElementById('payment-account')?.value;
    const transactionId = document.getElementById('payment-transaction')?.value;
    
    if (!phone || !transactionId) {
        showError('Please fill all required fields');
        return;
    }
    
    // In production, this would verify with payment gateway
    // For now, we'll simulate payment processing
    
    const paymentId = await db.payments.add({
        userId: currentUser.id,
        workId: currentWorkId,
        amount,
        method,
        status: 'completed',
        pages,
        transactionId,
        createdAt: new Date()
    });
    
    closePopup();
    showSuccess('Payment processed successfully! You can now download your work.');
}

function loadServices() {
    // Services view is already rendered in HTML
    // This function can be used to load payment history if needed
}

// Export
window.initiatePayment = initiatePayment;
window.processPayment = processPayment;
window.checkPaymentStatus = checkPaymentStatus;
window.loadServices = loadServices;
