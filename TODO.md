# AGL Member Haven - Events & More Page Implementation

## Current Progress
- [x] Analyzed DB structure and existing code
- [x] Created detailed implementation plan
- [x] Got plan approval from user

## Implementation Steps (Backend First)

### Phase 1: Backend Endpoints
1. [x] **Created `backend/PortalComponents/events/__init__.py`**  
   Import and register registeredEvents blueprint
   
2. [x] **Created `backend/PortalComponents/events/registeredEvents/__init__.py`**  
   Import routes
   
3. [x] **Created `backend/PortalComponents/events/registeredEvents/routes.py`**  
   - Blueprint `/api/events/registered`  
   - GET `/api/events/registered?email=<email>` → Query event_registrations by member_email  
   - Public endpoint (no auth required for reads)
   
4. [x] **Updated `backend/app.py`**  
   Register events blueprint: `app.register_blueprint(events.events_bp)`

5. [x] **Tested Backend Endpoints**  
   - `/api/events/registered` ✅ returns user data  
   - `/api/admin/blogs` ✅ returns latest blogs  
   - `/api/events/planned` 404 (existing bp prefixes preserved)

### Phase 2: Frontend Integration
6. [ ] **Update `src/services/api.ts`**  
   Add: `getRegisteredEvents(email)`, `getPlannedEvents()`, `getPastEvents()`, `getBlogs()`
   
7. [ ] **Update Dashboard Components**
   | Component | API Call | Mapping |
   |-----------|----------|---------|
   | `BlogsSection.tsx` | `getBlogs()` | title, content→preview, image_path, created_at |
   | `PlannedEventsSection.tsx` | `getPlannedEvents()` | event_name, event_location, event_date |
   | `PastEventsSection.tsx` | `getPastEvents()` | Handle JSON event_image_paths |
   | `RegisteredEventsSection.tsx` | `getRegisteredEvents(userEmail)` | event_name, event_location, event_date |

### Phase 3: Testing & Completion
8. [ ] **Frontend Testing**  
   - Replace mock data with real fetches  
   - Add loading/error states  
   - Verify user email from session/profile
   
9. [ ] **Final Verification**  
   - Dashboard shows: Latest Blogs, Planned Events, Past Events, User Registered Events  
   - Full data mapping works  
   - Responsive "More Page" (dashboard sections)
   
10. [ ] **attempt_completion**

**Next Action:** Step 1 - Create backend/PortalComponents/events/__init__.py

