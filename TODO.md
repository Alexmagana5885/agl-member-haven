# TODO

## Fix missing blog/past-event images & documents (404)

- [ ] Add Flask route `/api/assets/<path:filename>` that serves files from `backend/assets/`.
- [ ] Ensure React `buildAssetUrl()` paths (`/api/assets/...`) resolve correctly.
- [ ] Run backend and verify that previous 404 URLs now return 200.

