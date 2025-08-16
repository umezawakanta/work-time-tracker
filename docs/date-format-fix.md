# Date Format Fix for react-big-calendar with date-fns

## Issue

The application was encountering `RangeError` with the message:

```
Use `yyyy` instead of `YYYY` (in `YYYY年M月`) for formatting years
```

This error occurred because `date-fns` v2+ uses different format tokens than traditional date formatting libraries like `moment.js`.

## Root Cause

The `react-big-calendar` component was configured with date format strings using uppercase tokens that are not compatible with `date-fns`:

- `YYYY` should be `yyyy` for 4-digit year
- `D` should be `d` for day of month
- `ddd` should be `EEE` for abbreviated weekday name

## Changes Made

### 1. Year Format (YYYY → yyyy)

Fixed in:

- `src/components/calendar/BigCalendarView.tsx`
- `src/components/calendar/TaskCalendarIntegration.tsx`
- `src/components/calendar/EnhancedTaskCalendar.tsx`

**Before:**

```javascript
monthHeaderFormat: 'YYYY年M月';
```

**After:**

```javascript
monthHeaderFormat: 'yyyy年M月';
```

### 2. Day Format (D → d)

Fixed day of month formatting:

**Before:**

```javascript
dayHeaderFormat: 'M月D日(ddd)';
format(date, 'M月D日', { locale: ja });
```

**After:**

```javascript
dayHeaderFormat: 'M月d日(EEE)';
format(date, 'M月d日', { locale: ja });
```

### 3. Weekday Format (ddd → EEE)

Fixed abbreviated weekday names:

**Before:**

```javascript
'M月D日(ddd)';
```

**After:**

```javascript
'M月d日(EEE)';
```

## date-fns Format Tokens Reference

### Common Tokens

| Unit         | Token    | Result examples      |
| ------------ | -------- | -------------------- |
| Year         | `yyyy`   | 2024, 2025           |
| Month        | `M`      | 1, 2, ..., 12        |
| Month        | `MM`     | 01, 02, ..., 12      |
| Day of month | `d`      | 1, 2, ..., 31        |
| Day of month | `dd`     | 01, 02, ..., 31      |
| Day of week  | `E..EEE` | Mon, Tue, ...        |
| Day of week  | `EEEE`   | Monday, Tuesday, ... |
| Hour         | `H`      | 0, 1, ..., 23        |
| Hour         | `HH`     | 00, 01, ..., 23      |
| Minute       | `m`      | 0, 1, ..., 59        |
| Minute       | `mm`     | 00, 01, ..., 59      |

### Avoid These Uppercase Tokens

- `YYYY` - Use `yyyy` instead
- `DD` - Use `dd` instead (day of month with padding)
- `D` - Use `d` instead (day of month without padding)

## Best Practices

1. **Always use lowercase `yyyy` for years** when working with date-fns
2. **Use `d` or `dd` for day of month**, not `D` or `DD`
3. **Use `EEE` for abbreviated weekday names**, not `ddd`
4. **Refer to date-fns documentation** when in doubt: https://date-fns.org/docs/format
5. **Test date formatting** after library updates to catch incompatibilities early

## Configuration Files vs. Formatting

Note that configuration files (like `InternationalizationContext.tsx`) may still contain uppercase format strings like `'YYYY年MM月DD日'` as configuration values. These are fine as long as they're not directly used with date-fns formatting functions.

## Testing

After these changes, test the calendar views to ensure:

- Month headers display correctly (e.g., "2025年1月")
- Day headers display correctly (e.g., "1月16日(木)")
- Date range headers display correctly
- No console errors related to date formatting

---

最終更新: 2025年1月
