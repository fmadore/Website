# CookieConsent

The CookieConsent component displays a cookie consent banner to users who have not yet made a choice about accepting or declining cookies for analytics purposes.

## Description

This component is part of the GDPR compliance implementation for the website. It displays a fixed banner at the bottom of the screen asking for consent to use cookies, particularly for Google Analytics tracking. The user's choice is stored in localStorage to prevent the banner from appearing on subsequent visits.

## Usage

The CookieConsent component is automatically included in the main layout and requires no props.

```svelte
<script>
	import CookieConsent from '$lib/components/common/CookieConsent.svelte';
</script>

<CookieConsent />
```

## Features

- Shows only to users who haven't made a cookie preference choice
- Stores user preference in localStorage
- Automatic integration with Google Analytics (enables/disables based on user choice)
- Responsive design that works on all device sizes
- Reloads the page after accepting cookies to initialize analytics

## Implementation Details

The Google Analytics implementation uses the environment variable `VITE_GA_MEASUREMENT_ID` to store the tracking ID. This is defined in the `.env` file that should not be committed to version control.

When a user accepts cookies, the page reloads to initialize the Google Analytics tracking. The tracking code is conditionally loaded in the `app.html` file based on:

1. Whether the site is in production (not localhost)
2. Whether the user has accepted cookies or hasn't made a choice yet

## Accessibility

The component uses semantic HTML elements and follows accessibility best practices:

- Proper heading structure with h3
- High contrast text colors
- Keyboard accessible buttons
- Clear, simple language

## Related Components

- Button - Used for the accept/decline actions
