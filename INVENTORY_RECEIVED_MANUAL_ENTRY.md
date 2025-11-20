# Inventory Received - Manual Entry Feature

## 📋 Overview
Fitur ini memungkinkan Admin untuk menambahkan barang yang diterima secara manual, tanpa harus melalui proses permintaan (request) terlebih dahulu. Berguna untuk mencatat barang yang diterima di luar alur normal.

## 🔧 Perubahan Backend

### 1. Model: `receivedItem.model.js`
**Perubahan:**
- Field `request` diubah dari `required: true` menjadi **optional**
- Field `quantityRequested` diberi `default: 0` untuk entry manual

**Alasan:** Memungkinkan pembuatan received item tanpa reference ke InventoryRequest.

### 2. Controller: `inventory.controller.js`
**Fungsi:** `recordReceivedItem`

**Perubahan:**
- Mendukung 2 mode input:
  1. **Dengan requestId** (untuk teacher yang input dari approved request)
  2. **Tanpa requestId** (untuk admin yang input manual)
  
**Validasi:**
- Mode dengan requestId: Validasi quantity tidak melebihi request
- Mode manual: Validasi itemName harus diisi

**Request Body (Manual Entry):**
```json
{
  "itemName": "Pensil 2B",
  "quantityRequested": 0,
  "quantityReceived": 50,
  "notes": "Pembelian langsung"
}
```

### 3. Routes: `inventory.route.js`
**Perubahan:**
- POST `/received` diubah dari `requireTeacher` menjadi `requireAdminOrTeacher`
- Memungkinkan Admin juga POST ke endpoint ini

## 🎨 Perubahan Frontend

### File: `adminDashboard/inventory-received/page.tsx`

#### State Baru:
```typescript
const [success, setSuccess] = useState('');
const [showForm, setShowForm] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [formData, setFormData] = useState({
    itemName: '',
    quantityRequested: 0,
    quantityReceived: 0,
    notes: ''
});
```

#### UI Components:
1. **Tombol "Tambah Barang"** - Membuka modal form
2. **Success Banner** - Menampilkan pesan sukses
3. **Form Modal** dengan fields:
   - Nama Barang (required)
   - Jumlah Diminta (optional)
   - Jumlah Diterima (required)
   - Catatan (optional)

#### Validasi:
- Item name tidak boleh kosong
- Quantity received harus > 0

## 🔄 Koneksi Frontend-Backend

### Next.js Configuration: `next.config.ts`
**Tambahan:**
```typescript
async rewrites() {
    return [
        {
            source: '/api/:path*',
            destination: 'http://localhost:3000/api/:path*',
        },
    ];
}
```

**Fungsi:** Proxy semua request `/api/*` dari frontend (port 3001) ke backend (port 3000)

### CORS Configuration: Backend sudah setup
```javascript
app.use(cors({
    origin: 'http://localhost:3001',
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
```

## 📡 API Endpoints

### POST `/api/inventory/received`
**Authorization:** Admin atau Teacher

**Request Body (Manual - Admin):**
```json
{
  "itemName": "Pensil 2B",
  "quantityRequested": 0,
  "quantityReceived": 50,
  "notes": "Pembelian langsung"
}
```

**Request Body (From Request - Teacher):**
```json
{
  "requestId": "64abc123...",
  "quantityReceived": 50,
  "notes": "Sudah diterima dengan baik"
}
```

**Response:**
```json
{
  "success": true,
  "received": {
    "_id": "...",
    "itemName": "Pensil 2B",
    "quantityRequested": 0,
    "quantityReceived": 50,
    "receivedBy": "...",
    "notes": "Pembelian langsung",
    "receivedDate": "2025-11-20T..."
  }
}
```

### GET `/api/inventory/received`
**Authorization:** Admin atau Teacher

**Query Parameters:**
- `dateFilter`: 'all' | 'today' | 'week' | 'month'
- `search`: string (cari berdasarkan item name atau receiver name)

**Response:**
```json
{
  "success": true,
  "received": [...]
}
```

## 🚀 Cara Menggunakan

### Untuk Admin:
1. Buka halaman **Inventory Received Report**
2. Klik tombol **"Tambah Barang"** di pojok kanan atas
3. Isi form:
   - **Nama Barang** (wajib)
   - **Jumlah Diminta** (optional, untuk referensi)
   - **Jumlah Diterima** (wajib, min 1)
   - **Catatan** (optional)
4. Klik **"Simpan"**
5. Data akan muncul di tabel dan stats akan terupdate

### Untuk Teacher:
1. Teacher tetap menggunakan halaman **Inventory Received** yang lama
2. Memilih dari approved requests mereka
3. Input quantity received dan notes

## 🧪 Testing

### Test Manual Entry (Admin):
1. Login sebagai Admin
2. Navigate ke Inventory Received
3. Klik "Tambah Barang"
4. Submit form dengan data valid
5. Verifikasi data muncul di tabel

### Test Request-based Entry (Teacher):
1. Login sebagai Teacher
2. Buat request di Inventory Request
3. Admin approve request tersebut
4. Teacher navigate ke Inventory Received
5. Pilih request yang sudah approved
6. Input quantity received
7. Submit dan verifikasi

## 📊 Database Schema

### Collection: `receiveditems`
```javascript
{
  request: ObjectId (optional),      // null untuk manual entry
  item: ObjectId (optional),         // reference ke inventory item
  itemName: String (required),       // nama barang
  quantityRequested: Number (default: 0),
  quantityReceived: Number (required),
  receivedBy: ObjectId (required),   // user yang input
  notes: String (optional),
  receivedDate: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

## ⚠️ Catatan Penting

1. **Port Configuration:**
   - Backend: `localhost:3000`
   - Frontend: `localhost:3001`
   - Next.js rewrites akan handle proxy

2. **Authentication:**
   - Semua endpoint memerlukan JWT token di header
   - Token disimpan di localStorage dengan key 'token'

3. **Validation:**
   - Backend melakukan validasi di controller
   - Frontend melakukan validasi di UI sebelum submit
   - Double validation untuk keamanan

4. **Role-based Access:**
   - Admin: Bisa POST manual entry dan GET semua data
   - Teacher: Bisa POST dari request dan GET data sendiri

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Pastikan backend berjalan di port 3000
- Check CORS configuration
- Verify token ada di localStorage

### Error: "Data tidak lengkap"
- Pastikan itemName dan quantityReceived terisi
- Check validation di frontend form

### Data tidak muncul di tabel
- Check filter dateFilter dan searchTerm
- Refresh page atau klik tombol Refresh
- Check console untuk error

## 📝 Future Improvements

1. Add dropdown untuk memilih dari existing inventory items
2. Auto-update stock quantity saat barang diterima
3. Add barcode scanning untuk entry lebih cepat
4. Export data ke PDF/Excel
5. Add notification saat barang diterima

---

**Dibuat:** November 20, 2025  
**Status:** ✅ Implemented & Connected
