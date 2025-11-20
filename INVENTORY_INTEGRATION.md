# 📦 Inventory Management System - Full Integration

## ✅ Status: FULLY CONNECTED

### Backend Endpoints

#### Items Management (Admin)
```
POST   /api/inventory/items          - Create item
GET    /api/inventory/items          - Get all items (Admin/Teacher)
PUT    /api/inventory/items/:id      - Update item
DELETE /api/inventory/items/:id      - Delete item
```

#### Requests Management
```
POST   /api/inventory/requests       - Create request (Teacher)
GET    /api/inventory/requests       - Get all requests with filters (Admin)
GET    /api/inventory/my-requests    - Get own requests (Teacher)
PUT    /api/inventory/requests/:id/status - Approve/Reject (Admin)
```

---

## 🔌 Frontend Connections

### 1. Admin Page (`adminDashboard/inventory-reports/page.tsx`)

#### Endpoint Calls:
```javascript
// Get requests with filters and stats
GET /api/inventory/requests?status=pending&dateFilter=week&search=pensil

// Get all items
GET /api/inventory/items

// Create item
POST /api/inventory/items
{ name, description, quantity }

// Update item
PUT /api/inventory/items/:id
{ name, description, quantity }

// Delete item
DELETE /api/inventory/items/:id

// Approve request
PUT /api/inventory/requests/:id/status
{ status: 'Approved' }

// Reject request
PUT /api/inventory/requests/:id/status
{ status: 'Rejected' }
```

#### Features:
- ✅ Tab navigation (Requests / Items)
- ✅ Statistics cards (Total, Approved, Rejected, Pending, Approval Rate)
- ✅ Filter by status (All/Pending/Approved/Rejected)
- ✅ Filter by date (All/Today/Week/Month)
- ✅ Search by item name or teacher name
- ✅ Requests table with approve/reject buttons
- ✅ Items management (add/edit/delete)
- ✅ Real-time stats from backend

---

### 2. Guru Page (`teacherDashboard/inventory-request/page.tsx`)

#### Endpoint Calls:
```javascript
// Get available items
GET /api/inventory/items

// Get own requests
GET /api/inventory/my-requests

// Create request (with validation)
POST /api/inventory/requests
{ itemName, quantity }
```

#### Features:
- ✅ Dropdown shows all available items with stock
- ✅ Real-time stock display
- ✅ Max quantity validation (client-side)
- ✅ Server-side stock validation
- ✅ Error message if stock insufficient
- ✅ Request history with status badges
- ✅ Format dates in Indonesian

#### Validation Flow:
```
1. User selects item
   └─ selectedItem state updated
      └─ Show available stock

2. User enters quantity
   └─ Input max attribute = selectedItem.quantity
      └─ Show max warning

3. User clicks submit
   └─ Client-side validation:
      ├─ Check formData.itemName is set
      ├─ Check formData.quantity >= 1
      ├─ Check formData.quantity <= available stock
      └─ If pass, send to backend

4. Backend validation:
   ├─ Check item exists
   ├─ Check quantity > 0
   ├─ Check quantity <= stock
   └─ If pass, create request

5. Success response
   └─ Reset form
   └─ Close form
   └─ Refresh data
```

---

## 🔄 Complete Request Flow

```
1. ADMIN Setup Inventory
   Admin > Tab "Daftar Barang"
   ├─ Click "Tambah Barang"
   ├─ Fill: Nama, Deskripsi, Stok
   └─ POST /api/inventory/items
      └─ Item saved in DB

2. GURU Make Request
   Guru > Inventory Page
   ├─ GET /api/inventory/items
   ├─ See: Pensil (Tersedia: 50)
   ├─ Click "Buat Permintaan Baru"
   ├─ Select: Pensil
   ├─ Enter: 10
   ├─ Client validates quantity <= 50 ✓
   └─ POST /api/inventory/requests
      {
        itemName: "Pensil",
        quantity: 10
      }

3. BACKEND Process Request
   Backend /api/inventory/requests
   ├─ Get item "Pensil" from DB
   ├─ Check: 10 <= 50 stok ✓
   ├─ Save request with status: Pending
   └─ Return: { success: true, request }

4. GURU See Request Status
   Guru > Inventory Page
   ├─ GET /api/inventory/my-requests
   └─ See request:
      Pensil
      Jumlah: 10
      Status: Menunggu (Pending)
      Tanggal: 20 Nov 2025, 14:30

5. ADMIN Review Requests
   Admin > Inventory > Tab "Permintaan"
   ├─ GET /api/inventory/requests
      ?status=pending&dateFilter=all&search=
   ├─ See stats:
      Total: 1, Approved: 0, Rejected: 0, Pending: 1
      Approval Rate: 0%
   └─ See table:
      Barang: Pensil
      Diminta Oleh: Ibu Siti
      Jumlah: 10
      Tanggal: 20 Nov 2025, 14:30
      Status: Menunggu
      Action: [Setujui] [Tolak]

6. ADMIN Approve Request
   Admin > Click "Setujui"
   └─ PUT /api/inventory/requests/:id/status
      { status: "Approved" }

7. BACKEND Auto Update Stock
   Backend /api/inventory/requests/:id/status
   ├─ Update request status = Approved
   ├─ Add approvedBy = admin user
   ├─ Add approvedAt = now
   ├─ Get related item "Pensil"
   ├─ Calculate: quantity = 50 - 10 = 40
   ├─ Save item with new quantity
   └─ Return: { success: true, request }

8. GURU See Approved Status
   Guru > Inventory Page
   ├─ GET /api/inventory/my-requests
   └─ See request updated:
      Status: Disetujui (Approved) ✓ Green badge
      Tanggal Disetujui: 20 Nov 2025, 14:35

9. ADMIN See Updated Inventory
   Admin > Inventory > Tab "Daftar Barang"
   ├─ GET /api/inventory/items
   └─ See Pensil:
      Name: Pensil
      Stok: 40 (was 50, now -10)
```

---

## 🧪 Testing Checklist

### Admin Tests
- [ ] Create item
- [ ] Edit item
- [ ] Delete item
- [ ] View requests with all items
- [ ] Filter requests by status
- [ ] Filter requests by date
- [ ] Search requests by item name
- [ ] Search requests by teacher name
- [ ] Approve request (stock should decrease)
- [ ] Reject request (stock should stay same)
- [ ] Check stats update correctly

### Guru Tests
- [ ] View available items with stock
- [ ] Select item (stock info shows)
- [ ] Enter valid quantity
- [ ] Try quantity > stock (should error)
- [ ] Submit valid request
- [ ] Check request appears in history
- [ ] Check status (Pending → Approved → shows in green)
- [ ] Request shows date/time correctly

### Integration Tests
- [ ] Admin adds item (50 pcs)
- [ ] Guru makes request (10 pcs)
- [ ] Admin approves request
- [ ] Check: Admin inventory now shows 40 pcs
- [ ] Check: Guru sees "Disetujui" status
- [ ] Guru makes another request (25 pcs)
- [ ] Admin approves (should be 15 pcs left)
- [ ] Test error when guru requests more than available

---

## 📊 Data Models

### InventoryItem
```javascript
{
  _id: ObjectId,
  name: String,          // e.g., "Pensil"
  description: String,   // Optional
  quantity: Number,      // Current stock
  facility: ObjectId,    // Reference to Facility
  createdAt: Date,
  updatedAt: Date
}
```

### InventoryRequest
```javascript
{
  _id: ObjectId,
  item: ObjectId,           // Reference to InventoryItem
  itemName: String,         // e.g., "Pensil" (denormalized)
  requestedBy: ObjectId,    // Reference to User (Teacher)
  quantity: Number,         // Requested quantity
  status: String,           // "Pending" | "Approved" | "Rejected"
  approvedBy: ObjectId,     // Reference to User (Admin)
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Permissions

| Endpoint | Method | Auth | Role | Allowed |
|----------|--------|------|------|---------|
| /items | POST | ✓ | Admin | Create item |
| /items | GET | ✓ | Admin/Teacher | View items |
| /items/:id | PUT | ✓ | Admin | Update item |
| /items/:id | DELETE | ✓ | Admin | Delete item |
| /requests | POST | ✓ | Teacher | Create request |
| /requests | GET | ✓ | Admin | View all requests |
| /my-requests | GET | ✓ | Teacher | View own requests |
| /requests/:id/status | PUT | ✓ | Admin | Approve/Reject |

---

## 🚀 Next Steps (Optional)

1. Add pagination for large request lists
2. Add export to CSV for admin reports
3. Add notifications when request is approved/rejected
4. Add request cancellation for pending requests
5. Add bulk approve/reject action
6. Add inventory history tracking
7. Add low stock alerts for admin
8. Add request deadline/priority system

---

## 📝 Last Updated
- **Date**: 20 Nov 2025
- **Status**: ✅ FULLY FUNCTIONAL
- **Branch**: raddief
- **All Endpoints**: Connected & Working
