/**
 * On-demand Google Fonts loader for the template editors.
 *
 * The font set MUST match the one preloaded by eyrender (see
 * remotion-render-service `fonts.ts`) so the Fabric / Konva editors measure
 * text with the same metrics as the actual render — otherwise the WYSIWYG
 * editor lies about where text wraps. Keep this list in sync with eyrender.
 *
 * This used to live as a <link> in the root index.html, which made every page
 * pay for it. Instead we inject the stylesheet the first time an editor mounts
 * and resolve once the fonts are ready. `document.fonts.load()` / `.ready`
 * (used by the editors) only work once these @font-face rules are declared,
 * which is exactly what this stylesheet does.
 */

const FONTS_HREF =
    "https://fonts.googleapis.com/css2" +
    "?family=Dancing+Script:wght@400;500;600;700" +
    "&family=Inter:wght@300;400;500;600;700;800;900" +
    "&family=Lato:ital,wght@0,400;0,700;0,900;1,400;1,700" +
    "&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700" +
    "&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700" +
    "&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900" +
    "&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700" +
    "&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,400;1,700" +
    "&display=swap";

let started = false;

/**
 * Inject the editor font stylesheet (once) and resolve when the fonts are
 * ready. Safe to call on every editor mount — the stylesheet is added at most
 * once and `document.fonts.ready` reflects the current loading state.
 */
export async function ensureEditorFonts(): Promise<void> {
    if (!started && !document.querySelector("link[data-editor-fonts]")) {
        started = true;

        // preconnect speeds up the first font fetch; harmless if duplicated.
        const pre1 = document.createElement("link");
        pre1.rel = "preconnect";
        pre1.href = "https://fonts.googleapis.com";
        const pre2 = document.createElement("link");
        pre2.rel = "preconnect";
        pre2.href = "https://fonts.gstatic.com";
        pre2.crossOrigin = "anonymous";

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONTS_HREF;
        link.dataset.editorFonts = "true";

        document.head.append(pre1, pre2, link);
    }

    try {
        await document.fonts.ready;
    } catch {
        /* font loading failed — editors fall back to system fonts */
    }
}
