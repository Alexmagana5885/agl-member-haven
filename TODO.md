# TODO - Member admin More table Edit/Delete

- [ ] Implement backend admin endpoints for updating and deleting member details
  - [ ] `PUT /api/admin/members/<member_type>/<member_id>/details`
  - [ ] `DELETE /api/admin/members/<member_type>/<member_id>/details`
  - [ ] Restrict update fields to allowed DB columns per table

- [ ] Add frontend service methods for update/delete
  - [ ] `updateMemberDetails`
  - [ ] `deleteMember`

- [ ] Update `src/pages/Members.tsx`
  - [ ] Add Edit/Delete buttons to the “Member Details” dialog
  - [ ] Implement read-only -> editable mode transition
  - [ ] Add Save/Cancel buttons
  - [ ] Save persists changes via backend and refreshes details
  - [ ] Cancel discards changes and restores read-only mode
  - [ ] Delete opens confirmation dialog before deleting
  - [ ] After delete, close details dialog and refresh members list

- [ ] Run quick lint/build and manual smoke test

