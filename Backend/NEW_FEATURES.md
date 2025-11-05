New backend features added (Admin & Teacher)

Summary
- Facilities: CRUD (Admin) + report facility condition (Teacher/Admin)
- Inventory: CRUD items (Admin); Teachers can request items; Admin can approve/reject requests
- Curriculum: CRUD (Admin) and read for Teachers
- Schedule: CRUD (Admin) and read for Teachers
- Attendance: Teachers can mark attendance; Admin can query attendance reports

Mounted routes
- /api/facilities
- /api/inventory
- /api/curriculums
- /api/schedules
- /api/attendances

Auth & Roles
- All endpoints require JWT in Authorization header: "Bearer <token>"
- Admin-only endpoints are protected with role check middleware
- Teacher endpoints require Teacher role

Quick examples
- Create facility (Admin): POST /api/facilities
- Teacher request inventory: POST /api/inventory/requests
- Admin approve request: PUT /api/inventory/requests/:id/status { status: 'Approved' }
- Teacher mark attendance: POST /api/attendances { date, status }

Notes
- The project uses existing `auth` and `roleCheck` middleware; ensure users have correct `role` in `users` collection.
- No database migrations are required. New models use Mongoose.
