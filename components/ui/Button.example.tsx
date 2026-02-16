/**
 * Button Component Usage Examples
 * 
 * This file demonstrates how to use the Button component with different variants,
 * sizes, and states as specified in Requirement 18.
 */

import { Button } from './Button';

export function ButtonExamples() {
  return (
    <div className="p-8 space-y-8 bg-dark-gray min-h-screen">
      <section>
        <h2 className="text-h3 font-bold text-white mb-4">Button Variants</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="icon">🔍</Button>
        </div>
      </section>

      <section>
        <h2 className="text-h3 font-bold text-white mb-4">Button Sizes</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2 className="text-h3 font-bold text-white mb-4">Icon Button Sizes</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <Button variant="icon" size="sm">🔍</Button>
          <Button variant="icon" size="md">🔍</Button>
          <Button variant="icon" size="lg">🔍</Button>
        </div>
      </section>

      <section>
        <h2 className="text-h3 font-bold text-white mb-4">Button States</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary">Hover Me</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Hover over the first button to see the hover effect. Click to see the active state.
          Tab to the button to see the focus ring.
        </p>
      </section>

      <section>
        <h2 className="text-h3 font-bold text-white mb-4">All Variant Combinations</h2>
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary" size="sm">Primary Small</Button>
            <Button variant="primary" size="md">Primary Medium</Button>
            <Button variant="primary" size="lg">Primary Large</Button>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button variant="secondary" size="sm">Secondary Small</Button>
            <Button variant="secondary" size="md">Secondary Medium</Button>
            <Button variant="secondary" size="lg">Secondary Large</Button>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button variant="danger" size="sm">Danger Small</Button>
            <Button variant="danger" size="md">Danger Medium</Button>
            <Button variant="danger" size="lg">Danger Large</Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-h3 font-bold text-white mb-4">Interactive Examples</h2>
        <div className="flex gap-4 flex-wrap">
          <Button 
            variant="primary" 
            onClick={() => alert('Primary button clicked!')}
          >
            Click Me
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => console.log('Secondary button clicked')}
          >
            Log to Console
          </Button>
          <Button 
            variant="danger" 
            onClick={() => confirm('Are you sure?')}
          >
            Confirm Action
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-h3 font-bold text-white mb-4">Custom Styling</h2>
        <div className="flex gap-4 flex-wrap">
          <Button className="w-full">Full Width Button</Button>
          <Button className="min-w-[200px]">Min Width Button</Button>
        </div>
      </section>
    </div>
  );
}
