# PixelNode - CRM & Employee Management Portal

A professional, high-end CRM and Employee Management Portal built for PixelNode tech agency. Features a modern, clean, enterprise SaaS design with Deep Navy, Slate, and White color palette.

## Features

### Dashboard
- High-level overview with 4 key stats cards
- Total Employees, Active Tasks, Attendance percentage, and Pending Leaves
- Recent Activity feed with live updates
- Real-time clock display

### Attendance System
- Clock In / Clock Out functionality
- Live digital clock with date
- Monthly attendance history table
- Automatic total hours calculation
- Status tracking (Present, Absent, Half Day, Leave)

### Employee Management
- Admin-only user creation form
- Comprehensive employee profiles with avatar initials
- Contact Information section
- Organization Details (Joined Date, Reporting Manager, Team Size)
- Security section for password management
- Detailed profile view with tabs

### Task Management
- Kanban-style board with 4 columns (Todo, In Progress, In Review, Completed)
- Priority levels (Low, Medium, High)
- Due date tracking
- Drag-and-drop status updates
- Task creation dialog

### Daily Reports
- Rich text editor for work summaries
- Tasks completed tracking
- Hours worked logging
- Report history table
- Submission validation

### Leave Management
- Leave request form with multiple types
- Date range selection
- Status tracking (Pending, Approved, Rejected)
- Leave history with calculations
- Statistics dashboard

### Products & Services
- Product catalog with pricing
- Sales tracking
- Revenue metrics
- Growth statistics

### Reports & Analytics
- Department performance metrics
- Top performers leaderboard
- Productivity tracking
- Employee statistics

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Notifications**: Sonner
- **Font**: Inter

## Design Features

- Modern, clean, enterprise SaaS style
- Professional color palette (Deep Navy #1E3A5F, Slate, White)
- Fully responsive design
- Minimalist borders and subtle shadows
- Plenty of whitespace for clarity
- Smooth transitions and hover effects

## Database Schema

### Tables

1. **employees**: Employee records with personal and organizational details
2. **attendance**: Daily attendance logs with check-in/check-out times
3. **tasks**: Task management with status and priority tracking
4. **daily_reports**: Daily work reports and summaries
5. **leaves**: Leave requests with approval workflow

### Security

- Row Level Security (RLS) enabled on all tables
- Admin-only policies for user creation
- Employee-specific data access policies
- Secure authentication flow

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

## Project Structure

```
├── app/
│   ├── dashboard/          # Main dashboard
│   ├── attendance/         # Attendance tracking
│   ├── tasks/             # Task management
│   ├── daily-reports/     # Daily reports
│   ├── leaves/            # Leave management
│   ├── profile/           # User profile
│   ├── account/           # Admin user creation
│   ├── products/          # Products & services
│   └── reports/           # Analytics & reports
├── components/
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── header.tsx         # Header with clock
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## Key Components

### Sidebar Navigation
- Dashboard
- Products
- Tasks
- Daily Reports
- Attendance
- Leaves
- Reports
- My Profile (bottom)
- Account (bottom)

### Header
- Real-time clock
- Notification bell with badge
- User profile dropdown

## Default Admin User

- Name: Shubham Raj
- Role: Admin
- Access: Full system access

## Contributing

This is a private project for PixelNode. Contact the administrator for access.

## License

Proprietary - PixelNode Tech Agency
