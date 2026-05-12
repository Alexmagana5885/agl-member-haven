# TODO: 15-min inactivity auto logout + back-button lock

- [x] Implement server-side inactivity timeout (15 minutes) by tracking last activity in session and clearing session on expiry.
- [x] Add middleware/decorator to enforce inactivity timeout on protected routes (or augment existing login_required).
- [x] Implement client-side inactivity timer (15 minutes) that calls logout + redirects to /login.
- [x] Handle browser back button: prevent returning to portal after logout/expiry via history replacement and popstate handling.
- [x] Clear any client cached/sessionStorage/localStorage data on logout.
- [x] Ensure /login page triggers a fresh state when redirected from session expiry.
- [ ] Smoke test: login, idle for 16 minutes, verify redirect; try browser back after expiry/logout.


