# TODO: Fix InvoiceGenerator BILL TO with profile data ✅

## Steps:
- [x] Step 1: Update src/services/api.ts - Extend ProfileData interface with optional phone.
- [x] Step 2: Update src/pages/PaymentInvoices.tsx - Import getProfileData, fetch profile in useEffect, use profile data in handleDownload.
- [x] Step 3: Test changes - Run dev server, check PaymentInvoices page downloads use real name/email.
- [x] Step 4: Mark complete, attempt_completion.

All steps completed. Changes: src/services/api.ts and src/pages/PaymentInvoices.tsx updated to fetch and use real profile data (name, email, phone) in invoice PDFs.

