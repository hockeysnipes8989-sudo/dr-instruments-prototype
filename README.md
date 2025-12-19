# Dr Instruments Prototype

## Supabase Setup

Create a `.env` file at the project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The app expects a Supabase table named `inventory` with these columns:

- `id` (uuid or serial primary key)
- `sku` (text, unique)
- `name` (text)
- `category` (text)
- `quantity` (numeric)
- `price` (numeric)
- `location` (text)
- `min_stock_threshold` (numeric)

To seed the table with mock data, import and run `seedInventory` from
`src/seedSupabase.ts`.
