// Data menu
const menuItems = {
  food: [
    { id: "nasi_goreng", name: "🍳 Nasi Goreng", price: 15000 },
    { id: "mie_goreng", name: "🍜 Mie Goreng", price: 12000 },
    { id: "ayam_geprek", name: "🍗 Ayam Geprek", price: 18000 },
  ],
  drink: [
    { id: "es_teh", name: "🥤 Es Teh", price: 5000 },
    { id: "es_jeruk", name: "🍹 Es Jeruk", price: 7000 },
    { id: "jus_alpukat", name: "🥑 Jus Alpukat", price: 10000 },
  ],
};

// Format Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Fungsi penyimpanan localStorage
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Variabel global
let total = 0;
const billItemsContainer = document.getElementById("billItems");
const totalAmountDisplay = document.getElementById("totalAmount");
const itemSelect = document.getElementById("itemSelect");
const foodTypeSelect = document.getElementById("foodType");
const btnAdd = document.getElementById("btnAdd");
const btnClear = document.getElementById("btnClear");
const quantityInput = document.getElementById("quantity");

// Fungsi untuk memuat menu berdasarkan jenis
const loadMenuItems = (type) => {
  if (!menuItems[type]) return;
  
  itemSelect.innerHTML = "";
  menuItems[type].forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} - ${formatRupiah(item.price)}`;
    option.dataset.price = item.price;
    itemSelect.appendChild(option);
  });
};

// Fungsi untuk menambahkan item ke bill
const addItemToBill = () => {
  const selectedOption = itemSelect.selectedOptions[0];
  if (!selectedOption) return;

  const itemId = selectedOption.value;
  const itemName = selectedOption.text.split(" - ")[0];
  const itemPrice = parseInt(selectedOption.dataset.price);
  const quantity = parseInt(quantityInput.value) || 1;

  if (quantity < 1) {
    alert("Jumlah minimal 1");
    return;
  }

  const subtotal = itemPrice * quantity;
  total += subtotal;

  // Buat elemen item
  const itemElement = document.createElement("div");
  itemElement.className = "bill-item";
  itemElement.dataset.id = itemId;
  itemElement.dataset.price = itemPrice;
  itemElement.dataset.quantity = quantity;

  itemElement.innerHTML = `
    <span class="item-name">${itemName} x${quantity}</span>
    <span class="item-price">
      ${formatRupiah(subtotal)}
      <button class="btn-remove">✕</button>
    </span>
  `;

  // Tambahkan event untuk tombol hapus
  const removeBtn = itemElement.querySelector(".btn-remove");
  removeBtn.addEventListener("click", () => removeItem(itemElement, subtotal));

  billItemsContainer.appendChild(itemElement);
  updateTotal();
  saveBillToStorage();
};

// Fungsi untuk menghapus item
const removeItem = (itemElement, subtotal) => {
  if (confirm("Hapus item ini dari daftar?")) {
    total -= subtotal;
    itemElement.remove();
    updateTotal();
    saveBillToStorage();
  }
};

// Fungsi untuk menghapus semua item
const clearAllItems = () => {
  if (billItemsContainer.children.length === 0) {
    alert("Tidak ada item untuk dihapus!");
    return;
  }

  if (confirm("Apakah Anda yakin ingin menghapus semua item?")) {
    billItemsContainer.innerHTML = "";
    total = 0;
    updateTotal();
    saveBillToStorage();
  }
};

// Fungsi untuk update total
const updateTotal = () => {
  totalAmountDisplay.textContent = formatRupiah(total);
};

// Fungsi untuk menyimpan bill ke localStorage
const saveBillToStorage = () => {
  const items = Array.from(billItemsContainer.children).map(item => ({
    id: item.dataset.id,
    price: parseInt(item.dataset.price),
    quantity: parseInt(item.dataset.quantity),
    name: item.querySelector('.item-name').textContent.split(' x')[0]
  }));
  saveToLocalStorage('foodBill', { items, total });
};

// Fungsi untuk load bill dari localStorage
const loadBillFromStorage = () => {
  const savedBill = getFromLocalStorage('foodBill');
  if (!savedBill) return;

  savedBill.items.forEach(item => {
    const itemElement = document.createElement("div");
    itemElement.className = "bill-item";
    itemElement.dataset.id = item.id;
    itemElement.dataset.price = item.price;
    itemElement.dataset.quantity = item.quantity;

    itemElement.innerHTML = `
      <span class="item-name">${item.name} x${item.quantity}</span>
      <span class="item-price">
        ${formatRupiah(item.price * item.quantity)}
        <button class="btn-remove">✕</button>
      </span>
    `;

    const removeBtn = itemElement.querySelector(".btn-remove");
    removeBtn.addEventListener("click", () => removeItem(itemElement, item.price * item.quantity));

    billItemsContainer.appendChild(itemElement);
  });

  total = savedBill.total || 0;
  updateTotal();
};

// Event listeners
foodTypeSelect.addEventListener("change", () => {
  loadMenuItems(foodTypeSelect.value);
});

btnAdd.addEventListener("click", addItemToBill);
btnClear.addEventListener("click", clearAllItems);

// Validasi input quantity
quantityInput.addEventListener("input", (e) => {
  if (e.target.value < 1) e.target.value = 1;
});

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  loadMenuItems(foodTypeSelect.value);
  loadBillFromStorage();
});