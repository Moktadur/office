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
import { useGame } from '../context/GameContext';
import { SpiderEmblem } from '../components/SpiderEmblem';
import { TraversalRunner } from './TraversalRunner';
import { CombatArena } from './CombatArena';
import { sounds } from '../services/soundEffects';

export const PatrolScreen: React.FC = () => {
  const { state, currentSuit, switchHero } = useGame();
  const isPeter = state.hero === 'peter';

  // Modal launchers for gameplay modes
  const [activeMode, setActiveMode] = useState<
    'none' | 'traversal' | 'combat_symbiote' | 'combat_hunter' | 'combat_venom'
  >('none');

  const launchMode = (
    mode: 'traversal' | 'combat_symbiote' | 'combat_hunter' | 'combat_venom'
  ) => {
    sounds.playThwip();
    setActiveMode(mode);
  };

  const closeMode = () => {
    setActiveMode('none');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Showcase Card */}
      <View
        style={[
          styles.heroShowcase,
          {
            borderColor: currentSuit.colors.primary,
            backgroundColor: isPeter ? '#130B10' : '#14110A',
          },
        ]}
      >
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroBadge}>
            <SpiderEmblem
              size={36}
              color={currentSuit.colors.primary}
              glowColor={currentSuit.colors.glow}
              isSymbiote={currentSuit.id === 'peter_symbiote_black'}
            />
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>
                {isPeter ? 'PETER PARKER' : 'MILES MORALES'}
              </Text>
              <Text style={styles.suitSubtitle} numberOfLines={1}>
                {currentSuit.name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.switchHeroBtn,
              { backgroundColor: isPeter ? '#E5252122' : '#F59E0B22' },
            ]}
            onPress={switchHero}
            activeOpacity={0.7}
          >
            <Ionicons
              name="swap-horizontal"
              size={14}
              color={isPeter ? '#EF4444' : '#F59E0B'}
            />
            <Text
              style={[
                styles.switchHeroText,
                { color: isPeter ? '#EF4444' : '#F59E0B' },
              ]}
            >
              SWITCH
            </Text>
          </TouchableOpacity>
        </View>

        {/* Suit Perk Badge */}
        <View style={styles.perkContainer}>
          <Ionicons
            name={currentSuit.perkIcon as any}
            size={16}
            color={currentSuit.colors.glow}
          />
          <Text style={styles.perkText} numberOfLines={2}>
            {currentSuit.specialPerk}
          </Text>
        </View>

        {/* Suit Stat Bars */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statHead}>
              <Text style={styles.statName}>TRAVERSAL</Text>
              <Text style={styles.statNumber}>{currentSuit.stats.traversal}</Text>
            </View>
            <View style={styles.statBarBg}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${currentSuit.stats.traversal}%`,
                    backgroundColor: '#00E5FF',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHead}>
              <Text style={styles.statName}>DAMAGE</Text>
              <Text style={styles.statNumber}>{currentSuit.stats.damage}</Text>
            </View>
            <View style={styles.statBarBg}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${currentSuit.stats.damage}%`,
                    backgroundColor: '#EF4444',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHead}>
              <Text style={styles.statName}>DEFENSE</Text>
              <Text style={styles.statNumber}>{currentSuit.stats.defense}</Text>
            </View>
            <View style={styles.statBarBg}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${currentSuit.stats.defense}%`,
                    backgroundColor: '#10B981',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHead}>
              <Text style={styles.statName}>FOCUS RATE</Text>
              <Text style={styles.statNumber}>{currentSuit.stats.focusRate}</Text>
            </View>
            <View style={styles.statBarBg}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${currentSuit.stats.focusRate}%`,
                    backgroundColor: '#F59E0B',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* SECTION: PATROL MISSIONS & ACTION MODES */}
      <View style={styles.sectionHeader}>
        <Ionicons name="flash" size={18} color="#EF4444" />
        <Text style={styles.sectionTitle}>DEPLOY TO NEW YORK CITY</Text>
      </View>

      {/* Mode 1: Traversal Runner */}
      <TouchableOpacity
        style={[styles.launchCard, styles.traversalCard]}
        onPress={() => launchMode('traversal')}
        activeOpacity={0.8}
      >
        <View style={styles.launchCardGlow} />
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardIconBadge}>
            <Ionicons name="airplane" size={24} color="#00E5FF" />
          </View>
          <View style={styles.cardMeta}>
            <View style={styles.modeTag}>
              <Text style={styles.modeTagText}>HIGH SPEED TRAVERSAL</Text>
            </View>
            <Text style={styles.cardTitle}>NYC Web-Wings & City Rush</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Swing through Manhattan skyscraper canyons, deploy aerodynamic Web Wings in supersonic wind tunnels, dodge Hunter drones, and collect rare Spider-Bots!
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metricPill}>
            <Ionicons name="trophy" size={12} color="#FBBF24" />
            <Text style={styles.metricPillText}>
              BEST: {state.highScoreTraversal} PTS
            </Text>
          </View>
          <View style={styles.actionArrow}>
            <Text style={styles.actionArrowText}>START SWING</Text>
            <Ionicons name="chevron-forward" size={16} color="#00E5FF" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Mode 2: Symbiote Outbreak Combat */}
      <TouchableOpacity
        style={[styles.launchCard, styles.symbioteCard]}
        onPress={() => launchMode('combat_symbiote')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.cardIconBadge, { backgroundColor: '#3B0764' }]}>
            <Ionicons name="skull" size={24} color="#C084FC" />
          </View>
          <View style={styles.cardMeta}>
            <View style={[styles.modeTag, { backgroundColor: '#581C87' }]}>
              <Text style={[styles.modeTagText, { color: '#E9D5FF' }]}>
                COMBAT OUTBREAK
              </Text>
            </View>
            <Text style={styles.cardTitle}>Symbiote Hive Incursion</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Defeat waves of tendril lashers and giant Symbiote Behemoths. Master Spider-Sense parrying, Web Grabber crowd control, and execute Peter's Symbiote Surge!
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metricPill}>
            <Ionicons name="flame" size={12} color="#EF4444" />
            <Text style={styles.metricPillText}>
              PURGED: {state.symbiotesPurged}
            </Text>
          </View>
          <View style={styles.actionArrow}>
            <Text style={[styles.actionArrowText, { color: '#C084FC' }]}>
              FIGHT SYMBIOTES
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#C084FC" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Mode 3: Kraven Hunter Blind Ambush */}
      <TouchableOpacity
        style={[styles.launchCard, styles.hunterCard]}
        onPress={() => launchMode('combat_hunter')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.cardIconBadge, { backgroundColor: '#451A03' }]}>
            <Ionicons name="shield" size={24} color="#F59E0B" />
          </View>
          <View style={styles.cardMeta}>
            <View style={[styles.modeTag, { backgroundColor: '#78350F' }]}>
              <Text style={[styles.modeTagText, { color: '#FDE68A' }]}>
                FACTION CONFLICT
              </Text>
            </View>
            <Text style={styles.cardTitle}>Kraven's Hunter Ambush</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Infiltrate fortified hunter rooftops, neutralize automated robotic hound turrets, counter electric spears, and unleash Miles' Mega Venom Blast!
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metricPill}>
            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
            <Text style={styles.metricPillText}>
              HUNTERS: {state.huntersStopped}
            </Text>
          </View>
          <View style={styles.actionArrow}>
            <Text style={[styles.actionArrowText, { color: '#F59E0B' }]}>
              ENGAGE HUNTERS
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Mode 4: Climax Boss Battle vs Venom */}
      <TouchableOpacity
        style={[styles.launchCard, styles.bossCard]}
        onPress={() => launchMode('combat_venom')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.cardIconBadge, { backgroundColor: '#581C87' }]}>
            <Ionicons name="alert-circle" size={26} color="#EF4444" />
          </View>
          <View style={styles.cardMeta}>
            <View style={[styles.modeTag, { backgroundColor: '#7F1D1D' }]}>
              <Text style={[styles.modeTagText, { color: '#FCA5A5' }]}>
                EPIC BOSS BATTLE
              </Text>
            </View>
            <Text style={[styles.cardTitle, { color: '#F87171' }]}>
              Clash with Venom
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Face the alien symbiote behemoth himself. Dodge lethal ground shockwaves, counter with perfect parries, and fight together as Peter and Miles!
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metricPill}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.metricPillText}>REWARDS: +80 TECH / +4 TOKENS</Text>
          </View>
          <View style={styles.actionArrow}>
            <Text style={[styles.actionArrowText, { color: '#EF4444' }]}>
              BOSS FIGHT
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </View>
        </View>
      </TouchableOpacity>

      {/* CAREER MILESTONES SUMMARY */}
      <View style={styles.careerGrid}>
        <View style={styles.careerStatBox}>
          <Text style={styles.careerVal}>
            {(state.totalDistance / 1000).toFixed(1)} km
          </Text>
          <Text style={styles.careerLabel}>Total Swung</Text>
        </View>
        <View style={styles.careerStatBox}>
          <Text style={styles.careerVal}>{state.crimesCompleted}</Text>
          <Text style={styles.careerLabel}>Crimes Stopped</Text>
        </View>
        <View style={styles.careerStatBox}>
          <Text style={styles.careerVal}>{state.perfectParries}</Text>
          <Text style={styles.careerLabel}>Perfect Parries</Text>
        </View>
        <View style={styles.careerStatBox}>
          <Text style={styles.careerVal}>{state.highestCombo}x</Text>
          <Text style={styles.careerLabel}>Combo Record</Text>
        </View>
      </View>

      {/* FULLSCREEN GAME PLAY MODALS */}
      <Modal visible={activeMode === 'traversal'} animationType="slide">
        <TraversalRunner onClose={closeMode} />
      </Modal>

      <Modal visible={activeMode === 'combat_symbiote'} animationType="slide">
        <CombatArena encounterType="symbiote" onClose={closeMode} />
      </Modal>

      <Modal visible={activeMode === 'combat_hunter'} animationType="slide">
        <CombatArena encounterType="hunter" onClose={closeMode} />
      </Modal>

      <Modal visible={activeMode === 'combat_venom'} animationType="slide">
        <CombatArena encounterType="venom_boss" onClose={closeMode} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  heroShowcase: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTextCol: {
    gap: 2,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  suitSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  switchHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF22',
  },
  switchHeroText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  perkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00000044',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF11',
  },
  perkText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#00000033',
    padding: 8,
    borderRadius: 8,
  },
  statHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  statNumber: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  statBarBg: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  launchCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  traversalCard: {
    borderColor: '#06B6D4',
    backgroundColor: '#081726',
  },
  symbioteCard: {
    borderColor: '#7E22CE',
    backgroundColor: '#160B24',
  },
  hunterCard: {
    borderColor: '#D97706',
    backgroundColor: '#1C150A',
  },
  bossCard: {
    borderColor: '#DC2626',
    backgroundColor: '#200B10',
  },
  launchCardGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00E5FF11',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0E3B43',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
  },
  modeTag: {
    backgroundColor: '#0E7490',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  modeTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#CFFAFE',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF11',
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  actionArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionArrowText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00E5FF',
    letterSpacing: 0.5,
  },
  careerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  careerStatBox: {
    alignItems: 'center',
  },
  careerVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  careerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
});
