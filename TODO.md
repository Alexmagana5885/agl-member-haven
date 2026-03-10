# TODO - Registration Fee Fix

## Task
Fix the Registration Fee showing N/A in MemberPremiumsPayments.tsx by calculating the sum of all member payments

## Steps
- [x] 1. Analyze the issue - backend query only gets single payment record (LIMIT 1)
- [x] 2. Create plan and get user confirmation
- [x] 3. Modify backend SQL query to use SUM() for registration fees
- [x] 4. Test the changes

## Implementation
- Edit: backend/PortalComponents/admin/payments/membersPremiumsPayments/routes.py
- Change: Use SUM() aggregate to calculate total registration fees per member instead of getting just one record

## Summary
Updated both endpoints in routes.py:
1. `get_member_premiums_payments()` - Lists all premium payments with summed registration fees
2. `get_member_premium_payment_by_id()` - Gets single payment record with summed registration fees

The SQL query now uses:
- COUNT(*) to count registration payments per member
- SUM(amount) to calculate total registration fees
- MAX(timestamp) for the latest payment date
- GROUP BY member_email to aggregate per member

