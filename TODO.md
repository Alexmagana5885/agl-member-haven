# TODO

- [x] Update `backend/app.py` session cookie configuration so `SESSION_COOKIE_SECURE` is `False` on localhost/http and `True` on production/https.

- [ ] Restart backend.
- [ ] Re-test: login then call `GET /api/dashboard/user-info/profile` from frontend on `http://localhost:8080`.
- [ ] Verify dashboard loads season/profile data (no 401 from profile endpoint).

