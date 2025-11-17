# 🗺️ Parent Dashboard - Navigation Map

## 📊 Struktur Navigasi

```
┌─────────────────────────────────────────────────────────────────┐
│                      PARENT DASHBOARD                            │
│                   /parentDashboard                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────────────────┐
        │                     │                                  │
        ▼                     ▼                                  ▼
  ┌──────────┐         ┌──────────┐                      ┌──────────┐
  │ SIDEBAR  │         │   MAIN   │                      │  HEADER  │
  │ (Fixed)  │         │ CONTENT  │                      │ (Toggle) │
  └──────────┘         └──────────┘                      └──────────┘
        │                     │
        │                     │
        ├─ Dashboard          ├─ Welcome Banner
        │  (Home)             ├─ Children Cards
        │                     └─ Quick Links
        │
        ├─ Anak Saya ────────────┬─ List View
        │                         │  /my-children
        │                         │
        │                         └─ Detail View
        │                            /my-children/[id]
        │
        ├─ Jadwal Kegiatan ───────┐
        │                          │  /schedules
        │                          │  • Filter by child
        │                          │  • Grouped by day
        │                          └─ Schedule cards
        │
        ├─ Laporan (Unified) ─────┬─ Tab: Laporan Harian
        │                          │  • Filter by child
        │                          │  • Daily report cards
        │                          │
        │                          └─ Tab: Laporan Semester
        │                             • Filter by child
        │                             └─ Semester report cards
        │
        ├─ Tagihan ───────────────┐
        │                          │  /billing
        │                          │  • Statistics cards
        │                          │  • Payment list
        │                          └─ Upload proof button
        │
        └─ Chatbot ───────────────┐
                                   │  /chatbot
                                   │  • Message history
                                   │  • Input form
                                   └─ Send button
```

---

## 🎯 User Flow Diagrams

### Flow 1: Melihat Laporan Anak

```
START
  │
  ▼
Dashboard ─────► Sidebar: "Laporan"
  │                    │
  │                    ▼
  │              Reports Page
  │                    │
  │              ┌─────┴─────┐
  │              │           │
  │              ▼           ▼
  │         Daily Tab   Semester Tab
  │              │           │
  │              ▼           ▼
  │        Select Child  Select Child
  │              │           │
  │              ▼           ▼
  │        View Daily    View Semester
  │         Reports        Reports
  │              │           │
  └──────────────┴───────────┘
                 │
                 ▼
               END
```

### Flow 2: Melihat Detail Anak

```
START
  │
  ▼
Dashboard ─────► Click Child Card
  │                    │
  │                    ▼
  │              /my-children/[id]
  │                    │
  │                    ▼
  │              View Details:
  │              • Personal info
  │              • Medical notes
  │              • Fees
  │              • Schedules
  │                    │
  └────────────────────┘
                 │
                 ▼
               END
```

### Flow 3: Upload Bukti Pembayaran

```
START
  │
  ▼
Dashboard ─────► Sidebar: "Tagihan"
  │                    │
  │                    ▼
  │              Billing Page
  │                    │
  │                    ▼
  │              View Payments
  │                    │
  │                    ▼
  │         Find "Tertunda" payment
  │                    │
  │                    ▼
  │         Click "Upload Bukti"
  │                    │
  │                    ▼
  │            Select file
  │                    │
  │                    ▼
  │              Confirm upload
  │                    │
  │                    ▼
  │         Status → "Terkirim"
  │                    │
  └────────────────────┘
                 │
                 ▼
               END
```

### Flow 4: Chat dengan Asisten

```
START
  │
  ▼
Dashboard ─────► Sidebar: "Chatbot"
  │                    │
  │                    ▼
  │              Chatbot Page
  │                    │
  │                    ▼
  │         Initialize chat session
  │                    │
  │                    ▼
  │         View welcome message
  │                    │
  │              ┌─────┴─────┐
  │              │           │
  │              ▼           ▼
  │         Type message  Read reply
  │              │           │
  │              └─────┬─────┘
  │                    │
  │              [Loop until done]
  │                    │
  └────────────────────┘
                 │
                 ▼
               END
```

---

## 🔀 Component Hierarchy

### Dashboard Home (`page.tsx`)

```
Dashboard
├─ Welcome Banner
│  ├─ Text content
│  └─ Illustration
├─ Children Section
│  ├─ Section header
│  └─ Grid of ChildCards
│     └─ Each card links to /my-children/[id]
└─ Quick Links
   ├─ Link to /reports
   ├─ Link to /schedules
   └─ Link to /billing
```

### Reports Page (`reports/page.tsx`)

```
ReportsPage
├─ PageHeader
├─ Tab Navigation
│  ├─ Daily Tab (active indicator)
│  └─ Semester Tab (active indicator)
└─ Tab Content
   ├─ DailyReportsTab
   │  ├─ Child selector
   │  ├─ LoadingSpinner (conditional)
   │  ├─ ErrorMessage (conditional)
   │  └─ Report cards
   │     ├─ Date + badges
   │     ├─ Activities
   │     ├─ Meals
   │     └─ Notes
   │
   └─ SemesterReportsTab
      ├─ Child filter
      ├─ LoadingSpinner (conditional)
      ├─ ErrorMessage (conditional)
      └─ Report cards
         ├─ Child + semester info
         ├─ Cognitive development
         ├─ Social-emotional dev
         ├─ Physical development
         ├─ Language development
         └─ Overall notes
```

### Schedules Page (`schedules/page.tsx`)

```
SchedulesPage
├─ PageHeader
├─ Child selector
├─ LoadingSpinner (conditional)
├─ ErrorMessage (conditional)
└─ Schedule by day
   ├─ Senin
   │  └─ Schedule cards
   ├─ Selasa
   │  └─ Schedule cards
   ├─ Rabu
   │  └─ Schedule cards
   └─ ... (other days)
```

### Chatbot Page (`chatbot/page.tsx`)

```
ChatbotPage
├─ PageHeader
├─ ErrorMessage (conditional)
└─ Chat Container
   ├─ Messages Area (scrollable)
   │  ├─ Assistant messages
   │  │  ├─ Avatar/icon
   │  │  ├─ Content
   │  │  └─ Timestamp
   │  ├─ User messages
   │  │  ├─ Content
   │  │  └─ Timestamp
   │  └─ Loading indicator
   │
   └─ Input Form
      ├─ Text input
      └─ Send button
```

---

## 🎨 Layout Structure

```
┌───────────────────────────────────────────────────────┐
│  LAYOUT (layout.tsx)                                  │
│  ┌──────────┬───────────────────────────────────────┐│
│  │          │                                        ││
│  │  SIDEBAR │  MAIN CONTENT AREA                    ││
│  │  (Fixed) │  ┌──────────────────────────────────┐ ││
│  │          │  │                                   │ ││
│  │  • Dash  │  │  PAGE HEADER                      │ ││
│  │  • Kids  │  │  ┌─────────────────────────────┐ │ ││
│  │  • Sched │  │  │ Back Button + Title         │ │ ││
│  │  • Report│  │  └─────────────────────────────┘ │ ││
│  │          │  │                                   │ ││
│  │  ─────── │  │  CONTENT                          │ ││
│  │  • Bill  │  │  ┌─────────────────────────────┐ │ ││
│  │  • Chat  │  │  │                             │ │ ││
│  │          │  │  │  Dynamic content based on   │ │ ││
│  │          │  │  │  current route              │ │ ││
│  │          │  │  │                             │ │ ││
│  │  [Toggle]│  │  │  • Cards                    │ │ ││
│  │          │  │  │  • Lists                    │ │ ││
│  │          │  │  │  • Forms                    │ │ ││
│  │          │  │  │  • etc.                     │ │ ││
│  │          │  │  │                             │ │ ││
│  │          │  │  └─────────────────────────────┘ │ ││
│  │          │  │                                   │ ││
│  │          │  └───────────────────────────────────┘ ││
│  │          │                                        ││
│  └──────────┴────────────────────────────────────────┘│
│                                                        │
│  w-64         flex-1, overflow-y-auto, p-8            │
└────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
```
┌─────────┬──────────────────────┐
│ Sidebar │   Main Content       │
│ (Fixed) │   (Expanded)         │
│         │                      │
│ Always  │   Full width         │
│ Visible │   3-column grid      │
└─────────┴──────────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────┬────────────────┐
│ Sidebar │ Main Content   │
│ (Fixed) │ (Medium)       │
│         │                │
│ Visible │ 2-column grid  │
└─────────┴────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────┐
│ [☰] Main Content        │
│     (Full width)        │
│                         │
│     1-column grid       │
│                         │
│ Sidebar toggles with    │
│ hamburger menu          │
└─────────────────────────┘
```

---

## 🎯 State Management Overview

```
App State (localStorage)
├─ token (auth token)
└─ user (user object)

Component State (useState)
├─ children (array of Child)
├─ selectedChild (string ID)
├─ isLoading (boolean)
├─ error (string | null)
├─ reports (array)
├─ payments (array)
└─ messages (array)

Custom Hooks State
├─ useChildren()
│  ├─ children
│  ├─ isLoading
│  ├─ error
│  └─ refetch()
│
└─ useAuth()
   ├─ user
   ├─ isLoading
   └─ logout()
```

---

## 🔄 Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
API Call (fetch)
    │
    ├─► Loading State (true)
    │
    ▼
Backend Response
    │
    ├─► Success ─► Update State ─► Re-render
    │
    └─► Error ─► Set Error State ─► Show Error Message
    
Loading State (false)
```

---

## 🎨 Visual Hierarchy

```
Level 1: Page Title (text-3xl, font-bold, text-brand-purple)
         │
         ▼
Level 2: Section Headers (text-xl, font-semibold)
         │
         ▼
Level 3: Card Titles (text-lg, font-semibold)
         │
         ▼
Level 4: Labels (text-sm, font-medium)
         │
         ▼
Level 5: Body Text (text-sm, text-gray-600)
         │
         ▼
Level 6: Metadata (text-xs, text-gray-500)
```

---

Struktur navigasi ini memastikan user dapat dengan mudah menemukan informasi yang mereka butuhkan dengan minimal clicks! 🎯
