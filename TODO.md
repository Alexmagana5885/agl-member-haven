# TODO

- [x] Update `backend/PortalComponents/payments/premiums/routes.py` outstanding calculation to sum premium payments from Jan 1 of current year (instead of last 365 days / now).
- [x] Ensure date handling uses `datetime.now().year` and constructs `jan_1` as `YYYY-01-01 00:00:00`.
- [x] Run a quick grep/search to confirm no other outstanding queries use the old logic for premiums.



