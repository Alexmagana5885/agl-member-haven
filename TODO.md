# Reset Password Backend Implementation
## Approved Plan Steps (Progress: 7/8 ✅)

### 1. ✅ Created backend/.env with SMTP credentials
### 2. ✅ Updated backend/requirements.txt (added flask-mail - but using smtplib stdlib)
### 3. ✅ Added helpers to backend/login/auth.py (find_user_by_email, hash_password, update_user_password)
### 4. ✅ Added send_otp_email + generate_otp in backend/login/routes.py
### 5. ✅ Added /reset-password endpoint 
### 6. ✅ Added /verify-code endpoint 
### 7. ✅ Added /set-new-password endpoint 
### 8. [ ] Test & cleanup (pip install -r backend/requirements.txt, restart server, test endpoints)

**Next:** Step 8 - Install deps & test. Run `cd backend && pip install -r requirements.txt` then `python app.py`. Test reset flow.

