# Animation Builder

React + Vite tool for building CSS animations for existing AEM components.

## Run

Use Node 22.22.3. Install dependencies on each machine; do not copy node_modules between Intel and Apple Silicon.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm test
```

## Structure

Each component owns its Sass Module. Shared UI styles live in src/styles; App.module.scss owns the layout. The hook manages configuration. Pure generators in src/utils produce both the preview CSS and the export. src/styles/base.scss is a client reference only, never imported globally.

## Custom animation

The first, selectable preset starts with an empty name and every numeric input at zero, including scale and duration. Choose a duration above zero to see motion. Editing a preset retains its name with a modified marker; choosing Custom explicitly resets its numeric values. The preview reset icon replays the current configuration (or resets the scroll position) without clearing it.

All source styles use SCSS, including the unimported client reference. Vite compiles the interface styles; the export generator still returns plain CSS. No Tailwind or external utility-class framework is used.

## AEM workflow

Choose On page load or On scroll, configure the animation, then copy CSS and classes. Load custom CSS after the client's base stylesheet. Scroll exports use `abbv-animation inView yourAnimation` on the same element, relying on the existing client integration. The builder adds inView when a stationary wrapper enters its scroll preview; this observer is not exported. It simulates a single entrance per reset, not the client's undocumented repeat/threshold rules.

CSS selectors cannot detect visibility by themselves: if the client leaves inView present without delaying activation, the animation starts immediately. Validate the generated class on a staging page using the account's existing viewport behavior. No new JavaScript is required in the exported artifact.

The exported name has no prefix. Invalid characters and leading digits are sanitized; reserved names use customMotion; unnamed elements receive automatic export names. Use unique names for different animations. Reduced-motion users see static visible content. Delays use fill-mode both. Use an inner wrapper if a component already uses transforms. Percentage translations are relative to the animated element. Rebound follows translation direction; scale-only rebound uses a percentage.

## Validation scope

Automated generator tests cover viewport gating, delay, valid names, shared keyframes, reduced motion, and directional rebound. Real AEM integration still requires validation in the client's environment.

## Multiple elements

Add element creates an independent text element. Generic animations allow changing any element type; specialized animations keep the structure they require. Text starts as Abbvie — Animations Tool and is editable. Content and animation settings survive selection changes and preset changes. Elements can be removed while retaining at least one. Uploaded images remain local in browser memory.

Export resolves empty or duplicate names for any number of elements. The generated CSS contains animations and positioning; use existing AEM components for the actual text and images. Relative elements wrap inside the shared scene; absolute elements overlay it. Scroll activation observes entry of the shared block, including tall scenes.

The controls grid uses a 15px gap, two columns at 601–850px and 1300px+, and consistent 46px control heights with no per-field margins inside the grid.

## Position and layers

Each element supports relative/absolute position and integer z-index, including negative values. Absolute elements center over the shared block. Preview elements are siblings in an isolated relative container, so their z-index values are comparable. Export includes positioning and a motion-container parent class when absolute positioning is enabled. In AEM, apply that class to the shared parent, preserving a relative child or an explicit parent height. The viewport observer watches the stationary shared block so animated transforms do not change activation measurements.

## Motion library

77 presets: 33 basic entrances plus 44 advanced effects grouped into Reveals, 3D entrances, Elastic entrances, Emphasis, Cycles, and Exits (4 each). Definitions live in src/data/motions.js as ordered frames; the same generator serves preview and plain CSS export. Advanced controls replace the basic start-value controls because their paths contain several stages. Intensity scales movement, rotation, scale deviation and blur; clipping shapes and opacity stops stay fixed. Scale intensity above 100% can produce reflection in aggressive scale presets.

Repetitions, direction and transform origin apply to every preset. Cycles default to three iterations; infinite is optional. Exit presets intentionally end transparent; reverse/alternate can change the final visible state. Reduced-motion CSS restores visible content and removes transform, filter and clipping. Switching presets resets motion-specific values so advanced effects cannot leak into a basic or Custom animation.

The additional 20 presets cover SVG drawing, bars, segmented text, animated gradients, and group sequences (4 each). Selecting these presets chooses the required element type. Words, lines, letters and sequence items animate with configurable stagger. Enter one item per line for custom sequences or line reveals. Presets that require SVG, bars, segmented text, gradients or sequences lock Element type to their required structure, including after timing or name edits. Choose a generic preset or explicitly select Custom to unlock it. Generic animations apply to the complete element and allow changing its type.

Special presets export a Required HTML structure with its own Copy HTML button. Use this structure only in AEM components that permit the relevant tags and inline custom properties; SVG needs inline SVG support. CSS alone cannot segment existing text or create SVG paths. Preview and export share the same structure and timing; no new JavaScript is exported.

## Editing layout

The editor scrolls independently beside an equally tall preview. AEM export spans the width below both panels. On narrow screens, the preview stays above the scrolling controls. On page load replays immediately after changes. On scroll waits for the shared block to enter the preview viewport: scroll inside the preview to trigger it. Reset and configuration changes restore the initial scroll position for another test. The preview uses the selected activation directly, without a separate test-mode switch.


## Project workflow

Projects autosave in localStorage on this browser and origin. Export project JSON for a portable backup, including local image data. Import validates the version and values and backs up the previous scene when storage permits; Restore previous import backup recovers it. Invalid imports leave the scene intact. Storage failures are reported rather than silently treated as saved. A JSON backup is recommended before changing machines or ports. No backend is required.

Elements can be renamed, duplicated and reordered. Filters search the 77 presets by name, family and required element. A modified preset keeps its identity; explicitly selecting Custom resets motion settings. SVG, bars, segmented text, gradients and sequences export their structure even when using a generic motion.

## Timing and appearance

Duration is the motion duration per part. Active group duration is duration + (parts - 1) × stagger. Repeated groups use a shared cycle; Pause per cycle extends its hold. Delay is applied once at the start. Reverse and alternate reverse the timeline, including stagger and holds. The displayed total includes each cycle's hold, including the final one. A pause is ignored for a single repetition.

Number of bars (1–20), SVG stroke width and gradient colors are editable. Sample dimensions/colors may be omitted for existing AEM components. Required structural CSS and gradient stops remain. The preview canvas still supplies layout helpers and typography; it is not a replica of the client stylesheet.

Sequences use one item per line, including a single item; blank content is respected. Letters use grapheme segmentation when available. Changing the number or order of parts after exporting requires regenerating the associated CSS. Internal keyframe names are reserved alongside element names to avoid collisions inside one export; keep names unique across independently exported projects as well.

## Browser and AEM acceptance

Run `npm run dev` and open `/qa.html` for repeatable browser checks against actual exported CSS/HTML without preview styles. Click Run browser checks in Chrome, Firefox, Safari and Edge. See `docs/ACCEPTANCE.md` for the integration checklist and remaining validation. The QA page is a development entry, not included in the normal production build.

The client base reference remains in `src/styles/base.scss`, unchanged and unimported. No reference file was removed.
