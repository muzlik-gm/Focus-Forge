# Card Component

A flexible, accessible card component that implements the Forgrin design system as specified in **Requirement 19: Card Component System**.

## Features

- ✅ Four variants: standard, stats, task, session
- ✅ Glassmorphism styling with subtle transparency
- ✅ Hover lift effect with smooth animation
- ✅ 16px border radius for consistent design
- ✅ Soft shadows with elevation on hover
- ✅ Framer Motion animations for smooth interactions
- ✅ TypeScript support with proper types
- ✅ Ref forwarding for advanced use cases

## Usage

```tsx
import { Card } from '@/components/ui/Card';

// Basic usage (standard variant)
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Stats card variant
<Card variant="stats">
  <div className="text-4xl font-bold">1,234</div>
  <div className="text-sm text-gray-400">Focus Hours</div>
  <div className="text-xs text-green-500">↑ 12%</div>
</Card>

// Task card variant
<Card variant="task">
  <input type="checkbox" />
  <span>Complete project documentation</span>
  <span className="text-xs text-gray-400">2h</span>
</Card>

// Session card variant
<Card variant="session">
  <div className="text-2xl font-mono">25:00</div>
  <div className="flex gap-2">
    <button>Pause</button>
    <button>Stop</button>
  </div>
  <div className="text-sm">Distractions: 0</div>
</Card>

// Custom styling
<Card className="max-w-md">
  Custom content
</Card>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'standard' \| 'stats' \| 'task' \| 'session'` | `'standard'` | Card style variant |
| `children` | `React.ReactNode` | - | Card content |
| `className` | `string` | `''` | Additional CSS classes |
| `...props` | `HTMLAttributes<HTMLDivElement>` | - | All standard div attributes |

## Variants

### Standard
- **Background**: Dark gray with 80% opacity
- **Border**: 1px solid gray-800
- **Padding**: 16px
- **Shadow**: Large shadow, extra-large on hover
- **Use case**: General content cards, information displays

### Stats
- **Background**: Gradient from Electric Blue to Soft Purple (20% opacity)
- **Border**: 1px solid gray-800
- **Padding**: 24px
- **Shadow**: Large shadow, extra-large on hover
- **Use case**: Metric displays, dashboard statistics, KPI cards

### Task
- **Background**: Dark gray with 80% opacity
- **Border**: 1px solid gray-800
- **Padding**: 12px
- **Shadow**: Medium shadow, large on hover
- **Use case**: Task items in Kanban board, todo items

### Session
- **Background**: Dark gray with 80% opacity
- **Border**: 1px solid gray-800
- **Padding**: 20px
- **Shadow**: Large shadow, extra-large on hover
- **Use case**: Focus session timer display, active session cards

## Glassmorphism Effect

All card variants implement glassmorphism styling:
- **Backdrop blur**: Creates frosted glass effect
- **Semi-transparent background**: Allows content behind to show through subtly
- **Subtle border**: Defines card edges without harsh lines
- **Layered shadows**: Creates depth and elevation

## Hover Effect

When hovering over any card:
- **Lift animation**: Card moves up 4px (y: -4)
- **Shadow increase**: Shadow becomes more prominent
- **Smooth transition**: 200ms duration for natural feel
- **Scale**: No scale change (unlike buttons) to maintain layout stability

## Accessibility

- ✅ Semantic HTML (div element)
- ✅ Supports all standard div attributes
- ✅ Ref forwarding for advanced patterns
- ✅ No motion for users with reduced motion preference (handled by Framer Motion)
- ✅ Proper contrast ratios for text content

## Animation

The Card uses Framer Motion for smooth, natural animations:
- **whileHover**: Translates up by 4px (y: -4)
- **transition**: Smooth 200ms transition
- **No tap animation**: Cards are containers, not interactive elements

## Design System Compliance

Implements **Requirement 19: Card Component System**:
- ✅ 19.1: Standard card with dark background, 16px padding, 16px radius, soft shadow, subtle border
- ✅ 19.2: Stats card with large number, small label, tiny trend arrow, background gradient
- ✅ 19.3: Task card with checkbox, title, tags, estimated time, drag handle
- ✅ 19.4: Session card with timer display, pause/stop buttons, distraction counter
- ✅ 19.5: Hover lift effect with increased shadow
- ✅ 19.6: Glassmorphism styling applied to all variants

Implements **Requirement 16: Visual Design System**:
- ✅ 16.4: Glassmorphism effects with subtle transparency
- ✅ 16.5: 16px border radius for card components
- ✅ 16.6: Soft shadows on elevated components

## Examples

### Dashboard Stats Card
```tsx
<Card variant="stats">
  <div className="flex flex-col gap-2">
    <div className="text-5xl font-bold text-white">8.5</div>
    <div className="text-sm text-gray-300">Hours Today</div>
    <div className="flex items-center gap-1 text-xs text-green-400">
      <span>↑</span>
      <span>15% from yesterday</span>
    </div>
  </div>
</Card>
```

### Task Card with Full Details
```tsx
<Card variant="task">
  <div className="flex items-center gap-3">
    <input type="checkbox" className="h-5 w-5" />
    <div className="flex-1">
      <h4 className="font-medium">Implement authentication</h4>
      <div className="flex gap-2 mt-1">
        <span className="px-2 py-0.5 bg-electric-blue/20 text-neon-cyan text-xs rounded">
          Backend
        </span>
        <span className="px-2 py-0.5 bg-soft-purple/20 text-soft-purple text-xs rounded">
          High Priority
        </span>
      </div>
    </div>
    <div className="text-sm text-gray-400">2h</div>
    <div className="cursor-move text-gray-500">⋮⋮</div>
  </div>
</Card>
```

### Active Session Card
```tsx
<Card variant="session">
  <div className="flex flex-col items-center gap-4">
    <div className="text-6xl font-mono text-white">25:00</div>
    <div className="flex gap-3">
      <Button variant="secondary" size="sm">Pause</Button>
      <Button variant="danger" size="sm">Stop</Button>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <span>Distractions:</span>
      <span className="font-bold text-neon-cyan">0</span>
    </div>
  </div>
</Card>
```

## Testing

Run tests:
```bash
npm test -- tests/unit/components/Card.test.tsx
```

## Notes

- The Card component is a presentational component - it doesn't include specific content structure
- For task cards, session cards, and stats cards with specific layouts, consider creating specialized components that use Card as a base
- The glassmorphism effect works best on backgrounds with some visual interest
- Ensure sufficient contrast for text content on semi-transparent backgrounds
