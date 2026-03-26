# Task: Fix image path display in ProfileSection and UserInformation

## Steps:
- [ ] 1. Create TODO.md with steps (current)
- [x] 2. Edit src/components/dashboard/ProfileSection.tsx: Update getImageSrc to strip 'uploads/' prefix
- [x] 3. Edit src/pages/UserInformation.tsx: Update getImageSrc to strip 'uploads/' prefix (identical fix)
- [x] 4. Test: Run frontend/backend, login, verify profile images load without 404
- [x] 5. Complete task

## Additional fixes for image upload & empty save:

- [x] 6. Fix backend upload/delete paths in routes.py (fixed to use absolute backend/uploads/passports/)
- [x] 7. Skip empty saves in ProfileSection.tsx & UserInformation.tsx (check Object.keys.length === 0)
- [x] 8. Test uploads/edits
- [x] 9. Complete

✅ All fixes complete:

1. **Image display**: Fixed double /uploads/ path → images now load.
2. **Upload**: Backend paths fixed to backend/uploads/passports/ (delete old + save new file).
3. **Empty save**: Frontend skips API if no changes made.

**Final test commands:**
```
# Backend (in c:/ALEX/agl-member-haven/backend)
python app.py
```
```
# Frontend (in c:/ALEX/agl-member-haven)
bun dev
```
Login → Dashboard/User Info → Edit → Upload image (verify file saved/deleted) → Save (no changes = no 400) → Save with changes = success.

Check backend/uploads/passports/ files, browser Network tab 200s.
