# Shipzy Railways

Railway logistics booking platform.

## Features
- Customer management
- Warehouse management (with search)
- Multi-step booking flow
- Automatic MAWB / box AWB generation (series starting from 3, +11 per subsequent box)
- Shipping label PDF generation (4x6, Shipzy Railways branded)

## AWB Logic
- Master AWB: 10-digit, starts from 30000001
- First box uses master AWB
- Each subsequent box: previous + 11

## Setup
1. `npm install`
2. `npm run dev`

Data is stored in `data/store.json`. For production on Railway, attach a volume to persist the data directory.

## Label
Generated as multi-page PDF (one page per box). Logo integration pending full base64 embed.
