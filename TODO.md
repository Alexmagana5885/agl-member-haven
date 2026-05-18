# TODO - directPayments hardening

## Step 1: Make confirmation idempotent + safer
- Update `backend/PortalComponents/payments/directPayments/confirmation.py`:
  - validate required fields
  - if `CheckoutRequestID`/`MpesaReceiptNumber` missing => return non-accepted
  - return non-zero result if saving fails
  - prevent inserts on duplicates (using DB unique constraints/receipt)

## Step 2: Strengthen save layer
- Update `backend/PortalComponents/payments/directPayments/save_functions.py`:
  - add `INSERT ... ON DUPLICATE KEY UPDATE` for `MpesaReceiptNumber`
  - optionally also enforce uniqueness on `CheckoutRequestID` (DB migration)

## Step 3: Strengthen validation endpoint
- Update `backend/PortalComponents/payments/directPayments/validation.py`:
  - parse JSON safely
  - check required request fields
  - return appropriate ResultCode/Desc

## Step 4: Test locally
- Run a simple curl/postman simulation of confirmation/validation
- Verify duplicates don’t create extra rows in `directmpesapayments`

