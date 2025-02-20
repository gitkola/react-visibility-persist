import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisibilityProvider, createVisibilityBlock } from '../createVisibility';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('createVisibility', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should create a functioning visibility system', () => {
    const [TestBlock, TestToggle] = createVisibilityBlock('test');

    render(
      <VisibilityProvider>
        <TestToggle>Toggle</TestToggle>
        <TestBlock>Content</TestBlock>
      </VisibilityProvider>
    );

    // Content should be visible by default
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Click toggle to hide
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    // Click toggle to show again
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should persist visibility state', () => {
    const [TestBlock, TestToggle] = createVisibilityBlock('test');
    const persistKey = 'test-visibility';

    const TestComponent = () => (
      <VisibilityProvider persistKey={persistKey}>
        <TestToggle>Toggle</TestToggle>
        <TestBlock>Content</TestBlock>
      </VisibilityProvider>
    );

    const { unmount } = render(<TestComponent />);

    // Content should be visible by default
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Hide content
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    // Verify localStorage was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      persistKey,
      expect.any(String)
    );

    // Unmount and remount to test persistence
    unmount();
    render(<TestComponent />);

    // Content should still be hidden
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
