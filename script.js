// Simpan data ke localStorage
const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Ambil data dari localStorage
const getData = (key) => {
  return JSON.parse(localStorage.getItem(key)) || {};
};

// History penggunaan PS
let psHistory = getData('psHistory') || {};

// Update history
const updateHistory = (psId, duration, price) => {
  if (!psHistory[psId]) {
    psHistory[psId] = [];
  }
  psHistory[psId].push({
    date: new Date().toLocaleString(),
    duration: `${duration} menit`,
    price: price
  });
  saveData('psHistory', psHistory);
};

document.addEventListener("DOMContentLoaded", () => {
  let totalPayment = 0;
  const psItems = document.querySelectorAll(".ps-item");
  const totalDisplay = document.getElementById("total-payment");

  // Load sesi aktif dari localStorage
  const activeSessions = getData('activeSessions');
  Object.keys(activeSessions).forEach(psId => {
    const psItem = document.querySelector(`.ps-item[data-id="${psId}"]`);
    if (psItem) {
      const session = activeSessions[psId];
      const timerDisplay = psItem.querySelector('.timer');
      const startBtn = psItem.querySelector('.btn-start');
      const pauseBtn = psItem.querySelector('.btn-pause');
      const stopBtn = psItem.querySelector('.btn-stop');
      const select = psItem.querySelector('select');
      
      // Jika sesi masih aktif
      if (session.endTime > Date.now()) {
        endTime = session.endTime;
        currentPrice = session.price;
        select.value = session.duration;
        select.disabled = true;
        startTimer();
        toggleButtons(true);
      }
    }
  });

  // Format mata uang Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Update total pembayaran
  const updateTotal = () => {
    totalDisplay.textContent = formatRupiah(totalPayment);
  };

  // Inisialisasi setiap PS
  psItems.forEach((ps) => {
    const timerDisplay = ps.querySelector(".timer");
    const startBtn = ps.querySelector(".btn-start");
    const pauseBtn = ps.querySelector(".btn-pause");
    const stopBtn = ps.querySelector(".btn-stop");
    const select = ps.querySelector("select");

    let intervalId;
    let endTime;
    let isPaused = false;
    let currentPrice = 0;
    let remainingWhenPaused;

    // Tombol Mulai
    startBtn.addEventListener("click", () => {
      const duration = parseInt(select.value);
      if (!duration) {
        alert("Silakan pilih durasi terlebih dahulu!");
        return;
      }

      const selectedOption = select.options[select.selectedIndex];
      currentPrice = parseInt(selectedOption.getAttribute("data-price"));
      
      // Simpan sesi aktif
      const activeSessions = getData('activeSessions');
      activeSessions[ps.getAttribute('data-id')] = {
        endTime: Date.now() + duration * 60000,
        price: currentPrice,
        duration: duration
      };
      saveData('activeSessions', activeSessions);
      
      endTime = activeSessions[ps.getAttribute('data-id')].endTime;
      startTimer();
      toggleButtons(true);
      select.disabled = true;
      
      // Update history
      updateHistory(ps.getAttribute('data-id'), duration, currentPrice);
    });

    // Tombol Pause
    pauseBtn.addEventListener("click", () => {
      isPaused = !isPaused;
      pauseBtn.innerHTML = isPaused ? "▶️ Lanjutkan" : "⏸️ Pause";

      if (isPaused) {
        remainingWhenPaused = endTime - Date.now();
        clearInterval(intervalId);
      } else {
        endTime = Date.now() + remainingWhenPaused;
        startTimer();
      }
    });

    // Tombol Stop
    stopBtn.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin menghentikan sesi ini?")) {
        clearInterval(intervalId);
        resetTimer();

        // Jika dihentikan manual, tidak tambah ke total
        if (timerDisplay.textContent !== "00:00") {
          select.disabled = false;
        }
      }
    });

    // Fungsi timer
    function startTimer() {
      clearInterval(intervalId);

      // Di fungsi startTimer() tambahkan:
function startTimer() {
    clearInterval(intervalId);
    
    // Tambahkan pengecekan waktu negatif
    if(endTime <= Date.now()) {
        timerDisplay.textContent = "00:00 🎉";
        return;
    }
    
    // ... kode timer sebelumnya
}

      intervalId = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now());

        if (remaining <= 0) {
          clearInterval(intervalId);
          timerDisplay.textContent = "00:00 🎉";
          totalPayment += currentPrice;
          updateTotal();
          toggleButtons(false);
          return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        timerDisplay.textContent = `${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`;
      }, 1000);
    }

    // Fungsi toggle tombol
    function toggleButtons(isRunning) {
      startBtn.disabled = isRunning;
      pauseBtn.disabled = !isRunning;
      stopBtn.disabled = !isRunning;

      if (!isRunning) {
        isPaused = false;
        pauseBtn.innerHTML = "⏸️ Pause";
      }
    }

    // Fungsi reset timer
    function resetTimer() {
      clearInterval(intervalId);
      timerDisplay.textContent = "00:00";
      toggleButtons(false);
      select.disabled = false;
    }
  });

  // ... [Bagian tombol pauseAll/unpauseAll dan resetAll tetap sama]

  // Tombol Pause All
  document.getElementById("pauseAll").addEventListener("click", () => {
    const activePauseButtons = document.querySelectorAll(
      ".btn-pause:not(:disabled)"
    );
    if (activePauseButtons.length === 0) {
      alert("Tidak ada sesi yang aktif!");
      return;
    }

    if (confirm("Pause semua sesi yang aktif?")) {
      activePauseButtons.forEach((btn) => btn.click());
    }
  });

  // Tombol Unpause All
  document.getElementById("unpauseAll").addEventListener("click", () => {
    const pausedButtons = document.querySelectorAll(".btn-pause:disabled");
    if (pausedButtons.length === 0) {
      alert("Tidak ada sesi yang dipause!");
      return;
    }

    if (confirm("Lanjutkan semua sesi yang dipause?")) {
      pausedButtons.forEach((btn) => {
        if (btn.textContent.includes("Lanjutkan")) {
          btn.click();
        }
      });
    }
  });

  // Fungsi reset all (global)
  window.resetAll = () => {
    if (confirm("Apakah Anda yakin ingin mereset semua sesi?")) {
      totalPayment = 0;
      updateTotal();

      psItems.forEach((ps) => {
        const stopBtn = ps.querySelector(".btn-stop");
        if (!stopBtn.disabled) {
          stopBtn.click();
        }
      });
    }
  };
});
