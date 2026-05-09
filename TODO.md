# TODO - My Members (Organization Members CRUD)

## Step 1: Repo reconnaissance
- [x] Inspect existing member-related backend endpoints and data model.
- [x] Inspect existing frontend API service patterns.

## Step 2: Backend implementation
- [x] Add organization-scoped endpoints for members CRUD (list/add/update/delete).
- [x] Ensure authorization uses session-based organization membership.


## Step 3: Frontend implementation
- [x] Add route and page: `src/pages/MyMembers.tsx`.
- [x] Implement table with action menu (Edit/Delete) + Add Member button.
- [x] Implement Edit dialog with pre-filled values + Save/Cancel.
- [x] Implement Delete confirmation dialog.

## Step 4: Sidebar update
- [x] Add conditional sidebar link “My Members” visible only to organization members.
- [x] Wire link to `/my-members` route.


## Step 5: Wiring
- [x] Add frontend API calls in `src/services/myMembers.ts`.

## Step 6: Validation
- [x] Run frontend and verify behavior (sidebar + dialogs).
- [x] Run backend checks/manual requests.


