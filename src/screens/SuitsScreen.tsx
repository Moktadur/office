import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { HeroId, Suit, SuitId, TechCategory } from '../types/game';
import { SpiderEmblem } from '../components/SpiderEmblem';
import { sounds } from '../services/soundEffects';

export const SuitsScreen: React.FC = () => {
  const {
    state,
    allSuits,
    allTechUpgrades,
    equipSuit,
    unlockSuit,
    upgradeTech,
    switchHero,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'suits' | 'tech'>('suits');
  const [selectedHero, setSelectedHero] = useState<HeroId>(state.hero);
  const [selectedTechCat, setSelectedTechCat] = useState<TechCategory>('traversal');

  const filteredSuits = allSuits.filter((s) => s.hero === selectedHero);
  const equippedId = selectedHero === 'peter' ? state.peterSuit : state.milesSuit;

  const filteredTech = allTechUpgrades.filter((t) => t.category === selectedTechCat);

  const handleSuitAction = (suit: Suit) => {
    if (suit.unlocked) {
      equipSuit(suit.id);
    } else {
      unlockSuit(suit.id);
    }
  };

  const handleUpgrade = (techId: string) => {
    upgradeTech(techId);
  };

  return (
    <View style={styles.container}>
      {/* Top Toggle: Suits Wardrobe vs Tech Lab */}
      <View style={styles.mainTabs}>
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'suits' && styles.mainTabActive]}
          onPress={() => {
            sounds.playClick();
            setActiveTab('suits');
          }}
        >
          <Ionicons
            name="shirt"
            size={16}
            color={activeTab === 'suits' ? '#FFFFFF' : '#64748B'}
          />
          <Text
            style={[
              styles.mainTabText,
              activeTab === 'suits' && styles.mainTabTextActive,
            ]}
          >
            SUITS WARDROBE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'tech' && styles.mainTabActive]}
          onPress={() => {
            sounds.playClick();
            setActiveTab('tech');
          }}
        >
          <Ionicons
            name="hardware-chip"
            size={16}
            color={activeTab === 'tech' ? '#FFFFFF' : '#64748B'}
          />
          <Text
            style={[
              styles.mainTabText,
              activeTab === 'tech' && styles.mainTabTextActive,
            ]}
          >
            SUIT TECH LAB
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUITS TAB */}
      {activeTab === 'suits' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Selector (Peter vs Miles) */}
          <View style={styles.heroFilterRow}>
            <TouchableOpacity
              style={[
                styles.heroFilterBtn,
                selectedHero === 'peter' && styles.heroFilterPeter,
              ]}
              onPress={() => {
                sounds.playClick();
                setSelectedHero('peter');
              }}
            >
              <SpiderEmblem
                size={20}
                color="#E52521"
                glowColor="#FFFFFF"
              />
              <Text
                style={[
                  styles.heroFilterText,
                  selectedHero === 'peter' && styles.heroFilterTextActive,
                ]}
              >
                PETER PARKER SUITS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.heroFilterBtn,
                selectedHero === 'miles' && styles.heroFilterMiles,
              ]}
              onPress={() => {
                sounds.playClick();
                setSelectedHero('miles');
              }}
            >
              <SpiderEmblem
                size={20}
                color="#F59E0B"
                glowColor="#00E5FF"
              />
              <Text
                style={[
                  styles.heroFilterText,
                  selectedHero === 'miles' && styles.heroFilterTextActive,
                ]}
              >
                MILES MORALES SUITS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Suits List */}
          {filteredSuits.map((suit) => {
            const isEquipped = suit.id === equippedId;
            const canAfford =
              state.techParts >= suit.techCost &&
              state.heroTokens >= suit.tokenCost;

            return (
              <View
                key={suit.id}
                style={[
                  styles.suitCard,
                  isEquipped && styles.suitCardEquipped,
                  !suit.unlocked && styles.suitCardLocked,
                ]}
              >
                <View style={styles.suitTopRow}>
                  <View style={styles.suitEmblemBox}>
                    <SpiderEmblem
                      size={36}
                      color={suit.colors.primary}
                      glowColor={suit.colors.glow}
                      isSymbiote={suit.id === 'peter_symbiote_black'}
                    />
                  </View>

                  <View style={styles.suitInfoCol}>
                    <View style={styles.suitTitleRow}>
                      <Text style={styles.suitName}>{suit.name}</Text>
                      {isEquipped && (
                        <View style={styles.equippedBadge}>
                          <Text style={styles.equippedText}>EQUIPPED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.suitSubtitle}>{suit.subtitle}</Text>
                  </View>
                </View>

                <Text style={styles.suitDescription}>{suit.description}</Text>

                {/* Perk Box */}
                <View style={styles.suitPerkBox}>
                  <Ionicons
                    name={suit.perkIcon as any}
                    size={14}
                    color={suit.colors.glow}
                  />
                  <Text style={styles.suitPerkText}>{suit.specialPerk}</Text>
                </View>

                {/* Stat Meters */}
                <View style={styles.suitStatsRow}>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatName}>TRAV</Text>
                    <Text style={styles.miniStatVal}>{suit.stats.traversal}</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatName}>DMG</Text>
                    <Text style={styles.miniStatVal}>{suit.stats.damage}</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatName}>DEF</Text>
                    <Text style={styles.miniStatVal}>{suit.stats.defense}</Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatName}>FOCUS</Text>
                    <Text style={styles.miniStatVal}>{suit.stats.focusRate}</Text>
                  </View>
                </View>

                {/* Button: Equip or Unlock */}
                <View style={styles.suitActionRow}>
                  {suit.unlocked ? (
                    <TouchableOpacity
                      style={[
                        styles.suitBtn,
                        isEquipped ? styles.suitBtnEquipped : styles.suitBtnEquip,
                      ]}
                      onPress={() => handleSuitAction(suit)}
                      disabled={isEquipped}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isEquipped ? 'checkmark' : 'shield'}
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.suitBtnText}>
                        {isEquipped ? 'CURRENT SUIT' : 'EQUIP SUIT'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.suitBtn,
                        styles.suitBtnUnlock,
                        !canAfford && styles.suitBtnCantAfford,
                      ]}
                      onPress={() => handleSuitAction(suit)}
                      disabled={!canAfford}
                      activeOpacity={0.8}
                    >
                      <View style={styles.unlockCostGroup}>
                        <View style={styles.costItem}>
                          <Ionicons name="hardware-chip" size={13} color="#38BDF8" />
                          <Text style={styles.costText}>{suit.techCost}</Text>
                        </View>
                        <View style={styles.costItem}>
                          <Ionicons name="shield-checkmark" size={13} color="#FBBF24" />
                          <Text style={[styles.costText, { color: '#FDE047' }]}>
                            {suit.tokenCost}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.unlockBtnText}>
                        {canAfford ? 'FABRICATE SUIT' : 'LOCKED'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* TECH UPGRADES TAB */}
      {activeTab === 'tech' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Category Tabs */}
          <View style={styles.techCatRow}>
            {(
              [
                { id: 'traversal', name: 'TRAVERSAL', icon: 'airplane' },
                { id: 'damage', name: 'DAMAGE', icon: 'flash' },
                { id: 'health', name: 'HEALTH', icon: 'medkit' },
                { id: 'focus', name: 'FOCUS', icon: 'speedometer' },
              ] as const
            ).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.techCatBtn,
                  selectedTechCat === cat.id && styles.techCatBtnActive,
                ]}
                onPress={() => {
                  sounds.playClick();
                  setSelectedTechCat(cat.id);
                }}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={selectedTechCat === cat.id ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[
                    styles.techCatText,
                    selectedTechCat === cat.id && styles.techCatTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upgrades in this category */}
          {filteredTech.map((tech) => {
            const isMax = tech.level >= tech.maxLevel;
            const techCost = tech.costTech[tech.level] ?? 50;
            const tokenCost = tech.costTokens[tech.level] ?? 2;
            const canAfford =
              state.techParts >= techCost && state.heroTokens >= tokenCost;

            return (
              <View key={tech.id} style={styles.techCard}>
                <View style={styles.techHeader}>
                  <View style={styles.techTitleCol}>
                    <Text style={styles.techTitle}>{tech.title}</Text>
                    <View style={styles.levelDotsRow}>
                      {[...Array(tech.maxLevel)].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.levelDot,
                            i < tech.level && styles.levelDotFilled,
                          ]}
                        />
                      ))}
                      <Text style={styles.levelDotsText}>
                        LVL {tech.level}/{tech.maxLevel}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.techDesc}>{tech.description}</Text>

                <View style={styles.techBoostBox}>
                  <Ionicons name="sparkles" size={14} color="#10B981" />
                  <Text style={styles.techBoostText}>{tech.statBoost}</Text>
                </View>

                {/* Upgrade Button */}
                <View style={styles.techFooter}>
                  {isMax ? (
                    <View style={styles.maxedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.maxedText}>MAX LEVEL REACHED</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.upgradeBtn,
                        !canAfford && styles.upgradeBtnDisabled,
                      ]}
                      onPress={() => handleUpgrade(tech.id)}
                      disabled={!canAfford}
                      activeOpacity={0.8}
                    >
                      <View style={styles.upgradeCostRow}>
                        <View style={styles.costItem}>
                          <Ionicons name="hardware-chip" size={13} color="#38BDF8" />
                          <Text style={styles.costText}>{techCost}</Text>
                        </View>
                        <View style={styles.costItem}>
                          <Ionicons name="shield-checkmark" size={13} color="#FBBF24" />
                          <Text style={[styles.costText, { color: '#FDE047' }]}>
                            {tokenCost}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.upgradeBtnText}>
                        {canAfford ? 'UPGRADE TECH' : 'INSUFFICIENT PARTS'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  mainTabs: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 10,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  mainTabActive: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
  },
  mainTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  mainTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  heroFilterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    gap: 8,
  },
  heroFilterPeter: {
    borderColor: '#E52521',
    backgroundColor: '#200C12',
  },
  heroFilterMiles: {
    borderColor: '#F59E0B',
    backgroundColor: '#201608',
  },
  heroFilterText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  heroFilterTextActive: {
    color: '#FFFFFF',
  },
  suitCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  suitCardEquipped: {
    borderColor: '#10B981',
    backgroundColor: '#0B1E19',
  },
  suitCardLocked: {
    opacity: 0.85,
  },
  suitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  suitEmblemBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suitInfoCol: {
    flex: 1,
  },
  suitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suitName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  equippedBadge: {
    backgroundColor: '#065F46',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  equippedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#A7F3D0',
  },
  suitSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  suitDescription: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginVertical: 8,
  },
  suitPerkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00000044',
    padding: 8,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF11',
    marginBottom: 10,
  },
  suitPerkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F1F5F9',
    flex: 1,
  },
  suitStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatName: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
  },
  miniStatVal: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  suitActionRow: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 10,
  },
  suitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  suitBtnEquip: {
    backgroundColor: '#0284C7',
  },
  suitBtnEquipped: {
    backgroundColor: '#065F46',
  },
  suitBtnUnlock: {
    backgroundColor: '#D97706',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  suitBtnCantAfford: {
    backgroundColor: '#334155',
  },
  suitBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  unlockCostGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  costText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#38BDF8',
  },
  unlockBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  techCatRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  techCatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  techCatBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  techCatText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  techCatTextActive: {
    color: '#FFFFFF',
  },
  techCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  techHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  techTitleCol: {
    flex: 1,
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  levelDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  levelDot: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  levelDotFilled: {
    backgroundColor: '#38BDF8',
  },
  levelDotsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 4,
  },
  techDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginVertical: 6,
  },
  techBoostBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B33',
    padding: 7,
    borderRadius: 8,
    gap: 6,
    marginVertical: 6,
  },
  techBoostText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6EE7B7',
  },
  techFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 10,
    marginTop: 6,
  },
  upgradeBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  upgradeBtnDisabled: {
    backgroundColor: '#334155',
  },
  upgradeCostRow: {
    flexDirection: 'row',
    gap: 10,
  },
  upgradeBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  maxedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  maxedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#10B981',
  },
});
