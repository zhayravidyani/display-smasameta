// Data dan status aplikasi
const appState = {
    currentQueue: null,
    nextQueue: null,
    queueHistory: [],
    operators: [
        { id: 1, name: "Operator 1 - Pendaftaran", color: "#3498db", status: "active", currentQueue: null },
        { id: 2, name: "Operator 2 - Verifikasi Berkas", color: "#2ecc71", status: "active", currentQueue: null },
        { id: 3, name: "Operator 3 - Wawancara", color: "#e74c3c", status: "active", currentQueue: null },
        { id: 4, name: "Operator 4 - Tes Akademik", color: "#f39c12", status: "active", currentQueue: null },
        { id: 5, name: "Operator 5 - Tes Psikologi", color: "#9b59b6", status: "active", currentQueue: null },
        { id: 6, name: "Operator 6 - Administrasi", color: "#1abc9c", status: "active", currentQueue: null },
        { id: 7, name: "Operator 7 - Konseling", color: "#d35400", status: "active", currentQueue: null },
        { id: 8, name: "Operator 8 - Penutupan", color: "#34495e", status: "active", currentQueue: null }
    ],
    queueCounter: 1
};

// Inisialisasi Speech Synthesis
const speech = window.speechSynthesis;
let voices = [];
let femaleVoice = null;

// Fungsi untuk mendapatkan suara wanita
function getFemaleVoice() {
    voices = speech.getVoices();
    
    // Cari suara wanita dalam bahasa Indonesia atau Inggris
    for (let i = 0; i < voices.length; i++) {
        // Prioritaskan suara wanita bahasa Indonesia
        if (voices[i].lang.startsWith('id') && (voices[i].name.toLowerCase().includes('female') || voices[i].name.toLowerCase().includes('perempuan'))) {
            return voices[i];
        }
    }
    
    // Jika tidak ada, cari suara wanita bahasa Inggris
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].lang.startsWith('en') && (voices[i].name.toLowerCase().includes('female') || voices[i].name.toLowerCase().includes('woman'))) {
            return voices[i];
        }
    }
    
    // Jika tetap tidak ditemukan, ambil suara pertama yang tersedia
    return voices[0] || null;
}

// Fungsi untuk mengucapkan teks
function speakText(text) {
    if (speech.speaking) {
        speech.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = parseFloat(document.getElementById('volumeControl').value);
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }
    
    // Atur bahasa ke Indonesia
    utterance.lang = 'id-ID';
    
    speech.speak(utterance);
}

// Fungsi untuk memperbarui tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    document.getElementById('date').textContent = now.toLocaleDateString('id-ID', optionsDate);
    document.getElementById('time').textContent = now.toLocaleTimeString('id-ID', optionsTime);
}

// Fungsi untuk memperbarui tampilan antrian
function updateQueueDisplay() {
    const currentQueueElement = document.getElementById('currentQueue');
    const currentOperatorElement = document.getElementById('currentOperator');
    const nextQueueElement = document.getElementById('nextQueue');
    const nextOperatorElement = document.getElementById('nextOperator');
    
    if (appState.currentQueue) {
        currentQueueElement.textContent = `A${String(appState.currentQueue.number).padStart(3, '0')}`;
        currentOperatorElement.textContent = appState.currentQueue.operatorName;
        currentOperatorElement.style.backgroundColor = appState.currentQueue.operatorColor;
    } else {
        currentQueueElement.textContent = '-';
        currentOperatorElement.textContent = '-';
        currentOperatorElement.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    }
    
    if (appState.nextQueue) {
        nextQueueElement.textContent = `A${String(appState.nextQueue.number).padStart(3, '0')}`;
        nextOperatorElement.textContent = appState.nextQueue.operatorName;
        nextOperatorElement.style.backgroundColor = appState.nextQueue.operatorColor;
    } else {
        nextQueueElement.textContent = '-';
        nextOperatorElement.textContent = '-';
        nextOperatorElement.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    }
}

// Fungsi untuk memperbarui riwayat antrian
function updateQueueHistory() {
    const recentQueuesElement = document.getElementById('recentQueues');
    
    if (appState.queueHistory.length === 0) {
        recentQueuesElement.innerHTML = '<div class="empty-history">Belum ada antrian yang dipanggil</div>';
        return;
    }
    
    let historyHTML = '';
    const recentHistory = appState.queueHistory.slice(-5).reverse();
    
    recentHistory.forEach(queue => {
        historyHTML += `
            <div class="queue-history-item">
                <div class="queue-history-number">A${String(queue.number).padStart(3, '0')}</div>
                <div class="queue-history-operator">${queue.operatorName}</div>
                <div class="queue-history-time">${queue.time}</div>
            </div>
        `;
    });
    
    recentQueuesElement.innerHTML = historyHTML;
}

// Fungsi untuk memperbarui tampilan operator
function updateOperatorsDisplay() {
    const operatorsGridElement = document.getElementById('operatorsGrid');
    let operatorsHTML = '';
    
    appState.operators.forEach(operator => {
        const statusClass = operator.status === 'active' ? 'status-active' : 'status-busy';
        const cardClass = operator.status === 'active' ? 'active' : 'busy';
        
        operatorsHTML += `
            <div class="operator-card ${cardClass}">
                <div class="operator-header">
                    <div class="operator-name">${operator.name.split(' - ')[0]}</div>
                    <div class="operator-status ${statusClass}">${operator.status === 'active' ? 'Tersedia' : 'Sibuk'}</div>
                </div>
                <div class="operator-info">${operator.name.split(' - ')[1]}</div>
                <div class="operator-current-queue">
                    ${operator.currentQueue ? `Antrian: A${String(operator.currentQueue).padStart(3, '0')}` : '<span class="no-queue">Tidak ada antrian</span>'}
                </div>
            </div>
        `;
    });
    
    operatorsGridElement.innerHTML = operatorsHTML;
}

// Fungsi untuk menambahkan antrian baru
function addNewQueue() {
    const queueNumber = parseInt(document.getElementById('queueNumber').value);
    const operatorId = parseInt(document.getElementById('operatorSelect').value);
    
    if (queueNumber < 1) {
        alert('Nomor antrian harus lebih dari 0');
        return;
    }
    
    // Perbarui counter jika nomor antrian lebih besar
    if (queueNumber >= appState.queueCounter) {
        appState.queueCounter = queueNumber + 1;
    }
    
    // Cek apakah nomor antrian sudah ada di antrian saat ini atau selanjutnya
    const isAlreadyInQueue = 
        (appState.currentQueue && appState.currentQueue.number === queueNumber) ||
        (appState.nextQueue && appState.nextQueue.number === queueNumber);
    
    if (isAlreadyInQueue) {
        alert(`Nomor antrian A${String(queueNumber).padStart(3, '0')} sudah ada dalam antrian!`);
        return;
    }
    
    // Jika belum ada antrian saat ini, jadikan sebagai antrian saat ini
    if (!appState.currentQueue) {
        const operator = appState.operators.find(op => op.id === operatorId);
        appState.currentQueue = {
            number: queueNumber,
            operatorId: operatorId,
            operatorName: operator.name,
            operatorColor: operator.color
        };
        
        // Update status operator
        operator.status = 'busy';
        operator.currentQueue = queueNumber;
    } 
    // Jika belum ada antrian selanjutnya, jadikan sebagai antrian selanjutnya
    else if (!appState.nextQueue) {
        const operator = appState.operators.find(op => op.id === operatorId);
        appState.nextQueue = {
            number: queueNumber,
            operatorId: operatorId,
            operatorName: operator.name,
            operatorColor: operator.color
        };
    } else {
        alert('Sudah ada antrian saat ini dan selanjutnya. Panggil antrian saat ini terlebih dahulu.');
        return;
    }
    
    updateQueueDisplay();
    updateOperatorsDisplay();
    
    // Reset input nomor antrian ke nilai berikutnya
    document.getElementById('queueNumber').value = appState.queueCounter;
    document.getElementById('callStatus').textContent = `Antrian A${String(queueNumber).padStart(3, '0')} telah ditambahkan ke ${operatorId}`;
}

// Fungsi untuk memanggil antrian
function callQueue() {
    if (!appState.currentQueue) {
        document.getElementById('callStatus').textContent = 'Tidak ada antrian untuk dipanggil';
        return;
    }
    
    // Tampilkan status pemanggilan
    document.getElementById('callStatus').textContent = 'Memanggil antrian...';
    
    // Buat teks untuk diucapkan
    const queueText = `Nomor antrian A${String(appState.currentQueue.number).padStart(3, '0')}, silahkan menuju ${appState.currentQueue.operatorName.split(' - ')[0]}`;
    
    // Ucapkan teks
    speakText(queueText);
    
    // Tambahkan ke riwayat
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    appState.queueHistory.push({
        number: appState.currentQueue.number,
        operatorName: appState.currentQueue.operatorName,
        time: timeString
    });
    
    // Update status setelah beberapa detik
    setTimeout(() => {
        document.getElementById('callStatus').textContent = `Antrian A${String(appState.currentQueue.number).padStart(3, '0')} telah dipanggil`;
        
        // Pindah antrian selanjutnya ke antrian saat ini
        if (appState.nextQueue) {
            appState.currentQueue = appState.nextQueue;
            appState.nextQueue = null;
        } else {
            // Jika tidak ada antrian selanjutnya, reset antrian saat ini
            const operator = appState.operators.find(op => op.id === appState.currentQueue.operatorId);
            if (operator) {
                operator.status = 'active';
                operator.currentQueue = null;
            }
            
            appState.currentQueue = null;
        }
        
        updateQueueDisplay();
        updateQueueHistory();
        updateOperatorsDisplay();
    }, 4000); // Tunggu 4 detik untuk simulasi pemanggilan
}

// Fungsi untuk memperbarui antrian
function updateQueue() {
    const queueNumber = parseInt(document.getElementById('queueNumber').value);
    const operatorId = parseInt(document.getElementById('operatorSelect').value);
    
    if (queueNumber < 1) {
        alert('Nomor antrian harus lebih dari 0');
        return;
    }
    
    const operator = appState.operators.find(op => op.id === operatorId);
    
    // Coba update antrian saat ini
    if (appState.currentQueue && appState.currentQueue.number === queueNumber) {
        // Update operator sebelumnya
        const prevOperator = appState.operators.find(op => op.id === appState.currentQueue.operatorId);
        if (prevOperator && prevOperator.id !== operatorId) {
            prevOperator.status = 'active';
            prevOperator.currentQueue = null;
        }
        
        // Update antrian saat ini
        appState.currentQueue.operatorId = operatorId;
        appState.currentQueue.operatorName = operator.name;
        appState.currentQueue.operatorColor = operator.color;
        
        // Update operator baru
        operator.status = 'busy';
        operator.currentQueue = queueNumber;
        
        document.getElementById('callStatus').textContent = `Antrian saat ini (A${String(queueNumber).padStart(3, '0')}) telah diperbarui`;
    } 
    // Coba update antrian selanjutnya
    else if (appState.nextQueue && appState.nextQueue.number === queueNumber) {
        // Update operator sebelumnya
        const prevOperator = appState.operators.find(op => op.id === appState.nextQueue.operatorId);
        if (prevOperator && prevOperator.id !== operatorId) {
            prevOperator.status = 'active';
            prevOperator.currentQueue = null;
        }
        
        // Update antrian selanjutnya
        appState.nextQueue.operatorId = operatorId;
        appState.nextQueue.operatorName = operator.name;
        appState.nextQueue.operatorColor = operator.color;
        
        document.getElementById('callStatus').textContent = `Antrian selanjutnya (A${String(queueNumber).padStart(3, '0')}) telah diperbarui`;
    }
    // Jika tidak ditemukan, tambahkan sebagai antrian baru
    else {
        addNewQueue();
        return;
    }
    
    updateQueueDisplay();
    updateOperatorsDisplay();
}

// Fungsi untuk mereset antrian
function resetQueue() {
    if (confirm('Apakah Anda yakin ingin mereset semua antrian? Tindakan ini tidak dapat dibatalkan.')) {
        appState.currentQueue = null;
        appState.nextQueue = null;
        appState.queueCounter = 1;
        
        // Reset semua operator
        appState.operators.forEach(operator => {
            operator.status = 'active';
            operator.currentQueue = null;
        });
        
        document.getElementById('queueNumber').value = 1;
        updateQueueDisplay();
        updateOperatorsDisplay();
        document.getElementById('callStatus').textContent = 'Semua antrian telah direset';
    }
}

// Fungsi untuk mereset tampilan
function resetDisplay() {
    appState.queueHistory = [];
    updateQueueHistory();
    document.getElementById('callStatus').textContent = 'Riwayat tampilan telah direset';
}

// Fungsi untuk menguji suara
function testVoice() {
    const testText = "Ini adalah uji suara dari sistem antrian S P M B SMA Negeri 15. Sistem berfungsi dengan baik.";
    speakText(testText);
    document.getElementById('callStatus').textContent = 'Sedang menguji suara...';
    
    setTimeout(() => {
        document.getElementById('callStatus').textContent = 'Uji suara selesai';
    }, 3000);
}

// Fungsi untuk mengupdate indikator warna operator
function updateOperatorColorIndicator() {
    const operatorId = parseInt(document.getElementById('operatorSelect').value);
    const operator = appState.operators.find(op => op.id === operatorId);
    const indicator = document.getElementById('operatorColorIndicator');
    
    if (operator && indicator) {
        indicator.style.backgroundColor = operator.color;
    }
}

// Fungsi untuk menambah/mengurangi nomor antrian
function increaseQueueNumber() {
    const queueInput = document.getElementById('queueNumber');
    let currentValue = parseInt(queueInput.value);
    queueInput.value = currentValue + 1;
}

function decreaseQueueNumber() {
    const queueInput = document.getElementById('queueNumber');
    let currentValue = parseInt(queueInput.value);
    if (currentValue > 1) {
        queueInput.value = currentValue - 1;
    }
}

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi suara
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {
            femaleVoice = getFemaleVoice();
            console.log('Suara tersedia:', femaleVoice ? femaleVoice.name : 'Tidak ditemukan suara wanita');
        };
    }
    
    // Inisialisasi awal
    updateOperatorsDisplay();
    updateOperatorColorIndicator();
    
    // Set tahun saat ini di footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Update tanggal dan waktu setiap detik
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Event Listeners untuk tombol-tombol
    document.getElementById('increaseQueueBtn').addEventListener('click', increaseQueueNumber);
    document.getElementById('decreaseQueueBtn').addEventListener('click', decreaseQueueNumber);
    document.getElementById('addQueueBtn').addEventListener('click', addNewQueue);
    document.getElementById('updateQueueBtn').addEventListener('click', updateQueue);
    document.getElementById('resetQueueBtn').addEventListener('click', resetQueue);
    document.getElementById('resetDisplayBtn').addEventListener('click', resetDisplay);
    document.getElementById('callQueueBtn').addEventListener('click', callQueue);
    document.getElementById('testVoiceBtn').addEventListener('click', testVoice);
    
    // Event listener untuk perubahan operator
    document.getElementById('operatorSelect').addEventListener('change', updateOperatorColorIndicator);
    
    // Event listener untuk volume control
    document.getElementById('volumeControl').addEventListener('input', function() {
        document.getElementById('callStatus').textContent = `Volume diatur ke ${Math.round(this.value * 100)}%`;
    });
    
    // Event listener untuk input nomor antrian
    document.getElementById('queueNumber').addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value < 1) {
            this.value = 1;
        }
    });
    
    // Event listener untuk tombol enter pada input nomor antrian
    document.getElementById('queueNumber').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewQueue();
        }
    });
    
    // Tambahkan beberapa antrian contoh untuk demonstrasi
    setTimeout(() => {
        // Tambahkan antrian contoh 1
        appState.currentQueue = {
            number: 5,
            operatorId: 1,
            operatorName: "Operator 1 - Pendaftaran",
            operatorColor: "#3498db"
        };
        appState.operators[0].status = 'busy';
        appState.operators[0].currentQueue = 5;
        
        // Tambahkan antrian contoh 2
        appState.nextQueue = {
            number: 6,
            operatorId: 3,
            operatorName: "Operator 3 - Wawancara",
            operatorColor: "#e74c3c"
        };
        
        appState.queueCounter = 7;
        document.getElementById('queueNumber').value = 7;
        
        updateQueueDisplay();
        updateOperatorsDisplay();
        document.getElementById('callStatus').textContent = 'Sistem siap digunakan. Contoh antrian telah dimuat.';
    }, 1000);
    
    console.log('Sistem antrian SPMB SMA Negeri 15 telah dimuat');
});