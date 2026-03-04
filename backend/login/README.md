# Login Authentication System

This directory contains the secure login and session management system for the AGL Member Haven application.

## Structure

- `__init__.py` - Package initialization
- `auth.py` - Authentication logic and database functions for user verification
- `routes.py` - Flask blueprint with login, logout, and session endpoints
- `decorators.py` - Decorators for protecting routes that require authentication

## Features

✅ **Secure Password Hashing** - Uses werkzeug's `check_password_hash` and `generate_password_hash`
✅ **Server-Side Sessions** - Flask-Session with filesystem storage (can be upgraded to database/Redis)
✅ **Session Expiration** - 24-hour session timeout for security
✅ **User Type Support** - Handles both individual and organization users
✅ **Protected Routes** - Decorators to require login for sensitive endpoints
✅ **Role-Based Access** - `user_type_required` decorator for organization-only routes

## API Endpoints

### POST `/api/auth/login`
Authenticates user and creates a session.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "individual"  // or "organization"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "redirect": "/portal",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "type": "individual",
    "name": "User Name"
  }
}
```

### POST `/api/auth/logout`
Clears the user session.

**Response:**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

### GET `/api/auth/session`
Retrieves current session information.

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "type": "individual",
    "name": "User Name"
  }
}
```

## Usage Examples

### Basic Protected Route

```python
from login.decorators import login_required

@app.route('/api/protected')
@login_required
def protected_route():
    user_id = session.get('user_id')
    return jsonify({"data": "secret", "user_id": user_id})
```

### Organization-Only Route

```python
from login.decorators import user_type_required

@app.route('/api/org-dashboard')
@user_type_required('organization')
def org_dashboard():
    return jsonify({"data": "organization dashboard"})
```

### Getting User Information

```python
from login.auth import get_user_info

user_info = get_user_info(user_id, user_type)
print(user_info['name'])  # or organization_name
```

## Frontend Integration

The frontend should:
1. Send login credentials to `/api/auth/login`
2. On success, redirect user to `/portal`
3. On logout, clear local state and send POST to `/api/auth/logout`
4. Check session status with `/api/auth/session` on app load

## Security Configuration

**Production Environment Variables:**
```bash
SECRET_KEY=your-secure-random-key-here
DB_HOST=production-db-host
DB_USER=production-user
DB_PASSWORD=production-password
DB_NAME=production-database
```

**Session Storage:**
Currently uses filesystem storage. For production, consider:
- SQLAlchemy + Database
- Redis
- Memcached

Update `app.py`:
```python
app.config['SESSION_TYPE'] = 'sqlalchemy'
# or 'redis' / 'memcached'
```

## Portal Redirect

After successful login, users are redirected to `/portal` (frontend route) where they can access:
- User dashboard
- Protected resources
- Account settings
- Organization tools (if organization user)

## Security Best Practices

1. ✅ Passwords are hashed before storage and comparison
2. ✅ Sessions expire after 24 hours
3. ✅ CORS is configured to allow frontend communication
4. ✅ Session data stored server-side (not in cookies)
5. Todo: Implement HTTPS in production
6. Todo: Add rate limiting for login attempts
7. Todo: Implement password reset functionality
