/*
  # Employee Management System Schema

  ## Overview
  Creates a comprehensive schema for PixelNode's CRM and Employee Management Portal.

  ## New Tables

  1. `employees`
     - `id` (uuid, primary key) - Unique employee identifier
     - `employee_id` (text, unique) - Custom employee ID (e.g., EMP012)
     - `name` (text) - Full name
     - `email` (text, unique) - Email address
     - `phone` (text) - Phone number
     - `address` (text) - Physical address
     - `role` (text) - Job role/position
     - `department` (text) - Department name
     - `reporting_manager` (text) - Manager's name
     - `joining_date` (date) - Date of joining
     - `avatar_url` (text, nullable) - Profile picture URL
     - `is_admin` (boolean) - Admin privileges flag
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  2. `attendance`
     - `id` (uuid, primary key) - Unique attendance record ID
     - `employee_id` (uuid, foreign key) - References employees table
     - `date` (date) - Attendance date
     - `check_in` (timestamptz, nullable) - Check-in time
     - `check_out` (timestamptz, nullable) - Check-out time
     - `total_hours` (numeric, nullable) - Total hours worked
     - `status` (text) - Present, Absent, Half Day, Leave
     - `created_at` (timestamptz) - Record creation timestamp

  3. `tasks`
     - `id` (uuid, primary key) - Unique task ID
     - `title` (text) - Task title
     - `description` (text, nullable) - Task description
     - `status` (text) - Todo, In Progress, In Review, Completed
     - `priority` (text) - Low, Medium, High
     - `assigned_to` (uuid, foreign key) - References employees table
     - `assigned_by` (uuid, foreign key, nullable) - References employees table
     - `due_date` (date, nullable) - Due date
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  4. `daily_reports`
     - `id` (uuid, primary key) - Unique report ID
     - `employee_id` (uuid, foreign key) - References employees table
     - `date` (date) - Report date
     - `content` (text) - Report content
     - `tasks_completed` (text, nullable) - List of completed tasks
     - `hours_worked` (numeric, nullable) - Hours worked
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  5. `leaves`
     - `id` (uuid, primary key) - Unique leave ID
     - `employee_id` (uuid, foreign key) - References employees table
     - `leave_type` (text) - Casual, Sick, Vacation, etc.
     - `start_date` (date) - Leave start date
     - `end_date` (date) - Leave end date
     - `reason` (text) - Reason for leave
     - `status` (text) - Pending, Approved, Rejected
     - `approved_by` (uuid, foreign key, nullable) - References employees table
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Add policies for admin users to manage all data
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  reporting_manager text,
  joining_date date NOT NULL,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  check_in timestamptz,
  check_out timestamptz,
  total_hours numeric,
  status text NOT NULL DEFAULT 'Absent',
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'Todo',
  priority text NOT NULL DEFAULT 'Medium',
  assigned_to uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  content text NOT NULL,
  tasks_completed text,
  hours_worked numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  approved_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees table
CREATE POLICY "Employees can view all employee records"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

CREATE POLICY "Employees can update own record"
  ON employees FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any employee"
  ON employees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

-- RLS Policies for attendance table
CREATE POLICY "Employees can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

CREATE POLICY "Employees can insert own attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- RLS Policies for tasks table
CREATE POLICY "Employees can view assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Admins can view all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

CREATE POLICY "Admins can insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

CREATE POLICY "Employees can update assigned tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Admins can update all tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

-- RLS Policies for daily_reports table
CREATE POLICY "Employees can view own reports"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

CREATE POLICY "Employees can insert own reports"
  ON daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own reports"
  ON daily_reports FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- RLS Policies for leaves table
CREATE POLICY "Employees can view own leaves"
  ON leaves FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all leaves"
  ON leaves FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

CREATE POLICY "Employees can insert own leaves"
  ON leaves FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own leaves"
  ON leaves FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admins can update all leaves"
  ON leaves FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_daily_reports_employee_date ON daily_reports(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);