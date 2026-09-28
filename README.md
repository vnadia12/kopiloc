# Coffee Map v1

Static site: map, shop list, search, filters, nearest sort, shop detail with menu.

## Run
Open `index.html` in a browser (needs internet for map tiles and Leaflet).
For "Sort by nearest", the browser may require `http://localhost`:

    python3 -m http.server 8000   # then open http://localhost:8000

## Structure
- `index.html`     page layout
- `css/style.css`  styles
- `js/app.js`      map, list, filters, detail dialog
- `data/shops.js`  shop data (sample entries, replace with real ones)

## Add a shop
Copy one object in `data/shops.js`, change the fields, and get lat/lng by
right-clicking the place in Google Maps and copying the coordinates.

## Next steps (v2+)
- Move data to a database (e.g. Postgres/Supabase) and load it via an API
- Import place details with the Google Places API (server-side, keep the key private; follow Google's caching and attribution rules)
- User accounts, reviews and photo uploads with moderation
- Recommendations (popular nearby, good for working)
