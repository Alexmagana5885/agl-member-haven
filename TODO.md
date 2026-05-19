# TODO

## Blog + Past Event media management
- [x] Frontend: Replace `window.confirm` with in-app dialogs for blog/past-event delete

- [ ] Frontend: Extend `BlogsSection` edit dialog to manage cover image + documents (selective delete + upload)
- [ ] Frontend: Extend `PastEventsSection` edit dialog to manage images/docs (selective delete + append uploads)
- [ ] Frontend: Update `src/services/api.ts` with endpoints for selective media delete + uploads
- [ ] Backend: Update `blog_posts` schema + `backend/PortalComponents/blogs/routes.py`
  - [ ] Add multi-file fields for blogs (JSON arrays) for images and documents
  - [ ] Add endpoints: append upload, selective delete, and update core fields
  - [ ] Implement cover image selection as a gallery but default UI can remain single image

- [ ] Backend: Update `backend/PortalComponents/events/pastEvents/routes.py`
  - [ ] Add endpoints/extend PUT to allow selective deletion of specific stored image/doc paths
- [ ] Backend: Update `backend/DBstructure.sql` to reflect schema changes
- [ ] Frontend: Ensure BlogDetail reads the new blog image/doc fields
- [ ] Smoke test: edit blog/past-event, delete media entries, and verify persistence

