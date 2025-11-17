# User Management System - Admin Dashboard

## Overview
Comprehensive User Management feature for creating and managing Teacher and Parent accounts in the SkyTopia admin dashboard.

## Features

### 1. **User Registration Form**
- Admin-only user creation interface
- Role-based account creation (Teacher/Parent)
- Secure password generation and validation
- Form validation with real-time error feedback

### 2. **Role Selection & Dynamic Fields**

#### Common Fields (All Roles)
- Full Name (required)
- Email (required, unique, validated)
- Password (required for new users, optional for updates)
- Phone Number (optional, validated format)
- Role Selection (Teacher/Parent)

#### Teacher-Specific Fields
When "Teacher" is selected:
- **NIP (Employee ID)** - Required identification number
- **Assigned Class** - Optional field for class assignment (e.g., "Kelas A", "TK B")

#### Parent-Specific Fields
When "Parent" is selected:
- **Address** - Optional textarea for full address
- **Link to Child** - Required dropdown to associate parent with existing child in database

### 3. **User List Management**
- **Table View**: Comprehensive list of all Teachers and Parents
- **Search**: Real-time search by name, email, or phone
- **Role Filter**: Filter users by role (All/Teacher/Parent)
- **Pagination**: 10 users per page with navigation
- **Statistics**: Real-time counts of Teachers, Parents, and total users

### 4. **CRUD Operations**
- **Create**: Add new Teacher or Parent accounts
- **Read**: View all users with detailed information
- **Update**: Edit user information (name, phone, password)
- **Delete**: Remove user accounts with confirmation

### 5. **Security Features**
- **Password Requirements**: Minimum 8 characters
- **Auto-generate Password**: One-click secure password generation
- **Show/Hide Password**: Toggle visibility for verification
- **Token Authentication**: JWT-based API authentication
- **Admin-Only Access**: Backend enforced role checking
- **Email Uniqueness**: Prevents duplicate accounts

## File Structure

```
adminDashboard/
├── users/
│   └── page.tsx                    # Main user management page
├── components/
│   ├── UserFormModal.tsx           # Dynamic user form with role-based fields
│   ├── DeleteConfirmModal.tsx      # Reusable delete confirmation
│   └── Sidebar.tsx                 # Updated with User Management link
├── services/
│   └── userService.ts              # User API service functions
├── types/
│   ├── user.types.ts               # User type definitions
│   └── child.types.ts              # Child types (for parent linking)
└── page.tsx                        # Updated dashboard with Users tile
```

## Backend Integration

### API Endpoints Used
All endpoints connect to `http://localhost:3000/api/users`:

- **POST** `/register` - Create new user (Admin only)
- **GET** `/` - Get all users (Admin only)
- **GET** `/:id` - Get user by ID (Admin only)
- **PUT** `/:id` - Update user (Admin only)
- **DELETE** `/:id` - Delete user (Admin only)
- **GET** `/profile` - Get current user profile

### Request Payload Structure

#### Create User (POST /register)
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 8 chars)",
  "phone": "string (optional)",
  "role": "Teacher | Parent (required)"
}
```

#### Update User (PUT /:id)
```json
{
  "name": "string",
  "phone": "string",
  "password": "string (optional)"
}
```

**Note**: Email and role cannot be changed after account creation.

### Backend Schema Match
```javascript
// Backend User Model (user.model.js)
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["Teacher", "Admin", "Parent"], required: true }
}
```

## Usage Guide

### For Admins

#### Creating a Teacher Account
1. Navigate to `/adminDashboard/users`
2. Click "Tambah Pengguna" button
3. Select "Teacher (Guru)" from role dropdown
4. Fill in required fields:
   - Full Name
   - Email
   - Password (or use Auto-generate)
   - NIP (Employee ID)
5. Optionally fill:
   - Phone Number
   - Assigned Class
6. Click "Tambah" to create account

#### Creating a Parent Account
1. Navigate to `/adminDashboard/users`
2. Click "Tambah Pengguna" button
3. Select "Parent (Orang Tua)" from role dropdown
4. Fill in required fields:
   - Full Name
   - Email
   - Password (or use Auto-generate)
   - Link to Child (dropdown)
5. Optionally fill:
   - Phone Number
   - Address
6. Click "Tambah" to create account

#### Editing a User
1. Find user in the table
2. Click edit icon (pencil)
3. Modify allowed fields (name, phone, password)
4. Click "Update" to save changes

**Note**: Email and role cannot be modified after account creation.

#### Deleting a User
1. Find user in the table
2. Click delete icon (trash)
3. Confirm deletion in modal
4. User will be permanently removed

### Searching and Filtering
- **Search Box**: Type name, email, or phone number for instant filtering
- **Role Filter**: Select "Semua Role", "Guru", or "Orang Tua" to filter by role
- Filters can be combined for precise results

## Form Validation

### Client-Side Validation
- **Name**: Required, non-empty
- **Email**: Required, valid email format, unique
- **Password**: 
  - Required for new users
  - Optional for updates
  - Minimum 8 characters when provided
- **Phone**: Valid phone format (numbers, spaces, +, -, (), allowed)
- **NIP** (Teachers): Required, non-empty
- **Child Link** (Parents): Required, must select from dropdown

### Backend Validation
- Duplicate email prevention
- Password length enforcement (min 8 chars)
- Role enum validation
- Unique email constraint

## UI/UX Features

### Success Notifications
- Green success banner appears for 3 seconds after successful operations
- Messages: "Pengguna baru berhasil ditambahkan!", "Pengguna berhasil diupdate!", etc.

### Loading States
- Spinner during data fetch
- "Menyimpan..." button text during form submission
- Disabled buttons during operations

### Error Handling
- User-friendly error messages
- Alert dialogs for operation failures
- Retry button on fetch errors
- Field-level validation errors

### Responsive Design
- Mobile-friendly layout
- Horizontal scrolling table on small screens
- Stack filters vertically on mobile
- Touch-friendly buttons and inputs

### Visual Elements
- Role badges with color coding:
  - **Teacher**: Blue badge
  - **Parent**: Green badge
  - **Admin**: Purple badge
- Statistics cards with icons
- Hover effects on interactive elements
- Consistent color scheme with brand purple

## Security Considerations

1. **Authentication**: All API calls require valid JWT token
2. **Authorization**: Backend enforces Admin-only access
3. **Password Security**: 
   - Minimum 8 character requirement
   - Option to auto-generate strong passwords
   - Passwords never displayed in plain text (except during generation)
4. **Input Validation**: Both client and server-side validation
5. **Email Uniqueness**: Prevents duplicate accounts
6. **Audit Trail**: CreatedAt and UpdatedAt timestamps tracked

## Advanced Features

### Auto-Generate Password
- One-click secure password generation
- 12-character password with mixed case, numbers, and symbols
- Automatically shows generated password for copying
- Meets all security requirements

### Dynamic Form Fields
- Form adapts based on selected role
- Only relevant fields shown to reduce confusion
- Role-specific validations applied automatically

### Parent-Child Linking
- Dropdown populated from existing children in database
- Shows child name and birth date for easy identification
- Prevents orphaned parent accounts

### Admin Protection
- Admin users filtered from list (cannot be edited/deleted via UI)
- Prevents accidental deletion of admin accounts

## Limitations & Notes

1. **Email Immutability**: Email addresses cannot be changed after account creation
2. **Role Immutability**: User roles cannot be changed after account creation
3. **Child Requirement**: Parents must be linked to an existing child
4. **NIP Storage**: Currently stored in the same phone field or can be extended to separate field
5. **Single Child Link**: UI currently supports linking one child per parent (backend may support multiple)

## Future Enhancements

Potential improvements:
- Bulk user import (CSV/Excel)
- User profile pictures
- Password reset functionality
- Email verification on registration
- Multi-child linking for parents
- Assigned classes management for teachers
- User activity logs
- Export user list to CSV
- Advanced filtering (by registration date, status)
- User status (active/inactive)
- Two-factor authentication

## API Response Examples

### Success Response (Create User)
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Teacher",
    "phone": "08123456789"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "User with this email or phone already exists"
}
```

## Dependencies

- React Icons (`react-icons/fi`)
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Child Service (for parent-child linking)

## Testing Checklist

- [ ] Create Teacher account
- [ ] Create Parent account with child link
- [ ] Generate password automatically
- [ ] Edit user information
- [ ] Delete user account
- [ ] Search by name/email/phone
- [ ] Filter by role
- [ ] Pagination works correctly
- [ ] Validation shows errors
- [ ] Success messages appear
- [ ] Email uniqueness enforced
- [ ] Password requirements enforced
- [ ] Role-specific fields show/hide correctly

## Troubleshooting

### Common Issues

**Error: "Token tidak ditemukan"**
- Solution: User needs to log in again

**Error: "User with this email already exists"**
- Solution: Use a different email address

**Error: "Gagal mengambil data pengguna"**
- Solution: Check backend server is running on port 3000

**Parent dropdown empty**
- Solution: Ensure children exist in database first

**NIP not saving**
- Note: Currently may need backend extension for separate NIP field storage
