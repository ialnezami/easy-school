# Easy School - Product Requirements Document

## 1. Overview

Easy School is a comprehensive school management platform that connects teachers, students, and parents. The application enables resource sharing, class management, schedule organization, and secure communication between all stakeholders.

## 2. Objectives

- Provide a centralized platform for educational resource management
- Enable seamless communication between teachers, students, and parents
- Support class scheduling and timetable management
- Allow parents to monitor their children's academic activities
- Facilitate resource sharing and collaboration

## 3. User Roles & Permissions

### 3.1 Teacher
- Create and manage classes
- Upload and share educational resources
- Manage class schedules (emploi de temps)
- Communicate with students and parents
- View student progress and attendance

### 3.2 Student
- Access assigned classes and resources
- View personal schedule
- Communicate with teachers
- Access class materials and assignments

### 3.3 Parent
- Link to their child's account
- View child's classes, schedule, and resources
- Communicate with teachers
- Switch between parent view and child's account view
- Monitor child's academic activities

## 4. Core Features

### 4.1 Authentication & User Management
- User registration and login (email/password)
- Role-based access control (Teacher, Student, Parent)
- Parent-child account linking
- Account switching for parents (parent view ↔ child view)
- Profile management

### 4.2 Class Management
- Create, edit, and delete classes (Teachers)
- Assign students to classes
- Class details (name, description, subject, grade level)
- Class roster management

### 4.3 Resource Management
- Upload educational resources (documents, images, videos, links)
- Organize resources by class
- Resource categories and tags
- Download and preview capabilities
- Resource sharing permissions

### 4.4 Schedule Management (Emploi de Temps)
- Create and manage class schedules
- Weekly timetable view
- Time slot management
- Subject/class assignment to time slots
- Calendar integration

### 4.5 Messaging System
- **Teacher ↔ Student**: Direct messaging
- **Teacher ↔ Parent**: Direct messaging
- **Parent ↔ Teacher**: Direct messaging
- **Student ↔ Student**: Not allowed
- **Parent ↔ Parent**: Not allowed
- Real-time chat notifications
- Message history and search
- File attachments in messages

### 4.6 Dashboard
- Role-specific dashboards
- Recent activities
- Upcoming classes/schedules
- Recent messages
- Quick access to resources

## 5. Technical Requirements

### 5.1 Technology Stack
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Real-time**: WebSockets or Server-Sent Events (for chat)

### 5.2 Data Models

#### User
- id, email, password (hashed), name, role, createdAt, updatedAt
- Parent-specific: linkedChildren (array of student IDs)
- Student-specific: parentId (reference to parent)

#### Class
- id, name, description, subject, gradeLevel, teacherId, studentIds (array), createdAt, updatedAt

#### Resource
- id, title, description, fileUrl, fileType, classId, uploadedBy, createdAt, updatedAt

#### Schedule
- id, classId, dayOfWeek, startTime, endTime, subject, room, createdAt, updatedAt

#### Message
- id, senderId, receiverId, content, attachments, read, createdAt, updatedAt

### 5.3 Security Requirements
- Secure password hashing (bcrypt)
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- File upload security (type validation, size limits)
- HTTPS only (enforced by Vercel)

### 5.4 Performance Requirements
- Page load time < 2 seconds
- Real-time message delivery < 1 second
- Support for 1000+ concurrent users
- Optimized database queries with indexing

## 6. User Interface Requirements

### 6.1 Design Principles
- Clean, modern, and intuitive interface
- Mobile-responsive design
- Accessible (WCAG 2.1 AA compliance)
- Consistent color scheme and typography

### 6.2 Key Pages
- Login/Register
- Dashboard (role-specific)
- Classes List/Detail
- Resources Library
- Schedule/Timetable
- Messages/Chat
- Profile Settings
- Parent Account Switch Interface

## 7. Deployment & Infrastructure

### 7.1 Hosting
- Frontend & API: Vercel
- Database: MongoDB Atlas (cloud)
- File Storage: Vercel Blob or AWS S3

### 7.2 Environment Variables
- MongoDB connection string
- NextAuth secret
- File storage credentials
- Email service credentials (for notifications)

## 8. Future Enhancements (Out of Scope for MVP)
- Video conferencing integration
- Assignment submission and grading
- Gradebook and report cards
- Attendance tracking
- School-wide announcements
- Mobile app (iOS/Android)

## 9. Success Metrics
- User adoption rate
- Daily active users
- Message response time
- Resource upload/download frequency
- User satisfaction scores
