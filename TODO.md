# TODO - Message Delivery Logic Implementation

## Task Overview
Implement message delivery logic with three recipient options:
1. All Members (personalmembership + organizationmembership tables)
2. Officials Only (officialsmembers table)
3. Specific Recipient (with autocomplete, supporting multiple selections)

The recipient_group should be sent to backend as JSON.

## Implementation Plan

### Phase 1: Backend Updates (backend/PortalComponents/communications/routes.py) ✅ COMPLETED

- [x] 1.1 Modify `send_message` endpoint to accept `recipient_group` as JSON in request body
  - Accept format: `{ "type": "all_members" | "officials" | "specific_recipients", "recipients": [] }`
  - For specific_recipients: array of email addresses
- [x] 1.2 Update validation logic to handle new JSON format
- [x] 1.3 Store recipient_group as JSON string in database
- [x] 1.4 Add backward compatibility for legacy format

### Phase 2: Frontend API Service Updates (src/services/api.ts) ✅ COMPLETED

- [x] 2.1 Update MessagePayload interface to include recipient_group as object
- [x] 2.2 Add searchMembers function for autocomplete

### Phase 3: Frontend Messages Page Redesign (src/pages/Messages.tsx) ✅ COMPLETED

- [x] 3.1 Create compose message section with:
  - Subject input
  - Message body textarea
  - Sender info inputs
- [x] 3.2 Implement recipient type selection:
  - Radio buttons for: All Members, Officials, Specific Recipients
- [x] 3.3 For Specific Recipients:
  - Add autocomplete input field
  - Call `/members/search` API as user types
  - Display filtered results in dropdown
  - Allow multiple email selections with remove option
- [x] 3.4 Connect form to API and handle responses

### Phase 4: Testing

- [ ] 4.1 Test All Members delivery
- [ ] 4.2 Test Officials Only delivery
- [ ] 4.3 Test Specific Recipients with single selection
- [ ] 4.4 Test Specific Recipients with multiple selections

## Files Modified
1. `backend/PortalComponents/communications/routes.py` - Backend logic ✅
2. `src/services/api.ts` - API service ✅
3. `src/pages/Messages.tsx` - Frontend UI ✅

## API Usage

### Send Message Payload Format:
```json
{
  "recipient_group": {
    "type": "all_members" | "officials" | "specific_recipients",
    "recipients": ["email1@example.com", "email2@example.com"]  // Only for specific_recipients
  },
  "subject": "Message Subject",
  "message": "Message content",
  "sender_name": "Sender Name",
  "sender_email": "sender@email.com"
}
```

### Search Members:
- Endpoint: `GET /api/admin/messages/members/search?q={query}&limit=20`
- Returns: Array of members with id, member_name, email, member_type

