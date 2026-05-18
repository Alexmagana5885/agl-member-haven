# TODO - Official notification on successful payment

## Plan summary
Implement email notifications to officials (Chairperson, Treasurer, National Secretary) after a successful registration payment callback.

## Steps
- [x] Update `backend/PortalComponents/payments/registration/callback.py`
  - [x] Add SQL query to fetch officials from `officialsmembers` for positions: Chairperson, Treasurer, National Secretary
  - [x] Resolve each official’s email and name by joining `personalmembership` (via `personalmembership_email`)
  - [x] Add helper to send the official notification email using existing SMTP config
  - [x] Trigger the helper after payment is marked Completed and DB commit succeeds
  - [x] Ensure failures in sending emails do not break payment processing (log only)
- [ ] Smoke test by invoking the registration/premium callback with a successful payload
- [ ] Verify recipients and email body formatting


