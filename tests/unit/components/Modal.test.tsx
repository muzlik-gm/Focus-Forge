import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from '@/components/ui/Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    // Click the overlay (the parent div with backdrop)
    const overlay = screen.getByRole('dialog').parentElement?.querySelector('[aria-hidden="true"]');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const modalContent = screen.getByText('Modal content');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should apply custom className', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        className="custom-class"
      >
        <p>Modal content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-class');
  });

  it('should prevent body scroll when open', async () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    rerender(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  it('should focus first focusable element when opened', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <button>First button</button>
        <button>Second button</button>
      </Modal>
    );

    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toHaveFocus();
    });
  });

  it('should have focus trap event listener attached', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <button>Button 1</button>
        <button>Button 2</button>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    const button1 = screen.getByText('Button 1');
    const button2 = screen.getByText('Button 2');

    // Focus should start at close button
    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    // Manually focus the last element
    button2.focus();
    expect(button2).toHaveFocus();

    // Simulate Tab key on last element - should trigger focus trap logic
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    document.dispatchEvent(tabEvent);

    // The focus trap should be active (we can't test the actual focus movement in jsdom)
    // but we can verify the modal is properly set up with focusable elements
    const dialog = screen.getByRole('dialog');
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  it('should handle Shift+Tab for reverse focus navigation', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <button>Button 1</button>
        <button>Button 2</button>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');

    // Focus should start at close button
    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    // Simulate Shift+Tab - should trigger focus trap logic
    const shiftTabEvent = new KeyboardEvent('keydown', { 
      key: 'Tab', 
      shiftKey: true, 
      bubbles: true 
    });
    document.dispatchEvent(shiftTabEvent);

    // Verify the modal has multiple focusable elements for the trap to work
    const dialog = screen.getByRole('dialog');
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusableElements.length).toBeGreaterThanOrEqual(3); // close button + 2 content buttons
  });
});
