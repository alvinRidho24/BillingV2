document.addEventListener('DOMContentLoaded', () => {
    const psHistoryContainer = document.getElementById('psHistory');
    const resetButton = document.getElementById('resetHistory');
    
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const renderHistory = () => {
        const psHistory = JSON.parse(localStorage.getItem('psHistory')) || {};
        psHistoryContainer.innerHTML = '';

        Object.entries(psHistory).forEach(([psId, sessions]) => {
            if(sessions.length > 0) {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                historyItem.innerHTML = `
                    <h3 class="history-title">${psId.toUpperCase().replace('TV', 'TV ')}</h3>
                    <div class="session-list">
                        <div class="session-item session-header">
                            <div>Waktu</div>
                            <div>Durasi</div>
                            <div>Harga</div>
                            <div></div>
                        </div>
                        ${sessions.map((session, index) => `
                            <div class="session-item">
                                <div class="session-date">${session.date}</div>
                                <div class="session-duration">${session.duration}</div>
                                <div class="session-price">${formatRupiah(session.price)}</div>
                                <button class="btn-delete" data-psid="${psId}" data-index="${index}">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                `;
                psHistoryContainer.appendChild(historyItem);
            }
        });

        if(Object.keys(psHistory).length === 0) {
            psHistoryContainer.innerHTML = `
                <div class="empty-state">
                    📭 Belum ada history penggunaan
                </div>
            `;
        }
    };

    // Hapus per item, perbaikan:
psHistoryContainer.addEventListener('click', (e) => {
    if(e.target.classList.contains('btn-delete')) {
        const psId = e.target.dataset.psid;
        const index = parseInt(e.target.dataset.index);
        
        if(confirm('Hapus session ini?')) {
            let history = JSON.parse(localStorage.getItem('psHistory')) || {}; // Tambahkan fallback object
            
            // Tambahkan pengecekan keberadaan psId
            if(history[psId]) {
                history[psId].splice(index, 1);
                
                // Hapus key jika array kosong
                if(history[psId].length === 0) {
                    delete history[psId];
                }
            }
            
            localStorage.setItem('psHistory', JSON.stringify(history));
            renderHistory();
        }
    }
});

    // ... [Fungsi resetHistory dan event listener tetap sama]

    const resetHistory = () => {
        if(confirm('Apakah Anda yakin ingin menghapus semua history?')) {
            localStorage.removeItem('psHistory');
            renderHistory();
        }
    };

    // Event listeners
    resetButton.addEventListener('click', resetHistory);

    // Initial render
    renderHistory();
});