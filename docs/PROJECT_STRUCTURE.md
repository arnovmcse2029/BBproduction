# Project structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/       # Environment and Supabase client
│   │   ├── middleware/   # Supabase JWT verification
│   │   ├── routes/       # Implemented Express routes (health only)
│   │   └── server.ts     # Express app and server startup
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/                 # Architecture, API, database, auth, deployment
├── frontend/
│   ├── public/           # Static frontend files
│   ├── src/
│   │   ├── assets/       # Asset metadata
│   │   ├── components/   # Shared UI, auth, site, admin components
│   │   ├── context/      # Auth, cart, and store state
│   │   ├── data/         # Static menu and supporting data
│   │   ├── hooks/        # Shared React hooks
│   │   ├── lib/          # Helpers and Supabase clients
│   │   ├── routes/       # TanStack file-based routes
│   │   ├── services/     # Auth, data access, orders, and API adapters
│   │   ├── test/         # Frontend tests
│   │   └── types/        # Shared frontend types
│   ├── scripts/          # Frontend development helpers
│   ├── design-system/    # Frontend design references
│   ├── .env.example      # Public frontend environment placeholders
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── supabase/
│   ├── functions/        # Supabase Edge Functions
│   └── migrations/       # Versioned SQL definitions
├── .gitignore            # Repository-wide ignore rules
└── README.md
```

Frontend-specific manifests and Vite/TypeScript configuration live beside the app in `frontend/`.
Repository-level documentation, backend code, Supabase definitions, and ignore rules remain at
the root. The repository does not need empty backend `controllers/`, `services/`, `validators/`,
or `utils/` directories: no existing backend feature requires them. Add one when implementing a
real route or business capability.

TanStack route files stay directly in `frontend/src/routes/` to preserve file-based route
discovery. Generated `frontend/src/routeTree.gen.ts` is maintained by the router tooling.
