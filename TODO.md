# TODO
- [ ] Add asset URL helper using `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;`
  - [ ] Implement `buildAssetUrl(path)` in `src/services/api.ts`
- [ ] Wire asset URLs into blog rendering
  - [ ] Update `src/pages/BlogDetail.tsx` to use `buildAssetUrl(blog.image_path)`
  - [ ] Update `src/components/dashboard/BlogsSection.tsx` to render blog cover images using `buildAssetUrl(blog.image_path)`
- [ ] Wire asset URLs into past event rendering
  - [ ] Update `src/pages/PastEventDetail.tsx` to prefix `event_image_paths` + `event_document_paths` via `buildAssetUrl`
- [ ] Build/test the frontend
  - [ ] Run `npm run build` (and `npm test` if available)

