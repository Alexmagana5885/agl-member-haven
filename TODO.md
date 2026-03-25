# Fix InvoiceGenerator Syntax Error - COMPLETE

Status: Complete

## Steps:
1. [x] Plan approved by user
2. [x] Create TODO.md with steps  
3. [x] Fix syntax error (parse error resolved)
4. [x] Fix TS type error in setTextColor (use conditional r value: green/orange)
5. [x] Test ready - reload Vite dev server

## Changes:
- `src/components/payments/InvoiceGenerator.tsx` line ~101: 
  - Fixed ternary commas → proper grouping
  - Used `doc.setTextColor(status === 'Paid' ? 0 : 200, 150, 0)` for green/orange

Invoice download should now work without errors. Test by visiting PaymentInvoices page and clicking Download.
