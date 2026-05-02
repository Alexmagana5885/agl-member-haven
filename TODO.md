# AGL Member Haven - Registration Payment M-Pesa STK Push Rewrite

## Task Overview
Rewrite PHP M-Pesa STK Push for registration payments to Python/Flask in `backend/PortalComponents/payments/registration/`.
- Add unified `/pay-registration` endpoint matching PHP POST fields.
- Ensure callback matches PHP logic/tables/email.
- Use .env (MY_PASS_KEY -> MPESA_PASSKEY, MY_BUSINESS_SHORT_CODE).

## Steps (Approved Plan Breakdown)

### 1. [ ] Create TODO.md (Current - Done)
Track progress.

### 2. [x] Edit routes.py
- Add `/api/payments/pay-registration` POST endpoint:
  * Accept `User-email`, `phone_number`, `amount` (default 1).
  * Normalize phone.
  * Call `initiate_stk_push`.
  * Save to `mpesa_transactions` (status='Pending').
  * Return JSON: `{'success': True, 'message': 'Kindly enter your Mpesa Pin...'}`
- Keep existing /register-fee, /register-premium.

### 3. [x] Verify/ minor edit callback.py\n- Email body close enough to PHP (Dear User update optional).\n- Logic matches PHP tables/calc/email.

### 4. [ ] Check .env
- Manual: Add MY_PASS_KEY, MY_BUSINESS_SHORT_CODE if missing.

### 5. [ ] Test
- Restart `python backend/app.py`.
- POST curl: `curl -X POST http://localhost:5000/api/payments/pay-registration -H "Content-Type: application/json" -d '{"User-email":"test@example.com","phone_number":"0712345678","amount":"100"}'`
- Check DB inserts, callback log MemberReg.json.

### 6. [ ] Frontend integration (if needed)
- Check src/pages/OnlinePayments.tsx calls.

### 7. [ ] Complete
- attempt_completion.

**Next:** Edit routes.py.

