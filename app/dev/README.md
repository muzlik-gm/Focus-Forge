# Development Tools

This directory contains development-only tools and utilities that are **NOT accessible in production**.

## Plan Changer

**Location:** `/dev/change-plan`

A UI tool for quickly switching between subscription tiers during development.

### Features

- Switch between FREE, PRO, and TEAM plans instantly
- View current user subscription information
- Updates database directly
- Only works when `NODE_ENV=development`
- Returns 404 in production

### Usage

1. **Access the page:**
   - Navigate to `http://localhost:3000/dev/change-plan`
   - Or click the yellow "DEV" badge in the navbar (only visible in dev mode)

2. **Change plans:**
   - Click on any plan card (FREE, PRO, or TEAM)
   - The change is immediate
   - Page will refresh automatically to update session

3. **Verify changes:**
   - Check the billing page: `/billing`
   - Check the settings page: `/settings`
   - Check team features: `/team`

### API Endpoint

**POST** `/api/dev/change-plan`

```json
{
  "tier": "FREE" | "PRO" | "TEAM"
}
```

**GET** `/api/dev/change-plan`

Returns current user info and available tiers.

### Security

- ✅ Only accessible when `NODE_ENV=development`
- ✅ Returns 404 in production
- ✅ Requires authentication
- ✅ No environment variable needed
- ✅ Automatically disabled in production builds

### Testing Different Plans

**FREE Plan:**
- Basic features only
- No team collaboration
- No workspace features
- No API keys

**PRO Plan:**
- Advanced analytics
- AI insights
- Priority support
- Data export
- API keys access

**TEAM Plan:**
- Everything in PRO
- Team collaboration
- Workspace features
- Team leaderboards
- Admin controls

### Notes

- Changes are persisted to the database
- Next billing date is automatically set for paid plans (30 days from now)
- Session is refreshed after plan change
- No Stripe integration needed for testing
