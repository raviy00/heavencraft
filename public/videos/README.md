# 🎬 Background Videos

Place your background video file(s) here.

## How to use

1. Drop your video file into this folder:
   - Recommended formats: `.mp4` (H.264), `.webm` (VP9)
   - Recommended resolution: 1920×1080 or higher
   - Keep file size under ~20 MB for fast load times

2. Required file names (both recommended for max compatibility):
   - `bg.webm` — preferred (smaller, better quality)
   - `bg.mp4` — fallback for Safari / older browsers

## Where it's used

The video background is wired up in `src/layouts/PublicLayout.jsx`.
Both sources are already referenced — just drop the files here and they'll work automatically:

```jsx
<video autoPlay loop muted playsInline>
  <source src="/videos/bg.webm" type="video/webm" />
  <source src="/videos/bg.mp4"  type="video/mp4"  />
</video>
```

> **Tip:** If you want a static image fallback for when no video is present,
> set the `background-image` CSS property on the `<video>` element's parent.
> The dark overlay will still render correctly.
