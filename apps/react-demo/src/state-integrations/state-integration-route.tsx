import { createPerformanceScenario } from '../performance/performance-generator';
import { COMPLEX_INITIAL_MODEL, SIMPLE_INITIAL_MODEL } from './models';
import { StateComplexPage } from './pages/state-complex-page';
import { StateHomePage } from './pages/state-home-page';
import { StatePerformancePage } from './pages/state-performance-page';
import { StateSimplePage } from './pages/state-simple-page';
import type { StateDemoPage, StrategyDefinition } from './types';

export function StateIntegrationRoute({
  strategy,
  page,
  navigate
}: {
  strategy: StrategyDefinition;
  page: StateDemoPage;
  navigate(path: string): void;
}) {
  const initialModel = page === 'simple'
    ? SIMPLE_INITIAL_MODEL
    : page === 'complex'
      ? COMPLEX_INITIAL_MODEL
      : page === 'performance'
        ? createPerformanceScenario().model
        : { walkthrough: '' };
  const Page = page === 'simple'
    ? StateSimplePage
    : page === 'complex'
      ? StateComplexPage
      : page === 'performance'
        ? StatePerformancePage
        : null;
  return (
    <strategy.Provider initialModel={initialModel}>
      {Page ? <Page strategy={strategy} /> : <StateHomePage strategy={strategy} navigate={navigate} />}
    </strategy.Provider>
  );
}
