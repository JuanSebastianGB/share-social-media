import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowOnPurpose({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('intentional test error');
  }
  return <div>child content</div>;
}

describe('ErrorBoundary', () => {
  it('child renders without error — shows child content', () => {
    // Arrange / Act
    render(
      <ErrorBoundary fallBackComponent={<div>fallback</div>} resetCondition={1}>
        <ThrowOnPurpose shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('child throws — shows fallBackComponent and hides child content', () => {
    // Arrange
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    // Act
    render(
      <ErrorBoundary fallBackComponent={<div>fallback ui</div>} resetCondition={1}>
        <ThrowOnPurpose shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('fallback ui')).toBeInTheDocument();
    expect(screen.queryByText('child content')).not.toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('resetCondition changes and child no longer throws — recovers to child content', () => {
    // Arrange
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const { rerender } = render(
      <ErrorBoundary fallBackComponent={<div>fallback ui</div>} resetCondition={1}>
        <ThrowOnPurpose shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('fallback ui')).toBeInTheDocument();

    // Act
    rerender(
      <ErrorBoundary fallBackComponent={<div>fallback ui</div>} resetCondition={2}>
        <ThrowOnPurpose shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.queryByText('fallback ui')).not.toBeInTheDocument();

    consoleError.mockRestore();
  });
});
