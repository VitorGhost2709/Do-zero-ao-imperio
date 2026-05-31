import { useEffect } from 'react';
import { Header } from './components/Header';
import { StatusPanel } from './components/StatusPanel';
import { CharacterSummary } from './components/CharacterSummary';
import { MonthlySummary } from './components/MonthlySummary';
import { ActionPanel } from './components/ActionPanel';
import { ProgressTabs } from './components/ProgressTabs';
import { UpgradeShop } from './components/UpgradeShop';
import { HistoryLog } from './components/HistoryLog';
import { EventModal } from './components/EventModal';
import { GameOverScreen } from './components/GameOverScreen';
import { CharacterCreationScreen } from './components/CharacterCreationScreen';
import { NotificationStack } from './components/NotificationStack';
import { DangerAlert } from './components/ui/DangerAlert';
import { SuggestedGoalPanel } from './components/SuggestedGoalPanel';
import { useGameStore } from './store/gameStore';
import { useAuthStore } from './store/authStore';

function App() {
  const hydrate = useGameStore((s) => s.hydrate);
  const profileComplete = useGameStore((s) => s.profileComplete);
  const initAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    hydrate();
    const cleanupAuth = initAuth();
    return cleanupAuth;
  }, [hydrate, initAuth]);

  if (!profileComplete) {
    return <CharacterCreationScreen />;
  }

  return (
    <div className="min-h-screen bg-empire-bg">
      <Header />
      <NotificationStack />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-4">
          <DangerAlert />
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="order-2 lg:order-1 lg:col-span-3">
            <StatusPanel />
          </div>

          <div className="order-1 space-y-4 lg:order-2 lg:col-span-6">
            <CharacterSummary />
            <SuggestedGoalPanel />
            <MonthlySummary />
            <ActionPanel />
            <ProgressTabs />
          </div>

          <div className="order-3 space-y-4 lg:col-span-3">
            <UpgradeShop />
            <HistoryLog />
          </div>
        </div>
      </main>

      <EventModal />
      <GameOverScreen />
    </div>
  );
}

export default App;
