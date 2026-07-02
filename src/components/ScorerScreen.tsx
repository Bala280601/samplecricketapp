import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { 
  MatchState, 
  initialMatchState, 
  recordInteractiveDelivery, 
  formatOvers, 
  DeliveryOutcome 
} from '../utils/cricketEngine';
import { BackIcon, TrophyIcon, BallIcon, BatIcon, UndoIcon, WicketIcon } from './CustomIcons';

const { width } = Dimensions.get('window');

interface ScorerScreenProps {
  onBack: () => void;
}

type TabType = 'commentary' | 'scorecard';

export const ScorerScreen: React.FC<ScorerScreenProps> = ({ onBack }) => {
  // Game screens: 'setup' | 'scoring' | 'completed'
  const [screen, setScreen] = useState<'setup' | 'scoring'>('setup');
  const [team1, setTeam1] = useState('My Team A');
  const [team2, setTeam2] = useState('My Team B');
  const [oversInput, setOversInput] = useState('2'); // default 2 overs match

  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [history, setHistory] = useState<MatchState[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('commentary');

  // Wicket flow modal state
  const [showWktModal, setShowWktModal] = useState(false);
  const [wktType, setWktType] = useState<'caught' | 'bowled' | 'lbw' | 'stumped' | 'runout'>('caught');
  const [runoutOutStriker, setRunoutOutStriker] = useState(true);

  // Bowler change state
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [selectedBowlerIndex, setSelectedBowlerIndex] = useState(0);

  const startMatch = () => {
    const overs = parseInt(oversInput, 10) || 2;
    const initial = initialMatchState(team1, team2, overs);
    setMatchState(initial);
    setHistory([]);
    setScreen('scoring');
  };

  const handleRecordBall = (outcome: DeliveryOutcome) => {
    if (!matchState) return;

    // Save history for UNDO
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(matchState))]);

    const target = matchState.currentInningsIndex === 1 && matchState.innings[0]
      ? matchState.innings[0].runs + 1
      : undefined;

    // Process ball
    const nextState = recordInteractiveDelivery(matchState, outcome);
    setMatchState(nextState);

    // Check if over finished and match is not completed
    const activeInnings = nextState.innings[nextState.currentInningsIndex];
    if (activeInnings && !nextState.isCompleted && !activeInnings.isCompleted) {
      const validBalls = activeInnings.balls;
      if (validBalls > 0 && validBalls % 6 === 0 && outcome.type !== 'wide' && outcome.type !== 'noball') {
        // Trigger bowler change dialog
        setShowBowlerModal(true);
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setMatchState(prev);
    setHistory(prevHist => prevHist.slice(0, -1));
  };

  const handleWicketPress = () => {
    setShowWktModal(true);
  };

  const confirmWicket = () => {
    setShowWktModal(false);
    if (!matchState) return;

    const activeInnings = matchState.innings[matchState.currentInningsIndex]!;
    let outIndex = activeInnings.facingBatsmanIndex;
    
    if (wktType === 'runout') {
      outIndex = runoutOutStriker 
        ? activeInnings.facingBatsmanIndex 
        : (activeInnings.facingBatsmanIndex === activeInnings.currentBatsman1Index 
            ? activeInnings.currentBatsman2Index 
            : activeInnings.currentBatsman1Index);
    }

    const outcome: DeliveryOutcome = {
      runs: wktType === 'runout' ? 0 : 0, // Simplified: runout scored 0 runs
      type: 'normal',
      wicket: true,
      wicketType: wktType,
      batsmanOutIndex: outIndex
    };

    handleRecordBall(outcome);
  };

  const handleSelectBowler = (index: number) => {
    if (!matchState) return;
    
    // Save history
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(matchState))]);
    
    const nextState = { ...matchState };
    const inn = nextState.innings[nextState.currentInningsIndex];
    if (inn) {
      inn.currentBowlerIndex = index;
    }
    
    setMatchState(nextState);
    setShowBowlerModal(false);
  };

  if (screen === 'setup') {
    return (
      <View style={styles.container}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <BackIcon size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Local Scorer Setup</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.setupContent} style={{ flex: 1 }}>
          <View style={styles.formContainer}>
            <Text style={styles.setupLabel}>Team 1 (Batting First)</Text>
            <TextInput 
              style={styles.textInput}
              value={team1}
              onChangeText={setTeam1}
              placeholder="e.g. Chennai Super Kings"
              placeholderTextColor="#555"
            />

            <Text style={styles.setupLabel}>Team 2 (Bowling First)</Text>
            <TextInput 
              style={styles.textInput}
              value={team2}
              onChangeText={setTeam2}
              placeholder="e.g. Mumbai Indians"
              placeholderTextColor="#555"
            />

            <Text style={styles.setupLabel}>Overs</Text>
            <View style={styles.oversRow}>
              {['1', '2', '5', '10', '20'].map((ov) => (
                <TouchableOpacity
                  key={ov}
                  style={[styles.overSelectBtn, oversInput === ov && styles.overSelectBtnActive]}
                  onPress={() => setOversInput(ov)}
                >
                  <Text style={[styles.overSelectText, oversInput === ov && styles.overSelectTextActive]}>{ov} Over{ov !== '1' && 's'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={{ marginTop: 10 }}>
              <Text style={styles.setupLabel}>Or enter custom overs limit:</Text>
              <TextInput 
                style={styles.textInput}
                value={oversInput}
                onChangeText={setOversInput}
                keyboardType="numeric"
                placeholder="Limit"
                placeholderTextColor="#555"
              />
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={startMatch}>
              <Text style={styles.startBtnText}>Start Match Scorer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Scoring Screen UI
  if (!matchState) return null;
  const activeInnings = matchState.innings[matchState.currentInningsIndex];
  const inn1 = matchState.innings[0];
  const inn2 = matchState.innings[1];

  const runRate = activeInnings && activeInnings.balls > 0 
    ? ((activeInnings.runs / activeInnings.balls) * 6).toFixed(2) 
    : '0.00';

  let reqRunRate = '0.00';
  let runsNeeded = 0;
  let ballsRemaining = 0;

  if (matchState.currentInningsIndex === 1 && inn1 && inn2) {
    const target = inn1.runs + 1;
    runsNeeded = target - inn2.runs;
    ballsRemaining = (matchState.maxOvers * 6) - inn2.balls;
    if (ballsRemaining > 0 && runsNeeded > 0) {
      reqRunRate = ((runsNeeded / ballsRemaining) * 6).toFixed(2);
    }
  }

  // Get striker, non-striker, bowler safely
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
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <BackIcon size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Local Scorer</Text>
        <TouchableOpacity 
          style={[styles.undoBtn, history.length === 0 && styles.undoBtnDisabled]} 
          onPress={handleUndo}
          disabled={history.length === 0}
        >
          <UndoIcon size={16} color={history.length === 0 ? '#555' : '#FFF'} />
          <Text style={[styles.undoBtnText, { color: history.length === 0 ? '#555' : '#FFF' }]}>Undo</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scoreboard */}
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
              ({formatOvers(activeInnings.balls)}/{matchState.maxOvers})
            </Text>
          </View>

          {/* Target Banner */}
          {matchState.currentInningsIndex === 1 && inn1 && !matchState.isCompleted && (
            <View style={styles.targetBanner}>
              <Text style={styles.targetBannerText}>
                Need {runsNeeded} runs in {ballsRemaining} balls (Target: {inn1.runs + 1})
              </Text>
            </View>
          )}

          {/* Wicket/End Banner */}
          {matchState.isCompleted && (
            <View style={styles.completedBanner}>
              <TrophyIcon size={18} color="#FFD700" />
              <Text style={styles.completedBannerText}>{matchState.resultMessage}</Text>
            </View>
          )}
        </View>
      )}

      {/* Active Batsmen and Bowler Cards */}
      {activeInnings && !matchState.isCompleted && striker && (
        <View style={styles.statsCard}>
          {/* Batsmen Column */}
          <View style={styles.batsmenSection}>
            <View style={styles.sectionHeader}>
              <BatIcon size={14} color="#00E676" />
              <Text style={styles.statsHeaderTitle}>BATTING</Text>
            </View>
            
            <View style={[styles.playerStatRow, styles.activePlayerRow]}>
              <Text style={[styles.playerNameText, styles.activePlayerText]} numberOfLines={1}>
                {striker.name} *
              </Text>
              <Text style={styles.playerScoreText}>{striker.runs}({striker.balls})</Text>
            </View>

            {nonStriker && (
              <View style={styles.playerStatRow}>
                <Text style={styles.playerNameText} numberOfLines={1}>{nonStriker.name}</Text>
                <Text style={styles.playerScoreText}>{nonStriker.runs}({nonStriker.balls})</Text>
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
                <Text style={styles.playerScoreText}>{bowler.wickets}/{bowler.runs}</Text>
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
              <Text style={styles.emptyOverText}>No balls recorded in this over...</Text>
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

      {/* Modals & Dialogs (Inline Overlays for reliability in React Native) */}
      {/* 1. Wicket Selector Overlay */}
      {showWktModal && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Wicket Details</Text>
            
            <Text style={styles.modalSubtitle}>How out?</Text>
            <View style={styles.wktTypesRow}>
              {(['caught', 'bowled', 'lbw', 'stumped', 'runout'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.wktTypeBtn, wktType === type && styles.wktTypeBtnActive]}
                  onPress={() => setWktType(type)}
                >
                  <Text style={[styles.wktTypeBtnText, wktType === type && styles.wktTypeBtnTextActive]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {wktType === 'runout' && striker && nonStriker && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.modalSubtitle}>Who got out?</Text>
                <View style={styles.runoutOptionsRow}>
                  <TouchableOpacity
                    style={[styles.runoutSelectBtn, runoutOutStriker && styles.runoutSelectBtnActive]}
                    onPress={() => setRunoutOutStriker(true)}
                  >
                    <Text style={styles.runoutSelectBtnText}>{striker.name} (Striker)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.runoutSelectBtn, !runoutOutStriker && styles.runoutSelectBtnActive]}
                    onPress={() => setRunoutOutStriker(false)}
                  >
                    <Text style={styles.runoutSelectBtnText}>{nonStriker.name} (Non-Striker)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowWktModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmWicket}>
                <Text style={styles.modalConfirmText}>Confirm Wicket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 2. Bowler Selector Overlay */}
      {showBowlerModal && activeInnings && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>End of Over: Select Next Bowler</Text>
            <ScrollView style={styles.bowlerListScroll}>
              {activeInnings.bowlers.map((b, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.bowlerSelectRow, 
                    activeInnings.currentBowlerIndex === idx && styles.bowlerSelectRowCurrent
                  ]}
                  onPress={() => handleSelectBowler(idx)}
                >
                  <Text style={styles.bowlerNameSelectText}>{b.name}</Text>
                  <Text style={styles.bowlerStatsSelectText}>
                    Overs: {formatOvers(b.balls)} | Wkts: {b.wickets} | Runs: {b.runs}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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

      {/* Tab Content */}
      {activeTab === 'commentary' ? (
        <FlatList
          data={activeInnings ? activeInnings.ballByBallLog : []}
          keyExtractor={(item, index) => index.toString()}
          style={styles.commentaryList}
          contentContainerStyle={styles.commentaryContent}
          renderItem={({ item }) => {
            const isWkt = item.isWicket;
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
                    isWkt && styles.outcomeWkt,
                    isFour && styles.outcomeFour,
                    isSix && styles.outcomeSix,
                  ]}>
                    <Text style={[
                      styles.outcomeText,
                      (isWkt || isFour || isSix) && styles.outcomeContrastText
                    ]}>
                      {isWkt ? 'WICKET' : item.outcomeText}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commBody}>{item.commentary}</Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Start scoring by tapping the buttons below!</Text>
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

      {/* Scoring Input Actions */}
      {!matchState.isCompleted && !showBowlerModal && !showWktModal && (
        <View style={styles.scorerConsole}>
          {/* Extras Row */}
          <View style={styles.consoleRow}>
            <TouchableOpacity 
              style={[styles.consoleBtn, styles.btnExtra]}
              onPress={() => handleRecordBall({ runs: 0, type: 'wide', wicket: false })}
            >
              <Text style={styles.consoleBtnTextLight}>WD</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.consoleBtn, styles.btnExtra]}
              onPress={() => handleRecordBall({ runs: 0, type: 'noball', wicket: false })}
            >
              <Text style={styles.consoleBtnTextLight}>NB</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.consoleBtn, styles.btnExtra]}
              onPress={() => handleRecordBall({ runs: 1, type: 'legbye', wicket: false })}
            >
              <Text style={styles.consoleBtnTextLight}>LB</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.consoleBtn, styles.btnExtra]}
              onPress={() => handleRecordBall({ runs: 1, type: 'bye', wicket: false })}
            >
              <Text style={styles.consoleBtnTextLight}>BYE</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.consoleBtn, styles.btnWicket]}
              onPress={handleWicketPress}
            >
              <WicketIcon size={14} color="#FFF" />
              <Text style={[styles.consoleBtnText, { marginLeft: 4 }]}>WKT</Text>
            </TouchableOpacity>
          </View>

          {/* Runs Row */}
          <View style={styles.consoleRow}>
            {[0, 1, 2, 3, 4, 6].map((runValue) => {
              const isBoundary = runValue === 4 || runValue === 6;
              return (
                <TouchableOpacity 
                  key={runValue}
                  style={[
                    styles.consoleBtn, 
                    styles.btnRun,
                    isBoundary && styles.btnBoundary
                  ]}
                  onPress={() => handleRecordBall({ runs: runValue, type: 'normal', wicket: false })}
                >
                  <Text style={[
                    styles.consoleBtnText,
                    isBoundary && styles.consoleBtnTextDark
                  ]}>
                    {runValue === 0 ? 'DOT' : runValue}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  undoBtnDisabled: {
    backgroundColor: 'transparent',
  },
  undoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  setupContent: {
    padding: 16,
    paddingTop: 30,
  },
  formContainer: {
    backgroundColor: '#131A17',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  setupLabel: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#1E2723',
    color: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  oversRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overSelectBtn: {
    backgroundColor: '#1E2723',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  overSelectBtnActive: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  overSelectText: {
    color: '#BDC3C7',
    fontSize: 11,
    fontWeight: '700',
  },
  overSelectTextActive: {
    color: '#060B08',
  },
  startBtn: {
    backgroundColor: '#00E676',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  startBtnText: {
    color: '#060B08',
    fontSize: 15,
    fontWeight: '800',
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
    paddingBottom: 150,
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
    paddingBottom: 150,
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  modalCard: {
    width: width * 0.85,
    backgroundColor: '#131A17',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '700',
    marginBottom: 8,
  },
  wktTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  wktTypeBtn: {
    backgroundColor: '#1E2723',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  wktTypeBtnActive: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  wktTypeBtnText: {
    color: '#BDC3C7',
    fontSize: 10,
    fontWeight: '700',
  },
  wktTypeBtnTextActive: {
    color: '#FFF',
  },
  runoutOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  runoutSelectBtn: {
    flex: 1,
    backgroundColor: '#1E2723',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  runoutSelectBtnActive: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0,230,118,0.05)',
  },
  runoutSelectBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#7F8C8D',
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bowlerListScroll: {
    maxHeight: 250,
  },
  bowlerSelectRow: {
    backgroundColor: '#1E2723',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bowlerSelectRowCurrent: {
    borderWidth: 1,
    borderColor: '#00E676',
  },
  bowlerNameSelectText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  bowlerStatsSelectText: {
    color: '#7F8C8D',
    fontSize: 10,
  },
  scorerConsole: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#131A17',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    gap: 8,
    paddingBottom: 24, // extra padding for bottom notches
  },
  consoleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  consoleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnExtra: {
    backgroundColor: '#1E2723',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  consoleBtnTextLight: {
    color: '#7F8C8D',
    fontSize: 11,
    fontWeight: '800',
  },
  btnWicket: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
    flexDirection: 'row',
  },
  btnRun: {
    backgroundColor: '#1E2723',
  },
  btnBoundary: {
    backgroundColor: '#00E676',
  },
  consoleBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  consoleBtnTextDark: {
    color: '#060B08',
  },
});
