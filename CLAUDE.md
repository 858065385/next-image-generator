# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev          # Start development server on localhost:3000
npm run dev:preview  # Start with preview environment config on port 3001
npm run dev:prod     # Start with production environment config on port 3001

# Production builds
npm run build        # Build for production
npm run build:preview # Build with preview environment
npm run build:prod   # Build with production environment
npm run start        # Start production server

# Code quality
npm run lint         # Run ESLint checks
```

## Database Setup

Initialize PostgreSQL database with schema:
```bash
psql -U your_username -d your_database -f src/backend/sql/init.sql
```

## Architecture Overview

This is a Next.js 14 API-only service specialized for AI-driven image and video generation. The frontend has been completely removed for performance optimization, leaving only a clean REST API backend.

### Backend Architecture (`src/backend/`)

**Data Layer Structure:**
- `models/` - Database access layer with native SQL queries
- `service/` - Business logic layer coordinating model operations
- `config/db.ts` - PostgreSQL connection pool management
- `type/type.ts` - TypeScript interfaces for all database entities

**Core Services:**
- `generate-_check.ts` - Pre-generation validation (authentication, credits, subscription)
- Credit system tracks usage per billing cycle via `credit_usage` table
- Subscription management through Creem API integration
- File storage via Cloudflare R2 (S3-compatible)

**Database Schema:**
- `users` - User accounts and OAuth provider details
- `credit_usage` - Credit tracking per billing cycle
- `effect` - AI models/endpoints (Replicate API integration)
- `effect_result` - Generated content results and metadata
- `subscription_plans` - Available subscription tiers
- `user_subscriptions` - Active subscriptions via Creem
- `payment_history` - Payment transaction records

### API Route Structure (`src/app/api/`)

**Authentication:**
- `/api/auth/[...nextauth]/route.ts` - NextAuth.js Google OAuth
- `/api/auth/test/route.ts` - Authentication test

**AI Generation:**
- `/api/predictions/text_to_image/route.ts` - Text to image generation
- `/api/predictions/img_to_video/route.ts` - Image to video generation
- `/api/predictions/[id]/route.ts` - Prediction status polling

**Payment & Subscription:**
- `/api/creem/checkout/route.ts` - Creem checkout session creation
- `/api/webhook/creem/route.ts` - Creem webhook handling
- `/api/webhook/replicate/route.ts` - Replicate webhook handling

**User Management:**
- `/api/user/check_pro_status/route.ts` - User subscription status
- `/api/user/get_user_subscription_info/route.ts` - Subscription details

**Content Management:**
- `/api/effect_result/count_all/route.ts` - Total result count
- `/api/effect_result/list_by_user_id/route.ts` - User-specific results
- `/api/effect_result/update/route.ts` - Result updates

**File Storage:**
- `/api/r2/upload/route.ts` - Cloudflare R2 file upload

### Authentication & Authorization

**Middleware System (`src/lib/auth-middleware.ts`):**
- `requireAuth()` - Basic authentication check
- `requireAdmin()` - Admin access (using UUID whitelist)
- `requireSelf()` - User data ownership validation
- `requireDev()` - Development environment only

**Admin UUID System:**
- Admin users identified by UUID in `ADMIN_UUIDS` array
- Default admin UUID: '10086'
- Development environment bypasses admin checks

### AI Integration

**Supported Platforms:**
- Replicate API for AI model execution
- Pre-configured models: Kling v2.1 (video, 15 credits), Flux1.1 Pro (image, 1 credit)

**Generation Flow:**
1. Pre-check: `generateCheck()` validates user auth, subscription, and credits
2. Call Replicate API with model-specific parameters
3. Store results in `effect_result` table
4. Upload media files to Cloudflare R2
5. Deduct credits from user quota

### File Storage (R2)

**Key Functions in `lib/r2.ts`:**
- `generatePresignedUrl()` - For direct browser uploads
- `uploadImageToR2()` / `uploadVideoToR2()` - Server-side uploads from URL
- File organization: `ssat/{type}/{uuid}_{filename}`

### Environment Variables

Required environment variables for backend functionality:
```
# Database
POSTGRES_URL=            # PostgreSQL connection string

# Authentication
NEXTAUTH_SECRET=         # NextAuth.js secret
GOOGLE_CLIENT_ID=        # Google OAuth
GOOGLE_CLIENT_SECRET=

# AI Services
REPLICATE_API_TOKEN=     # Replicate API access
REPLICATE_WEBHOOK_SECRET=

# File Storage
R2_ACCOUNT_ID=           # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=

# Payment (Creem)
CREEM_API_KEY=           # Creem API key
CREEM_WEBHOOK_SECRET=    # Webhook secret
CREEM_API_BASE_URL=      # https://api.creem.io
CREEM_PRODUCT_MONTHLY_ID= # Monthly product ID
CREEM_PRODUCT_YEARLY_ID=  # Yearly product ID
CREEM_SUCCESS_URL=       # Success redirect URL (default: /admin/payment-result?success=true)
```

## Key Patterns

**Database Access:**
- Models use pg Pool with parameterized queries
- Services coordinate multiple model calls
- All functions use async/await, return typed interfaces

**Error Handling:**
- Custom ResponseCodeEnum for consistent API responses
- Credit validation returns specific error codes (-1: uninitialized, -2: no subscription, -3: exceeded limit)

**Type Safety:**
- Comprehensive TypeScript interfaces in `type/type.ts`
- Database row formatters convert QueryResultRow to typed objects
- Domain-specific types for complex business objects in `type/domain/`
- Consistent status codes and payment status enums in `type/enum/`

## Current Configuration Status

**Configured Services:**
- ✅ **Database**: PostgreSQL (Supabase)
- ✅ **Authentication**: Google OAuth via NextAuth.js
- ✅ **AI Services**: Replicate API
- ✅ **File Storage**: Cloudflare R2
- ✅ **Type Safety**: Comprehensive TypeScript
- ✅ **Auth Middleware**: Complete API protection system

**Needs Configuration:**
- ⚠️ **Payment**: Requires Creem API configuration
- ⚠️ **Production URLs**: Need to update OAuth callbacks

## API Usage

Visit `http://localhost:3000` to see all available API endpoints. Use Postman, curl, or integrate with your own frontend to interact with these APIs.

## Important Notes

- **Payment**: Migrated from Stripe to Creem
- **Frontend**: Completely removed for performance
- **Architecture**: Clean API-only service with complete backend logic
- **Admin Access**: Use UUID '10086' for admin privileges in development