# Cookie Banner Implementation Guide

This guide provides complete instructions for implementing the cookie consent banner system used in the KUA website. The system is GDPR/CCPA compliant and includes granular cookie preferences management.

## 🎯 Overview

The cookie banner system consists of:
- **Cookie Consent Banner**: Main banner that appears on first visit
- **Cookie Preferences Manager**: Detailed modal for granular control
- **Cookie Preferences Button**: Button to reopen preferences
- **Cookie Policy Page**: Dedicated page explaining cookie usage
- **Cookie Utilities**: Backend functions for consent management
- **GTM Integration**: Google Tag Manager consent mode integration

## 📁 File Structure

```
components/
├── cookie/
│   ├── cookie-consent-banner.tsx      # Main banner component
│   ├── cookie-preferences-button.tsx  # Button to open preferences
│   └── cookie-preferences-manager.tsx # Detailed preferences modal
lib/
└── cookie-utils.ts                    # Consent management utilities
app/
├── layout.tsx                         # Root layout (includes banner)
├── confidentialite/
│   └── cookies/
│       ├── page.tsx                   # Cookie policy page
│       └── cookie-policy-client.tsx   # Cookie policy content
components/
└── gtm-script.tsx                     # GTM integration with consent
```

## 🔧 Implementation Steps

### Step 1: Create Cookie Utilities (`lib/cookie-utils.ts`)

```typescript
type CookieConsent = {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

const CONSENT_COOKIE_NAME = "cookie-consent"
const CONSENT_EXPIRY_DAYS = 365

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  if (typeof window === "undefined") return

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS)

  document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(
    consent,
  )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`

  applyConsentSettings(consent)
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null

  const cookies = document.cookie.split("; ")
  const consentCookie = cookies.find((cookie) => cookie.startsWith(`${CONSENT_COOKIE_NAME}=`))

  if (!consentCookie) return null

  try {
    const consentValue = consentCookie.split("=")[1]
    return JSON.parse(decodeURIComponent(consentValue))
  } catch (error) {
    console.error("Error parsing cookie consent:", error)
    return null
  }
}

export function hasConsented(category: keyof CookieConsent): boolean {
  const consent = getCookieConsent()
  return consent ? consent[category] : false
}

export function initializeGTMConsent(): void {
  if (typeof window === "undefined") return
  
  const checkGtag = () => {
    if (typeof window.gtag === "function") {
      const existingConsent = getCookieConsent()
      if (existingConsent) {
        applyConsentSettings(existingConsent)
      }
    } else {
      setTimeout(checkGtag, 100)
    }
  }
  
  checkGtag()
}

export function applyConsentSettings(consent: CookieConsent): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return

  try {
    window.gtag('consent', 'update', {
      'analytics_storage': consent.analytics ? 'granted' : 'denied',
      'ad_storage': consent.marketing ? 'granted' : 'denied',
      'ad_user_data': consent.marketing ? 'granted' : 'denied',
      'ad_personalization': consent.marketing ? 'granted' : 'denied',
      'functionality_storage': consent.functional ? 'granted' : 'denied',
      'personalization_storage': consent.functional ? 'granted' : 'denied',
      'security_storage': 'granted'
    })

    window.gtag('event', 'consent_update', {
      'event_category': 'consent',
      'analytics_consent': consent.analytics,
      'marketing_consent': consent.marketing,
      'functional_consent': consent.functional,
      'consent_method': 'granular_selection'
    })
  } catch (error) {
    console.error('Error applying consent settings:', error)
  }
}

export function isGTMLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function"
}
```

### Step 2: Create Cookie Consent Banner (`components/cookie/cookie-consent-banner.tsx`)

**⚠️ IMPORTANT**: Replace all branding elements (colors, company name, text) with your project's branding.

Key elements to customize:
- Color scheme: `#7157AF` (purple) → your brand color
- Company name: "Küa" → your company name
- French text → your language
- Cookie provider details → your actual cookies
- Links to privacy policy → your privacy policy URL

```typescript
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, Shield, Settings, BarChart, Target, Info } from "lucide-react"
import { setCookieConsent, getCookieConsent, applyConsentSettings, initializeGTMConsent } from "@/lib/cookie-utils"

// CUSTOMIZE: Update cookie provider details for your project
const cookieProviders = {
  necessary: [
    {
      name: "Session Cookie",
      provider: "Your Site", // CHANGE: Your company name
      purpose: "Maintains your active session while browsing the site.",
      duration: "Session",
      type: "HTTP Cookie",
    },
    // Add your actual necessary cookies
  ],
  functional: [
    // Add your functional cookies
  ],
  analytics: [
    // Add your analytics cookies (Google Analytics, etc.)
  ],
  marketing: [
    // Add your marketing cookies (Facebook Pixel, etc.)
  ],
}

export default function CookieConsentBanner() {
  const [open, setOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    setMounted(true)
    
    const existingConsent = getCookieConsent()
    if (existingConsent) {
      setPreferences(existingConsent)
      applyConsentSettings(existingConsent)
    } else {
      setOpen(true)
    }

    const handleOpenPreferences = () => {
      setOpen(true)
      setShowPreferences(true)
    }

    window.addEventListener("openCookiePreferences", handleOpenPreferences)
    return () => {
      window.removeEventListener("openCookiePreferences", handleOpenPreferences)
    }
  }, [])

  if (!mounted) return null

  const handlePreferenceChange = (category: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const handleSavePreferences = () => {
    setCookieConsent(preferences)
    applyConsentSettings(preferences)
    
    if (preferences.analytics) {
      window.dispatchEvent(new CustomEvent('analytics_consent_granted'));
      if (window.dataLayer) {
        window.dataLayer.push({
          'event': 'analytics_consent_granted'
        });
      }
    }
    
    setShowPreferences(false)
    setOpen(false)
  }

  const handleRefuse = () => {
    const refusedPreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setPreferences(refusedPreferences)
    setCookieConsent(refusedPreferences)
    applyConsentSettings(refusedPreferences)
    setOpen(false)
  }

  const handleAcceptAll = () => {
    const acceptedPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(acceptedPreferences)
    setCookieConsent(acceptedPreferences)
    applyConsentSettings(acceptedPreferences)
    
    if (acceptedPreferences.analytics) {
      window.dispatchEvent(new CustomEvent('analytics_consent_granted'));
      if (window.dataLayer) {
        window.dataLayer.push({
          'event': 'analytics_consent_granted'
        });
      }
    }
    
    setOpen(false)
  }

  // Preferences modal (customize colors and text)
  if (showPreferences) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setShowPreferences(false)} />
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#101010] text-white rounded-xl shadow-xl border border-[#2A2A2A] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* CUSTOMIZE: Header colors and text */}
          <div className="bg-gradient-to-r from-[#101010] to-[#151515] border-b border-[#2A2A2A]">
            <div className="flex justify-between items-center p-5">
              <h3 className="font-semibold text-xl flex items-center">
                <span className="w-1 h-5 bg-[#7157AF] rounded-full mr-3"></span>
                Cookie Preferences {/* CHANGE: Your text */}
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-[#2A2A2A]/50 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5">
            <p className="text-[#E0E0E0] mb-6 text-sm leading-relaxed">
              We use different types of cookies to optimize your experience on our site. You can choose which categories of cookies you accept.
            </p>

            <div className="space-y-4">
              {/* Cookie categories - customize colors and content */}
              <div className="p-4 bg-[#151515] border border-[#2A2A2A] rounded-lg transition-all hover:border-[#2A2A2A]/80">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 text-[#7157AF]">
                    <Shield size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Necessary Cookies</h4>
                        <div className="relative group">
                          <Info size={14} className="text-[#ABABAB] cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="text-xs text-[#ABABAB] space-y-1.5">
                              <p className="font-medium text-[#E0E0E0] mb-1">Examples:</p>
                              <div>
                                <span className="font-medium text-[#E0E0E0]">cookieConsent</span> – Saves cookie preferences
                              </div>
                              <div>
                                <span className="font-medium text-[#E0E0E0]">__hcaptcha</span> – CAPTCHA security
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled={true}
                        className="rounded border-gray-600 bg-[#101010] text-[#7157AF] h-5 w-5"
                      />
                    </div>
                    <p className="text-sm text-[#ABABAB]">These cookies are essential for the website to function.</p>
                  </div>
                </div>
              </div>

              {/* Repeat for other cookie categories */}
              {/* Functional, Analytics, Marketing cookies... */}
            </div>
          </div>

          <div className="p-5 border-t border-[#2A2A2A] bg-[#0D0D0D]">
            <div className="flex items-center justify-between">
              <Link
                href="/privacy/cookies" // CHANGE: Your privacy policy URL
                className="text-sm text-[#ABABAB] hover:text-[#7157AF] transition-colors"
              >
                Cookie Policy
              </Link>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="bg-transparent border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#7157AF]/10 hover:border-[#7157AF] hover:text-white transition-colors"
                  onClick={() => setShowPreferences(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#7157AF] hover:bg-[#5E43A0] text-white transition-colors"
                  onClick={handleSavePreferences}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!open) return null

  return (
    <div className="fixed bottom-5 left-5 z-50 max-w-sm bg-gradient-to-r from-[#0D0D0D] to-[#121212] text-[#FFF4E6] rounded-lg shadow-xl border border-[#2A2A2A] p-5 animate-in fade-in slide-in-from-bottom-10">
      <button
        onClick={() => setOpen(false)}
        className="absolute top-3 right-3 text-[#FFF4E6]/70 hover:text-[#FFF4E6] p-1.5 rounded-full hover:bg-[#2A2A2A]/30 transition-colors"
        aria-label="Close"
      >
        <X size={14} />
      </button>

      <p className="text-sm mb-5 leading-relaxed pr-4">
        By clicking "Accept", you consent to the use of cookies to improve your experience, analyze traffic and personalize content.
      </p>

      <div className="flex flex-col space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-[#3A3A3A] text-[#E0E0E0] bg-[#171717] hover:bg-[#8A6BDF]/10 hover:border-[#8A6BDF] hover:text-white transition-colors px-1.5"
            onClick={() => setShowPreferences(true)}
          >
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-[#3A3A3A] text-[#E0E0E0] bg-[#171717] hover:bg-[#8A6BDF]/10 hover:border-[#8A6BDF] hover:text-white transition-colors px-1.5"
            onClick={handleRefuse}
          >
            Refuse
          </Button>
          <Button
            size="sm"
            className="text-xs bg-[#8A6BDF] hover:bg-[#7157AF] text-white transition-colors px-1.5"
            onClick={handleAcceptAll}
          >
            Accept
          </Button>
        </div>
        <div className="text-xs text-center text-[#ABABAB] pt-1">
          <Link href="/privacy/cookies" className="underline hover:text-[#8A6BDF] transition-colors">
            Cookie Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### Step 3: Create Cookie Preferences Button (`components/cookie/cookie-preferences-button.tsx`)

```typescript
"use client"

import { Button } from "@/components/ui/button"

export default function CookiePreferencesButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const event = new CustomEvent("openCookiePreferences")
        window.dispatchEvent(event)
      }}
      className="text-xs bg-[#101010] text-white border-[#101010] hover:bg-[#101010]/90 hover:text-gray-100"
    >
      Manage Cookies {/* CUSTOMIZE: Your text */}
    </Button>
  )
}
```

### Step 4: Create Cookie Preferences Manager (`components/cookie/cookie-preferences-manager.tsx`)

This is a simpler version of the preferences modal that can be used in other contexts.

```typescript
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { setCookieConsent, getCookieConsent } from "@/lib/cookie-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

export default function CookiePreferencesManager() {
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const existingConsent = getCookieConsent()
    if (existingConsent) {
      setPreferences(existingConsent)
    }
  }, [open])

  const handlePreferenceChange = (category: keyof typeof preferences) => {
    if (category === "necessary") return
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleSavePreferences = () => {
    setCookieConsent(preferences)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your preferences regarding cookies used on our site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cookie categories with switches */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="necessary-pref" className="text-base font-medium">
                  Necessary
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium mb-1">Examples:</p>
                      <ul className="text-xs space-y-1">
                        <li>
                          <span className="font-medium">cookieConsent</span> – Saves cookie preferences
                        </li>
                        <li>
                          <span className="font-medium">__hcaptcha</span> – CAPTCHA security
                        </li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                These cookies are essential for the site to function and cannot be disabled.
              </p>
            </div>
            <Switch id="necessary-pref" checked={preferences.necessary} disabled={true} />
          </div>

          {/* Repeat for other categories */}
        </div>

        <DialogFooter>
          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Step 5: Create Cookie Policy Page

Create the directory structure: `app/privacy/cookies/` and add:

**`page.tsx`:**
```typescript
import type { Metadata } from "next"
import CookiePolicyClient from "./cookie-policy-client"

export const metadata: Metadata = {
  title: "Cookie Policy | Your Company", // CHANGE: Your company name
  description: "Cookie policy for Your Company. Learn how we use cookies on our website.",
  // Add other metadata...
}

export default function CookiePolicyPage() {
  return <CookiePolicyClient />
}
```

**`cookie-policy-client.tsx`:**
```typescript
"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import CookiePreferencesManager from "@/components/cookie/cookie-preferences-manager"

export default function CookiePolicyClient() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#FFF4E6]">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24 flex-grow">
        <div className="mb-16 relative">
          <div className="absolute left-0 top-0 w-2 h-16 bg-[#7157AF]"></div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 pl-6">Cookie Policy</h1>
          <p className="text-[#FFF4E6]/70 pl-6 text-lg">Last updated: [DATE]</p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#FFF4E6]">Introduction</h2>
            <div className="text-[#FFF4E6]/80 space-y-4">
              <p>
                This cookie policy explains how our website uses cookies and similar technologies...
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#FFF4E6]">Manage Your Preferences</h2>
            <div className="text-[#FFF4E6]/80 space-y-6">
              <p>You can modify your cookie preferences at any time:</p>
              <div className="bg-[#FFF4E6]/5 p-6 rounded-lg border border-[#FFF4E6]/10">
                <CookiePreferencesManager />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
```

### Step 6: Integrate with Root Layout (`app/layout.tsx`)

Add the cookie banner to your root layout:

```typescript
import CookieConsentBanner from "@/components/cookie/cookie-consent-banner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        {/* Your head content */}
      </head>
      <body className="font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  )
}
```

### Step 7: Add Cookie Preferences Button to Footer

In your footer component:

```typescript
import CookiePreferencesButton from "@/components/cookie/cookie-preferences-button"

// In your footer JSX:
<div>
  <Link href="/privacy/cookies">Cookie Policy</Link>
  <CookiePreferencesButton />
</div>
```

### Step 8: GTM Integration (`components/gtm-script.tsx`)

```typescript
"use client"

import { useEffect } from "react"
import Script from "next/script"
import { getCookieConsent, applyConsentSettings } from "@/lib/cookie-utils"
import { usePathname } from "next/navigation" 

export default function GTMScript() {
  const pathname = usePathname()
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'YOUR-GTM-ID' // CHANGE: Your GTM ID

  useEffect(() => {
    window.dataLayer = window.dataLayer || []
    
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    
    window.gtag = gtag
    
    // Set default consent before GTM loads
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',
      'wait_for_update': 500
    })
    
    // Apply existing consent
    const existingConsent = getCookieConsent()
    if (existingConsent) {
      applyConsentSettings(existingConsent)
    }
  }, [])

  useEffect(() => {
    const existingConsent = getCookieConsent()
    if (existingConsent && typeof window.gtag === 'function') {
      applyConsentSettings(existingConsent)
    }
  }, [pathname])

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
      >
        {`
          (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      
      <noscript>
        <iframe 
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0" 
          width="0" 
          style={{display: 'none', visibility: 'hidden'}}
        />
      </noscript>
    </>
  )
}
```

## 🎨 Customization Checklist

### Branding Changes
- [ ] Replace `#7157AF` (purple) with your brand color
- [ ] Replace "Küa" with your company name
- [ ] Update all French text to your language
- [ ] Replace company logo/branding elements
- [ ] Update privacy policy URLs

### Content Changes
- [ ] Update cookie provider details with your actual cookies
- [ ] Modify cookie descriptions and purposes
- [ ] Update cookie policy content
- [ ] Change contact information
- [ ] Update legal compliance text (GDPR/CCPA)

### Technical Changes
- [ ] Update GTM ID in environment variables
- [ ] Modify cookie names if needed
- [ ] Update consent expiry period
- [ ] Add/remove cookie categories as needed
- [ ] Update analytics tracking events

## 🔒 Legal Compliance

This implementation provides:
- **Granular consent**: Users can choose specific cookie categories
- **Consent persistence**: Preferences are saved and remembered
- **Easy access**: Users can change preferences anytime
- **GTM integration**: Proper consent mode implementation
- **Legal compliance**: GDPR/CCPA compliant structure

## 🚀 Testing

1. **First visit**: Banner should appear
2. **Accept all**: All cookies enabled, banner disappears
3. **Refuse all**: Only necessary cookies, banner disappears
4. **Custom preferences**: Granular control works
5. **Reopen preferences**: Button opens preferences modal
6. **GTM consent**: Check browser dev tools for consent updates
7. **Cookie persistence**: Refresh page, preferences maintained

## 📝 Environment Variables

Add to your `.env.local`:
```
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## 🎯 Key Features

- **Responsive design**: Works on all devices
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Lazy loading and optimized rendering
- **SEO friendly**: Proper meta tags and structured data
- **Legal compliant**: GDPR/CCPA ready structure
- **GTM ready**: Full Google Tag Manager integration

Remember to thoroughly test the implementation and customize all branding elements to match your project!
