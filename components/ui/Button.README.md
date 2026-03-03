# Button Component

A flexible, accessible button component that implements the Forgrin design system as specified in **Requirement 18: Button Design System**.

## Features

- ✅ Four variants: primary, secondary, danger, icon
- ✅ Three sizes: sm, md, lg
- ✅ Hover, active, and focus states with animations
- ✅ Fully accessible with keyboard navigation
- ✅ Framer Motion animations for smooth interactions
- ✅ TypeScript support with proper types
- ✅ Ref forwarding for advanced use cases

## Usage

```tsx
import { Button } from '@/components/ui/Button';

// Basic usage
<Button>Click Me</Button>

// With variant
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="icon">🔍</Button>

// With size
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With onClick handler
<Button onClick={() => console.log('Clicked!')}>
  Click Me
</Button>

// Disabled state
<Button disabled>Disabled</Button>

// Custom styling
<Button className="w-full">Full Width</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'icon'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `children` | `React.ReactNode` | - | Button content |
| `disabled` | `boolean` | `false` | Disabled state |
| `onClick` | `() => void` | - | Click handler |
| `className` | `string` | `''` | Additional CSS classes |
| `...props` | `ButtonHTMLAttributes` | - | All standard button attributes |

## Variants

### Primary
- **Background**: Electric Blue (#2563EB)
- **Text**: White
- **Hover**: Darker blue with shadow
- **Use case**: Main call-to-action buttons

### Secondary
- **Background**: Transparent
- **Border**: 1px solid gray
- **Text**: Gray
- **Hover**: Light background
- **Use case**: Secondary actions, cancel buttons

### Danger
- **Background**: Red (#DC2626)
- **Text**: White
- **Hover**: Darker red with shadow
- **Use case**: Destructive actions (delete, remove)

### Icon
- **Shape**: Circular
- **Background**: Transparent
- **Hover**: Subtle background
- **Use case**: Icon-only buttons (search, close, menu)

## Sizes

### Small (sm)
- **Padding**: 12px horizontal, 6px vertical
- **Font**: 14px
- **Use case**: Compact UIs, inline actions

### Medium (md) - Default
- **Padding**: 16px horizontal, 8px vertical
- **Font**: 16px
- **Use case**: Standard buttons throughout the app

### Large (lg)
- **Padding**: 24px horizontal, 12px vertical
- **Font**: 18px
- **Use case**: Hero sections, primary CTAs

## States

### Hover
- Slight scale increase (1.02x)
- Darker background color
- Increased shadow (for primary/danger)

### Active
- Slight scale decrease (0.98x)
- Inset shadow effect

### Focus
- 2px glowing ring around button
- Ring color matches variant
- Visible only with keyboard navigation (focus-visible)

### Disabled
- 50% opacity
- Cursor not-allowed
- No hover/active effects

## Accessibility

- ✅ Proper button role
- ✅ Keyboard navigation support (Tab, Enter, Space)
- ✅ Focus-visible ring for keyboard users
- ✅ Disabled state properly communicated
- ✅ Supports ARIA attributes
- ✅ Ref forwarding for advanced patterns

## Animation

The Button uses Framer Motion for smooth, natural animations:
- **whileHover**: Scales to 1.02x
- **whileTap**: Scales to 0.98x
- **transition**: Smooth 200ms transitions

## Examples

See `Button.example.tsx` for comprehensive usage examples.

## Requirements

Implements **Requirement 18: Button Design System**:
- ✅ 18.1: Primary button with Electric Blue background
- ✅ 18.2: Hover effects with darkened color and shadow
- ✅ 18.3: Active state with inset shadow
- ✅ 18.4: Focus state with glowing ring
- ✅ 18.5: Secondary button with transparent background
- ✅ 18.6: Secondary hover with light background
- ✅ 18.7: Danger button with red background
- ✅ 18.8: Icon button with circular shape

## Testing

The Button component has comprehensive test coverage:
- 22 unit tests covering all variants, sizes, and states
- Accessibility tests
- Interaction tests
- Custom styling tests

Run tests:
```bash
npm test -- tests/unit/components/Button.test.tsx
```
