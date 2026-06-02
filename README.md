# Tatari-HRMS

A full-featured **Human Resource Management System** built with **Laravel 12** (backend) and **React 18 + TypeScript** (frontend). Supports multi-portal access (Employee, HR, Admin) with role-based permissions, real-time notifications, and AI-powered recruitment features.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12 (PHP ^8.2) |
| Frontend | React 18.3, TypeScript, Vite 8 |
| Styling | Tailwind CSS, Lucide Icons |
| Database | SQLite / MySQL |
| Real-time | Laravel Reverb (WebSockets), Laravel Echo |
| AI | Google Gemini API (applicant CV analysis) |
| Queue | Database driver |
| Notifications | Toast (sonner), In-app, Real-time |

---

## Modules & Features

### Authentication & Access Control
- Three login portals: Employee, HR, and Admin
- Token-based API authentication
- Force password change on first login
- Session inactivity auto-logout
- Comprehensive audit logging

### Employee Management
- Full employee lifecycle (create, edit, deactivate)
- Employee profiles with department, position, compensation
- Bulk CSV import with downloadable template
- Manager assignment hierarchy

### Department Management
- Create and manage departments
- Employee headcount tracking
- Self-service department view for employees

### Leave Management
- Configurable leave types (annual, sick, personal, maternity, etc.)
- Leave request submission and approval workflow
- Leave balance tracking with carry-forward rules
- Half-day support per leave type
- Real-time notifications on leave status changes

### Performance Evaluation (360°)
- **Evaluation Templates** — configurable forms with mixed question types (rating, text, multiple choice, yes/no, numeric)
- **Evaluation Periods** — time-bound cycles with multi-template support
- **360° Evaluations** — self, peer, and manager evaluations
- **Auto-assignment** — self-evaluations automatically created when a period activates
- **Weighted Scoring** — configurable weights per evaluator type (e.g., self: 30%, peer: 30%, manager: 40%)
- **Performance Summaries** — aggregated scores per employee per period

### Performance Reviews
- Simpler cycle-based reviews (distinct from the 360° evaluations)
- Status workflow: draft → submitted → in review → completed
- Rating scale, strengths, areas for improvement, goals

### Recruitment
- Job vacancy management with employment types, salary ranges, and locations
- Public career page with job listings and application forms
- Applicant tracking with status pipeline (submitted → reviewing → shortlisted → hired/rejected)
- Interview scheduling

### AI-Powered Applicant Screening
- Automated CV analysis via Google Gemini API
- Scores CV against job requirements (0-100)
- Generates verdict, strengths, gaps, and summary
- Configurable scoring threshold for HR notifications
- Supports PDF and DOCX resume parsing

### Compensation Management
- Salary breakdown: basic, housing, transport, other allowances
- Effective date tracking and status management

### Payroll Management
- Monthly payroll records with allowances, bonuses, and deductions
- Unpaid leave calculation and approval workflow

### Notification System
- In-app notifications with real-time delivery via WebSockets
- Unread count badge
- Notifications for leave requests, evaluations, applicant changes, and more
- Mark as read / clear all

### Permissions & Access Control
- Three permission levels: Employee, HR, Administrator
- Granular individual permission overrides (grant/revoke)
- Frontend and backend route protection
- 15+ distinct permissions

### Audit Logging
- Tracks all significant actions with employee, module, action, status
- Searchable by action, module, user, and date range
- Modules: Authentication, Employee Management, Permissions, Leave Management, and more

### System Settings & Company Management
- Multi-company support with subscription-like expiration tracking
- System-wide configuration

### Dashboards
- Role-specific dashboards with composable widgets
- Headcount, leave, performance, recruitment, and activity widgets
- Quick actions and recent activity tracking

---

## Database

43 tables covering employees, departments, leave management, performance evaluations, recruitment, payroll, compensation, notifications, audit logs, and system configuration.

---

## Architecture Highlights

- **Event-driven** — 13+ custom events with listeners for notifications, audit logging, and side effects
- **Queue jobs** — background processing for CV analysis and email
- **Real-time** — Laravel Reverb WebSockets for live updates
- **Multi-tenant ready** — company-scoped data model
- **Polymorphic notifications** — single table serving all entity types
- **Dashboard widget system** — composable per-role dashboards
- **Modular frontend** — domain-separated API service files
- **Session monitoring** — frontend auto-logout on inactivity

---

## Getting Started

### Prerequisites
- PHP ^8.2
- Composer
- Node.js & npm
- SQLite or MySQL

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd tatari-hrms

# Backend setup
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed

# Frontend setup
cd frontend
npm install
npm run dev

# Start the Laravel development server (from root)
php artisan serve
```
