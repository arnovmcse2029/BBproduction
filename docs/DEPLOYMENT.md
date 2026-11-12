# Deployment

No deployment was performed for this reorganization.

## Frontend

1. Change to `frontend/` and install its dependencies with `npm install`.
2. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the frontend hosting
   environment. These are public client values; never set a service-role key as a `VITE_*`
   variable.
3. Build with `npm run build`; the production server/adapter must match the existing TanStack
   Start and Nitro configuration in `frontend/vite.config.ts`.
4. Configure Supabase Auth redirect URLs for the deployed site and Google OAuth provider.

## Express backend

1. Use Node.js 22.6 or newer and install dependencies from `backend/`.
2. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT`, and the allowed `FRONTEND_URL` in the backend
   environment. Do not commit `backend/.env`.
   `NODE_ENV` appears in the example file but is not currently consumed by the service.
3. Build with `npm run build` in `backend/`; start the generated entry with `npm start`.
4. The only implemented HTTP endpoint is `/api/v1/health`. Do not configure frontend business
   operations to this service until their corresponding API routes exist.

## Supabase

Review migration history, schema, and policies in the target project before applying SQL. Apply
only the schema design selected for the deployment; the code-managed menu and legacy database
catalog scripts are alternatives. Deploy the `create-customer-order` Edge Function only after
the required order SQL is applied and verified.

Razorpay is not integrated. Online payments must not be represented as successfully paid.
