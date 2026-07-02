import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { TrophyIcon, BallIcon, BatIcon } from './CustomIcons';

const { width } = Dimensions.get('window');

interface DashboardProps {
  onSelectSimulate: (team1: string, team2: string, overs: number) => void;
  onSelectScorer: () => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({
  onSelectSimulate,
  onSelectScorer,
}) => {
  const simMatches = [
    { team1: 'India', team2: 'Pakistan', overs: 5, t1Color: '#FF9933', t2Color: '#128C44', label: 'T20 Blockbuster' },
    { team1: 'Australia', team2: 'England', overs: 5, t1Color: '#FFD700', t2Color: '#E21B1B', label: 'Ashes Classic (Sim)' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <BallIcon size={28} color="#00E676" />
          <Text style={styles.headerTitle}>CREASE<Text style={styles.headerAccent}>MASTER</Text></Text>
        </View>
        <Text style={styles.headerSub}>Premium Live Cricket & Scoring Companion</Text>
      </View>

      {/* Live Simulation Card */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIndicator} />
        <Text style={styles.sectionTitle}>LIVE SIMULATORS</Text>
      </View>
      
      {simMatches.map((match, idx) => (
        <View key={idx} style={styles.matchCard}>
          <View style={styles.cardHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SIM LIVE</Text>
            </View>
            <Text style={styles.matchLabel}>{match.label}</Text>
          </View>
          
          <View style={styles.vsRow}>
            {/* Team 1 */}
            <View style={styles.teamColumn}>
              <View style={[styles.teamBadge, { backgroundColor: match.t1Color }]}>
                <Text style={styles.teamBadgeText}>{match.team1.substring(0, 3).toUpperCase()}</Text>
              </View>
              <Text style={styles.teamName}>{match.team1}</Text>
            </View>
            
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            
            {/* Team 2 */}
            <View style={styles.teamColumn}>
              <View style={[styles.teamBadge, { backgroundColor: match.t2Color }]}>
                <Text style={styles.teamBadgeText}>{match.team2.substring(0, 3).toUpperCase()}</Text>
              </View>
              <Text style={styles.teamName}>{match.team2}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <Text style={styles.matchInfo}>{match.overs} Overs Match</Text>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => onSelectSimulate(match.team1, match.team2, match.overs)}
            >
              <Text style={styles.actionBtnText}>Watch Simulation</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Interactive Local Scorer section */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIndicator} />
        <Text style={styles.sectionTitle}>LOCAL MATCH UTILITY</Text>
      </View>

      <View style={styles.scorerCard}>
        <View style={styles.scorerIconContainer}>
          <BatIcon size={42} color="#00E676" />
        </View>
        
        <View style={styles.scorerDetails}>
          <Text style={styles.scorerTitle}>Gully & Local Scorer</Text>
          <Text style={styles.scorerDesc}>
            Ditch the notebook! Keep live records of matches with custom teams, track strike rotation, run rates, individual batsmen, and bowler stats dynamically.
          </Text>
          
          <TouchableOpacity style={styles.scorerBtn} onPress={onSelectScorer}>
            <TrophyIcon size={16} color="#060B08" />
            <Text style={styles.scorerBtnText}>Start New Match Scorer</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footerBranding}>
        <Text style={styles.brandingText}>CREASEMASTER © 2026</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F0D', // Deep charcoal-green background
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    marginLeft: 8,
    letterSpacing: 1.5,
  },
  headerAccent: {
    color: '#00E676', // Neon emerald green
  },
  headerSub: {
    fontSize: 12,
    color: '#7F8C8D',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    backgroundColor: '#00E676',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00E676',
    letterSpacing: 1,
  },
  matchCard: {
    backgroundColor: '#131A17',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E74C3C',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E74C3C',
    letterSpacing: 0.5,
  },
  matchLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  vsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  teamColumn: {
    alignItems: 'center',
    width: width * 0.25,
  },
  teamBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  teamBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  teamName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  vsBadge: {
    backgroundColor: '#1E2723',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  vsText: {
    color: '#7F8C8D',
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfo: {
    color: '#7F8C8D',
    fontSize: 12,
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: '#00E676',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#060B08',
    fontSize: 12,
    fontWeight: '700',
  },
  scorerCard: {
    backgroundColor: '#131A17',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
    marginBottom: 24,
  },
  scorerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scorerDetails: {
    flex: 1,
  },
  scorerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  scorerDesc: {
    fontSize: 12,
    color: '#95A5A6',
    lineHeight: 18,
    marginBottom: 16,
  },
  scorerBtn: {
    backgroundColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  scorerBtnText: {
    color: '#060B08',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
  },
  footerBranding: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandingText: {
    fontSize: 10,
    color: '#34495E',
    letterSpacing: 2,
    fontWeight: '600',
  },
});
