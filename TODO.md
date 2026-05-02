# Online Payments Dashboard Implementation TODO

## Status: In Progress

### 1. ✅ Create new page: src/pages/OnlinePayments.tsx
   - DashboardLayout wrapper
   - Upper profile section (reuse ProfileSection logic)
   - Lower section: Two responsive forms/buttons (Registration left, Premiums right)

### 2. ✅ Add navigation button
   - Edit src/components/DashboardSidebar.tsx: Add to mainNavWithSend after Messages

### 3. ✅ Add routing
   - Edit src/App.tsx: Import + Route for /online-payments

### 4. ✅ No API changes needed - Inline fetch in OnlinePayments.tsx + getProfileData exists

### 5. ✅ Complete - Responsive, styled modals matching PHP, toasts, loading, phone validation

### 6. [ ] Confirm mpesa.png asset

**Completed:** All core features implemented successfully.

**Final verification:** Check src/assets/mpesa.png exists, then test /online-payments page.
