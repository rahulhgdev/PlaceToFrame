# PlaceToFrame

Turn your favorite locations into beautiful custom posters. Grab a map, style it however you like, and download it as a print-ready image.

## What is this?

PlaceToFrame is a simple web tool for creating personalized map posters. Want a poster of your hometown, vacation spot, or that one place that means something to you? Just search for it, pick your style, and boom — you've got a poster ready to frame.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then fire up the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser and start creating.

## Build for Production

Ready to ship it? Run:

```bash
npm run build
```

This spits out an optimized build in the `dist/` folder.

## Tech Stack

- **React** for the UI
- **Vite** for lightning-fast dev builds
- **Tailwind CSS** for styling
- **Nominatim API** for Geocoding
- **Overpass API** for querying/extracting data from OpenStreetMap (OSM) 
- **Canvas API** for rendering map posters

## How It Works

Pick a location, choose from different map themes and resolutions, and generate a poster. Everything renders on canvas and downloads as an image — no server needed, all client-side magic.
