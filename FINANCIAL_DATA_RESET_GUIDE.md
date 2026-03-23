# Financial Data Reset Guide

## Overview

This guide explains how to reset all financial data to zero and start fresh with a clean system.

## Reset Page

**URL**: http://localhost:3006/reset-financial-data

**Access**: Admin users only

## What Gets Reset

### 1. API Data (Persistent Storage)
- **Payments**: All payment records in `data/payments.json`
- **Expenditures**: All expenditure requests in `data/expenditures.json`

### 2. Browser localStorage
- **student_payments**: Payment records stored locally
- **expenditure_requests**: Expenditure requests stored locally
- **financial_overview**: Cached financial summaries
- **payment_confirmations**: Payment confirmation data
- **financial_reports**: Generated financial reports
- **revenue_data**: Revenue tracking data
- **expense_data**: Expense tracking data

## Reset Process

### Step 1: Access Reset Page
1. Login as **admin** user
2. Go to http://localhost:3006/reset-financial-data
3. You'll see a warning about the destructive nature of this operation

### Step 2: Perform Reset
1. Click **"🗑️ Reset All Financial Data"**
2. Confirm the first warning dialog
3. Confirm the final warning dialog
4. Wait for all operations to complete

### Step 3: Verify Reset
1. Click **"🔍 Verify Reset"** to confirm all data is cleared
2. Should show 0 payments and 0 expenditures in both API and localStorage

### Step 4: Check Results
1. Go to Finance page as admin - should show ₦0 revenue
2. Go to Dashboard as accountant - should show ₦0 revenue
3. All financial amounts should be zero across the system

## Optional: Create Sample Data

After reset, you can optionally create minimal sample data:
1. Click **"📊 Create Sample Data"**
2. This creates 2 sample payments (₦50,000 + ₦45,000 = ₦95,000 total)
3. Useful for testing the system with minimal data

## What Happens After Reset

### Immediate Effects:
- ✅ All revenue amounts show ₦0
- ✅ No payment records exist
- ✅ No expenditure requests exist
- ✅ Financial reports show empty data
- ✅ Both admin and accountant see identical ₦0 amounts

### System Behavior:
- ✅ Payment confirmation still works (can add new payments)
- ✅ Expenditure creation still works (can create new requests)
- ✅ All financial calculations start from zero
- ✅ No demo data is automatically generated

## Files Modified for Reset Functionality

### Reset Page:
- `src/app/reset-financial-data/page.tsx` - Main reset interface

### API Endpoints:
- `src/app/api/payments/reset/route.ts` - Reset payments endpoint
- `src/app/api/expenditures/reset/route.ts` - Reset expenditures endpoint
- `src/app/api/payments/route.ts` - Modified to not generate demo data
- `src/app/api/expenditures/route.ts` - Modified to not generate demo data

### Storage Libraries:
- `src/lib/paymentsStorage.ts` - Disabled auto demo data generation
- `src/lib/expenditureStorage.ts` - Disabled auto demo data generation

## Manual Reset (Alternative Method)

If you prefer to reset manually:

### Clear API Data:
```bash
# Delete the data files
rm data/payments.json
rm data/expenditures.json
```

### Clear Browser Data:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear localStorage for the site
4. Refresh the page

## Starting Fresh Workflow

1. **Reset Everything**: Use the reset page to clear all data
2. **Verify Clean State**: Check that all amounts show ₦0
3. **Add Real Data**: Start adding actual student payments
4. **Create Expenditures**: Add real expenditure requests as needed
5. **Monitor Growth**: Watch financial data grow from zero

## Benefits of Starting Fresh

- ✅ **Clean Data**: No confusing demo data mixed with real data
- ✅ **Accurate Reporting**: All reports reflect actual school finances
- ✅ **Easy Tracking**: Can see exactly how much has been collected
- ✅ **Professional Setup**: System ready for production use
- ✅ **Consistent State**: Both admin and accountant see identical data

## Security Notes

- ⚠️ **Admin Only**: Only admin users can access the reset functionality
- ⚠️ **Irreversible**: Reset operation cannot be undone
- ⚠️ **Confirmation Required**: Multiple confirmations prevent accidental resets
- ⚠️ **Audit Trail**: Reset operations are logged with timestamps

## Status: ✅ READY TO USE

The financial data reset system is fully implemented and ready for use. You can now start with a completely clean financial state and build up your data from zero.