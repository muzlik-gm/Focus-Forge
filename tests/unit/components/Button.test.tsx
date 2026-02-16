import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Variants', () => {
    it('renders primary variant with correct styles', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: /primary button/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-electric-blue');
      expect(button).toHaveClass('text-white');
    });

    it('renders secondary variant with correct styles', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: /secondary button/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border');
    });

    it('renders danger variant with correct styles', () => {
      render(<Button variant="danger">Danger Button</Button>);
      const button = screen.getByRole('button', { name: /danger button/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders icon variant with correct styles', () => {
      render(<Button variant="icon">🔍</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('renders medium size correctly (default)', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button', { name: /medium/i });
      
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-base');
    });

    it('renders large size correctly', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: /large/i });
      
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-lg');
    });

    it('renders icon sizes correctly', () => {
      const { rerender } = render(<Button variant="icon" size="sm">🔍</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('w-8');

      rerender(<Button variant="icon" size="md">🔍</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('w-10');

      rerender(<Button variant="icon" size="lg">🔍</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('w-12');
    });
  });

  describe('States', () => {
    it('applies hover styles', () => {
      render(<Button variant="primary">Hover Me</Button>);
      const button = screen.getByRole('button', { name: /hover me/i });
      
      expect(button).toHaveClass('hover:bg-blue-700');
      expect(button).toHaveClass('hover:shadow-md');
    });

    it('applies active styles', () => {
      render(<Button variant="primary">Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      
      expect(button).toHaveClass('active:shadow-inner');
    });

    it('applies focus styles', () => {
      render(<Button variant="primary">Focus Me</Button>);
      const button = screen.getByRole('button', { name: /focus me/i });
      
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
      expect(button).toHaveClass('focus-visible:ring-electric-blue');
    });

    it('handles disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Keyboard</Button>);
      const button = screen.getByRole('button', { name: /keyboard/i });
      
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button', { name: /accessible button/i });
      
      expect(button).toBeInTheDocument();
    });

    it('supports custom aria attributes', () => {
      render(
        <Button aria-label="Custom Label" aria-describedby="description">
          Button
        </Button>
      );
      const button = screen.getByRole('button', { name: /custom label/i });
      
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('supports ref forwarding', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button', { name: /custom/i });
      
      expect(button).toHaveClass('custom-class');
    });

    it('merges custom className with default styles', () => {
      render(<Button className="custom-class" variant="primary">Merged</Button>);
      const button = screen.getByRole('button', { name: /merged/i });
      
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-electric-blue');
    });
  });

  describe('Default Props', () => {
    it('uses primary variant by default', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button', { name: /default/i });
      
      expect(button).toHaveClass('bg-electric-blue');
    });

    it('uses medium size by default', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button', { name: /default size/i });
      
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });
  });
});
