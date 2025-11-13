# Google Search Console Issues - Fixes Applied

## Issues Identified

1. **Alternate page with proper canonical tag** (8 affected pages)
   - Google was seeing both `www.constructionstemarie.ca` and `constructionstemarie.ca` versions
   - Pages were being treated as alternates with canonical tags

2. **Page with redirect** (1 affected page)
   - `http://constructionstemarie.ca/` (non-HTTPS) was not properly redirecting

3. **Crawled - currently not indexed** (2 affected pages)
   - `https://constructionstemarie.ca/renovation-joliette`
   - `https://constructionstemarie.ca/services/agrandissement-de-maison`
   - Likely caused by canonical/redirect issues

## Fixes Applied

### 1. Added Redirects in `vercel.json`

Added permanent 301 redirects to ensure all variations redirect to the canonical HTTPS non-www version:

```json
"redirects": [
  {
    "source": "/:path*",
    "has": [
      {
        "type": "host",
        "value": "www.constructionstemarie.ca"
      }
    ],
    "destination": "https://constructionstemarie.ca/:path*",
    "permanent": true
  },
  {
    "source": "/:path*",
    "has": [
      {
        "type": "header",
        "key": "x-forwarded-proto",
        "value": "http"
      }
    ],
    "destination": "https://constructionstemarie.ca/:path*",
    "permanent": true
  }
]
```

**What this does:**
- Redirects `www.constructionstemarie.ca/*` → `https://constructionstemarie.ca/*`
- Redirects `http://constructionstemarie.ca/*` → `https://constructionstemarie.ca/*`
- All redirects are permanent (301) for SEO

### 2. Verified Canonical Tags

All pages already have correct self-referencing canonical tags pointing to `https://constructionstemarie.ca/[path]` (non-www version).

### 3. Verified Sitemap

The `sitemap.xml` uses the correct canonical URLs (non-www, HTTPS).

## Expected Results

After deployment and Google re-crawling:

1. **Alternate page with proper canonical tag** - Should resolve as all www versions redirect to non-www
2. **Page with redirect** - Should resolve as HTTP redirects to HTTPS
3. **Crawled - currently not indexed** - Should resolve once canonical/redirect issues are fixed

## Next Steps

1. **Deploy to Vercel** - The redirects will take effect after deployment
2. **Request Re-indexing** - In Google Search Console:
   - Go to each affected page
   - Click "Request Indexing"
   - Or use the "Validate Fix" button in the issue reports
3. **Monitor** - Check Google Search Console in 1-2 weeks to see if issues are resolved

## Timeline

- **Immediate**: Redirects will work after deployment
- **1-2 weeks**: Google will re-crawl and update index
- **2-4 weeks**: Issues should be fully resolved in Search Console

## Notes

- All canonical tags use `https://constructionstemarie.ca/` (non-www) as the canonical version
- This is the correct approach - choose one version (non-www) and redirect all others to it
- The redirects ensure Google only indexes the canonical version

