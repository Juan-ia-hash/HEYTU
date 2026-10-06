# Google sign-in setup

Google sign-in is handled by Supabase Auth. The Google Client Secret belongs
only in the Supabase dashboard. Never add it to this app, `.env`, or Vercel
frontend variables.

## Google Cloud

1. Create or open the Google Cloud project that will own HEYTU's OAuth consent
   configuration.
2. In Google Auth Platform, configure the app name, support email, audience,
   and requested scopes (`openid`, `email`, and `profile`). Publish or add test
   users as appropriate for the selected audience.
3. Create an OAuth Client ID with application type **Web application**.
4. Add authorized JavaScript origins:
   - Local web: `http://localhost:8081`
   - Production web: `https://<YOUR-HEYTU-DOMAIN>` (origin only; no path)
5. In the Supabase Dashboard, open **Authentication → Providers → Google** and
   copy the callback URL displayed there. Add that exact URL as the Google
   client's authorized redirect URI. The hosted form is
   `https://<PROJECT-REF>.supabase.co/auth/v1/callback`; use the actual value
   shown by your Supabase project.
6. Copy the Google Client ID and Client Secret into the Supabase Google provider
   settings and enable the provider. Do not put the secret in client code.

## Supabase project

1. Apply `supabase/migrations/20261005000000_create_profiles.sql`.
2. Enable Google under **Authentication → Providers** using the credentials
   from Google Cloud.
3. Under **Authentication → URL Configuration → Redirect URLs**, allow the
   app return URLs listed in [AUTH_REDIRECTS.md](./AUTH_REDIRECTS.md).
4. Put the Supabase Project URL and publishable key in the local `.env` file
   (copy `.env.example`) and in the Vercel environment settings.

Use only a Supabase publishable key in the frontend. A publishable key is safe
to expose when RLS is enabled and policies are correct. A `service_role` key is
never safe in a browser or mobile bundle.
