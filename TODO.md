# TODO

## AGL Members PDF Styling Upgrade

### Step 1: Identify and update PDF generators
- [ ] Update `backend/PortalComponents/admin/members/members_routes.py` for both endpoints:
  - `/admin/members/print` (All Members table PDF)
  - `/<member_type>/<member_id>/print-details` (Member Details PDF)

### Step 2: Modern bluish header + logo + title
- [ ] Add consistent header drawing helper using `src/assets/AGLlogo.png` equivalent server-side file (`backend/assets` or bundled frontend assets as available)
- [ ] Style header with bluish theme
- [ ] Logo left, “Association of Government Librarians” right

### Step 3: Omit sensitive fields in Member Details PDF
- [ ] Exclude from key/value table: Password, Payment Number, Payment Code, Payment Date, Completion Letter

### Step 4: Improve table layout (professional typography)
- [ ] Add clean table header styling (background, borders, alignment)
- [ ] Improve row spacing, consistent column widths, wrapping where needed
- [ ] Ensure both PDFs use the same styling system

### Step 5: Professional footer
- [ ] Add footer on each page with italic “Association of Government Librarians”

### Step 6: Validate and test
- [ ] Run app / quick PDF generation smoke test
- [ ] Spot-check member_type=personal and organization

