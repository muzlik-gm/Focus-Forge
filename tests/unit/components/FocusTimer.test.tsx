import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FocusTimer } from '@/components/timer/FocusTimer';
import { post } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  post: jest.fn(),
}));

const mockPost = post as jest.MockedFunction<typeof post>;

describe('FocusTimer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render in idle state with default duration', () => {
    render(<FocusTimer />);
    
    // Check timer display shows 25:00 (default)
    expect(screen.getByText('25:00')).toBeInTheDocument();
    
    // Check start button is visible
    expect(screen.getByText('Start Focus Session')).toBeInTheDocument();
    
    // Check duration input is visible
    expect(screen.getByLabelText(/session duration/i)).toBeInTheDocument();
  });

  it('should allow changing duration when idle', () => {
    render(<FocusTimer />);
    
    const durationInput = screen.getByLabelText(/session duration/i) as HTMLInputElement;
    
    // Change duration to 30 minutes
    fireEvent.change(durationInput, { target: { value: '30' } });
    
    expect(durationInput.value).toBe('30');
    expect(screen.getByText('30:00')).toBeInTheDocument();
  });

  it('should start a session when start button is clicked', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    render(<FocusTimer />);
    
    const startButton = screen.getByText('Start Focus Session');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/sessions/start', {
        durationMinutes: 25,
      });
    });

    // Check that pause and stop buttons appear
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });
  });

  it('should countdown when running', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    render(<FocusTimer initialDuration={1} />);
    
    const startButton = screen.getByText('Start Focus Session');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    // Initial time should be 01:00
    expect(screen.getByText('01:00')).toBeInTheDocument();

    // Advance timer by 1 second
    jest.advanceTimersByTime(1000);

    // Time should now be 00:59
    await waitFor(() => {
      expect(screen.getByText('00:59')).toBeInTheDocument();
    });
  });

  it('should pause session when pause button is clicked', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    render(<FocusTimer />);
    
    // Start session
    const startButton = screen.getByText('Start Focus Session');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    // Click pause
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/sessions/test-session-id/pause', {});
    });

    // Check that resume button appears
    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
      expect(screen.getByText('⏸ Paused')).toBeInTheDocument();
    });
  });

  it('should resume session when resume button is clicked', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    render(<FocusTimer />);
    
    // Start session
    fireEvent.click(screen.getByText('Start Focus Session'));
    await waitFor(() => expect(screen.getByText('Pause')).toBeInTheDocument());

    // Pause session
    fireEvent.click(screen.getByText('Pause'));
    await waitFor(() => expect(screen.getByText('Resume')).toBeInTheDocument());

    // Resume session
    fireEvent.click(screen.getByText('Resume'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/sessions/test-session-id/resume', {});
    });

    // Check that pause button appears again
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });
  });

  it('should stop session when stop button is clicked', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    render(<FocusTimer />);
    
    // Start session
    fireEvent.click(screen.getByText('Start Focus Session'));
    await waitFor(() => expect(screen.getByText('Stop')).toBeInTheDocument());

    // Stop session
    fireEvent.click(screen.getByText('Stop'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/sessions/test-session-id/stop', {});
    });

    // Check that we're back to idle state
    await waitFor(() => {
      expect(screen.getByText('Start Focus Session')).toBeInTheDocument();
    });
  });

  it('should log distraction when button is clicked', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    render(<FocusTimer />);
    
    // Start session
    fireEvent.click(screen.getByText('Start Focus Session'));
    await waitFor(() => expect(screen.getByText('Log Distraction')).toBeInTheDocument());

    // Initial distraction count should be 0
    expect(screen.getByText('0')).toBeInTheDocument();

    // Log a distraction
    fireEvent.click(screen.getByText('Log Distraction'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/sessions/test-session-id/distraction', {});
    });

    // Distraction count should increment
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('should complete session when timer reaches zero', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    const onComplete = jest.fn();

    render(<FocusTimer initialDuration={1} onSessionComplete={onComplete} />);
    
    // Start session with 1 minute duration
    fireEvent.click(screen.getByText('Start Focus Session'));
    await waitFor(() => expect(screen.getByText('Pause')).toBeInTheDocument());

    // Advance timer by 60 seconds to complete
    jest.advanceTimersByTime(60000);

    // Check completion state
    await waitFor(() => {
      expect(screen.getByText('✓ Completed!')).toBeInTheDocument();
      expect(screen.getByText('🎉 Focus Session Complete!')).toBeInTheDocument();
    });

    // Check that stop API was called
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/sessions/test-session-id/stop', {});
    });

    // Check that callback was called
    expect(onComplete).toHaveBeenCalled();
  });

  it('should display error message when API call fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));

    render(<FocusTimer />);
    
    fireEvent.click(screen.getByText('Start Focus Session'));

    await waitFor(() => {
      expect(screen.getByText(/failed to start session/i)).toBeInTheDocument();
    });
  });

  it('should show elapsed time when running', async () => {
    mockPost.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: 'test-session-id' } }),
    } as Response);

    render(<FocusTimer initialDuration={5} />);
    
    fireEvent.click(screen.getByText('Start Focus Session'));
    await waitFor(() => expect(screen.getByText('Pause')).toBeInTheDocument());

    // Check elapsed time display
    expect(screen.getByText(/Elapsed: 00:00 \/ 5:00/)).toBeInTheDocument();

    // Advance timer by 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByText(/Elapsed: 00:30 \/ 5:00/)).toBeInTheDocument();
    });
  });
});
