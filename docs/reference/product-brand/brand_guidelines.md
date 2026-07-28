# Brand & Design Guidelines

---

## Page Layout

All content pages use a centered max-width container, matching the Polaris `.Polaris-Page` pattern. This keeps content readable at large viewport widths and gives the app a composed, card-focused feel.

### Rule

Every view that renders standard page content (cards, tables, forms) MUST wrap its root element with:

```tsx
<div className="mx-auto w-full max-w-5xl flex flex-col gap-6 p-6">
```

- **`max-w-5xl`** (64 rem / 1024 px) — standard page content width
- **`mx-auto`** — horizontal centering within the `<main>` area
- **`w-full`** — fills up to the max-width
- **`p-6`** — consistent 24 px inset on all sides
- **`flex flex-col gap-6`** — vertical rhythm between sections

### Narrower variants (form/settings pages)

Pages whose content is intrinsically narrow (profile, settings, forms) may use a smaller cap:

| Page type          | Max width   | Tailwind class  |
|--------------------|-------------|-----------------|
| Standard page      | 64 rem      | `max-w-5xl`     |
| Settings / forms   | 42 rem      | `max-w-2xl`     |
| Single-field forms | 32 rem      | `max-w-xl`      |

### Exempt views (full-width by design)

These views intentionally span the full content area and must NOT have a max-width container:

- **PipelineBuilderView** — canvas / node editor
- **FileArchiveView** — dual-panel file browser
- **ChatAssistantView** — full-height chat interface
- **BookkeepingReviewView** — resizable panel editor

---

## Color Palette

Split Complimentary Colors
Color	Hex	RGB
#ee8fe0	(238,143,224)
#b0ee8f	(176,238,143)
#eedd8f	(238,221,143)
#bbbbbb	(187,187,187)
#aaaaaa	(170,170,170)

Visual Design Layout Main  (Disregard Colors, just website layout is important here):

element.style {
}
@media screen and (min-width: 75em) {
    .Polaris-Frame--hasSidebar .Polaris-Frame__Main {
        padding-inline-end: calc(var(--pc-sidebar-width) + var(--pc-frame-main-padding-right-from-env, 0));
    }
}
.Polaris-Frame--hasTopBar .Polaris-Frame__Main {
    border-start-start-radius: var(--p-border-radius-300);
    border-start-end-radius: var(--p-border-radius-300);
    margin-top: var(--pg-top-bar-height);
    padding-top: 0;
}
@media (min-width: 48em) {
    .Polaris-Frame--hasNav .Polaris-Frame__Main {
        padding-inline-start: var(--pg-layout-width-nav-base);
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + constant(safe-area-inset-left));
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + env(safe-area-inset-left));
    }
}
.Polaris-Frame__NoScrollbarGutterLine {
    border-inline-end: none;
}
.Polaris-Frame__Main {
    padding-inline-start: 0;
    padding-inline-start: constant(safe-area-inset-left);
    padding-inline-start: env(safe-area-inset-left);
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
@media (min-width: 30.625em) {
    .Polaris-Frame__Main {
        max-width: unset;
    }
}
.Polaris-Frame__Main {
    --pc-frame-main-padding-right-from-env: env(safe-area-inset-right);
    flex: 1 1;
    display: flex;
    align-items: stretch;
    min-width: 0;
    border-inline-end: none;
    background-color: var(--p-color-bg);
    height: 100%;
    overflow: hidden;
    transition: padding var(--p-motion-duration-0) linear var(--p-motion-duration-50);
    padding-inline-end: var(--pc-frame-main-padding-right-from-env, 0);
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
user agent stylesheet
main {
    display: block;
    unicode-bidi: isolate;
}
style attribute {
    --pc-sidebar-width-base: 450px;
}
.Polaris-Frame.Polaris-Frame--notFullScreen {
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-100));
    --pc-scrollbar-spacer: 0;
    background-color: var(--p-color-bg-inverse);
    transition: width var(--p-motion-duration-250) var(--p-motion-ease);
}
.Polaris-Frame {
    --pc-frame-button-size: var(--p-space-800);
    --pc-sidebar-width-base: 22.25rem;
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-400));
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    background-color: var(--p-color-bg);
}
._AppFrame_1k9ev_28 {
    scrollbar-color: auto;
    background-color: var(--p-color-bg-inverse);
}
style attribute {
    overflow: hidden;
    background-color: var(--p-color-bg);
    color: var(--p-color-text);
    --universal-sidebar-width: 450px;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
style attribute {
    --vsc-domain: "admin.shopify.com";
    --pc-frame-global-ribbon-height: 0px;
    --pc-frame-offset: 0px;
    --pc-app-provider-scrollbar-width: 11px;
    --pc-checkbox-offset: 38px;
}
:root {
    --inventory-list-activator-cell-min-width: 8.875rem;
}
:root {
    --cell-activator-horizontal-spacing: var(--p-space-200);
    --cell-activator-border-width: .125rem;
}
:root {
    --locations-table-cell-vertical-padding: var(--p-space-300);
    --locations-table-cell-horizontal-padding: var(--p-space-200);
    --locations-table-activator-icon-width: var(--p-space-500);
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --celebration-static-banner-bg: var(--p-color-bg-surface);
    --celebration-static-banner-color: var(--p-color-text);
}
:root {
    --universal-sidebar-width: 22.25rem;
}
:root {
    --image-dimensions: 15rem;
    --narrow-image-dimensions: 11.25rem;
    --padding: 1.25rem;
    --column-gap: 1.25rem;
    --column-width: var(--image-dimensions);
    --two-column-width: calc(var(--column-width) * 2);
    --width-when-column-wraps: calc(var(--two-column-width) + var(--column-gap) + var(--padding) * 2 - .0625rem);
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --keyword-token-color: #003a5a;
    --column-token-color: #086b5a;
    --bracket-token-color: #8a8a8a;
    --comment-token-color: #8a8a8a;
    --default-font-stack: "GeistMonoRegular", "Monaco", "Consolas", "monospace";
}
:root {
    --polaris-version-number: "{{POLARIS_VERSION}}";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
:root {
    --osui-nav-item-interior-padding: var(--p-space-200);
    --osui_nav-action-connected-button-width: 1.75rem;
    --osui_nav-action-connected-button-width-slim: 1.25rem;
    --osui_nav-action-common-prefix-size: 1.25rem;
    --osui_nav-action-common-prefix-gap: var(--p-space-200);
    --osui-nav-item-alignment-none: 0;
    --osui-nav-item-alignment-base-tight: var(--p-space-300);
    --osui_nav-item-alignment-common-icon: calc(var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap) + var(--osui-nav-item-alignment-base-tight));
    --osui_nav-item-alignment-common-action-with-icon: calc(var(--osui_nav-action-connected-button-width-slim) + var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap));
    --osui_nav-item-alignment-nested-offset: var(--p-space-100);
}
:root {
    --floating-controls-wrapper-height: 5rem;
    --ask-sidekick-field-height: 2.75rem;
    --animation-bezier: cubic-bezier(.2, .8, 0, 1);
    --osw-z-index-floating-controls: 3;
}
:root {
    --editable-text-border-radius: var(--p-border-radius-200);
    --editable-text-padding: var(--p-space-100) var(--p-space-150);
}
:root {
    --item-min-height: var(--p-space-400);
    --item-min-width: 3.125rem;
    --item-vertical-padding: var(--p-space-200);
}
:root {
    --pc-toast-manager-translate-y-out: 9.375rem;
    --pc-toast-manager-translate-y-in: 0;
    --pc-toast-manager-scale-in: 1;
    --pc-toast-manager-scale-out: .9;
    --pc-toast-manager-blur-in: 0;
    --pc-toast-manager-transition-delay-in: 0s;
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --polaris-version-number: "25.59.0-admin-web.8b88454";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-bottom-bar-max-height: 21.875rem;
    --pg-bottom-bar-height: 0rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
constructed stylesheet
html, slot {
    --t-test-26021: blue;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
<style>
@font-face {
    font-family: Inter;
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(InterVariable-cyrillic-ext-1751944278923.woff2) format('woff2');
    unicode-range: U +0460 -052F, U +1C80 -1C8A, U +20B4, U +2DE0 -2DFF, U + A640-A69F, U + FE2E-FE2F;
}
<style>
--sidekick-input-end-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
<style>
--gradient-degree {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--sidekick-input-start-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
constructed stylesheet
--s-scrollbox-thumb-color-26021 {
    syntax: "<color>";
    inherits: true;
    initial-value: #000;
}
<style>
--angle1 {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--background-color3 {
    syntax: "<color>";
    inherits: false;
    initial-value: #000000;
}
<style>
--gradient-stop {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 20%;
}
<style>
--chat-glow-angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle2 {
    syntax: "<angle>";
    inherits: false;
    initial-value: -180deg;
}
<style>
--background-color2 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}
<style>
--background-color1 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}

UI Component Styling: 

element.style {
}
@media screen and (min-width: 75em) {
    .Polaris-Frame--hasSidebar .Polaris-Frame__Main {
        padding-inline-end: calc(var(--pc-sidebar-width) + var(--pc-frame-main-padding-right-from-env, 0));
    }
}
.Polaris-Frame--hasTopBar .Polaris-Frame__Main {
    border-start-start-radius: var(--p-border-radius-300);
    border-start-end-radius: var(--p-border-radius-300);
    margin-top: var(--pg-top-bar-height);
    padding-top: 0;
}
@media (min-width: 48em) {
    .Polaris-Frame--hasNav .Polaris-Frame__Main {
        padding-inline-start: var(--pg-layout-width-nav-base);
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + constant(safe-area-inset-left));
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + env(safe-area-inset-left));
    }
}
.Polaris-Frame__NoScrollbarGutterLine {
    border-inline-end: none;
}
.Polaris-Frame__Main {
    padding-inline-start: 0;
    padding-inline-start: constant(safe-area-inset-left);
    padding-inline-start: env(safe-area-inset-left);
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
@media (min-width: 30.625em) {
    .Polaris-Frame__Main {
        max-width: unset;
    }
}
.Polaris-Frame__Main {
    --pc-frame-main-padding-right-from-env: env(safe-area-inset-right);
    flex: 1 1;
    display: flex;
    align-items: stretch;
    min-width: 0;
    border-inline-end: none;
    background-color: var(--p-color-bg);
    height: 100%;
    overflow: hidden;
    transition: padding var(--p-motion-duration-0) linear var(--p-motion-duration-50);
    padding-inline-end: var(--pc-frame-main-padding-right-from-env, 0);
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
user agent stylesheet
main {
    display: block;
    unicode-bidi: isolate;
}
style attribute {
    --pc-sidebar-width-base: 450px;
}
.Polaris-Frame.Polaris-Frame--notFullScreen {
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-100));
    --pc-scrollbar-spacer: 0;
    background-color: var(--p-color-bg-inverse);
    transition: width var(--p-motion-duration-250) var(--p-motion-ease);
}
.Polaris-Frame {
    --pc-frame-button-size: var(--p-space-800);
    --pc-sidebar-width-base: 22.25rem;
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-400));
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    background-color: var(--p-color-bg);
}
._AppFrame_1k9ev_28 {
    scrollbar-color: auto;
    background-color: var(--p-color-bg-inverse);
}
style attribute {
    overflow: hidden;
    background-color: var(--p-color-bg);
    color: var(--p-color-text);
    --universal-sidebar-width: 450px;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
style attribute {
    --vsc-domain: "admin.shopify.com";
    --pc-frame-global-ribbon-height: 0px;
    --pc-frame-offset: 0px;
    --pc-app-provider-scrollbar-width: 11px;
    --pc-checkbox-offset: 38px;
}
:root {
    --inventory-list-activator-cell-min-width: 8.875rem;
}
:root {
    --cell-activator-horizontal-spacing: var(--p-space-200);
    --cell-activator-border-width: .125rem;
}
:root {
    --locations-table-cell-vertical-padding: var(--p-space-300);
    --locations-table-cell-horizontal-padding: var(--p-space-200);
    --locations-table-activator-icon-width: var(--p-space-500);
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --celebration-static-banner-bg: var(--p-color-bg-surface);
    --celebration-static-banner-color: var(--p-color-text);
}
:root {
    --universal-sidebar-width: 22.25rem;
}
:root {
    --image-dimensions: 15rem;
    --narrow-image-dimensions: 11.25rem;
    --padding: 1.25rem;
    --column-gap: 1.25rem;
    --column-width: var(--image-dimensions);
    --two-column-width: calc(var(--column-width) * 2);
    --width-when-column-wraps: calc(var(--two-column-width) + var(--column-gap) + var(--padding) * 2 - .0625rem);
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --keyword-token-color: #003a5a;
    --column-token-color: #086b5a;
    --bracket-token-color: #8a8a8a;
    --comment-token-color: #8a8a8a;
    --default-font-stack: "GeistMonoRegular", "Monaco", "Consolas", "monospace";
}
:root {
    --polaris-version-number: "{{POLARIS_VERSION}}";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
:root {
    --osui-nav-item-interior-padding: var(--p-space-200);
    --osui_nav-action-connected-button-width: 1.75rem;
    --osui_nav-action-connected-button-width-slim: 1.25rem;
    --osui_nav-action-common-prefix-size: 1.25rem;
    --osui_nav-action-common-prefix-gap: var(--p-space-200);
    --osui-nav-item-alignment-none: 0;
    --osui-nav-item-alignment-base-tight: var(--p-space-300);
    --osui_nav-item-alignment-common-icon: calc(var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap) + var(--osui-nav-item-alignment-base-tight));
    --osui_nav-item-alignment-common-action-with-icon: calc(var(--osui_nav-action-connected-button-width-slim) + var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap));
    --osui_nav-item-alignment-nested-offset: var(--p-space-100);
}
:root {
    --floating-controls-wrapper-height: 5rem;
    --ask-sidekick-field-height: 2.75rem;
    --animation-bezier: cubic-bezier(.2, .8, 0, 1);
    --osw-z-index-floating-controls: 3;
}
:root {
    --editable-text-border-radius: var(--p-border-radius-200);
    --editable-text-padding: var(--p-space-100) var(--p-space-150);
}
:root {
    --item-min-height: var(--p-space-400);
    --item-min-width: 3.125rem;
    --item-vertical-padding: var(--p-space-200);
}
:root {
    --pc-toast-manager-translate-y-out: 9.375rem;
    --pc-toast-manager-translate-y-in: 0;
    --pc-toast-manager-scale-in: 1;
    --pc-toast-manager-scale-out: .9;
    --pc-toast-manager-blur-in: 0;
    --pc-toast-manager-transition-delay-in: 0s;
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --polaris-version-number: "25.59.0-admin-web.8b88454";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-bottom-bar-max-height: 21.875rem;
    --pg-bottom-bar-height: 0rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
constructed stylesheet
html, slot {
    --t-test-26021: blue;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
<style>
@font-face {
    font-family: Inter;
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(InterVariable-cyrillic-ext-1751944278923.woff2) format('woff2');
    unicode-range: U +0460 -052F, U +1C80 -1C8A, U +20B4, U +2DE0 -2DFF, U + A640-A69F, U + FE2E-FE2F;
}
<style>
--sidekick-input-end-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
<style>
--gradient-degree {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--sidekick-input-start-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
constructed stylesheet
--s-scrollbox-thumb-color-26021 {
    syntax: "<color>";
    inherits: true;
    initial-value: #000;
}
<style>
--angle1 {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--background-color3 {
    syntax: "<color>";
    inherits: false;
    initial-value: #000000;
}
<style>
--gradient-stop {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 20%;
}
<style>
--chat-glow-angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle2 {
    syntax: "<angle>";
    inherits: false;
    initial-value: -180deg;
}
<style>
--background-color2 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}
<style>
--background-color1 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}

Side Bar Styling: 

element.style {
}
@media screen and (min-width: 75em) {
    .Polaris-Frame--hasSidebar .Polaris-Frame__Main {
        padding-inline-end: calc(var(--pc-sidebar-width) + var(--pc-frame-main-padding-right-from-env, 0));
    }
}
.Polaris-Frame--hasTopBar .Polaris-Frame__Main {
    border-start-start-radius: var(--p-border-radius-300);
    border-start-end-radius: var(--p-border-radius-300);
    margin-top: var(--pg-top-bar-height);
    padding-top: 0;
}
@media (min-width: 48em) {
    .Polaris-Frame--hasNav .Polaris-Frame__Main {
        padding-inline-start: var(--pg-layout-width-nav-base);
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + constant(safe-area-inset-left));
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + env(safe-area-inset-left));
    }
}
.Polaris-Frame__NoScrollbarGutterLine {
    border-inline-end: none;
}
.Polaris-Frame__Main {
    padding-inline-start: 0;
    padding-inline-start: constant(safe-area-inset-left);
    padding-inline-start: env(safe-area-inset-left);
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
@media (min-width: 30.625em) {
    .Polaris-Frame__Main {
        max-width: unset;
    }
}
.Polaris-Frame__Main {
    --pc-frame-main-padding-right-from-env: env(safe-area-inset-right);
    flex: 1 1;
    display: flex;
    align-items: stretch;
    min-width: 0;
    border-inline-end: none;
    background-color: var(--p-color-bg);
    height: 100%;
    overflow: hidden;
    transition: padding var(--p-motion-duration-0) linear var(--p-motion-duration-50);
    padding-inline-end: var(--pc-frame-main-padding-right-from-env, 0);
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
user agent stylesheet
main {
    display: block;
    unicode-bidi: isolate;
}
style attribute {
    --pc-sidebar-width-base: 450px;
}
.Polaris-Frame.Polaris-Frame--notFullScreen {
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-100));
    --pc-scrollbar-spacer: 0;
    background-color: var(--p-color-bg-inverse);
    transition: width var(--p-motion-duration-250) var(--p-motion-ease);
}
.Polaris-Frame {
    --pc-frame-button-size: var(--p-space-800);
    --pc-sidebar-width-base: 22.25rem;
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-400));
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    background-color: var(--p-color-bg);
}
._AppFrame_1k9ev_28 {
    scrollbar-color: auto;
    background-color: var(--p-color-bg-inverse);
}
style attribute {
    overflow: hidden;
    background-color: var(--p-color-bg);
    color: var(--p-color-text);
    --universal-sidebar-width: 450px;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
style attribute {
    --vsc-domain: "admin.shopify.com";
    --pc-frame-global-ribbon-height: 0px;
    --pc-frame-offset: 0px;
    --pc-app-provider-scrollbar-width: 11px;
    --pc-checkbox-offset: 38px;
}
:root {
    --inventory-list-activator-cell-min-width: 8.875rem;
}
:root {
    --cell-activator-horizontal-spacing: var(--p-space-200);
    --cell-activator-border-width: .125rem;
}
:root {
    --locations-table-cell-vertical-padding: var(--p-space-300);
    --locations-table-cell-horizontal-padding: var(--p-space-200);
    --locations-table-activator-icon-width: var(--p-space-500);
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --celebration-static-banner-bg: var(--p-color-bg-surface);
    --celebration-static-banner-color: var(--p-color-text);
}
:root {
    --universal-sidebar-width: 22.25rem;
}
:root {
    --image-dimensions: 15rem;
    --narrow-image-dimensions: 11.25rem;
    --padding: 1.25rem;
    --column-gap: 1.25rem;
    --column-width: var(--image-dimensions);
    --two-column-width: calc(var(--column-width) * 2);
    --width-when-column-wraps: calc(var(--two-column-width) + var(--column-gap) + var(--padding) * 2 - .0625rem);
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --keyword-token-color: #003a5a;
    --column-token-color: #086b5a;
    --bracket-token-color: #8a8a8a;
    --comment-token-color: #8a8a8a;
    --default-font-stack: "GeistMonoRegular", "Monaco", "Consolas", "monospace";
}
:root {
    --polaris-version-number: "{{POLARIS_VERSION}}";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
:root {
    --osui-nav-item-interior-padding: var(--p-space-200);
    --osui_nav-action-connected-button-width: 1.75rem;
    --osui_nav-action-connected-button-width-slim: 1.25rem;
    --osui_nav-action-common-prefix-size: 1.25rem;
    --osui_nav-action-common-prefix-gap: var(--p-space-200);
    --osui-nav-item-alignment-none: 0;
    --osui-nav-item-alignment-base-tight: var(--p-space-300);
    --osui_nav-item-alignment-common-icon: calc(var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap) + var(--osui-nav-item-alignment-base-tight));
    --osui_nav-item-alignment-common-action-with-icon: calc(var(--osui_nav-action-connected-button-width-slim) + var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap));
    --osui_nav-item-alignment-nested-offset: var(--p-space-100);
}
:root {
    --floating-controls-wrapper-height: 5rem;
    --ask-sidekick-field-height: 2.75rem;
    --animation-bezier: cubic-bezier(.2, .8, 0, 1);
    --osw-z-index-floating-controls: 3;
}
:root {
    --editable-text-border-radius: var(--p-border-radius-200);
    --editable-text-padding: var(--p-space-100) var(--p-space-150);
}
:root {
    --item-min-height: var(--p-space-400);
    --item-min-width: 3.125rem;
    --item-vertical-padding: var(--p-space-200);
}
:root {
    --pc-toast-manager-translate-y-out: 9.375rem;
    --pc-toast-manager-translate-y-in: 0;
    --pc-toast-manager-scale-in: 1;
    --pc-toast-manager-scale-out: .9;
    --pc-toast-manager-blur-in: 0;
    --pc-toast-manager-transition-delay-in: 0s;
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --polaris-version-number: "25.59.0-admin-web.8b88454";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-bottom-bar-max-height: 21.875rem;
    --pg-bottom-bar-height: 0rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
constructed stylesheet
html, slot {
    --t-test-26021: blue;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
<style>
@font-face {
    font-family: Inter;
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(InterVariable-cyrillic-ext-1751944278923.woff2) format('woff2');
    unicode-range: U +0460 -052F, U +1C80 -1C8A, U +20B4, U +2DE0 -2DFF, U + A640-A69F, U + FE2E-FE2F;
}
<style>
--sidekick-input-end-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
<style>
--gradient-degree {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--sidekick-input-start-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
constructed stylesheet
--s-scrollbox-thumb-color-26021 {
    syntax: "<color>";
    inherits: true;
    initial-value: #000;
}
<style>
--angle1 {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--background-color3 {
    syntax: "<color>";
    inherits: false;
    initial-value: #000000;
}
<style>
--gradient-stop {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 20%;
}
<style>
--chat-glow-angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle2 {
    syntax: "<angle>";
    inherits: false;
    initial-value: -180deg;
}
<style>
--background-color2 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}
<style>
--background-color1 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}

Data Tables and Main pages information presentation: 

element.style {
}
@media screen and (min-width: 75em) {
    .Polaris-Frame--hasSidebar .Polaris-Frame__Main {
        padding-inline-end: calc(var(--pc-sidebar-width) + var(--pc-frame-main-padding-right-from-env, 0));
    }
}
.Polaris-Frame--hasTopBar .Polaris-Frame__Main {
    border-start-start-radius: var(--p-border-radius-300);
    border-start-end-radius: var(--p-border-radius-300);
    margin-top: var(--pg-top-bar-height);
    padding-top: 0;
}
@media (min-width: 48em) {
    .Polaris-Frame--hasNav .Polaris-Frame__Main {
        padding-inline-start: var(--pg-layout-width-nav-base);
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + constant(safe-area-inset-left));
        padding-inline-start: calc(var(--pg-layout-width-nav-base) + env(safe-area-inset-left));
    }
}
.Polaris-Frame__NoScrollbarGutterLine {
    border-inline-end: none;
}
.Polaris-Frame__Main {
    padding-inline-start: 0;
    padding-inline-start: constant(safe-area-inset-left);
    padding-inline-start: env(safe-area-inset-left);
    padding-bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
@media (min-width: 30.625em) {
    .Polaris-Frame__Main {
        max-width: unset;
    }
}
.Polaris-Frame__Main {
    --pc-frame-main-padding-right-from-env: env(safe-area-inset-right);
    flex: 1 1;
    display: flex;
    align-items: stretch;
    min-width: 0;
    border-inline-end: none;
    background-color: var(--p-color-bg);
    height: 100%;
    overflow: hidden;
    transition: padding var(--p-motion-duration-0) linear var(--p-motion-duration-50);
    padding-inline-end: var(--pc-frame-main-padding-right-from-env, 0);
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
user agent stylesheet
main {
    display: block;
    unicode-bidi: isolate;
}
style attribute {
    --pc-sidebar-width-base: 450px;
}
.Polaris-Frame.Polaris-Frame--notFullScreen {
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-100));
    --pc-scrollbar-spacer: 0;
    background-color: var(--p-color-bg-inverse);
    transition: width var(--p-motion-duration-250) var(--p-motion-ease);
}
.Polaris-Frame {
    --pc-frame-button-size: var(--p-space-800);
    --pc-sidebar-width-base: 22.25rem;
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-400));
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    background-color: var(--p-color-bg);
}
._AppFrame_1k9ev_28 {
    scrollbar-color: auto;
    background-color: var(--p-color-bg-inverse);
}
style attribute {
    overflow: hidden;
    background-color: var(--p-color-bg);
    color: var(--p-color-text);
    --universal-sidebar-width: 450px;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
style attribute {
    --vsc-domain: "admin.shopify.com";
    --pc-frame-global-ribbon-height: 0px;
    --pc-frame-offset: 0px;
    --pc-app-provider-scrollbar-width: 11px;
    --pc-checkbox-offset: 38px;
}
:root {
    --inventory-list-activator-cell-min-width: 8.875rem;
}
:root {
    --cell-activator-horizontal-spacing: var(--p-space-200);
    --cell-activator-border-width: .125rem;
}
:root {
    --locations-table-cell-vertical-padding: var(--p-space-300);
    --locations-table-cell-horizontal-padding: var(--p-space-200);
    --locations-table-activator-icon-width: var(--p-space-500);
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --celebration-static-banner-bg: var(--p-color-bg-surface);
    --celebration-static-banner-color: var(--p-color-text);
}
:root {
    --universal-sidebar-width: 22.25rem;
}
:root {
    --image-dimensions: 15rem;
    --narrow-image-dimensions: 11.25rem;
    --padding: 1.25rem;
    --column-gap: 1.25rem;
    --column-width: var(--image-dimensions);
    --two-column-width: calc(var(--column-width) * 2);
    --width-when-column-wraps: calc(var(--two-column-width) + var(--column-gap) + var(--padding) * 2 - .0625rem);
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --keyword-token-color: #003a5a;
    --column-token-color: #086b5a;
    --bracket-token-color: #8a8a8a;
    --comment-token-color: #8a8a8a;
    --default-font-stack: "GeistMonoRegular", "Monaco", "Consolas", "monospace";
}
:root {
    --polaris-version-number: "{{POLARIS_VERSION}}";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
:root {
    --osui-nav-item-interior-padding: var(--p-space-200);
    --osui_nav-action-connected-button-width: 1.75rem;
    --osui_nav-action-connected-button-width-slim: 1.25rem;
    --osui_nav-action-common-prefix-size: 1.25rem;
    --osui_nav-action-common-prefix-gap: var(--p-space-200);
    --osui-nav-item-alignment-none: 0;
    --osui-nav-item-alignment-base-tight: var(--p-space-300);
    --osui_nav-item-alignment-common-icon: calc(var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap) + var(--osui-nav-item-alignment-base-tight));
    --osui_nav-item-alignment-common-action-with-icon: calc(var(--osui_nav-action-connected-button-width-slim) + var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap));
    --osui_nav-item-alignment-nested-offset: var(--p-space-100);
}
:root {
    --floating-controls-wrapper-height: 5rem;
    --ask-sidekick-field-height: 2.75rem;
    --animation-bezier: cubic-bezier(.2, .8, 0, 1);
    --osw-z-index-floating-controls: 3;
}
:root {
    --editable-text-border-radius: var(--p-border-radius-200);
    --editable-text-padding: var(--p-space-100) var(--p-space-150);
}
:root {
    --item-min-height: var(--p-space-400);
    --item-min-width: 3.125rem;
    --item-vertical-padding: var(--p-space-200);
}
:root {
    --pc-toast-manager-translate-y-out: 9.375rem;
    --pc-toast-manager-translate-y-in: 0;
    --pc-toast-manager-scale-in: 1;
    --pc-toast-manager-scale-out: .9;
    --pc-toast-manager-blur-in: 0;
    --pc-toast-manager-transition-delay-in: 0s;
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --polaris-version-number: "25.59.0-admin-web.8b88454";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-bottom-bar-max-height: 21.875rem;
    --pg-bottom-bar-height: 0rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
constructed stylesheet
html, slot {
    --t-test-26021: blue;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
<style>
@font-face {
    font-family: Inter;
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(InterVariable-cyrillic-ext-1751944278923.woff2) format('woff2');
    unicode-range: U +0460 -052F, U +1C80 -1C8A, U +20B4, U +2DE0 -2DFF, U + A640-A69F, U + FE2E-FE2F;
}
<style>
--sidekick-input-end-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
<style>
--gradient-degree {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--sidekick-input-start-fade {
    syntax: "<length>";
    inherits: false;
    initial-value: 0;
}
constructed stylesheet
--s-scrollbox-thumb-color-26021 {
    syntax: "<color>";
    inherits: true;
    initial-value: #000;
}
<style>
--angle1 {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--background-color3 {
    syntax: "<color>";
    inherits: false;
    initial-value: #000000;
}
<style>
--gradient-stop {
    syntax: "<percentage>";
    inherits: false;
    initial-value: 20%;
}
<style>
--chat-glow-angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
}
<style>
--angle2 {
    syntax: "<angle>";
    inherits: false;
    initial-value: -180deg;
}
<style>
--background-color2 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}
<style>
--background-color1 {
    syntax: "<color>";
    inherits: false;
    initial-value: #06171a;
}

Smaller UI components: 

lement.style {
}
.Polaris-Text--medium {
    font-weight: var(--p-font-weight-medium);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    .Polaris-Text--bodySm {
        font-size: var(--p-font-size-300);
        letter-spacing: var(--p-font-letter-spacing-normal);
        line-height: var(--p-font-line-height-400);
    }
}
.Polaris-Text--bodySm {
    font-size: var(--p-font-size-350);
    font-weight: var(--p-font-weight-regular);
    letter-spacing: var(--p-font-letter-spacing-dense);
    line-height: var(--p-font-line-height-500);
}
.Polaris-Text--root {
    --s-global-color-26021: currentColor;
    --s-icon-color-26021: currentColor;
    --s-link-color-26021: currentColor;
    --s-link-color-active-26021: currentColor;
    --s-link-color-hover-26021: currentColor;
    --s-link-text-decoration-26021: underline;
    margin: 0;
    text-align: inherit;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
.Polaris-Button--textAlignCenter {
    justify-content: center;
    text-align: center;
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    .Polaris-Button--sizeSlim {
        --pc-button-padding-block: var(--p-space-100);
    }
}
.Polaris-Button--sizeSlim {
    --pc-button-padding-block: var(--p-space-200);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    .Polaris-Button--sizeSlim, .Polaris-Button--sizeMedium {
        --pc-button-padding-inline: var(--p-space-300);
        min-height: var(--p-height-700);
        min-width: var(--p-width-700);
    }
}
.Polaris-Button--sizeSlim, .Polaris-Button--sizeMedium {
    --pc-button-padding-inline: var(--p-space-400);
    min-height: var(--p-height-800);
    min-width: var(--p-width-800);
}
.Polaris-Button--variantSecondary {
    --pc-button-bg_hover: var(--p-color-bg-fill-hover);
    --pc-button-bg: var(--p-color-bg-fill);
    --pc-button-bg_active: var(--p-color-bg-fill-active);
    --pc-button-bg_pressed: var(--p-color-bg-fill-selected);
    --pc-button-color: var(--p-color-text);
    --pc-button-icon-fill: var(--p-color-icon);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    .Polaris-Button--variantSecondary {
        --pc-button-box-shadow: var(--p-shadow-button);
        --pc-button-box-shadow_active: var(--p-shadow-button-inset);
    }
}
.Polaris-Button--variantSecondary {
    --pc-button-box-shadow: 0 0 0 var(--p-space-025) var(--p-color-border) inset;
}
.Polaris-Button {
    --pc-button-icon-fill: currentColor;
    --pc-button-icon-fill_hover: var(--pc-button-icon-fill);
    --pc-button-icon-fill_active: var(--pc-button-icon-fill);
    --pc-button-icon-fill_pressed: var(--pc-button-icon-fill_active);
    --pc-button-icon-fill_disabled: var(--p-color-icon-disabled);
    all: unset;
    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--pc-button-gap);
    padding: var(--pc-button-padding-block) var(--pc-button-padding-inline);
    background: var(--pc-button-bg);
    border: none;
    border-radius: var(--p-border-radius-200);
    box-shadow: var(--pc-button-box-shadow);
    color: var(--pc-button-color);
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
    -webkit-tap-highlight-color: #0000;
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    .Polaris-Button {
        --pc-button-box-shadow_hover: var(--pc-button-box-shadow);
        --pc-button-box-shadow_active: var(--pc-button-box-shadow);
        --pc-button-box-shadow_pressed: var(--pc-button-box-shadow_active);
        --pc-button-box-shadow_disabled: var(--pc-button-box-shadow);
    }
}
.Polaris-Button {
    --pc-button-gap: var(--p-space-050);
    --pc-button-bg: #0000;
    --pc-button-bg_hover: var(--pc-button-bg);
    --pc-button-bg_active: var(--pc-button-bg);
    --pc-button-bg_pressed: var(--pc-button-bg_active);
    --pc-button-bg_disabled: var(--p-color-bg-fill-disabled);
    --pc-button-color: inherit;
    --pc-button-color_hover: var(--pc-button-color);
    --pc-button-color_active: var(--pc-button-color);
    --pc-button-color_pressed: var(--pc-button-color_active);
    --pc-button-color_disabled: var(--p-color-text-disabled);
    --pc-button-box-shadow: #0000;
    --pc-button-box-shadow_hover: #0000;
    --pc-button-box-shadow_active: #0000;
    --pc-button-box-shadow_pressed: #0000;
    --pc-button-box-shadow_disabled: #0000;
}
user agent stylesheet
a:-webkit-any-link {
    color: -webkit-link;
    cursor: pointer;
}
style attribute {
    --pc-inline-stack-align: space-between;
    --pc-inline-stack-wrap: wrap;
    --pc-inline-stack-flex-direction-xs: row;
}
.Polaris-InlineStack {
    --pc-inline-stack-flex-direction-xs: initial;
    --pc-inline-stack-flex-direction-sm: initial;
    --pc-inline-stack-flex-direction-md: initial;
    --pc-inline-stack-flex-direction-lg: initial;
    --pc-inline-stack-flex-direction-xl: initial;
    flex-direction: var(--pc-inline-stack-flex-direction-xs);
}
.Polaris-InlineStack {
    --pc-inline-stack-column-gap-xs: initial;
    --pc-inline-stack-column-gap-sm: initial;
    --pc-inline-stack-column-gap-md: initial;
    --pc-inline-stack-column-gap-lg: initial;
    --pc-inline-stack-column-gap-xl: initial;
    column-gap: var(--pc-inline-stack-column-gap-xs);
}
.Polaris-InlineStack {
    --pc-inline-stack-row-gap-xs: initial;
    --pc-inline-stack-row-gap-sm: initial;
    --pc-inline-stack-row-gap-md: initial;
    --pc-inline-stack-row-gap-lg: initial;
    --pc-inline-stack-row-gap-xl: initial;
    row-gap: var(--pc-inline-stack-row-gap-xs);
}
style attribute {
    --pc-block-stack-order: column;
    --pc-block-stack-gap-xs: var(--p-space-400);
}
.Polaris-BlockStack {
    --pc-block-stack-align: initial;
    --pc-block-stack-inline-align: initial;
    --pc-block-stack-order: initial;
    display: flex;
    flex-direction: var(--pc-block-stack-order);
    align-items: var(--pc-block-stack-inline-align);
    justify-content: var(--pc-block-stack-align);
}
.Polaris-BlockStack {
    --pc-block-stack-gap-xs: initial;
    --pc-block-stack-gap-sm: initial;
    --pc-block-stack-gap-md: initial;
    --pc-block-stack-gap-lg: initial;
    --pc-block-stack-gap-xl: initial;
    gap: var(--pc-block-stack-gap-xs);
}
:root [data-page=home] [data-home-sections]>:nth-child(1) {
    --_index: 0;
}
:root [data-page=home] [data-home-sections]>* {
    --stagger: var(--p-motion-duration-150);
    --_index: 0;
    transform-origin: center top;
    transition: transform var(--p-motion-duration-400) var(--p-motion-ease-out), opacity var(--p-motion-duration-300) var(--p-motion-ease-out);
    transition-delay: calc(var(--stagger) * var(--_index));
}
style attribute {
    --pc-bleed-margin-block-start-xs: var(--p-space-200);
    --pc-bleed-margin-block-start-md: var(--p-space-500);
}
.Polaris-Bleed {
    --pc-bleed-margin-block-start-xs: initial;
    --pc-bleed-margin-block-start-sm: var(--pc-bleed-margin-block-start-xs);
    --pc-bleed-margin-block-start-md: var(--pc-bleed-margin-block-start-sm);
    --pc-bleed-margin-block-start-lg: var(--pc-bleed-margin-block-start-md);
    --pc-bleed-margin-block-start-xl: var(--pc-bleed-margin-block-start-lg);
    --pc-bleed-margin-block-end-xs: initial;
    --pc-bleed-margin-block-end-sm: var(--pc-bleed-margin-block-end-xs);
    --pc-bleed-margin-block-end-md: var(--pc-bleed-margin-block-end-sm);
    --pc-bleed-margin-block-end-lg: var(--pc-bleed-margin-block-end-md);
    --pc-bleed-margin-block-end-xl: var(--pc-bleed-margin-block-end-lg);
    --pc-bleed-margin-inline-start-xs: initial;
    --pc-bleed-margin-inline-start-sm: var(--pc-bleed-margin-inline-start-xs);
    --pc-bleed-margin-inline-start-md: var(--pc-bleed-margin-inline-start-sm);
    --pc-bleed-margin-inline-start-lg: var(--pc-bleed-margin-inline-start-md);
    --pc-bleed-margin-inline-start-xl: var(--pc-bleed-margin-inline-start-lg);
    --pc-bleed-margin-inline-end-xs: initial;
    --pc-bleed-margin-inline-end-sm: var(--pc-bleed-margin-inline-end-xs);
    --pc-bleed-margin-inline-end-md: var(--pc-bleed-margin-inline-end-sm);
    --pc-bleed-margin-inline-end-lg: var(--pc-bleed-margin-inline-end-md);
    --pc-bleed-margin-inline-end-xl: var(--pc-bleed-margin-inline-end-lg);
    margin-block-start: calc(var(--pc-bleed-margin-block-start-xs) * -1);
    margin-block-end: calc(var(--pc-bleed-margin-block-end-xs) * -1);
    margin-inline-start: calc(var(--pc-bleed-margin-inline-start-xs) * -1);
    margin-inline-end: calc(var(--pc-bleed-margin-inline-end-xs) * -1);
}
style attribute {
    --pc-box-padding-block-start-xs: var(--p-space-0);
    --pc-box-padding-block-end-xs: var(--p-space-0);
}
.Polaris-Box {
    --pc-box-shadow: initial;
    --pc-box-background: initial;
    --pc-box-border-radius: initial;
    --pc-box-border-end-start-radius: var(--pc-box-border-radius);
    --pc-box-border-end-end-radius: var(--pc-box-border-radius);
    --pc-box-border-start-start-radius: var(--pc-box-border-radius);
    --pc-box-border-start-end-radius: var(--pc-box-border-radius);
    --pc-box-color: initial;
    --pc-box-min-height: initial;
    --pc-box-min-width: initial;
    --pc-box-max-width: initial;
    --pc-box-outline-color: initial;
    --pc-box-outline-style: initial;
    --pc-box-outline-width: initial;
    --pc-box-overflow-x: initial;
    --pc-box-overflow-y: initial;
    --pc-box-width: initial;
    --pc-box-border-style: initial;
    --pc-box-border-color: initial;
    --pc-box-border-width: 0;
    --pc-box-border-block-start-width: var(--pc-box-border-width);
    --pc-box-border-block-end-width: var(--pc-box-border-width);
    --pc-box-border-inline-start-width: var(--pc-box-border-width);
    --pc-box-border-inline-end-width: var(--pc-box-border-width);
    --pc-box-inset-block-start: initial;
    --pc-box-inset-block-end: initial;
    --pc-box-inset-inline-start: initial;
    --pc-box-inset-inline-end: initial;
    inset-block-start: var(--pc-box-inset-block-start);
    inset-block-end: var(--pc-box-inset-block-end);
    inset-inline-start: var(--pc-box-inset-inline-start);
    inset-inline-end: var(--pc-box-inset-inline-end);
    background-color: var(--pc-box-background);
    box-shadow: var(--pc-box-shadow);
    border-end-start-radius: var(--pc-box-border-end-start-radius);
    border-end-end-radius: var(--pc-box-border-end-end-radius);
    border-start-start-radius: var(--pc-box-border-start-start-radius);
    border-start-end-radius: var(--pc-box-border-start-end-radius);
    border-color: var(--pc-box-border-color);
    border-style: var(--pc-box-border-style);
    border-block-start-width: var(--pc-box-border-block-start-width);
    border-block-end-width: var(--pc-box-border-block-end-width);
    border-inline-start-width: var(--pc-box-border-inline-start-width);
    border-inline-end-width: var(--pc-box-border-inline-end-width);
    color: var(--pc-box-color);
    min-height: var(--pc-box-min-height);
    min-width: var(--pc-box-min-width);
    max-width: var(--pc-box-max-width);
    outline-color: var(--pc-box-outline-color);
    outline-style: var(--pc-box-outline-style);
Show all properties (5 more)
}
.Polaris-Box {
    --pc-box-padding-inline-end-xs: initial;
    --pc-box-padding-inline-end-sm: initial;
    --pc-box-padding-inline-end-md: initial;
    --pc-box-padding-inline-end-lg: initial;
    --pc-box-padding-inline-end-xl: initial;
    padding-inline-end: var(--pc-box-padding-inline-end-xs);
}
.Polaris-Box {
    --pc-box-padding-inline-start-xs: initial;
    --pc-box-padding-inline-start-sm: initial;
    --pc-box-padding-inline-start-md: initial;
    --pc-box-padding-inline-start-lg: initial;
    --pc-box-padding-inline-start-xl: initial;
    padding-inline-start: var(--pc-box-padding-inline-start-xs);
}
.Polaris-Box {
    --pc-box-padding-block-start-xs: initial;
    --pc-box-padding-block-start-sm: initial;
    --pc-box-padding-block-start-md: initial;
    --pc-box-padding-block-start-lg: initial;
    --pc-box-padding-block-start-xl: initial;
    padding-block-start: var(--pc-box-padding-block-start-xs);
}
.Polaris-Box {
    --pc-box-padding-block-end-xs: initial;
    --pc-box-padding-block-end-sm: initial;
    --pc-box-padding-block-end-md: initial;
    --pc-box-padding-block-end-lg: initial;
    --pc-box-padding-block-end-xl: initial;
    padding-block-end: var(--pc-box-padding-block-end-xs);
}
constructed stylesheet
@media (min-width: 48rem), (pointer: fine) {
    :host > * {
        font-size: var(--s-global-font-size-26021, 0.8125rem);
        line-height: var(--s-global-line-height-26021, 1.25rem);
        letter-spacing: var(--s-global-letter-spacing-26021, 0rem);
    }
}
constructed stylesheet
:host > * {
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizelegibility;
    font-size: var(--s-global-font-size-26021, 1rem);
    line-height: var(--s-global-line-height-26021, 1.5rem);
    letter-spacing: var(--s-global-letter-spacing-26021, -0.00833em);
    font-family: var(--s-global-font-family-26021);
    font-weight: var(--s-global-font-weight-26021, 450);
    font-variant: normal;
    color: var(--s-global-color-26021, rgba(48, 48, 48, 1));
    text-shadow: none;
    text-transform: none;
    font-style: normal;
    text-align: start;
    text-align-last: auto;
    text-indent: 0px;
}
.Polaris-Frame__Scrollable {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg) #0000;
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
.Polaris-Scrollable {
    --pc-scrollable-shadow-size: var(--p-space-500);
    --pc-scrollable-shadow-color: #00000026;
    --pc-scrollable-shadow-bottom: 0 var(--pc-scrollable-shadow-size) var(--pc-scrollable-shadow-size) var(--pc-scrollable-shadow-size) var(--pc-scrollable-shadow-color);
    --pc-scrollable-shadow-top: 0 calc(var(--pc-scrollable-shadow-size) * -1) var(--pc-scrollable-shadow-size) var(--pc-scrollable-shadow-size) var(--pc-scrollable-shadow-color);
    --pc-scrollable-max-height: none;
    -webkit-overflow-scrolling: touch;
    position: relative;
    max-height: var(--pc-scrollable-max-height);
    overflow-x: hidden;
    overflow-y: hidden;
    isolation: isolate;
}
.Polaris-Frame__Main {
    --pc-frame-main-padding-right-from-env: env(safe-area-inset-right);
    flex: 1 1;
    display: flex;
    align-items: stretch;
    min-width: 0;
    border-inline-end: none;
    background-color: var(--p-color-bg);
    height: 100%;
    overflow: hidden;
    transition: padding var(--p-motion-duration-0) linear var(--p-motion-duration-50);
    padding-inline-end: var(--pc-frame-main-padding-right-from-env, 0);
}
style attribute {
    --pc-sidebar-width-base: 450px;
}
.Polaris-Frame.Polaris-Frame--notFullScreen {
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-100));
    --pc-scrollbar-spacer: 0;
    background-color: var(--p-color-bg-inverse);
    transition: width var(--p-motion-duration-250) var(--p-motion-ease);
}
.Polaris-Frame {
    --pc-frame-button-size: var(--p-space-800);
    --pc-sidebar-width-base: 22.25rem;
    --pc-sidebar-width: calc(var(--pc-sidebar-width-base) + var(--p-space-400));
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    background-color: var(--p-color-bg);
}
._AppFrame_1k9ev_28 {
    scrollbar-color: auto;
    background-color: var(--p-color-bg-inverse);
}
style attribute {
    overflow: hidden;
    background-color: var(--p-color-bg);
    color: var(--p-color-text);
    --universal-sidebar-width: 450px;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background-color: #f1f2f4;
    scrollbar-color: var(--p-color-scrollbar-thumb-bg-hover) #0000;
}
html, body, button {
    font-family: var(--p-font-family-sans);
}
@media (hover) and (pointer: fine), (min-width: 48em) {
    html, body {
        font-size: var(--p-font-size-325);
        line-height: var(--p-font-line-height-500);
    }
}
html, body {
    font-size: var(--p-font-size-400);
    line-height: var(--p-font-line-height-600);
    font-weight: var(--p-font-weight-regular);
    font-feature-settings: "calt" 0;
    letter-spacing: initial;
    color: var(--p-color-text);
    -webkit-tap-highlight-color: #0000;
}
style attribute {
    --vsc-domain: "admin.shopify.com";
    --pc-frame-global-ribbon-height: 0px;
    --pc-frame-offset: 0px;
    --pc-app-provider-scrollbar-width: 11px;
    --pc-checkbox-offset: 38px;
}
:root {
    --overview-dashboard-uae-customization-mode-padding-top: 3.5rem;
    --overview-dashboard-uae-metric-card-height: 22.125rem;
}
:root {
    --keyword-token-color: #007ab8;
    --dataset-token-color: #791a79;
    --column-token-color: #086b5a;
    --operator-token-color: #007ab8;
    --viz-token-color: #d13c77;
    --value-token-color: #003a5a;
    --bracket-token-color: #8a8a8a;
    --comment-token-color: #b5b5b5;
    --connector-token-color: #4c295e;
    --default-font-stack: "GeistMonoRegular", "Monaco", "Consolas", "monospace";
}
:root {
    --inventory-list-activator-cell-min-width: 8.875rem;
}
:root {
    --cell-activator-horizontal-spacing: var(--p-space-200);
    --cell-activator-border-width: .125rem;
}
:root {
    --locations-table-cell-vertical-padding: var(--p-space-300);
    --locations-table-cell-horizontal-padding: var(--p-space-200);
    --locations-table-activator-icon-width: var(--p-space-500);
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --s-onboarding-first-message-animate-delay: .3s;
    --s-onboarding-card-stack-animate-delay: 1.25s;
    --s-onboarding-title-animate: 1.25s;
    --s-onboarding-subtitle-animate: 2s;
    --s-onboarding-quality-bar-animate-delay: 2s;
    --s-onboarding-last-message-animate-delay: 3s;
    --s-onboarding-header-footer-animate-delay: .5s;
    --s-onboarding-view-delay: .25s;
    --s-card-spacing: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-border-radius: calc(var(--p-space-200) + var(--p-space-050));
    --s-card-bg: var(--p-color-bg-surface);
    --s-card-bg-hover: var(--p-color-bg-surface-hover);
    --s-card-shadow: var(--p-shadow-100);
    --s-card-button-bg: var(--p-color-bg);
    --s-card-button-shadow: 0 .375rem .375rem -.1875rem #4d00cf14, 0 .125rem .125rem -.0625rem #4d00cf14, 0 .0625rem .0625rem -.03125rem #4d00cf14, 0 .03125rem .03125rem 0 #4d00cf14;
    --s-footer-input-height: 3rem;
    --s-footer-height: calc(var(--s-footer-input-height) + var(--p-space-300));
    --s-card-width-compact: 23.75rem;
    --s-card-width-normal: 30rem;
    --s-card-width-wide: 37.5rem;
    --s-media-preview-max-height: 11.25rem;
    --s-form-card-fullscreen-width: 35rem;
    --s-card-min-width: 20rem;
}
:root {
    --celebration-static-banner-bg: var(--p-color-bg-surface);
    --celebration-static-banner-color: var(--p-color-text);
}
:root {
    --universal-sidebar-width: 22.25rem;
}
:root {
    --image-dimensions: 15rem;
    --narrow-image-dimensions: 11.25rem;
    --padding: 1.25rem;
    --column-gap: 1.25rem;
    --column-width: var(--image-dimensions);
    --two-column-width: calc(var(--column-width) * 2);
    --width-when-column-wraps: calc(var(--two-column-width) + var(--column-gap) + var(--padding) * 2 - .0625rem);
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --keyword-token-color: #003a5a;
    --column-token-color: #086b5a;
    --bracket-token-color: #8a8a8a;
    --comment-token-color: #8a8a8a;
    --default-font-stack: "GeistMonoRegular", "Monaco", "Consolas", "monospace";
}
:root {
    --polaris-version-number: "{{POLARIS_VERSION}}";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
:root {
    --osui-nav-item-interior-padding: var(--p-space-200);
    --osui_nav-action-connected-button-width: 1.75rem;
    --osui_nav-action-connected-button-width-slim: 1.25rem;
    --osui_nav-action-common-prefix-size: 1.25rem;
    --osui_nav-action-common-prefix-gap: var(--p-space-200);
    --osui-nav-item-alignment-none: 0;
    --osui-nav-item-alignment-base-tight: var(--p-space-300);
    --osui_nav-item-alignment-common-icon: calc(var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap) + var(--osui-nav-item-alignment-base-tight));
    --osui_nav-item-alignment-common-action-with-icon: calc(var(--osui_nav-action-connected-button-width-slim) + var(--osui_nav-action-common-prefix-size) + var(--osui_nav-action-common-prefix-gap));
    --osui_nav-item-alignment-nested-offset: var(--p-space-100);
}
:root {
    --floating-controls-wrapper-height: 5rem;
    --ask-sidekick-field-height: 2.75rem;
    --animation-bezier: cubic-bezier(.2, .8, 0, 1);
    --osw-z-index-floating-controls: 3;
}
:root {
    --editable-text-border-radius: var(--p-border-radius-200);
    --editable-text-padding: var(--p-space-100) var(--p-space-150);
}
:root {
    --item-min-height: var(--p-space-400);
    --item-min-width: 3.125rem;
    --item-vertical-padding: var(--p-space-200);
}
:root {
    --pc-toast-manager-translate-y-out: 9.375rem;
    --pc-toast-manager-translate-y-in: 0;
    --pc-toast-manager-scale-in: 1;
    --pc-toast-manager-scale-out: .9;
    --pc-toast-manager-blur-in: 0;
    --pc-toast-manager-transition-delay-in: 0s;
}
:root {
    --pc-label-as-placeholder-y: 1.25rem;
}
:root {
    --polaris-version-number: "25.59.0-admin-web.8b88454";
    --pg-navigation-width: 15rem;
    --pg-dangerous-magic-space-4: 1rem;
    --pg-dangerous-magic-space-5: 1.25rem;
    --pg-dangerous-magic-space-8: 2rem;
    --pg-layout-width-primary-min: 30rem;
    --pg-layout-width-primary-max: 41.375rem;
    --pg-layout-width-secondary-min: 15rem;
    --pg-layout-width-secondary-max: 20rem;
    --pg-layout-width-one-half-width-base: 28.125rem;
    --pg-layout-width-one-third-width-base: 15rem;
    --pg-layout-width-nav-base: var(--pg-navigation-width);
    --pg-layout-width-page-content-partially-condensed: 28.125rem;
    --pg-layout-width-inner-spacing-base: var(--pg-dangerous-magic-space-4);
    --pg-layout-width-outer-spacing-min: var(--pg-dangerous-magic-space-5);
    --pg-layout-width-outer-spacing-max: var(--pg-dangerous-magic-space-8);
    --pg-layout-relative-size: 2;
    --pg-dismiss-icon-size: 2rem;
    --pg-top-bar-height: 3.5rem;
    --pg-bottom-bar-max-height: 21.875rem;
    --pg-bottom-bar-height: 0rem;
    --pg-mobile-nav-width: calc(100vw - var(--pg-dismiss-icon-size) - var(--pg-dangerous-magic-space-8));
    --pg-control-height: 2rem;
    --pg-control-vertical-padding: calc((2.25rem - var(--p-font-line-height-600) - var(--p-space-050)) / 2);
    --pg-system-alert-banner-height: 0rem;
}
:root, .p-theme-light {
    --p-border-radius-0: 0rem;
    --p-border-radius-050: .125rem;
    --p-border-radius-100: .25rem;
    --p-border-radius-150: .375rem;
    --p-border-radius-200: .5rem;
    --p-border-radius-300: .75rem;
    --p-border-radius-400: 1rem;
    --p-border-radius-500: 1.25rem;
    --p-border-radius-750: 1.875rem;
    --p-border-radius-full: 624.9375rem;
    --p-border-width-0: 0rem;
    --p-border-width-0165: .04125rem;
    --p-border-width-025: .0625rem;
    --p-border-width-050: .125rem;
    --p-border-width-100: .25rem;
    --p-breakpoints-xs: 0rem;
    --p-breakpoints-sm: 30.625rem;
    --p-breakpoints-md: 48rem;
    --p-breakpoints-lg: 65rem;
    --p-breakpoints-xl: 90rem;
    color-scheme: light;
    --p-color-bg: #f1f1f1;
    --p-color-bg-inverse: #1a1a1a;
    --p-color-bg-surface: #ffffff;
    --p-color-bg-surface-hover: #f7f7f7;
    --p-color-bg-surface-active: #f3f3f3;
    --p-color-bg-surface-selected: #f1f1f1;
    --p-color-bg-surface-disabled: #0000000d;
    --p-color-bg-surface-secondary: #f7f7f7;
    --p-color-bg-surface-secondary-hover: #f1f1f1;
    --p-color-bg-surface-secondary-active: #ebebeb;
    --p-color-bg-surface-secondary-selected: #ebebeb;
    --p-color-bg-surface-tertiary: #f3f3f3;
    --p-color-bg-surface-tertiary-hover: #ebebeb;
    --p-color-bg-surface-tertiary-active: #e3e3e3;
    --p-color-bg-surface-brand: #e3e3e3;
    --p-color-bg-surface-brand-hover: #ebebeb;
    --p-color-bg-surface-brand-active: #f1f1f1;
    --p-color-bg-surface-brand-selected: #f1f1f1;
    --p-color-bg-surface-info: #eaf4ff;
    --p-color-bg-surface-info-hover: #e0f0ff;
    --p-color-bg-surface-info-active: #cae6ff;
    --p-color-bg-surface-success: #cdfed4;
    --p-color-bg-surface-success-hover: #affebf;
    --p-color-bg-surface-success-active: #92fcac;
    --p-color-bg-surface-caution: #fff8db;
    --p-color-bg-surface-caution-hover: #fff4bf;
    --p-color-bg-surface-caution-active: #ffef9d;
    --p-color-bg-surface-warning: #fff1e3;
    --p-color-bg-surface-warning-hover: #ffebd5;
Show all properties (354 more)
}
constructed stylesheet
html, slot {
    --t-test-26021: blue;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
html {
    scrollbar-width: thin;
    scrollbar-color: var(--p-color-bg) var(--p-color-bg);
    transition: scrollbar-color var(--p-motion-duration-100) var(--p-motion-ease-in);
}
html {
    position: relative;
    font-size: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
*, *:before, *:after {
    box-sizing: border-box;
}
<style>
@font-face {
    font-family: Inter;
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url(InterVariable-cyrillic-ext-1751944278923.woff2) format('woff2');
    unicode-range: U +0460 -052F, U +1C80 -1C8A, U +20B4, U +2DE0 -2DFF, U + A640-A69F, U + FE2E-FE2F;
}


SVGs: 
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.54 1.177a1.25 1.25 0 0 0-1.08 0l-5.25 2.51c-.434.208-.71.647-.71 1.128v1.185c0 .69.56 1.25 1.25 1.25v2.75h-.25a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-.25v-2.75c.69 0 1.25-.56 1.25-1.25v-1.185c0-.481-.276-.92-.71-1.128zm3.21 8.823v-2.75h-1.5v2.75zm-3 0v-2.75h-1.5v2.75zm-3 0v-2.75h-1.5v2.75zm-2.75-5.027 5-2.392 5 2.392v.777h-10zm0 7.527v-1h10v1z"></path></svg>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.952 1.5h.096c.182 0 .371 0 .543.034.695.138 1.237.68 1.375 1.375.035.172.034.361.034.543v9.096c0 .182 0 .371-.034.543a1.75 1.75 0 0 1-1.375 1.375c-.172.035-.361.034-.543.034h-.096c-.182 0-.371 0-.543-.034a1.75 1.75 0 0 1-1.375-1.375c-.035-.172-.034-.361-.034-.543v-9.096c0-.182 0-.371.034-.543a1.75 1.75 0 0 1 1.375-1.375c.172-.035.361-.034.543-.034m-.253 1.505a.25.25 0 0 0-.194.194l-.003.053c-.002.055-.002.127-.002.248v9c0 .121 0 .193.002.248l.003.053a.25.25 0 0 0 .194.194l.053.003c.055.002.127.002.248.002s.193 0 .248-.002l.053-.003a.25.25 0 0 0 .194-.194l.003-.053c.002-.055.002-.127.002-.248v-9c0-.121 0-.193-.002-.248l-.003-.053a.25.25 0 0 0-.194-.194l-.053-.003c-.055-.002-.127-.002-.248-.002s-.193 0-.248.002z"></path><path fill-rule="evenodd" d="M3.452 7h.096c.182 0 .371 0 .543.034.695.138 1.237.68 1.375 1.375.035.172.034.361.034.543v3.596c0 .182 0 .371-.034.543a1.75 1.75 0 0 1-1.375 1.375c-.172.035-.361.034-.543.034h-.096c-.182 0-.371 0-.543-.034a1.75 1.75 0 0 1-1.375-1.375c-.035-.172-.034-.361-.034-.543v-3.596c0-.182 0-.371.034-.543a1.75 1.75 0 0 1 1.375-1.375c.172-.035.361-.034.543-.034m-.253 1.505a.25.25 0 0 0-.194.194l-.003.053c-.002.055-.002.127-.002.248v3.5c0 .121 0 .193.002.248l.003.053a.25.25 0 0 0 .194.194l.053.003c.055.002.127.002.248.002s.193 0 .248-.002l.053-.003a.25.25 0 0 0 .194-.194l.003-.053c.002-.055.002-.127.002-.248v-3.5c0-.121 0-.193-.002-.248l-.003-.053a.25.25 0 0 0-.194-.194l-.053-.003c-.055-.002-.127-.002-.248-.002s-.193 0-.248.002z"></path><path fill-rule="evenodd" d="M12.5 4h-.048c-.182 0-.371 0-.543.034a1.75 1.75 0 0 0-1.375 1.375c-.035.172-.034.361-.034.543v6.596c0 .182 0 .371.034.543.138.695.68 1.237 1.375 1.375.172.035.361.034.543.034h.096c.182 0 .371 0 .543-.034a1.75 1.75 0 0 0 1.375-1.375c.035-.172.034-.361.034-.543v-6.596c0-.182 0-.371-.034-.543a1.75 1.75 0 0 0-1.375-1.375c-.172-.035-.361-.034-.543-.034zm-.495 1.7a.25.25 0 0 1 .194-.195l.053-.003c.054-.002.127-.002.248-.002s.193 0 .248.002l.053.003a.25.25 0 0 1 .194.194l.003.053c.002.055.002.127.002.248v6.5c0 .121 0 .193-.002.248l-.003.053a.25.25 0 0 1-.194.194l-.053.003c-.055.002-.127.002-.248.002s-.194 0-.248-.002l-.053-.003a.25.25 0 0 1-.194-.194l-.003-.053c-.002-.055-.002-.127-.002-.248v-6.5c0-.121 0-.193.002-.248l.003-.053zv-.002Z"></path></svg>

<span class="Polaris-Button__Icon"><span class="_Indicator_1cknc_5"></span></span>