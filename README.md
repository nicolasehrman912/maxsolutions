# Max Solutions App

## ZECAT API Migration Guide

The application has been updated to use ZECAT API v2.0. Here are the key changes:

### Authentication
- API 2.0 requires authentication via Bearer token in the Authorization header
- Token needs to be requested from api@zecat.com
- Add the token to your .env.local file as NEXT_PUBLIC_ZECAT_API_TOKEN

### API Endpoints
- Base URL changed from https://api.zecatdifapro.com/ to https://api.zecat.com/v1/
- Individual endpoint paths remain the same

### Testing
- Use https://api-preprod.zecat.com/v1/ for testing
- Request a test token from api@zecat.com

### Data Structure
- The object structure is similar but includes additional fields
- Variants now include images and quantity-based discounts
- Printing areas and types are more separated, linked by printingTypeConfigurations
- Family objects have more marketing attributes (video, icon, promo text)

## Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

## Environment Setup
Create a .env.local file in the root directory with the following:

```
NEXT_PUBLIC_ZECAT_API_TOKEN=your_token_here
``` 