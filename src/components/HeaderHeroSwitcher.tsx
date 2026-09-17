import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { SpiderEmblem } from './SpiderEmblem';

export const HeaderHeroSwitcher: React.FC = () => {
  const { state, currentSuit, switchHero, toggleSound, toggleHaptics } = useGame();
  const isPeter = state.hero === 'peter';

  return (
    <View style={styles.container}>
      {/* Hero Switcher Bar */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[
            styles.heroButton,
            isPeter ? styles.peterActive : styles.milesActive,
          ]}
          onPress={switchHero}
          activeOpacity={0.8}
        >
          <View style={styles.heroAvatar}>
            <SpiderEmblem
              size={24}
              color={isPeter ? '#FFFFFF' : '#F59E0B'}
              glowColor={isPeter ? '#E52521' : '#00E5FF'}
            />
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>
                {isPeter ? 'PETER PARKER' : 'MILES MORALES'}
              </Text>
              <View
                style={[
                  styles.switchBadge,
                  { backgroundColor: isPeter ? '#E5252133' : '#F59E0B33' },
                ]}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={12}
                  color={isPeter ? '#FF6B6B' : '#FCD34D'}
                />
                <Text
                  style={[
                    styles.switchText,
                    { color: isPeter ? '#FF8787' : '#FDE68A' },
                  ]}
                >
                  SWITCH
                </Text>
              </View>
            </View>
            <Text style={styles.suitName} numberOfLines={1}>
              {currentSuit.name}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Currency & Settings */}
        <View style={styles.rightGroup}>
          {/* Tech Parts */}
          <View style={styles.currencyBadge}>
            <Ionicons name="hardware-chip" size={14} color="#38BDF8" />
            <Text style={styles.currencyText}>{state.techParts}</Text>
          </View>

          {/* Hero Tokens */}
          <View style={[styles.currencyBadge, styles.tokenBadge]}>
            <Ionicons name="shield-checkmark" size={14} color="#FBBF24" />
            <Text style={[styles.currencyText, { color: '#FDE047' }]}>
              {state.heroTokens}
            </Text>
          </View>

          {/* Audio toggle */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleSound}
            activeOpacity={0.7}
          >
            <Ionicons
              name={state.soundEnabled ? 'volume-high' : 'volume-mute'}
              size={17}
              color={state.soundEnabled ? '#38BDF8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Level & XP bar */}
      <View style={styles.xpRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelLabel}>LVL</Text>
          <Text style={styles.levelNum}>{state.level}</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View
            style={[
              styles.xpFill,
              {
                width: `${Math.min(100, (state.xp / state.maxXp) * 100)}%`,
                backgroundColor: isPeter ? '#E52521' : '#F59E0B',
              },
            ]}
          />
        </View>
        <Text style={styles.xpText}>
          {state.xp}/{state.maxXp} XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    maxWidth: '56%',
  },
  peterActive: {
    borderColor: '#E52521',
    backgroundColor: '#1A1215',
  },
  milesActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#1B1710',
  },
  heroAvatar: {
    marginRight: 8,
  },
  heroInfo: {
    flex: 1,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  switchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  switchText: {
    fontSize: 9,
    fontWeight: '700',
  },
  suitName: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tokenBadge: {
    borderColor: '#78350F',
    backgroundColor: '#241407',
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#E52521',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    gap: 2,
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FEE2E2',
  },
  levelNum: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  xpBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
});
