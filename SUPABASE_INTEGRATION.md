# Supabase Integration Plan - Focus Forge

## Overview

Integrate Supabase as the backend service for Focus Forge, providing:

- **Authentication** - User signup, login, OAuth providers
- **Database** - PostgreSQL for storing user data, tasks, workflows
- **Row Level Security (RLS)** - Secure data access per user
- **Real-time** - Live updates for collaborative features

---

## Phase 1: Setup & Configuration

### 1.1 Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1.2 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 1.3 Supabase Client Setup

- Create `src/lib/supabase/client.ts` - Browser client
- Create `src/lib/supabase/server.ts` - Server client
- Create `src/lib/supabase/middleware.ts` - Auth middleware

---

## Phase 2: Authentication

### 2.1 Auth Features

- [ ] Email/Password signup & login
- [ ] OAuth providers (Google, GitHub)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management
- [ ] Protected routes middleware

### 2.2 Auth Components

- [ ] Update `/login` page with Supabase auth
- [ ] Update `/signup` page with Supabase auth
- [ ] Create auth callback route `/auth/callback`
- [ ] Create password reset page `/reset-password`
- [ ] Create auth context/provider

### 2.3 Auth Hooks

- [ ] `useUser()` - Get current user
- [ ] `useSession()` - Get current session
- [ ] `useAuth()` - Auth actions (login, logout, etc.)

---

## Phase 3: Database Schema

### 3.1 Tables

#### `profiles` (extends auth.users)

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `tasks`

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `workflows`

```sql
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_settings`

```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  notifications_weekly BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tasks: Users can CRUD their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Workflows: Users can CRUD their own workflows
CREATE POLICY "Users can manage own workflows" ON workflows
  FOR ALL USING (auth.uid() = user_id);

-- Settings: Users can manage their own settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

### 3.3 Database Functions & Triggers

```sql
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Phase 4: API Layer

### 4.1 Server Actions / API Routes

- [ ] `src/app/actions/auth.ts` - Auth actions
- [ ] `src/app/actions/tasks.ts` - Task CRUD
- [ ] `src/app/actions/workflows.ts` - Workflow CRUD
- [ ] `src/app/actions/profile.ts` - Profile management
- [ ] `src/app/actions/settings.ts` - Settings management

### 4.2 Data Fetching Hooks

- [ ] `useTasks()` - Fetch and manage tasks
- [ ] `useWorkflows()` - Fetch and manage workflows
- [ ] `useProfile()` - Fetch and manage profile
- [ ] `useSettings()` - Fetch and manage settings

---

## Phase 5: UI Integration

### 5.1 Update Existing Pages

- [ ] `/dashboard` - Fetch real tasks from database
- [ ] `/dashboard/tasks` - Full task management
- [ ] `/dashboard/workflows` - Workflow management
- [ ] `/settings` - Real settings persistence

### 5.2 New Components

- [ ] `AuthProvider` - Context for auth state
- [ ] `ProtectedRoute` - HOC for protected pages
- [ ] `TaskForm` - Create/edit task form
- [ ] `WorkflowBuilder` - Visual workflow editor

---

## Phase 6: Real-time Features (Optional)

### 6.1 Real-time Subscriptions

- [ ] Live task updates
- [ ] Collaboration notifications
- [ ] Activity feed updates

---

## File Structure

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       ├── server.ts       # Server Supabase client
│       └── middleware.ts   # Auth middleware helper
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useTasks.ts
│   ├── useWorkflows.ts
│   └── useSettings.ts
├── app/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── workflows.ts
│   │   ├── profile.ts
│   │   └── settings.ts
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts
│   └── (protected)/
│       ├── dashboard/
│       └── settings/
├── components/
│   └── providers/
│       └── AuthProvider.tsx
├── types/
│   └── database.types.ts   # Generated Supabase types
└── middleware.ts           # Next.js middleware for auth
```

---

## Implementation Tasks

### Task 1: Initial Setup

- [ ] Create Supabase project
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Create Supabase client utilities

### Task 2: Database Setup

- [ ] Create database tables in Supabase
- [ ] Set up RLS policies
- [ ] Create triggers and functions
- [ ] Generate TypeScript types

### Task 3: Authentication

- [ ] Implement auth provider
- [ ] Update login page
- [ ] Update signup page
- [ ] Create auth callback route
- [ ] Add middleware for protected routes

### Task 4: Core Features

- [ ] Implement task CRUD operations
- [ ] Implement workflow management
- [ ] Implement profile management
- [ ] Implement settings persistence

### Task 5: Dashboard Integration

- [ ] Connect dashboard to real data
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement optimistic updates

### Task 6: Testing & Polish

- [ ] Test auth flows
- [ ] Test data operations
- [ ] Add proper error messages
- [ ] Implement loading skeletons

---

## Security Considerations

1. **Never expose service role key** to client
2. **Always use RLS** for data access control
3. **Validate inputs** on server-side
4. **Use HTTPS** in production
5. **Implement rate limiting** for auth endpoints
6. **Store sensitive data** encrypted

---

## Timeline Estimate

| Phase                   | Duration        |
| ----------------------- | --------------- |
| Phase 1: Setup          | 1-2 hours       |
| Phase 2: Auth           | 3-4 hours       |
| Phase 3: Database       | 2-3 hours       |
| Phase 4: API Layer      | 3-4 hours       |
| Phase 5: UI Integration | 4-6 hours       |
| Phase 6: Real-time      | 2-3 hours       |
| **Total**               | **15-22 hours** |

---

## Next Steps

1. Create a Supabase project at https://supabase.com
2. Run `npm install @supabase/supabase-js @supabase/ssr`
3. Add environment variables to `.env.local`
4. Start with Phase 1 implementation
