# Modal Component

A fully accessible modal dialog component with overlay, blur effects, focus trapping, and keyboard navigation.

## Features

- **Dark semi-transparent overlay** with blur effect
- **Centered modal box** with 24px padding and 16px border radius
- **Close button** in the top right corner
- **Focus trapping** - keyboard focus stays within the modal
- **Escape key support** - press Escape to close
- **Overlay click support** - click outside to close
- **Smooth animations** - fade in/out with scale effect
- **Body scroll lock** - prevents background scrolling when modal is open
- **WCAG compliant** - proper ARIA attributes and keyboard navigation

## Usage

```tsx
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
      >
        <p>This is the modal content.</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            // Handle action
            setIsOpen(false);
          }}>
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Controls whether the modal is visible |
| `onClose` | `() => void` | Yes | - | Callback function when modal should close |
| `title` | `string` | Yes | - | Title displayed in the modal header |
| `children` | `React.ReactNode` | Yes | - | Content to display in the modal body |
| `className` | `string` | No | `''` | Additional CSS classes for the modal box |

## Modal Types

The Modal component supports various use cases as specified in Requirement 20:

### Create Task Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
  <TaskForm onSubmit={handleSubmit} />
</Modal>
```

### Start Focus Session Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Start Focus Session">
  <SessionForm onSubmit={handleStartSession} />
</Modal>
```

### Invite Team Member Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
  <InviteForm onSubmit={handleInvite} />
</Modal>
```

### Delete Confirmation Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
  <p>Are you sure you want to delete this item?</p>
  <div className="mt-4 flex gap-2 justify-end">
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </div>
</Modal>
```

### Billing Upgrade Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Pro">
  <PricingCard plan="pro" />
  <Button className="mt-4 w-full" onClick={handleUpgrade}>
    Upgrade Now
  </Button>
</Modal>
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move focus to next focusable element within modal
- **Shift + Tab**: Move focus to previous focusable element
- **Escape**: Close the modal
- Focus automatically moves to first focusable element when modal opens
- Focus is trapped within the modal (cannot tab outside)

### ARIA Attributes
- `role="dialog"`: Identifies the element as a dialog
- `aria-modal="true"`: Indicates the modal is modal
- `aria-labelledby`: Links the modal to its title
- `aria-label`: Provides accessible label for close button

### Screen Reader Support
- Modal title is properly announced
- Close button has descriptive label
- Overlay is hidden from screen readers with `aria-hidden="true"`

## Styling

The Modal uses the FocusForge design system:

- **Background**: Dark gray with 95% opacity and backdrop blur
- **Border**: 1px solid gray-800
- **Border Radius**: 16px (rounded-card)
- **Padding**: 24px (p-6)
- **Shadow**: 2xl shadow for depth
- **Overlay**: Black with 60% opacity and backdrop blur

## Animation

The Modal uses Framer Motion for smooth animations:

- **Overlay**: Fades in/out (opacity 0 → 1)
- **Modal Box**: Fades in with scale and slide up effect
- **Duration**: 200ms with ease-out timing
- **Exit Animation**: Reverses the entrance animation

## Requirements Validation

This component satisfies **Requirement 20: Modal System**:

✅ 20.1 - Dark semi-transparent overlay with blur effect  
✅ 20.2 - Centered modal box with 24px padding and 16px radius  
✅ 20.3 - Close icon in top right corner  
✅ 20.4 - Focus trapping within modal  
✅ 20.5 - Escape key closes modal  
✅ 20.6 - Overlay click closes modal  
✅ 20.7 - Supports all modal types (Create Task, Start Focus Session, Invite Team Member, Delete Confirmation, Billing Upgrade)

## Best Practices

1. **Always provide a title** - helps users understand the modal's purpose
2. **Include clear actions** - provide Cancel and Confirm buttons
3. **Keep content focused** - modals should have a single purpose
4. **Handle loading states** - disable buttons during async operations
5. **Validate before closing** - confirm unsaved changes
6. **Use appropriate variants** - danger for destructive actions

## Examples

See `Modal.example.tsx` for complete working examples.
