# HackerChat Demo

A Vite + Supabase demo for LMUHacks 2025!

## Supabase Setup

Follow these steps to set up your Supabase project:

1. Create a new project on [Supabase](https://supabase.com/).
2. Go to your [API Settings](https://supabase.com/dashboard/project/_/settings/api) to find your `URL` and `anon` key.
3. Add the following to your `.env.local` file (you can rename `.env.example` if you haven't already):

```bash
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
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
GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
```

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
