import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock ReactFlow to avoid issues with JSDOM
vi.mock('reactflow', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="rf-root">{children}</div>
  ),
  Background: () => <div data-testid="rf-background" />,
  Controls: () => <div data-testid="rf-controls" />,
  MiniMap: () => <div data-testid="rf-minimap" />,
  Panel: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="rf-panel" className={className}>
      {children}
    </div>
  ),
  BackgroundVariant: { Dots: 'dots' },
}));

describe('App Dashboard Layout', () => {
  it('renders the Toolbox sidebar', () => {
    render(<App />);
    expect(screen.getByText('Toolbox')).toBeInTheDocument();
  });

  it('renders the Inspector sidebar', () => {
    render(<App />);
    expect(screen.getByText('Inspector')).toBeInTheDocument();
  });

  it('renders the Canvas with React Flow', () => {
    render(<App />);
    expect(screen.getByTestId('rf-root')).toBeInTheDocument();
  });
});
