import type { PropsWithChildren, ReactNode } from 'react';
import type { StrategyDefinition } from '../types';
import { useDemoState } from '../types';

export function StatePageFrame({
  strategy,
  pageLabel,
  title,
  description,
  children,
  actions
}: PropsWithChildren<{
  strategy: StrategyDefinition;
  pageLabel: string;
  title: string;
  description: string;
  actions?: ReactNode;
}>) {
  return (
    <div className="demo-page state-demo-page">
      <div className="vr-breadcrumb">
        <a href="/">React Demo</a><span>/</span>
        <a href={`/state/${strategy.id}`}>{strategy.label}</a><span>/</span><span>{pageLabel}</span>
      </div>
      <header className="vr-page-heading state-page-heading">
        <div>
          <p className="vr-eyebrow">{strategy.label} integration</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <a className="docs-button" href={`http://127.0.0.1:4201/docs/react-state-${strategy.id}`}>Read Documentation</a>
      </header>
      <StateReadout />
      {actions}
      {children}
    </div>
  );
}

export function StateReadout() {
  const state = useDemoState();
  return (
    <section className="state-readout" aria-label="State store activity">
      <span>Store revision <strong>{state.revision}</strong></span>
      <span>Populated values <strong>{state.populatedValues}</strong></span>
    </section>
  );
}
