

# Multi-Step Authentication Flow for Igdrasil

## Overview
Build a polished multi-step signup/login flow with Google OAuth, a BankID placeholder, email+password auth, and business onboarding -- all powered by your external Supabase project. A "Skip" button lets testers bypass the flow entirely during development.

## User Experience

The flow has two entry points (Login and Sign Up) and the signup is split into 4 steps:

```text
+---------------------+
|   Auth Page (/auth)  |
|                      |
|  [Google Login]      |
|  [BankID] (soon)     |
|  ── or ──            |
|  Email + Password    |
|  [Login] / [Sign Up] |
|                      |
|  [Skip (dev only)]   |
+---------------------+
        |
   (Sign Up flow)
        |
  Step 1: Email + Password
  Step 2: Legal Entity Name (required)
  Step 3: Business Description (optional)
  Step 4: SIE-4 File Upload (optional)
        |
   --> Dashboard
```

- **Login**: email+password or Google -- goes straight to Dashboard
- **Sign Up**: after creating the account, walks through steps 2-4 to collect business info
- **Skip button**: visible in bottom corner, navigates directly to `/` without auth
- **BankID button**: styled like the Google button but shows a toast saying "Coming soon" when clicked

## Technical Plan

### 1. Connect Supabase
- Connect your external Supabase project (you'll be prompted)
- Enable Google OAuth provider in your Supabase dashboard (Authentication > Providers > Google)

### 2. Database: `profiles` table (migration)
Create a `profiles` table to store the business info collected during onboarding:

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, FK to auth.users(id) ON DELETE CASCADE | |
| legal_entity_name | text, NOT NULL | |
| business_description | text, nullable | |
| sie4_file_url | text, nullable | Reference to uploaded file |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Plus:
- A trigger to auto-create a profile row on signup
- RLS policies so users can only read/update their own profile
- A Supabase Storage bucket `sie4-files` for the SIE-4 uploads

### 3. Auth Context (`src/contexts/AuthContext.tsx`)
- Wrap the app in an `AuthProvider`
- Expose `user`, `profile`, `loading`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `updateProfile`
- Use `onAuthStateChange` listener (set up before `getSession`)

### 4. Auth Page (`src/pages/Auth.tsx`)
- Single page with login/signup toggle
- Social buttons: Google (functional) + BankID (placeholder toast)
- Email + password form with validation (zod)

### 5. Onboarding Steps (`src/components/auth/OnboardingWizard.tsx`)
After email signup completes:
- **Step 1**: Confirmation (account created)
- **Step 2**: Legal entity name (required, text input)
- **Step 3**: Business description (optional, textarea)
- **Step 4**: SIE-4 file upload (optional, file input accepting `.se`)
- Progress bar at the top showing current step
- "Next" / "Back" / "Skip this step" buttons
- Final step saves everything to the `profiles` table and uploads SIE-4 to storage

### 6. Protected Routes
- Wrap existing routes so unauthenticated users redirect to `/auth`
- The "Skip" button sets a flag in sessionStorage to bypass auth checks during testing

### 7. Routing Changes (`src/App.tsx`)
- Add `/auth` route
- Add `/onboarding` route
- Wrap protected routes in an auth guard component

## Files to Create/Modify

| File | Action |
|---|---|
| `src/contexts/AuthContext.tsx` | Create -- auth state management |
| `src/pages/Auth.tsx` | Create -- login/signup page |
| `src/components/auth/OnboardingWizard.tsx` | Create -- multi-step onboarding |
| `src/components/auth/ProtectedRoute.tsx` | Create -- route guard |
| `src/App.tsx` | Modify -- add routes, wrap in AuthProvider |
| Supabase migration | Create -- profiles table, trigger, RLS, storage bucket |

## Styling
- Matches the existing Nordic beige palette and serif "Igdrasil" branding
- Clean card-based layout centered on the page
- Step progress indicator using the existing Progress component
- Google button with Google logo, BankID with a shield/lock icon
