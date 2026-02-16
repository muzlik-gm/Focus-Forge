import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '@/components/ui/Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Card>Test Content</Card>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Variants', () => {
    it('should render standard variant by default', () => {
      const { container } = render(<Card>Standard</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-dark-gray/80');
      expect(card.className).toContain('p-4');
    });

    it('should render stats variant with gradient background', () => {
      const { container } = render(<Card variant="stats">Stats</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-gradient-to-br');
      expect(card.className).toContain('from-electric-blue/20');
      expect(card.className).toContain('to-soft-purple/20');
      expect(card.className).toContain('p-6');
    });

    it('should render task variant with compact padding', () => {
      const { container } = render(<Card variant="task">Task</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-dark-gray/80');
      expect(card.className).toContain('p-3');
    });

    it('should render session variant with medium padding', () => {
      const { container } = render(<Card variant="session">Session</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-dark-gray/80');
      expect(card.className).toContain('p-5');
    });
  });

  describe('Glassmorphism Styling', () => {
    it('should apply backdrop blur to all variants', () => {
      const variants: Array<'standard' | 'stats' | 'task' | 'session'> = [
        'standard',
        'stats',
        'task',
        'session',
      ];

      variants.forEach((variant) => {
        const { container } = render(<Card variant={variant}>Content</Card>);
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain('backdrop-blur-sm');
      });
    });

    it('should apply border to all variants', () => {
      const variants: Array<'standard' | 'stats' | 'task' | 'session'> = [
        'standard',
        'stats',
        'task',
        'session',
      ];

      variants.forEach((variant) => {
        const { container } = render(<Card variant={variant}>Content</Card>);
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain('border');
        expect(card.className).toContain('border-gray-800');
      });
    });

    it('should apply rounded corners to all variants', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('rounded-card');
    });
  });

  describe('Shadow Effects', () => {
    it('should apply shadow to standard variant', () => {
      const { container } = render(<Card variant="standard">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow-lg');
      expect(card.className).toContain('hover:shadow-xl');
    });

    it('should apply shadow to stats variant', () => {
      const { container } = render(<Card variant="stats">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow-lg');
      expect(card.className).toContain('hover:shadow-xl');
    });

    it('should apply smaller shadow to task variant', () => {
      const { container } = render(<Card variant="task">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow-md');
      expect(card.className).toContain('hover:shadow-lg');
    });

    it('should apply shadow to session variant', () => {
      const { container } = render(<Card variant="session">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow-lg');
      expect(card.className).toContain('hover:shadow-xl');
    });
  });

  describe('Custom Styling', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('custom-class');
    });

    it('should merge custom className with base styles', () => {
      const { container } = render(<Card className="max-w-md">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('max-w-md');
      expect(card.className).toContain('rounded-card');
      expect(card.className).toContain('bg-dark-gray/80');
    });
  });

  describe('HTML Attributes', () => {
    it('should accept and apply standard div attributes', () => {
      render(
        <Card data-testid="test-card" role="article">
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');
      expect(card).toHaveAttribute('role', 'article');
    });

    it('should accept onClick handler', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Content</Card>);
      const card = screen.getByText('Content');
      card.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should accept id attribute', () => {
      render(<Card id="my-card">Content</Card>);
      expect(document.getElementById('my-card')).toBeInTheDocument();
    });
  });

  describe('Complex Content', () => {
    it('should render complex nested content', () => {
      render(
        <Card>
          <h3>Title</h3>
          <p>Description</p>
          <button>Action</button>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render stats card structure', () => {
      render(
        <Card variant="stats">
          <div className="text-4xl">1,234</div>
          <div className="text-sm">Focus Hours</div>
          <div className="text-xs">↑ 12%</div>
        </Card>
      );
      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('Focus Hours')).toBeInTheDocument();
      expect(screen.getByText('↑ 12%')).toBeInTheDocument();
    });

    it('should render task card structure', () => {
      render(
        <Card variant="task">
          <input type="checkbox" aria-label="Complete task" />
          <span>Task title</span>
          <span>2h</span>
        </Card>
      );
      expect(screen.getByLabelText('Complete task')).toBeInTheDocument();
      expect(screen.getByText('Task title')).toBeInTheDocument();
      expect(screen.getByText('2h')).toBeInTheDocument();
    });

    it('should render session card structure', () => {
      render(
        <Card variant="session">
          <div>25:00</div>
          <button>Pause</button>
          <button>Stop</button>
          <div>Distractions: 0</div>
        </Card>
      );
      expect(screen.getByText('25:00')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.getByText('Distractions: 0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with semantic content', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card description</p>
        </Card>
      );
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should support ARIA attributes', () => {
      render(
        <Card aria-label="Statistics card" role="region">
          Content
        </Card>
      );
      expect(screen.getByLabelText('Statistics card')).toBeInTheDocument();
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Requirements Validation', () => {
    it('should implement Requirement 19.1 - standard card styling', () => {
      const { container } = render(<Card variant="standard">Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      // Dark background
      expect(card.className).toContain('bg-dark-gray/80');
      // 16px padding (p-4 = 1rem = 16px)
      expect(card.className).toContain('p-4');
      // 16px radius
      expect(card.className).toContain('rounded-card');
      // Soft shadow
      expect(card.className).toContain('shadow-lg');
      // Subtle border
      expect(card.className).toContain('border');
    });

    it('should implement Requirement 19.2 - stats card with gradient', () => {
      const { container } = render(<Card variant="stats">Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      // Background gradient
      expect(card.className).toContain('bg-gradient-to-br');
      expect(card.className).toContain('from-electric-blue/20');
      expect(card.className).toContain('to-soft-purple/20');
    });

    it('should implement Requirement 19.5 - hover lift effect', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      // Hover shadow increase
      expect(card.className).toContain('hover:shadow-xl');
    });

    it('should implement Requirement 19.6 - glassmorphism styling', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      // Backdrop blur for glassmorphism
      expect(card.className).toContain('backdrop-blur-sm');
      // Semi-transparent background
      expect(card.className).toContain('/80');
    });

    it('should implement Requirement 16.4 - glassmorphism effects', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      expect(card.className).toContain('backdrop-blur-sm');
    });

    it('should implement Requirement 16.5 - 16px border radius', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      expect(card.className).toContain('rounded-card');
    });

    it('should implement Requirement 16.6 - soft shadows', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      expect(card.className).toContain('shadow-lg');
    });
  });
});
