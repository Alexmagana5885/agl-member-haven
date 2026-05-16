# Session/CORS Fix Guide

## Problem Summary
Sessions were failing when accessing the app from URLs other than `localhost:8080` + backend on `localhost:5000`. This was due to:
1. **Hardcoded CORS whitelist** - Backend didn't allow requests from your IP addresses (192.168.0.110, 192.168.137.1)
2. **Frontend not using environment variables** - API service was using hardcoded `/api` instead of `VITE_API_BASE_URL`
3. **Missing IP/domain combinations** - Session cookies weren't being sent due to CORS rejection

## Changes Made

### 1. Frontend (`src/services/api.ts`)
**Before:**
```typescript
const API_BASE_URL = "/api";  // ❌ Hardcoded, ignores VITE_API_BASE_URL
```

**After:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";  // ✅ Uses env var, falls back to proxy
```

**Impact:** 
- In development (localhost:8080): Uses `/api` proxy → `localhost:5000`
- In production: Uses `VITE_API_BASE_URL` environment variable
- On other IPs (192.168.x.x): Uses `VITE_API_BASE_URL` if set

### 2. Backend (`backend/app.py`)

#### CORS Whitelist Updated
**Added missing origins:**
```python
"http://127.0.0.1:8080",
"http://127.0.0.1:5173", 
"http://127.0.0.1:3000",
"http://192.168.0.110:8080",
"http://192.168.137.1:8080",
"https://fadschool.fad.co.ke",
"https://member.log.agl.or.ke",
```

#### Session Cookie Configuration Updated
```python
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
```

**Impact:** 
- Automatically uses `False` for development (HTTP)
- Automatically uses `True` for production (HTTPS)
- Sessions now work across all whitelisted origins

## Configuration for Different Environments

### Development (localhost)
```bash
# .env or environment variable
VITE_API_BASE_URL=http://localhost:5000
FLASK_ENV=development  # or omit - SESSION_COOKIE_SECURE will be False
```
✅ Session works with Vite proxy

### Local Network Testing
```bash
# Frontend accessed via: http://192.168.0.110:8080
# .env or frontend environment
VITE_API_BASE_URL=http://192.168.0.110:5000
# OR
VITE_API_BASE_URL=http://127.0.0.1:5000

FLASK_ENV=development
```
✅ Session now works because:
- IP is in CORS whitelist
- Frontend uses VITE_API_BASE_URL
- Cookies set with SameSite=None

### Production (HTTPS)
```bash
# .env on backend server
VITE_API_BASE_URL=https://member.log.agl.or.ke/backend
FLASK_ENV=production
```
✅ Session works with:
- HTTPS domain in CORS whitelist
- SESSION_COOKIE_SECURE=True (required for SameSite=None on HTTPS)

## Testing the Fix

### Test 1: localhost (Vite dev server)
```bash
Frontend: http://localhost:8080
Backend: http://localhost:5000 (via proxy)
Expected: ✅ Login → Session check succeeds
```

### Test 2: Local Network IP
```bash
# Terminal 1: Backend
FLASK_ENV=development python backend/app.py

# Terminal 2: Frontend
VITE_API_BASE_URL=http://192.168.0.110:5000 npm run dev

# Browser: http://192.168.0.110:8080
# Login should now work!
Expected: ✅ Login → Session check succeeds
```

### Test 3: Production
```bash
# All traffic via HTTPS
Frontend: https://agl-member-haven.vercel.app
Backend: https://member.log.agl.or.ke/backend
Expected: ✅ Login → Session check succeeds
```

## Troubleshooting

### Session still fails after changes?

1. **Check CORS error in browser DevTools (Console tab)**
   - If you see "CORS policy error", the origin isn't in the whitelist
   - Add it to `backend/app.py` `allowed_origins` list

2. **Check Application/Cookies tab in DevTools**
   - Should see `session` cookie being set after login
   - If missing, CORS rejection prevented it

3. **Verify VITE_API_BASE_URL is set correctly**
   ```bash
   # Check what frontend is using
   # In browser console:
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```

4. **Verify Flask received the origin**
   ```bash
   # Add this to backend/app.py after CORS initialization:
   print(f"CORS allowed origins: {allowed_origins}")
   # Check logs when making requests
   ```

## Additional Notes

- **Why SameSite=None?** Allows cookies to flow between frontend and backend on different domains/ports
- **Why credentials: "include"?** Tells browser to send cookies with cross-domain requests
- **Why changeOrigin: true in Vite?** Modifies the Host header so backend thinks request is from localhost:5000, not localhost:8080
- **Session type: filesystem** - Good for development; consider Redis for production with multiple app instances

## Next Steps

1. Test the fix locally with your IP address
2. Verify sessions work on all environments
3. Update `.env` files for each deployment environment
4. For production, ensure HTTPS is properly configured
