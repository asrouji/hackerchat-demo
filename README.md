# HackerChat Demo

A Vite + Supabase demo for LMUHacks 2025!

## Supabase Project Setup

Follow these steps to set up your Supabase project:

1. Create a new project on [Supabase](https://supabase.com/).
2. Go to your [API Settings](https://supabase.com/dashboard/project/_/settings/api) to find your `URL` and `anon` key.
3. Add the following to your `.env.local` file (you can rename `.env.example` if you haven't already):

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## GitHub App Setup

Follow these steps to set up your GitHub OAuth app. Skip this if using a different OAuth provider.

1. Go to your [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App" and fill in the details:
   - For the homepage URL, you can use `http://localhost:3000` for local development.
   - For the authorization callback URL, go to your [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/providers), click on "GitHub", enable it, and copy in the "Callback URL" value.
3. After creating the app on Github, go back to Supabase and copy in the `Client ID` and `Client Secret` from the GitHub app.
4. Copy the client ID to your `.env.local` file:

```bash
VITE_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
```

## Supabase Table Schema

To quickly set up the tables for this project, you can use the following SQL in your [Supabase SQL editor](https://supabase.com/dashboard/project/_/sql/new):

### Hacker Table

```sql
create table public.hacker (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  github_login text not null,
  github_avatar_url text not null,
  constraint hacker_pkey primary key (id),
  constraint hacker_id_fkey foreign KEY (id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
```

### Message Table

```sql
create table public.message (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  hacker_id uuid not null,
  content text not null,
  constraint message_pkey primary key (id),
  constraint message_hacker_id_fkey foreign KEY (hacker_id) references hacker (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
```

## Generating Supabase Types

To generate TypeScript types for your Supabase tables, visit the [Supabase API page](https://supabase.com/dashboard/project/_/api?page=tables-intro) and click the "Generate and download types" button. Replace the contents of `src/supabase.types.ts` with the generated types.

## Running the Project

To run the project, run these commands:

```bash
npm install # install dependencies
npm run dev # start the development server
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the site! Changes you make will be reflected in real-time.

## Creating your own Vite Project

To start your own Vite project similar to this one, you can use the following command:

```bash
npm create vite@latest
```

## Learn More

To learn more about Vite and Supabase, take a look at the following resources:

- [Vite Documentation](https://vite.dev/guide/)
- [Supabase Documentation](https://supabase.com/docs)
