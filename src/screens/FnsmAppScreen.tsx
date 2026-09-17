import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DISTRICTS_DATA } from '../constants/districtsData';
import { CrimeAlert, District } from '../types/game';
import { useGame } from '../context/GameContext';
import { TraversalRunner } from './TraversalRunner';
import { CombatArena } from './CombatArena';
import { sounds } from '../services/soundEffects';

export const FnsmAppScreen: React.FC = () => {
  const { state } = useGame();
  const [selectedBorough, setSelectedBorough] = useState<'All' | 'Manhattan' | 'Brooklyn' | 'Queens'>('All');
  const [selectedCrime, setSelectedCrime] = useState<CrimeAlert | null>(null);
  const [activeMission, setActiveMission] = useState<{
    crime: CrimeAlert;
    mode: 'traversal' | 'combat';
  } | null>(null);

  // Filter districts
  const filteredDistricts = DISTRICTS_DATA.filter(
    (d) => selectedBorough === 'All' || d.borough === selectedBorough
  );

  // All crimes
  const allCrimes: (CrimeAlert & { districtName: string })[] = [];
  DISTRICTS_DATA.forEach((d) => {
    d.crimes.forEach((c) => {
      allCrimes.push({
        ...c,
        districtName: d.name,
        completed: state.completedCrimes.includes(c.id),
      });
    });
  });

  const handleLaunchCrime = (crime: CrimeAlert) => {
    sounds.playThwip();
    setActiveMission({
      crime,
      mode: crime.gameMode,
    });
  };

  const closeMission = () => {
    setActiveMission(null);
  };

  return (
    <View style={styles.container}>
      {/* Holographic FNSM Header */}
      <View style={styles.header}>
        <View style={styles.appTitleRow}>
          <View style={styles.appIcon}>
            <Ionicons name="notifications" size={18} color="#00E5FF" />
          </View>
          <View>
            <Text style={styles.appTitle}>FNSM APP DISPATCH</Text>
            <Text style={styles.appSubtitle}>
              Friendly Neighborhood Spider-Man Network v2.4
            </Text>
          </View>
        </View>

        <View style={styles.activePingsBadge}>
          <View style={styles.pingDot} />
          <Text style={styles.pingText}>
            {allCrimes.filter((c) => !c.completed).length} ACTIVE PINGS
          </Text>
        </View>
      </View>

      {/* Borough Filter Tabs */}
      <View style={styles.boroughTabs}>
        {(['All', 'Manhattan', 'Brooklyn', 'Queens'] as const).map((b) => (
          <TouchableOpacity
            key={b}
            style={[
              styles.boroughTab,
              selectedBorough === b && styles.boroughTabActive,
            ]}
            onPress={() => {
              sounds.playClick();
              setSelectedBorough(b);
            }}
          >
            <Text
              style={[
                styles.boroughTabText,
                selectedBorough === b && styles.boroughTabTextActive,
              ]}
            >
              {b.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollList}>
        {/* District Security Status Bar */}
        <View style={styles.districtsOverviewCard}>
          <Text style={styles.overviewTitle}>DISTRICT SECURITY STATUS</Text>
          <View style={styles.districtsGrid}>
            {filteredDistricts.map((d) => {
              const comp = Math.min(
                100,
                d.completion +
                  (d.crimes.filter((c) => state.completedCrimes.includes(c.id)).length /
                    d.crimes.length) *
                    25
              );

              return (
                <View key={d.id} style={styles.districtItem}>
                  <View style={styles.districtNameRow}>
                    <Text style={styles.districtName} numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text style={styles.districtPercent}>{Math.round(comp)}%</Text>
                  </View>
                  <View style={styles.districtBarBg}>
                    <View
                      style={[
                        styles.districtBarFill,
                        {
                          width: `${comp}%`,
                          backgroundColor:
                            comp > 75 ? '#10B981' : comp > 40 ? '#F59E0B' : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Live Crime Feed */}
        <View style={styles.feedHeaderRow}>
          <Ionicons name="radio" size={16} color="#EF4444" />
          <Text style={styles.feedTitle}>LIVE CRIME & EMERGENCY DISPATCH</Text>
        </View>

        {allCrimes
          .filter(
            (c) =>
              selectedBorough === 'All' ||
              DISTRICTS_DATA.find((d) => d.id === c.districtId)?.borough ===
                selectedBorough
          )
          .map((crime) => {
            const isCompleted = crime.completed;

            return (
              <View
                key={crime.id}
                style={[
                  styles.crimeCard,
                  isCompleted && styles.crimeCardCompleted,
                ]}
              >
                {/* Top Row: Type tag & Threat Level */}
                <View style={styles.crimeTopRow}>
                  <View style={styles.typeTagRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        crime.type === 'symbiote_nest'
                          ? styles.badgeSymbiote
                          : crime.type === 'hunter_base'
                          ? styles.badgeHunter
                          : crime.type === 'car_chase'
                          ? styles.badgeChase
                          : styles.badgeTech,
                      ]}
                    >
                      <Ionicons
                        name={
                          crime.type === 'symbiote_nest'
                            ? 'skull'
                            : crime.type === 'hunter_base'
                            ? 'shield'
                            : crime.type === 'car_chase'
                            ? 'car'
                            : 'scan'
                        }
                        size={12}
                        color="#FFFFFF"
                      />
                      <Text style={styles.typeBadgeText}>
                        {crime.type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>

                    <Text style={styles.districtTag}>{crime.districtName}</Text>
                  </View>

                  <View
                    style={[
                      styles.threatBadge,
                      crime.threat === 'Severe'
                        ? styles.threatSevere
                        : crime.threat === 'High'
                        ? styles.threatHigh
                        : styles.threatModerate,
                    ]}
                  >
                    <Text style={styles.threatText}>{crime.threat.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Crime Title & Desc */}
                <Text style={styles.crimeTitle}>{crime.title}</Text>
                <Text style={styles.crimeDescription}>{crime.description}</Text>

                {/* Footer: Rewards & Launch Button */}
                <View style={styles.crimeFooter}>
                  <View style={styles.rewardsRow}>
                    <View style={styles.rewardPill}>
                      <Ionicons name="hardware-chip" size={12} color="#38BDF8" />
                      <Text style={styles.rewardText}>+{crime.techParts}</Text>
                    </View>
                    <View style={styles.rewardPill}>
                      <Ionicons name="shield-checkmark" size={12} color="#FBBF24" />
                      <Text style={[styles.rewardText, { color: '#FDE047' }]}>
                        +{crime.heroTokens}
                      </Text>
                    </View>
                    <View style={styles.rewardPill}>
                      <Text style={styles.xpRewardText}>+{crime.xpReward} XP</Text>
                    </View>
                  </View>

                  {isCompleted ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.completedText}>RESOLVED</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.respondBtn,
                        crime.gameMode === 'traversal'
                          ? styles.respondBtnSpeed
                          : styles.respondBtnCombat,
                      ]}
                      onPress={() => handleLaunchCrime(crime)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={
                          crime.gameMode === 'traversal'
                            ? 'airplane'
                            : 'flash'
                        }
                        size={14}
                        color="#FFFFFF"
                      />
                      <Text style={styles.respondBtnText}>
                        {crime.gameMode === 'traversal' ? 'INTERCEPT' : 'RESPOND'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
      </ScrollView>

      {/* ACTIVE MISSION LAUNCH MODALS */}
      {activeMission && activeMission.mode === 'traversal' && (
        <Modal visible animationType="slide">
          <TraversalRunner
            crimeId={activeMission.crime.id}
            missionTitle={activeMission.crime.title}
            onClose={closeMission}
          />
        </Modal>
      )}

      {activeMission && activeMission.mode === 'combat' && (
        <Modal visible animationType="slide">
          <CombatArena
            crimeId={activeMission.crime.id}
            missionTitle={activeMission.crime.title}
            encounterType={
              activeMission.crime.type === 'hunter_base' ? 'hunter' : 'symbiote'
            }
            onClose={closeMission}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#083344',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  activePingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#270A10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  pingText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F87171',
  },
  boroughTabs: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    gap: 8,
  },
  boroughTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  boroughTabActive: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
  },
  boroughTabText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  boroughTabTextActive: {
    color: '#FFFFFF',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
  },
  districtsOverviewCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
  },
  districtsGrid: {
    gap: 10,
  },
  districtItem: {
    gap: 4,
  },
  districtNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  districtName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  districtPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  districtBarBg: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  districtBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  crimeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  crimeCardCompleted: {
    opacity: 0.6,
    borderColor: '#10B98133',
  },
  crimeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeSymbiote: {
    backgroundColor: '#581C87',
  },
  badgeHunter: {
    backgroundColor: '#78350F',
  },
  badgeChase: {
    backgroundColor: '#0369A1',
  },
  badgeTech: {
    backgroundColor: '#334155',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  districtTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  threatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  threatSevere: {
    backgroundColor: '#450A0A',
  },
  threatHigh: {
    backgroundColor: '#451A03',
  },
  threatModerate: {
    backgroundColor: '#1E293B',
  },
  threatText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F87171',
  },
  crimeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  crimeDescription: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 12,
  },
  crimeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 10,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  xpRewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A855F7',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#10B981',
  },
  respondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  respondBtnSpeed: {
    backgroundColor: '#0284C7',
  },
  respondBtnCombat: {
    backgroundColor: '#DC2626',
  },
  respondBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
