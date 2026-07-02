import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardScreen } from './src/components/DashboardScreen';
import { SimulatorScreen } from './src/components/SimulatorScreen';
import { ScorerScreen } from './src/components/ScorerScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#131A17" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [screen, setScreen] = useState<'dashboard' | 'simulator' | 'scorer'>('dashboard');
  const [simConfig, setSimConfig] = useState<{ team1: string; team2: string; overs: number } | null>(null);

  const handleSelectSimulate = (team1: string, team2: string, overs: number) => {
    setSimConfig({ team1, team2, overs });
    setScreen('simulator');
  };

  const handleSelectScorer = () => {
    setScreen('scorer');
  };

  const handleBackToDashboard = () => {
    setScreen('dashboard');
    setSimConfig(null);
  };

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right
      }
    ]}>
      {screen === 'dashboard' && (
        <DashboardScreen 
          onSelectSimulate={handleSelectSimulate}
          onSelectScorer={handleSelectScorer}
        />
      )}
      {screen === 'simulator' && simConfig && (
        <SimulatorScreen 
          team1={simConfig.team1}
          team2={simConfig.team2}
          maxOvers={simConfig.overs}
          onBack={handleBackToDashboard}
        />
      )}
      {screen === 'scorer' && (
        <ScorerScreen 
          onBack={handleBackToDashboard}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F0D',
  },
});

export default App;
