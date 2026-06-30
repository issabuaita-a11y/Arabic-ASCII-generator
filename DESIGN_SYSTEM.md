# Arabic ASCII Studio Design System

This product uses a restrained black-and-white interface so the generated ASCII artwork stays central. The system is intentionally small: one accent, one geometry scale, and reusable controls.

## Primitive Tokens

### Color

| Token | Value | Use |
| --- | --- | --- |
| `color.black` | `#050505` | Primary text, icons, selected states |
| `color.white` | `#ffffff` | Panels, controls, artboard background |
| `color.canvas` | `#f2f2ef` | Workspace/canvas background |
| `color.surfaceMuted` | `#f5f5f3` | Inputs and inactive control fills |
| `color.border` | `rgba(5, 5, 5, 0.12)` | Default strokes |
| `color.borderStrong` | `#050505` | Active artboard and selected controls |
| `color.textMuted` | `#727272` | Labels and secondary text |

### Typography

| Token | Value | Use |
| --- | --- | --- |
| `font.uiArabic` | `IBM Plex Sans Arabic` | Arabic interface text |
| `font.uiLatin` | `Space Grotesk` | Latin interface text and labels |
| `font.code` | `Courier New` fallback stack | ASCII output |
| `type.caption` | `11px` | Metadata and tiny labels |
| `type.label` | `12px` | Field labels |
| `type.control` | `13px` | Buttons, selects, tabs |
| `type.body` | `14px` | Panel body text |
| `type.section` | `16px` | Section titles |

### Spacing

| Token | Value |
| --- | --- |
| `space.1` | `4px` |
| `space.2` | `8px` |
| `space.3` | `12px` |
| `space.4` | `16px` |
| `space.5` | `20px` |
| `space.6` | `24px` |

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `radius.control` | `12px` | Buttons, inputs, selects, segmented controls |
| `radius.panel` | `14px` | Open settings panel |
| `radius.artboard` | `8px` | Artboards |
| `radius.round` | `999px` | Switch tracks and true circular/pill affordances only |

### Elevation

| Token | Value | Use |
| --- | --- | --- |
| `shadow.control` | `0 2px 8px rgba(5, 5, 5, 0.08)` | Floating controls |
| `shadow.panel` | `0 8px 24px rgba(5, 5, 5, 0.10)` | Open panels and artboards |

## Semantic Tokens

| Token | Primitive | Use |
| --- | --- | --- |
| `text.primary` | `color.black` | Main text |
| `text.secondary` | `color.textMuted` | Labels |
| `surface.canvas` | `color.canvas` | Full workspace |
| `surface.panel` | `color.white` | Settings panel |
| `surface.control` | `color.white` | Buttons and controls |
| `surface.controlMuted` | `color.surfaceMuted` | Inputs and disabled states |
| `state.active` | `color.black` | Selected, active, primary |
| `border.default` | `color.border` | Normal control stroke |
| `border.active` | `color.borderStrong` | Selected artboard/control stroke |

## Components

### Canvas Control

Used for zoom, size, language, and compact toolbar controls.

- Height: `40px`
- Radius: `radius.control`
- Fill: `surface.control`
- Border: `border.default`
- Icon/text: `text.primary`
- Active fill: `state.active`
- Active text/icon: `surface.control`

### Settings Panel

- Fill: `surface.panel`
- Border: `border.default`
- Radius: `radius.panel`
- Shadow: `shadow.panel`
- Section padding: `20px`

### Rail Tab

- Desktop rail fill: `state.active`
- Tab size: `46px`
- Active tab: white fill with black icon
- Mobile rail becomes a white segmented bottom navigation with black active state.
- Mobile rail and opened mobile panel share the same `12px` viewport inset and `12px` radius.
- Mobile opened panels sit above the rail with an `8px` gap; they do not stretch full-width to the viewport.
- Mobile export is a compact 4-column row, not the desktop vertical icon stack.

### Input / Select / Textarea

- Fill: `surface.controlMuted`
- Border: transparent by default, `border.active` on focus
- Radius: `radius.control`
- Minimum height: `40px`

### Style Card / Export Tile

- Fill: `surface.control`
- Border: `border.default`
- Radius: `radius.control`
- Active: `border.active`, no colored glow

### Artboard

- Default border: `border.default`
- Active border: `border.active`
- The active stroke belongs to the artboard itself, not the wrapper.
- Wrapper padding stays zero so selection does not visually create a second frame.
