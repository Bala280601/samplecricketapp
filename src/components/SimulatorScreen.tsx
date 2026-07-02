import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import { 
  MatchState, 
  initialMatchState, 
  recordInteractiveDelivery, 
  generateSimulatedOutcome, 
  formatOvers 
} from '../utils/cricketEngine';
import { PlayIcon, PauseIcon, FastForwardIcon, BackIcon, TrophyIcon, BallIcon, BatIcon } from './CustomIcons';

const { width } = Dimensions.get('window');

interface SimulatorScreenProps {
  team1: string;
  team2: string;
  maxOvers: number;
  onBack: () => void;
}

type TabType = 'commentary' | 'scorecard';

export const SimulatorScreen: React.FC<SimulatorScreenProps> = ({
  team1,
  team2,
  maxOvers,
  onBack,
}) => {
  const [matchState, setMatchState] = useState<MatchState>(() => 
    initialMatchState(team1, team2, maxOvers)
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 5>(2); // 1x, 2x, 5x speed
  const [activeTab, setActiveTab] = useState<TabType>('commentary');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Speed mapping in milliseconds: 1x -> 2500ms, 2x -> 1200ms, 5x -> 400ms
  const getIntervalMs = (s: number) => {
    if (s === 1) return 2500;
    if (s === 2) return 1200;
    return 400;
  };

  useEffect(() => {
    if (isPlaying && !matchState.isCompleted) {
      const interval = getIntervalMs(speed);
      timerRef.current = setInterval(() => {
        simulateNextBall();
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, matchState.isCompleted]);

  const simulateNextBall = () => {
    setMatchState(prev => {
      if (prev.isCompleted) return prev;
      
      const activeInnings = prev.innings[prev.currentInningsIndex];
      if (!activeInnings || activeInnings.isCompleted) return prev;

      const striker = activeInnings.batsmen[activeInnings.facingBatsmanIndex];
      const bowler = activeInnings.bowlers[activeInnings.currentBowlerIndex];

      // Generate outcome
      const outcome = generateSimulatedOutcome(striker, bowler);
      
      // Process delivery
      return recordInteractiveDelivery(prev, outcome);
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    setSpeed(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 5;
      return 1;
    });
  };

  const resetMatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMatchState(initialMatchState(team1, team2, maxOvers));
    setIsPlaying(true);
  };

  const activeInnings = matchState.innings[matchState.currentInningsIndex];
  const inn1 = matchState.innings[0];
  const inn2 = matchState.innings[1];

  // Helper stats
  const runRate = activeInnings && activeInnings.balls > 0 
    ? ((activeInnings.runs / activeInnings.balls) * 6).toFixed(2) 
    : '0.00';

  let reqRunRate = '0.00';
  let runsNeeded = 0;
  let ballsRemaining = 0;

  if (matchState.currentInningsIndex === 1 && inn1 && inn2) {
    const target = inn1.runs + 1;
    runsNeeded = target - inn2.runs;
    ballsRemaining = (maxOvers * 6) - inn2.balls;
    if (ballsRemaining > 0 && runsNeeded > 0) {
      reqRunRate = ((runsNeeded / ballsRemaining) * 6).toFixed(2);
    }
  }

  // Get striker, non-striker, and bowler safely
  const striker = activeInnings ? activeInnings.batsmen[activeInnings.facingBatsmanIndex] : null;
  const nonStrikerIndex = activeInnings 
    ? (activeInnings.facingBatsmanIndex === activeInnings.currentBatsman1Index 
        ? activeInnings.currentBatsman2Index 
        : activeInnings.currentBatsman1Index)
    : -1;
  const nonStriker = activeInnings && nonStrikerIndex !== -1 ? activeInnings.batsmen[nonStrikerIndex] : null;
  const bowler = activeInnings ? activeInnings.bowlers[activeInnings.currentBowlerIndex] : null;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <BackIcon size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Live Simulation</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={resetMatch}>
          <Text style={styles.resetBtnText}>Restart</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scoreboard Widget */}
      {activeInnings && (
        <View style={styles.scoreboardWidget}>
          <View style={styles.inningsHeader}>
            <View style={styles.teamBadgeRow}>
              <View style={[styles.miniDot, { backgroundColor: matchState.currentInningsIndex === 0 ? '#FF9933' : '#128C44' }]} />
              <Text style={styles.battingTeamName}>{activeInnings.battingTeam.toUpperCase()}</Text>
              <Text style={styles.inningsLabel}>Innings {matchState.currentInningsIndex + 1}</Text>
            </View>
            <View style={styles.runRateContainer}>
              <Text style={styles.runRateText}>CRR: {runRate}</Text>
              {matchState.currentInningsIndex === 1 && (
                <Text style={styles.runRateText}> | RRR: {reqRunRate}</Text>
              )}
            </View>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>
              {activeInnings.runs}/{activeInnings.wickets}
            </Text>
            <Text style={styles.oversText}>
              ({formatOvers(activeInnings.balls)}/{maxOvers})
            </Text>
          </View>

          {/* Chase info */}
          {matchState.currentInningsIndex === 1 && inn1 && !matchState.isCompleted && (
            <View style={styles.targetBanner}>
              <Text style={styles.targetBannerText}>
                {activeInnings.battingTeam} needs {runsNeeded} runs in {ballsRemaining} balls to win (Target: {inn1.runs + 1})
              </Text>
            </View>
          )}

          {/* Completed message */}
          {matchState.isCompleted && (
            <View style={styles.completedBanner}>
              <TrophyIcon size={18} color="#FFD700" />
              <Text style={styles.completedBannerText}>
                {matchState.resultMessage}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Active Bat / Bowl Stats */}
      {activeInnings && !matchState.isCompleted && striker && (
        <View style={styles.statsCard}>
          {/* Batsmen Column */}
          <View style={styles.batsmenSection}>
            <View style={styles.sectionHeader}>
              <BatIcon size={14} color="#00E676" />
              <Text style={styles.statsHeaderTitle}>BATTING</Text>
            </View>
            
            {/* Striker */}
            <View style={[styles.playerStatRow, styles.activePlayerRow]}>
              <Text style={[styles.playerNameText, styles.activePlayerText]} numberOfLines={1}>
                {striker.name} *
              </Text>
              <Text style={styles.playerScoreText}>
                {striker.runs}({striker.balls})
              </Text>
            </View>

            {/* Non Striker */}
            {nonStriker && (
              <View style={styles.playerStatRow}>
                <Text style={styles.playerNameText} numberOfLines={1}>
                  {nonStriker.name}
                </Text>
                <Text style={styles.playerScoreText}>
                  {nonStriker.runs}({nonStriker.balls})
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statsVerticalDivider} />

          {/* Bowler Column */}
          {bowler && (
            <View style={styles.bowlerSection}>
              <View style={styles.sectionHeader}>
                <BallIcon size={14} color="#00E676" />
                <Text style={styles.statsHeaderTitle}>BOWLING</Text>
              </View>
              
              <View style={[styles.playerStatRow, styles.activePlayerRow]}>
                <Text style={[styles.playerNameText, styles.activePlayerText]} numberOfLines={1}>
                  {bowler.name}
                </Text>
                <Text style={styles.playerScoreText}>
                  {bowler.wickets}/{bowler.runs}
                </Text>
              </View>
              <Text style={styles.bowlerOversText}>
                Overs: {formatOvers(bowler.balls)} | Econ: {bowler.balls > 0 ? ((bowler.runs / bowler.balls) * 6).toFixed(2) : '0.00'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Current Over Progress */}
      {activeInnings && !matchState.isCompleted && (
        <View style={styles.overHistoryRow}>
          <Text style={styles.thisOverLabel}>This Over: </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.overBallsList}>
            {activeInnings.oversHistory.length === 0 ? (
              <Text style={styles.emptyOverText}>Starting over...</Text>
            ) : (
              activeInnings.oversHistory.map((ball, bIdx) => {
                const isWkt = ball === 'W';
                const isBoundary = ball === '4' || ball === '6';
                const isExtra = ball.startsWith('Wd') || ball.startsWith('Nb');
                return (
                  <View 
                    key={bIdx} 
                    style={[
                      styles.ballCircle, 
                      isWkt && styles.wktBall,
                      isBoundary && styles.boundaryBall,
                      isExtra && styles.extraBall
                    ]}
                  >
                    <Text 
                      style={[
                        styles.ballText, 
                        isWkt && styles.wktBallText, 
                        isBoundary && styles.boundaryBallText,
                        isExtra && styles.extraBallText
                      ]}
                    >
                      {ball}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'commentary' && styles.activeTabButton]}
          onPress={() => setActiveTab('commentary')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'commentary' && styles.activeTabButtonText]}>Commentary</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'scorecard' && styles.activeTabButton]}
          onPress={() => setActiveTab('scorecard')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'scorecard' && styles.activeTabButtonText]}>Scorecard</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Contents */}
      {activeTab === 'commentary' ? (
        <FlatList
          data={activeInnings ? activeInnings.ballByBallLog : []}
          keyExtractor={(item, index) => index.toString()}
          style={styles.commentaryList}
          contentContainerStyle={styles.commentaryContent}
          renderItem={({ item }) => {
            const isWicket = item.isWicket;
            const isFour = item.outcomeText === '4';
            const isSix = item.outcomeText === '6';
            
            return (
              <View style={styles.commentaryCard}>
                <View style={styles.commHeader}>
                  <View style={styles.commOverBadge}>
                    <Text style={styles.commOverText}>Ov {item.over}</Text>
                  </View>
                  
                  <View style={[
                    styles.outcomeBadge,
                    isWicket && styles.outcomeWkt,
                    isFour && styles.outcomeFour,
                    isSix && styles.outcomeSix,
                  ]}>
                    <Text style={[
                      styles.outcomeText,
                      (isWicket || isFour || isSix) && styles.outcomeContrastText
                    ]}>
                      {isWicket ? 'WICKET' : item.outcomeText}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commBody}>{item.commentary}</Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Simulation waiting to start...</Text>
            </View>
          }
        />
      ) : (
        <ScrollView style={styles.scorecardScroll} contentContainerStyle={styles.scorecardContent}>
          {/* Innings 1 Scorecard */}
          {inn1 && (
            <View style={styles.scorecardSection}>
              <Text style={styles.scorecardSectionTitle}>{inn1.battingTeam} Batting Scorecard</Text>
              <View style={styles.scorecardTableHeader}>
                <Text style={[styles.thText, styles.thName]}>Batsman</Text>
                <Text style={[styles.thText, styles.thCenter]}>R</Text>
                <Text style={[styles.thText, styles.thCenter]}>B</Text>
                <Text style={[styles.thText, styles.thCenter]}>4s</Text>
                <Text style={[styles.thText, styles.thCenter]}>6s</Text>
                <Text style={[styles.thText, styles.thRight]}>SR</Text>
              </View>
              {inn1.batsmen.map((b, bIdx) => {
                if (b.balls === 0 && !b.out) return null; // haven't batted yet
                return (
                  <View key={bIdx} style={styles.scorecardRow}>
                    <View style={styles.tdNameCol}>
                      <Text style={styles.tdNameText}>{b.name}</Text>
                      <Text style={styles.tdDismissalText}>{b.out ? b.howOut : 'not out'}</Text>
                    </View>
                    <Text style={[styles.tdText, styles.tdCenter, styles.boldText]}>{b.runs}</Text>
                    <Text style={[styles.tdText, styles.tdCenter]}>{b.balls}</Text>
                    <Text style={[styles.tdText, styles.tdCenter]}>{b.fours}</Text>
                    <Text style={[styles.tdText, styles.tdCenter]}>{b.sixes}</Text>
                    <Text style={[styles.tdText, styles.tdRight]}>
                      {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.inningsSummaryRow}>
                <Text style={styles.summaryRunsText}>Total: {inn1.runs}/{inn1.wickets}</Text>
                <Text style={styles.summaryOversText}>Overs: {formatOvers(inn1.balls)}</Text>
              </View>
            </View>
          )}

          {/* Innings 2 Scorecard */}
          {inn2 && (
            <View style={[styles.scorecardSection, { marginTop: 20 }]}>
              <Text style={styles.scorecardSectionTitle}>{inn2.battingTeam} Batting Scorecard</Text>
              <View style={styles.scorecardTableHeader}>
                <Text style={[styles.thText, styles.thName]}>Batsman</Text>
                <Text style={[styles.thText, styles.thCenter]}>R</Text>
                <Text style={[styles.thText, styles.thCenter]}>B</Text>
                <Text style={[styles.thText, styles.thCenter]}>4s</Text>
                <Text style={[styles.thText, styles.thCenter]}>6s</Text>
                <Text style={[styles.thText, styles.thRight]}>SR</Text>
              </View>
              {inn2.batsmen.map((b, bIdx) => {
                if (b.balls === 0 && !b.out) return null;
                return (
                  <View key={bIdx} style={styles.scorecardRow}>
                    <View style={styles.tdNameCol}>
                      <Text style={styles.tdNameText}>{b.name}</Text>
                      <Text style={styles.tdDismissalText}>{b.out ? b.howOut : 'not out'}</Text>
                    </View>
                    <Text style={[styles.tdText, styles.tdCenter, styles.boldText]}>{b.runs}</Text>
                    <Text style={[styles.tdText, styles.tdCenter]}>{b.balls}</Text>
                    <Text style={[styles.tdText, styles.tdCenter]}>{b.fours}</Text>
                    <Text style={[styles.tdText, styles.tdCenter]}>{b.sixes}</Text>
                    <Text style={[styles.tdText, styles.tdRight]}>
                      {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.inningsSummaryRow}>
                <Text style={styles.summaryRunsText}>Total: {inn2.runs}/{inn2.wickets}</Text>
                <Text style={styles.summaryOversText}>Overs: {formatOvers(inn2.balls)}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Simulator Bottom Controls */}
      {!matchState.isCompleted && (
        <View style={styles.bottomControlsBar}>
          <TouchableOpacity 
            style={[styles.controlBtn, styles.speedBtn]} 
            onPress={cycleSpeed}
          >
            <FastForwardIcon size={16} color="#00E676" />
            <Text style={styles.speedBtnText}>{speed}x Speed</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, isPlaying ? styles.pauseBtn : styles.playBtn]} 
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <>
                <PauseIcon size={16} color="#060B08" />
                <Text style={[styles.controlBtnText, { color: '#060B08' }]}>Pause Sim</Text>
              </>
            ) : (
              <>
                <PlayIcon size={16} color="#060B08" />
                <Text style={[styles.controlBtnText, { color: '#060B08' }]}>Resume Sim</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F0D',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#131A17',
  },
  backBtn: {
    padding: 8,
  },
  appBarTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  resetBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreboardWidget: {
    backgroundColor: '#131A17',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  battingTeamName: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  inningsLabel: {
    color: '#7F8C8D',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  runRateContainer: {
    flexDirection: 'row',
  },
  runRateText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
  },
  oversText: {
    color: '#95A5A6',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  targetBanner: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  targetBannerText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  completedBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  completedBannerText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#131A17',
    margin: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  batsmenSection: {
    flex: 1,
  },
  bowlerSection: {
    flex: 1,
  },
  statsVerticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7F8C8D',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  playerStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  activePlayerRow: {
    borderRadius: 4,
  },
  playerNameText: {
    color: '#95A5A6',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    marginRight: 4,
  },
  activePlayerText: {
    color: '#FFF',
    fontWeight: '700',
  },
  playerScoreText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bowlerOversText: {
    color: '#7F8C8D',
    fontSize: 10,
    marginTop: 4,
  },
  overHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A17',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  thisOverLabel: {
    color: '#7F8C8D',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
  },
  overBallsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyOverText: {
    color: '#555',
    fontSize: 11,
    fontStyle: 'italic',
  },
  ballCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#34495E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  ballText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  wktBall: {
    backgroundColor: '#E74C3C',
  },
  wktBallText: {
    color: '#FFF',
  },
  boundaryBall: {
    backgroundColor: '#00E676',
  },
  boundaryBallText: {
    color: '#060B08',
  },
  extraBall: {
    backgroundColor: '#F39C12',
  },
  extraBallText: {
    color: '#FFF',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#131A17',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#1E2723',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  tabButtonText: {
    color: '#7F8C8D',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTabButtonText: {
    color: '#00E676',
  },
  commentaryList: {
    flex: 1,
    marginHorizontal: 12,
  },
  commentaryContent: {
    paddingBottom: 80,
  },
  commentaryCard: {
    backgroundColor: '#131A17',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  commHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commOverBadge: {
    backgroundColor: '#1E2723',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  commOverText: {
    color: '#7F8C8D',
    fontSize: 10,
    fontWeight: '700',
  },
  outcomeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outcomeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  outcomeContrastText: {
    color: '#060B08',
  },
  outcomeWkt: {
    backgroundColor: '#E74C3C',
  },
  outcomeFour: {
    backgroundColor: '#00E676',
  },
  outcomeSix: {
    backgroundColor: '#00E676',
  },
  commBody: {
    color: '#ECF0F1',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#7F8C8D',
    fontSize: 12,
    fontStyle: 'italic',
  },
  scorecardScroll: {
    flex: 1,
    marginHorizontal: 12,
  },
  scorecardContent: {
    paddingBottom: 80,
  },
  scorecardSection: {
    backgroundColor: '#131A17',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scorecardSectionTitle: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  scorecardTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 6,
    marginBottom: 6,
  },
  thText: {
    color: '#7F8C8D',
    fontSize: 10,
    fontWeight: '700',
  },
  thName: {
    flex: 2.5,
  },
  thCenter: {
    flex: 1,
    textAlign: 'center',
  },
  thRight: {
    flex: 1.2,
    textAlign: 'right',
  },
  scorecardRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tdNameCol: {
    flex: 2.5,
  },
  tdNameText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tdDismissalText: {
    color: '#7F8C8D',
    fontSize: 9,
    marginTop: 2,
  },
  tdText: {
    color: '#BDC3C7',
    fontSize: 11,
  },
  tdCenter: {
    flex: 1,
    textAlign: 'center',
  },
  tdRight: {
    flex: 1.2,
    textAlign: 'right',
  },
  boldText: {
    color: '#FFF',
    fontWeight: '700',
  },
  inningsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
  },
  summaryRunsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  summaryOversText: {
    color: '#7F8C8D',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomControlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#131A17',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 8,
  },
  speedBtn: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    flex: 0.45,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  speedBtnText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  playBtn: {
    backgroundColor: '#00E676',
    flex: 0.5,
  },
  pauseBtn: {
    backgroundColor: '#00E676',
    flex: 0.5,
  },
  controlBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});
