import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { SPIDER_BOTS_DATA } from '../constants/spiderBotsData';
import { sounds } from '../services/soundEffects';

export const SpiderBotsScreen: React.FC = () => {
  const {
    state,
    collectSpiderBot,
    toggleSound,
    toggleHaptics,
  } = useGame();

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const collectedCount = SPIDER_BOTS_DATA.filter((b) =>
    state.collectedSpiderBots.includes(b.id)
  ).length;

  const handleScanFrequencies = () => {
    sounds.playThwip();
    setScanning(true);
    setScanResult('SCANNING MULTIVERSE FREQUENCIES...');

    setTimeout(() => {
      // Find first uncollected bot to unlock
      const uncollected = SPIDER_BOTS_DATA.find(
        (b) => !state.collectedSpiderBots.includes(b.id)
      );

      if (uncollected) {
        collectSpiderBot(uncollected.id);
        sounds.playLevelUp();
        setScanResult(`DECODED SIGNAL: ${uncollected.name} (${uncollected.universe})!`);
      } else {
        sounds.playClick();
        setScanResult('ALL 10 MULTIVERSE SIGNALS HARMONIZED!');
      }
      setScanning(false);
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Spider-Bot Frequency Scanner Card */}
      <View style={styles.scannerCard}>
        <View style={styles.scannerHeader}>
          <View style={styles.radarIcon}>
            <Ionicons name="radio" size={24} color="#F59E0B" />
          </View>
          <View style={styles.scannerTitleCol}>
            <Text style={styles.scannerTitle}>MULTIVERSE BOT SCANNER</Text>
            <Text style={styles.scannerSubtitle}>
              Quantum emission beacon tracker
            </Text>
          </View>
        </View>

        <Text style={styles.scannerDesc}>
          Interdimensional Spider-Bots are transmitting anomalous frequencies across New York. Ping the network to track and decode their quantum signatures.
        </Text>

        {scanResult && (
          <View style={styles.scanResultBox}>
            <Ionicons name="sparkles" size={16} color="#38BDF8" />
            <Text style={styles.scanResultText}>{scanResult}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.scanBtn, scanning && styles.scanBtnActive]}
          onPress={handleScanFrequencies}
          disabled={scanning}
          activeOpacity={0.8}
        >
          <Ionicons
            name={scanning ? 'sync' : 'scan-circle'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.scanBtnText}>
            {scanning ? 'PINGING FREQUENCIES...' : 'PING MULTIVERSE FREQUENCY'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Collection Progress Strip */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>COLLECTION PROGRESS</Text>
        <Text style={styles.progressCount}>
          {collectedCount} / {SPIDER_BOTS_DATA.length} BOTS FOUND
        </Text>
      </View>

      {/* Spider-Bots Grid */}
      <View style={styles.botsGrid}>
        {SPIDER_BOTS_DATA.map((bot) => {
          const isCollected = state.collectedSpiderBots.includes(bot.id);

          return (
            <View
              key={bot.id}
              style={[
                styles.botCard,
                isCollected ? styles.botCardCollected : styles.botCardLocked,
              ]}
            >
              <View style={styles.botTopRow}>
                <View
                  style={[
                    styles.botAvatar,
                    {
                      backgroundColor: isCollected ? bot.primaryColor : '#1E293B',
                      borderColor: isCollected ? bot.secondaryColor : '#334155',
                    },
                  ]}
                >
                  <Ionicons
                    name={isCollected ? 'bug' : 'lock-closed'}
                    size={22}
                    color={isCollected ? '#FFFFFF' : '#64748B'}
                  />
                </View>

                <View style={styles.botMeta}>
                  <View style={styles.rarityRow}>
                    <View
                      style={[
                        styles.rarityBadge,
                        bot.rarity === 'Legendary'
                          ? styles.rarityLegendary
                          : bot.rarity === 'Rare'
                          ? styles.rarityRare
                          : styles.rarityCommon,
                      ]}
                    >
                      <Text style={styles.rarityText}>{bot.rarity}</Text>
                    </View>
                    <Text style={styles.universeText}>{bot.universe}</Text>
                  </View>
                  <Text style={styles.botName}>
                    {isCollected ? bot.name : 'Unknown Quantum Beacon'}
                  </Text>
                </View>
              </View>

              {isCollected ? (
                <>
                  <Text style={styles.botQuote}>{bot.quote}</Text>
                  <View style={styles.botFooter}>
                    <Ionicons name="location" size={12} color="#64748B" />
                    <Text style={styles.botDistrict}>{bot.district}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.lockedHint}>
                  Signal detected near {bot.district}. Ping frequency scanner to decode!
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* CAREER COMBAT & PATROL RECORDS */}
      <View style={styles.recordsSection}>
        <View style={styles.recordsHeader}>
          <Ionicons name="trophy" size={18} color="#FBBF24" />
          <Text style={styles.recordsTitle}>CAREER COMBAT & PATROL DOSSIER</Text>
        </View>

        <View style={styles.dossierGrid}>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Hero Rank & Level</Text>
            <Text style={styles.dossierVal}>Level {state.level} Spider-Hero</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Total City Distance Swung</Text>
            <Text style={styles.dossierVal}>
              {(state.totalDistance / 1000).toFixed(2)} km
            </Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>High-Speed Traversal Record</Text>
            <Text style={styles.dossierVal}>
              {state.highScoreTraversal} points
            </Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>District Crimes Resolved</Text>
            <Text style={styles.dossierVal}>
              {state.crimesCompleted} emergency calls
            </Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Alien Symbiotes Purged</Text>
            <Text style={styles.dossierVal}>
              {state.symbiotesPurged} tendrils/hives
            </Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Kraven Hunters Neutralized</Text>
            <Text style={styles.dossierVal}>
              {state.huntersStopped} hunters & drones
            </Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Spider-Sense Perfect Parries</Text>
            <Text style={styles.dossierVal}>
              {state.perfectParries} counters
            </Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Highest Combat Strike Chain</Text>
            <Text style={styles.dossierVal}>
              {state.highestCombo} Hits
            </Text>
          </View>
        </View>
      </View>

      {/* SETTINGS CARD */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>GAMEPLAY AUDIO & FEEDBACK</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={20} color="#38BDF8" />
            <View>
              <Text style={styles.settingLabel}>Sound Effects Synthesizer</Text>
              <Text style={styles.settingSub}>
                Dynamic Web-Audio THWIP, punch impacts, parry chimes
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggleSwitch,
              state.soundEnabled && styles.toggleSwitchActive,
            ]}
            onPress={toggleSound}
          >
            <View
              style={[
                styles.toggleKnob,
                state.soundEnabled && styles.toggleKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={20} color="#A855F7" />
            <View>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingSub}>
                Vibration on web swinging, combat strikes, and perfect parry
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggleSwitch,
              state.hapticsEnabled && styles.toggleSwitchActive,
            ]}
            onPress={toggleHaptics}
          >
            <View
              style={[
                styles.toggleKnob,
                state.hapticsEnabled && styles.toggleKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scannerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D97706',
    marginBottom: 16,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  radarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#451A03',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  scannerTitleCol: {
    flex: 1,
  },
  scannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scannerSubtitle: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700',
    marginTop: 2,
  },
  scannerDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 12,
  },
  scanResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C4A6E',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  scanResultText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E0F2FE',
    flex: 1,
  },
  scanBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanBtnActive: {
    backgroundColor: '#B45309',
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
  },
  botsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  botCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  botCardCollected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0B192E',
  },
  botCardLocked: {
    opacity: 0.65,
  },
  botTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  botMeta: {
    flex: 1,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityLegendary: {
    backgroundColor: '#78350F',
  },
  rarityRare: {
    backgroundColor: '#0369A1',
  },
  rarityCommon: {
    backgroundColor: '#334155',
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  universeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  botName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  botQuote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#94A3B8',
    lineHeight: 16,
    marginVertical: 4,
  },
  botFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  botDistrict: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  lockedHint: {
    fontSize: 10,
    color: '#64748B',
    fontStyle: 'italic',
  },
  recordsSection: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  recordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recordsTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dossierGrid: {
    gap: 8,
  },
  dossierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  dossierLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dossierVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  settingsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  settingsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  settingSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#0284C7',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
