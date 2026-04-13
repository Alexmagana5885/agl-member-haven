# Fix Registered Events Download Card Error

## Plan Overview
Fix \"Error generating event card\" by patching backend `backend/PortalComponents/events/registeredEvents/routes.py`:
- Define missing `content` for QR code.
- Fix FPDF generation bugs.
- Improve paths, error handling.

Status: [x] Fixes Applied | [ ] Testing (new DB cursor error: "Unread result found")
</

## Implementation Steps
- [x] Step 1: Edit `backend/PortalComponents/events/registeredEvents/routes.py` with fixes. ✅
- [x] Step 2: Verify `requirements.txt` has deps (fpdf, qrcode[pil]) – OK. ✅
- [ ] Step 3: Restart backend server if running.
- [ ] Step 4: Test download button for a registered event.
- [ ] Step 5: Check PDF output (QR, layout, download).
- [ ] Step 6: Update TODO with results and attempt_completion.

Next: Proceed to Step 1.
