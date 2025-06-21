# FocusHero - Pomodoro Timer Application

## Overview

FocusHero is a modern Pomodoro timer application built to help users improve their focus and productivity through time-boxed work sessions. The application combines a sleek React frontend with a robust Express.js backend, using PostgreSQL for data persistence and featuring AI-powered motivational quotes to keep users engaged.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context for settings and theme management
- **Data Fetching**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: In-memory storage with optional PostgreSQL persistence
- **External APIs**: OpenAI GPT-4o for motivational quote generation
- **Development**: Hot module reloading with Vite integration

## Key Components

### Timer System
The core timer functionality is built around a custom `useTimer` hook that manages:
- Focus sessions (default 25 minutes)
- Short breaks (default 5 minutes)
- Long breaks (default 30 minutes)
- Session tracking and persistence
- Local storage for timer state continuity

### Database Schema
The application uses three main tables:
- **Users**: User authentication and management
- **Sessions**: Focus session tracking with timestamps, duration, notes, and completion status
- **Settings**: User preferences for timer durations, notifications, and theme

### UI Components
- **PomodoroTimer**: Main timer interface with circular progress indicator
- **SessionHistory**: Historical view of completed sessions with filtering
- **MotivationalQuote**: AI-generated inspirational messages
- **Settings**: Comprehensive settings management interface
- **Layout**: Responsive navigation with mobile support

### External Integrations
- **OpenAI API**: Generates contextual motivational quotes using GPT-4o
- **Notification System**: Browser and sound notifications for session transitions

## Data Flow

1. **Timer Initialization**: Settings loaded from database, timer state restored from localStorage
2. **Session Management**: Active sessions tracked in real-time, saved to database on completion
3. **Data Persistence**: Session history and user preferences stored in PostgreSQL
4. **Real-time Updates**: React Query manages server state synchronization
5. **Offline Continuity**: Timer state persisted locally for uninterrupted experience

## External Dependencies

### Core Framework Dependencies
- **React 18**: Modern React features with concurrent rendering
- **Express.js**: Lightweight web framework for Node.js
- **TypeScript**: Type safety across the entire application

### Database & ORM
- **PostgreSQL**: Primary database for persistent data storage
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript integration
- **@neondatabase/serverless**: Serverless PostgreSQL connection for cloud deployment

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built component library based on Radix UI

### State Management & Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation

### AI Integration
- **OpenAI**: GPT-4o API for generating motivational content

## Deployment Strategy

### Development Environment
- **Replit**: Cloud-based development with integrated PostgreSQL
- **Vite Dev Server**: Hot module reloading for rapid development
- **TypeScript**: Compile-time type checking

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: ESBuild compilation for Node.js deployment
- **Database**: PostgreSQL with Drizzle migrations

### Environment Configuration
- Database URL configuration via environment variables
- OpenAI API key for AI feature integration
- Replit-specific configurations for cloud deployment

## Changelog

Changelog:
- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.