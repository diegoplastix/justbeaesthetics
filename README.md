# JustBe Aesthetics — Astro

Pixel-perfect Astro port of the WordPress site at
`https://justbeaesthetics.ismailhhridoy.com/`. Scope: homepage only.

## How the mirror works

The original WordPress homepage (HTML, CSS, JS, images, fonts) is mirrored
byte-for-byte under `public/`. Astro's `public/` directory is copied verbatim
to `dist/` at build time, so **nothing is reprocessed, recompiled, or
reinterpreted**. `public/index.html` is served at `/` exactly as WordPress
rendered it.

```
public/
├── index.html                      <- the rendered homepage
└── wp-content/                     <- every referenced asset
    ├── plugins/elementor/...
    ├── themes/hello-elementor/...
    └── uploads/.../*.webp|png|jpg
```

## Develop

```
npm install
npm run dev        # http://localhost:4321
```

## Build

```
npm run build      # outputs to dist/
npm run preview    # serves dist/
```

## Deploy

Both configs are included:

- **Netlify** — connect the repo; `netlify.toml` handles build + redirects.
- **Vercel** — connect the repo; `vercel.json` handles build + trailing slashes.

## Notes

- The contact/booking forms on the original are Elementor forms that POST to
  PHP. Per your instruction they are kept as visual-only (no backend). If you
  later want them to submit, point the `<form action="...">` at Netlify Forms,
  Formspree, or a serverless endpoint.
- A few `@id` identifiers inside JSON-LD structured data still reference the
  original domain. These don't affect rendering. Update them to your final
  domain after it's chosen.
