# TODO: Planned Events Registration Logic

## Task
Create registration logic for Planned Events in backend\PortalComponents\payments\events with STK Push payment integration.

## Steps

### Step 1: Create events module directory and __init__.py
- [x] Understand the task requirements
- [x] Review existing payment modules (registration, premiums)
- [x] Review database structure (plannedevent, event_registrations, eventregcheckout tables)
- [x] Create `backend/PortalComponents/payments/events/__init__.py`

### Step 2: Create routes.py for event registration
- [x] Create STK push initiation logic for event payments
- [x] Handle free events (amount = 0) - direct registration
- [x] Handle paid events - initiate STK push
- [x] Check for duplicate registrations
- [x] Save checkout request to eventregcheckout table

### Step 3: Create callback.py for payment confirmation
- [x] Process M-Pesa STK callback
- [x] On successful payment: insert into event_registrations
- [x] Send confirmation email
- [x] Handle failed transactions

### Step 4: Update app.py to register blueprints
- [x] Import event blueprints
- [x] Register blueprints in Flask app

## Dependencies
- Reuses accessToken.py from registration module
- Uses same database connection pattern as other payment modules
- Uses same email sending pattern

## Follow-up Steps
- Test the endpoints
- Configure callback URL for M-Pesa
- Verify database tables exist

