# Igdrasil Brand Guidelines

## Focus Ring Behavior

Focus rings must **reinforce the existing border**, not create a separate outer shell.

### Rules

1. **Color**: The focus ring uses `--ring` (a bolder shade of `--border`), never brand pink or any accent color.
2. **No offset gap**: Use `ring-offset-0` so the ring sits directly on the element border. Never use `ring-offset-2` — it creates a visible gap that looks like a second outline.
3. **Width**: `ring-2` is the standard width. This makes the existing border appear bolder on focus.

### CSS Variables

| Variable | Light | Dark | Purpose |
|---|---|---|---|
| `--border` | `0 0% 73%` | `0 0% 22%` | Default border |
| `--ring` | `0 0% 55%` | `0 0% 45%` | Focus ring (darker/lighter than border) |

### Implementation Pattern

```tsx
// Correct — ring reinforces the border
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"

// Wrong — pink ring with gap
"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### Rationale

The focus indicator should feel like the element's own border becoming more prominent, not a separate highlight layer wrapping it. This keeps the UI clean and avoids the "double outline" effect.

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#ee8fe0` | CTAs, active nav, user chat bubble |
| Success | `#b0ee8f` | Positive amounts, success states |
| Warning | `#eedd8f` | Caution banners, pending states |
| Border | `#bbbbbb` | Card borders, dividers, inputs |
| Muted | `#aaaaaa` | Secondary text, placeholders, icons |

## Typography

Font: **Inter** variable (weights 100–900).
