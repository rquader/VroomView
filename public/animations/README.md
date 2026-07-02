# Lottie animation files

Drop Lottie **JSON** files here. `<LottiePlayer>` fetches them at runtime from
`/animations/<name>.json`, so the app builds and runs even when this folder is empty —
components just show a static fallback until a file exists.

## Expected filenames

The built-in components look for these (see `constants/animations.ts`):

| File | Used by |
|------|---------|
| `loading.json` | `LoadingAnimation` |
| `empty.json` | `EmptyState` |
| `success.json` | `SuccessAnimation` |
| `error.json` | `ErrorAnimation` |

## Where to get animations (licensing matters)

- Create your own (After Effects + Bodymovin, or a Lottie editor).
- Download from [LottieFiles](https://lottiefiles.com) — **only** ones licensed for your
  use (free license or your own assets). Check each animation's license.
- **Do not** commit copyrighted or random JSON you don't have rights to.

To use a custom name/path, pass `src` (or a bundled `animationData`) to `<LottiePlayer>`.
