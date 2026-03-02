# 🎬 Background Videos

Place your background video file(s) here.

## How to use

1. Drop your video file into this folder:
   - Recommended formats: `.mp4` (H.264), `.webm` (VP9)
   - Recommended resolution: 1920×1080 or higher
   - Keep file size under ~20 MB for fast load times

2. Example files:
   - `bg.mp4` — main background video
   - `bg.webm` — WebM fallback for better browser compatibility

## How to wire it up in the app

In `src/pages/AuthPage.jsx`, replace `<MinecraftBackground />` with:

```jsx
<video
  autoPlay
  loop
  muted
  playsInline
  style={{
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  }}
>
  <source src="/videos/bg.webm" type="video/webm" />
  <source src="/videos/bg.mp4"  type="video/mp4"  />
</video>
```

> **Tip:** If you want both the video AND the Minecraft block animation on top of it,
> keep `<MinecraftBackground />` and just add reduced-opacity blocks.
> Set each block's `alpha` to `0.05–0.15` in `MinecraftBackground.jsx`.
