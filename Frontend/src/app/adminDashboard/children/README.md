# Child Information CRUD System - Admin Dashboard

## Overview
Comprehensive CRUD (Create, Read, Update, Delete) interface for managing child information in the SkyTopia admin dashboard.

## Features

### 1. **Data Structure**
- TypeScript interfaces matching backend structure
- Complete type safety with `child.types.ts`
- Fields include:
  - Full Name
  - Date of Birth
  - Gender (Laki-laki/Perempuan)
  - Parent/Guardian Information
  - Medical Notes/Allergies
  - Monthly & Semester Fees
  - Schedules
  - Enrollment Date (createdAt)

### 2. **List View (`/adminDashboard/children`)**
- **Table Display**: Shows all children with comprehensive information
  - Name with medical alert indicators
  - Birth date and calculated age
  - Gender
  - Parent name and contact
  - Number of schedules
- **Search Functionality**: Real-time search by child name or parent name/email
- **Pagination**: 10 items per page with navigation controls
- **Statistics**: Display total count of children
- **Responsive Design**: Horizontal scrolling for smaller screens

### 3. **Add/Edit Form Modal**
- **Modal-based Interface**: Non-intrusive form overlay
- **Validation**:
  - Required fields (name, birth date, gender, parent)
  - Date validation (no future dates)
  - Numeric validation for fees
- **Parent Selection**: Dropdown populated from users with "Parent" role
- **Form Fields**:
  - Name (required)
  - Birth Date (required, date picker)
  - Gender (required, dropdown)
  - Parent/Guardian (required, dropdown)
  - Medical Notes/Allergies (optional, textarea)
  - Monthly Fee (optional, numeric)
  - Semester Fee (optional, numeric)

### 4. **Delete Confirmation**
- **Safety Modal**: Prevents accidental deletions
- **Clear Warning**: Shows child name and confirmation message
- **Disabled During Operation**: Prevents double submissions

### 5. **Access Control**
- **Admin Only**: All CRUD operations restricted to Admin role
- **Token-based Auth**: Uses JWT token from localStorage
- **Backend Enforcement**: Server-side role checking via middleware

## File Structure

```
adminDashboard/
├── children/
│   └── page.tsx                    # Main children list page with table
├── components/
│   ├── ChildFormModal.tsx          # Add/Edit form modal
│   ├── DeleteConfirmModal.tsx      # Delete confirmation modal
│   └── Sidebar.tsx                 # Updated with Children link
├── services/
│   └── childService.ts             # API service functions
├── types/
│   └── child.types.ts              # TypeScript interfaces
└── page.tsx                        # Updated dashboard with Children tile
```

## Backend Integration

### API Endpoints Used
All endpoints connect to `http://localhost:3000/api/children`:

- **GET** `/` - Get all children (Admin only)
- **GET** `/:id` - Get child by ID
- **POST** `/` - Create new child (Admin only)
- **PUT** `/:id` - Update child (Admin only)
- **DELETE** `/:id` - Delete child (Admin only)
- **GET** `/search?search=query` - Search children (Admin only)

### Authentication
- Uses Bearer token authentication
- Token stored in localStorage
- Automatically included in all API requests

### Data Synchronization
- Backend model fields match exactly:
  ```javascript
  {
    name: String,
    birth_date: Date,
    gender: "Laki-laki" | "Perempuan",
    parent_id: ObjectId (ref: User),
    medical_notes: String (optional),
    monthly_fee: Number,
    semester_fee: Number,
    schedules: [ObjectId (ref: Schedule)]
  }
  ```

## Usage

### For Admin Users

1. **Viewing Children**
   - Navigate to `/adminDashboard/children`
   - View complete list in table format
   - Use search bar to find specific children

2. **Adding a Child**
   - Click "Tambah Anak" button
   - Fill in required information
   - Select parent from dropdown
   - Submit form

3. **Editing a Child**
   - Click edit icon (pencil) in table row
   - Modify information in modal
   - Save changes

4. **Deleting a Child**
   - Click delete icon (trash) in table row
   - Confirm deletion in modal
   - Child removed from database

### For Developers

#### Adding Custom Validation
Edit `ChildFormModal.tsx`, modify the `validateForm()` function:
```typescript
const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChildFormData, string>> = {};
    
    // Add your custom validation here
    if (condition) {
        newErrors.fieldName = 'Error message';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
```

#### Extending API Service
Edit `childService.ts` to add new endpoints:
```typescript
export const customFunction = async (params): Promise<ReturnType> => {
    const response = await fetch(`${API_BASE_URL}/children/custom-endpoint`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params)
    });
    return response.json();
};
```

## UI/UX Features

- **Loading States**: Spinner during data fetch
- **Error Handling**: User-friendly error messages
- **Disabled States**: Buttons disabled during operations
- **Hover Effects**: Visual feedback on interactive elements
- **Responsive Design**: Mobile-friendly table with horizontal scroll
- **Color Coding**: Medical notes highlighted with warning color
- **Confirmation Dialogs**: Prevent accidental destructive actions

## Security Considerations

1. **Authentication Required**: All operations require valid JWT token
2. **Role-Based Access**: Backend enforces Admin role requirement
3. **Input Validation**: Both client and server-side validation
4. **SQL Injection Prevention**: MongoDB with parameterized queries
5. **XSS Protection**: React's built-in escaping

## Future Enhancements

Potential improvements:
- Export to CSV/Excel functionality
- Bulk operations (delete multiple, import)
- Advanced filtering (by age, gender, parent)
- Schedule management directly from child view
- Photo upload for child profile
- Audit log for changes
- Email notifications to parents on updates

## Dependencies

- React Icons (`react-icons/fi`)
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS (for styling)

## Notes

- The backend must be running on `http://localhost:3000`
- Parents must be created in the system before adding children
- All dates are formatted to Indonesian locale
- Currency formatted as Indonesian Rupiah (IDR)
- Pagination set to 10 items per page (configurable)
