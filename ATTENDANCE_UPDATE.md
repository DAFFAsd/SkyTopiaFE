# Attendance System Update - Clock In/Out dengan Timestamp

## Ringkasan Perubahan

Sistem absensi telah diperbarui untuk mendukung fitur **Clock In dan Clock Out** dengan timestamp, serta foto wajib untuk status "Izin". Sistem sekarang mencatat dua kali entry per hari (masuk dan pulang) dengan timestamp lengkap.

## Fitur Baru

### 1. **Dual Clock System (Masuk & Pulang)**
- Guru dapat melakukan Clock In saat tiba
- Guru dapat melakukan Clock Out saat pulang
- Hanya satu entry per hari untuk setiap guru
- Timestamp otomatis tercatat untuk kedua sesi

### 2. **Timestamp Otomatis**
- Clock In: Jam masuk dicatat otomatis ketika guru submit
- Clock Out: Jam pulang dicatat otomatis ketika guru submit
- Format: HH:MM (contoh: 07:30, 14:45)

### 3. **Foto Wajib untuk Status "Izin"**
- Jika guru memilih status "Izin" saat Clock Out, foto **wajib** diupload
- Foto diupload ke Cloudinary secara otomatis
- Admin dapat melihat dan mendownload foto dari dashboard

### 4. **Catatan Optional**
- Guru dapat menambahkan catatan untuk Clock In dan Clock Out
- Catatan ditampilkan di history dan admin dashboard

## Perubahan Database Schema

### Model: `attendance.model.js`

```javascript
{
    teacher: ObjectId,        // Referensi ke guru
    date: Date,              // Tanggal (unique per guru)
    clockIn: {
        status: String,      // 'Present', 'Absent', 'Leave'
        timestamp: Date,     // Waktu masuk otomatis
        note: String         // Catatan opsional
    },
    clockOut: {
        status: String,      // 'Present', 'Absent', 'Leave'
        timestamp: Date,     // Waktu pulang otomatis
        note: String,        // Catatan opsional
        leavePhoto: String   // URL foto izin (jika ada)
    }
}
```

## API Endpoints Baru

### Clock In (Jam Masuk)
```
POST /api/attendances/clock-in
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
    "status": "Present|Absent|Leave",
    "note": "Catatan opsional"
}

Response:
{
    "success": true,
    "message": "Clock in berhasil",
    "attendance": { /* record */ }
}
```

### Clock Out (Jam Pulang)
```
POST /api/attendances/clock-out
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
    "status": "Present|Absent|Leave",
    "note": "Catatan opsional",
    "leavePhoto": "https://cloudinary.com/..." // URL foto (jika izin)
}

Response:
{
    "success": true,
    "message": "Clock out berhasil",
    "attendance": { /* record */ }
}
```

## Perubahan Frontend

### Teacher Dashboard - Attendance Page
**File:** `/teacherDashboard/attendance/page.tsx`

**Fitur:**
1. **Bagian Jam Masuk (Clock In)**
   - Status Kehadiran (Hadir/Tidak Hadir/Izin)
   - Catatan opsional
   - Tombol "Clock In" (disabled jika sudah ada clock in hari ini)
   - Menampilkan jam masuk jika sudah clock in

2. **Bagian Jam Pulang (Clock Out)**
   - Status Kehadiran (Hadir/Tidak Hadir/Izin)
   - Upload foto **wajib** jika status "Izin"
   - Catatan opsional
   - Tombol "Clock Out" (disabled jika belum clock in atau sudah clock out)
   - Menampilkan jam pulang jika sudah clock out

3. **Riwayat Absensi**
   - Tabel menampilkan: Tanggal, Jam Masuk (status + waktu + catatan), Jam Pulang (status + waktu + catatan)
   - Status ditampilkan dengan badge warna (Hijau=Hadir, Merah=Absen, Kuning=Izin)

### Admin Dashboard - Teacher Management
**File:** `/adminDashboard/teacher-management/page.tsx`

**Perubahan pada Tab "Absensi":**
1. **Tabel Attendance**
   - Kolom: Nama Guru | Email | Tanggal | Jam Masuk | Jam Pulang
   - Jam Masuk menampilkan: Badge Status + Timestamp + Catatan (jika ada)
   - Jam Pulang menampilkan: Badge Status + Timestamp + Catatan (jika ada) + Link Foto (jika ada)

2. **Export CSV**
   - Update: Sekarang mencakup jam masuk, jam pulang, status masuk, status pulang
   - Kolom: Nama Guru | Email | Tanggal | Jam Masuk | Jam Pulang | Status Masuk | Status Pulang | Catatan

3. **Filter**
   - Tetap bisa filter berdasarkan guru, tanggal, dan status
   - Status filter menggunakan `clockIn.status`

## Perubahan Backend

### Controllers: `attendance.controller.js`

**Endpoint Baru:**
1. `clockIn()` - Untuk Clock In (Jam Masuk)
2. `clockOut()` - Untuk Clock Out (Jam Pulang)

**Endpoint Existing:**
- `markAttendance()` - Legacy, masih berfungsi untuk kompatibilitas

**Endpoint Admin:**
- `getAttendance()` - Updated untuk support status filter di clockIn

### Routes: `attendance.route.js`

```javascript
// Clock In & Out
POST /api/attendances/clock-in      // requireTeacher
POST /api/attendances/clock-out     // requireTeacher

// Legacy (masih berfungsi)
POST /api/attendances               // requireTeacher

// Get Data
GET /api/attendances/my-records     // requireTeacher (guru lihat data sendiri)
GET /api/attendances                // requireAdmin (admin lihat semua)
```

## Alur Penggunaan

### Untuk Guru

1. **Saat Tiba (Pagi)**
   - Buka halaman "Catat Absensi"
   - Pilih Status (Hadir/Tidak Hadir/Izin)
   - Tambah catatan jika ada (opsional)
   - Klik "Clock In"
   - Jam masuk otomatis tercatat

2. **Saat Pulang (Sore)**
   - Di halaman yang sama, buka bagian "Jam Pulang"
   - Pilih Status (Hadir/Tidak Hadir/Izin)
   - **Jika Izin: Upload foto** (wajib)
   - Tambah catatan jika ada (opsional)
   - Klik "Clock Out"
   - Jam pulang otomatis tercatat

3. **Lihat Riwayat**
   - Scroll ke bawah, lihat tabel "Riwayat Absensi"
   - Menampilkan semua entry masuk dan pulang

### Untuk Admin

1. **Lihat Absensi Guru**
   - Buka "Manajemen Guru" → Tab "Absensi"
   - Lihat semua guru dengan clock in/out mereka
   - Klik "Lihat Foto" untuk melihat foto izin

2. **Filter Data**
   - Filter berdasarkan Guru, Tanggal, Status
   - Klik "Terapkan Filter"

3. **Export Data**
   - Klik "Export CSV" untuk download laporan

## Validasi & Error Handling

### Clock In
- ✓ Wajib: Status kehadiran
- ✓ Opsional: Catatan
- ✓ Disabled: Jika sudah ada clock in hari ini
- ✓ Error: Token tidak valid → instruksi login kembali

### Clock Out
- ✓ Wajib: Status kehadiran
- ✓ Wajib: Foto (jika status "Izin")
- ✓ Opsional: Catatan
- ✓ Disabled: Jika belum clock in
- ✓ Disabled: Jika sudah ada clock out hari ini
- ✓ Error: Token tidak valid → instruksi login kembali

## Integrasi Cloudinary

Foto izin diupload ke Cloudinary dengan setting:
- Upload Preset: `skytopia`
- Endpoint: `https://api.cloudinary.com/v1_1/dxq8ydbtk/image/upload`
- Konfigurasi: Sesuaikan dengan akun Cloudinary Anda

Untuk mengubah setting, edit di `/teacherDashboard/attendance/page.tsx`:
```typescript
const uploadPhotoToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'skytopia'); // <- Ubah di sini
    // ...
}
```

## File yang Diubah

### Backend
1. `/src/models/attendance.model.js` - Update schema
2. `/src/controllers/attendance.controller.js` - Tambah clockIn & clockOut methods
3. `/src/routes/attendance.route.js` - Tambah routes baru

### Frontend
1. `/app/teacherDashboard/attendance/page.tsx` - Redesign dengan clock in/out
2. `/app/adminDashboard/teacher-management/page.tsx` - Update interface dan tabel

## Backward Compatibility

- Endpoint lama `/api/attendances` (POST) masih berfungsi
- Menggunakan `clockIn.status`, `clockIn.timestamp`, `clockIn.note`
- Kompatibel dengan data lama (jika ada)

## Testing Checklist

- [ ] Clock In berhasil dengan timestamp
- [ ] Clock Out berhasil dengan timestamp
- [ ] Foto izin wajib saat status "Izin"
- [ ] Riwayat absensi menampilkan masuk & pulang
- [ ] Admin dashboard menampilkan data clock in/out
- [ ] Filter status bekerja di admin
- [ ] Export CSV berisi data lengkap
- [ ] Foto izin bisa dilihat di admin
- [ ] Error handling jika token invalid
- [ ] Disabled state tombol bekerja dengan benar

## Catatan Penting

1. **Unique Constraint**: Satu guru hanya bisa punya satu entry per hari
2. **Timestamp**: Otomatis menggunakan waktu server saat submit
3. **Photo Upload**: Membutuhkan koneksi internet dan Cloudinary configured
4. **Status Izin**: Foto WAJIB jika memilih status "Izin" saat clock out
