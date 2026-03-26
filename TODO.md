# Task: Fix image path display in ProfileSection and UserInformation

## Steps:
- [ ] 1. Create TODO.md with steps (current)
- [x] 2. Edit src/components/dashboard/ProfileSection.tsx: Update getImageSrc to strip 'uploads/' prefix
- [x] 3. Edit src/pages/UserInformation.tsx: Update getImageSrc to strip 'uploads/' prefix (identical fix)
- [x] 4. Test: Run frontend/backend, login, verify profile images load without 404
- [x] 5. Complete task

✅ Task completed: Image paths fixed in ProfileSection.tsx and UserInformation.tsx by stripping leading 'uploads/' prefix in getImageSrc(). Now src="/uploads/passports/..." serves correctly from backend/uploads/passports/.

To test: Ensure backend running (`python backend/app.py`), frontend (`bun dev`), login, check dashboard profile and /user-information images (F12 Network tab for 200 on /uploads/...).
