I have analyzed your project structure and configuration. Here is the plan to fix the default locale redirection and the missing canonical URL.

### **Problem Analysis**

1. **Default Locale Redirection (`/`** **->** **`/en`)**:

   * Currently, `middleware.ts` is configured with `localePrefix: 'always'`. This forces the `/en` prefix even for the default language.

   * **Fix**: Change `localePrefix` to `'as-needed'`. This will allow the default language (English) to be served at the root `/` without a prefix.

2. **Missing Canonical URL**:

   * The `metadata` configurations in `app/[locale]/layout.tsx` and `app/layout.tsx` are missing the `metadataBase` property. Next.js requires this to resolve relative URLs (like `/`, `/ko`) into full absolute URLs (e.g., `https://svgcodetopng.com/`).

   * **Fix**: Add `metadataBase: new URL('https://svgcodetopng.com')` to the metadata configurations.

### **Implementation Plan**

1. **Modify** **`middleware.ts`**:

   * Change `localePrefix` from `'always'` to `'as-needed'`.

2. **Modify** **`app/[locale]/layout.tsx`**:

   * Update the `generateMetadata` function.

   * Add `metadataBase: new URL('https://svgcodetopng.com')` to the return object for **every language block** (English, Korean, Japanese, etc.) to ensure the canonical URL is generated correctly for all locales.

3. **Modify** **`app/layout.tsx`**:

   * Add `metadataBase: new URL('https://svgcodetopng.com')` to the exported `metadata` object.

4. **Verification**:

   * Review the code changes to ensure all metadata objects are correctly formed.

