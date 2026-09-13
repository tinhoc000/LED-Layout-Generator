LED Layout Generator v2.2 — iPad PWA
=======================================

WHAT THIS IS
This is the iPad Progressive Web App version of LED Layout Generator.
It does not require Photoshop or Python on the iPad.

IMPORTANT: A PWA must be opened from an HTTPS website before it can be
reliably added to the iPad Home Screen and cached for offline use.
Opening index.html directly from the Files app is useful for inspecting
the files, but it is not the recommended PWA installation method.

FILES TO HOST
Upload the ENTIRE contents of this folder together:
- index.html
- manifest.webmanifest
- sw.js
- icons/
- Presets/ (optional examples)

INSTALL ON IPAD
1. Host this folder on an HTTPS website.
2. Open the site's index.html in SAFARI on the iPad.
3. Tap the Share button.
4. Tap Add to Home Screen.
5. Launch LED Layout from its new Home Screen icon.
6. After one successful online load, the app's core files are cached for offline use.

IPAD CONTROLS
- Pinch with two fingers on the preview: zoom in/out.
- Drag the preview: pan around the LED layout.
- Double-tap the preview: Fit.
- Portrait mode: tap Settings to open/close the settings drawer.
- Landscape mode: settings stay visible beside the preview.

EXPORTING ON IPAD
When supported by iOS, SVG, PNG, PDF, and JSON preset exports open the
native Share sheet. Choose Save to Files, AirDrop, Mail, etc.
If the Share API is unavailable, the app falls back to a browser download.

FEATURES CARRIED OVER FROM THE PORTABLE APP
- Front / Rear horizontal view.
- Bottom-to-Top / Top-to-Bottom vertical label order.
- A1 -> A7 -> F1 progression.
- Custom vertical section row counts.
- Custom horizontal section widths.
- Custom rectangular module width and height.
- Alternating section colors.
- Individual letter-section color overrides.
- Custom text and grid colors.
- Live zoomable preview.
- SVG, PNG, vector PDF export.
- Save / Load JSON presets.
- Offline application shell after installation.

PRIVACY
All layout generation is performed locally in the browser.
The application itself does not upload your layout data.
