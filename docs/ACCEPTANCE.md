# Animation Builder acceptance

## Automated checks

- `npm test`: generators, structures, name collision prevention, timing, validation of project files, duplication and reordering.
- `npm run lint` and `npm run build`.
- Start `npm run dev`; visit `/qa.html` and click Run browser checks.
- The browser page exercises all 77 presets, a repeated group with a pause, inView gating, a reduced-motion override and generic SVG rendering. It mounts actual exported HTML/CSS without the preview's styles.

## Current evidence (2026-09-21)

- 32 Node tests passed; lint and production build passed.
- Browser integrated Chromium: 80 passed, 0 failed.
- UI manually checked: preset type lock, modified marker, bar count and pause, duplication, filter search, reorder and restore after reload, JSON import and backup restore, scroll activation, copying CSS and HTML.
- Chrome desktop, Firefox, Safari and Edge: pending independent execution. Chromium evidence does not certify all four applications.
- Client AEM staging: pending VPN-backed validation. No production site was changed.

## Browser UI checklist

Run on each required browser, at desktop and a narrow window:

1. Make a text animation; reload and confirm text, configuration, order and selection restore.
2. Duplicate, rename and reorder two elements. Confirm their edits are independent.
3. Export JSON, edit the scene, import the JSON and restore the previous-import backup. An invalid JSON file must not replace the scene.
4. Search for SVG, filter by family/type and select a preset. Clear filters; the current selection must remain intelligible.
5. Select a special preset and edit duration/name. Type remains locked and the preset is marked modified. Selecting Custom unlocks the type.
6. Scroll activation must wait until entry, Reset must restore the initial test, and load mode must run immediately.
7. Copy CSS, classes and HTML; verify copied text matches the visible output. Check keyboard focus and the Copy status.
8. Compare a special preset with a generic preset on the same content type: required HTML remains visible.
9. Test zero duration, stagger zero, normal/reverse/alternate, two and infinite repetitions, and pause. Inspect the whole group before the next cycle.
10. Enable the OS preference for reduced motion; content remains visible and does not animate. The automated override is additional coverage, not a substitute for this check.

## AEM staging checklist (VPN)

Use a disposable staging page and the existing client components; do not publish these tests to production.

- Test one CSS-only entrance, one SVG, one segmented text, bars with repetitions and a gradient.
- Verify the actual component preserves `<span>`, inline `--motion-order`, inline SVG and `pathLength` where needed. Record unsupported types rather than declaring global AEM compatibility.
- Load exported CSS after the account stylesheet; use an inner element if the component has its own transform.
- Confirm the client's activation contract for `.abbv-animation` and `.inView`, including when it adds/removes classes, late-loaded content and scrolling back up. The builder simulates a single entry per reset.
- Disable sample appearance when the component supplies dimensions/colors; provide the needed sizing and relative parent height for absolute children.
- Inspect wrapper nesting, overflow clipping, z-index and stacking contexts with real account components.
- Do not modify part count/order after export without regenerating CSS.
- Verify text remains understandable with keyboard navigation, screen readers and reduced motion; avoid hiding essential content with exit animations.
- Record browser name/version, component, preset/config, actual result and screenshot. Production approval is separate from local QA.

## Release gate

Release 1.0 after all four browser runs and the AEM cases pass or unsupported combinations are clearly excluded. Until then this remains an internal beta. No client-side JS is added to AEM by the export.
