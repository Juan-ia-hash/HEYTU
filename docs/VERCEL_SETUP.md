# Vercel deployment preparation

HEYTU's Expo web bundle reads configuration from build-time public environment
variables. In Vercel, open **Project → Settings → Environment Variables** and
add the following for the environments where the app should build:

Set the Vercel build command to `npx expo export --platform web` and the output
directory to `dist`. The repository's `npm run web` command starts the local
development server; it is not the production build command.

| Variable                               | Value                    |
| -------------------------------------- | ------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`             | Supabase Project URL     |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

These two values are intentionally public and become part of the client bundle.
Supabase Row Level Security protects data access. Never add a Supabase
`service_role` key, Google Client Secret, or other private credential to an
`EXPO_PUBLIC_*` variable or frontend code. Keep Google Client ID/Secret in the
Supabase Google provider configuration.

After setting variables, redeploy so Expo embeds them in the web build. Use the
Vercel production hostname chosen by the project owner in Google Cloud's
authorized JavaScript origins and Supabase's allowed redirect URLs, as
described in [AUTH_REDIRECTS.md](./AUTH_REDIRECTS.md). Preview deployments have
different origins; add only the preview hosts that should be allowed to sign
in.

For local development, copy `.env.example` to `.env` and fill in the same two
Supabase values. Do not commit `.env`.
