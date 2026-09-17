import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { sounds } from '../services/soundEffects';
import { SpiderSenseAlert } from '../components/SpiderSenseAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Enemy {
  id: string;
  name: string;
  type: 'hunter' | 'hound' | 'symbiote' | 'behemoth' | 'boss';
  health: number;
  maxHealth: number;
  attackTimer: number; // ticks till attack
  attackType: 'yellow' | 'red';
  isTelegraphing: boolean;
  webbedHits: number;
  isStunned: boolean;
  xOffset: number;
}

interface CombatArenaProps {
  encounterType?: 'hunter' | 'symbiote' | 'venom_boss';
  onClose?: () => void;
  crimeId?: string;
  missionTitle?: string;
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  encounterType = 'symbiote',
  onClose,
  crimeId,
  missionTitle,
}) => {
  const { state, currentSuit, recordCombatVictory } = useGame();
  const isPeter = state.hero === 'peter';

  // Combat state
  const [playerHealth, setPlayerHealth] = useState<number>(100);
  const [focus, setFocus] = useState<number>(60); // 0 - 100
  const [ultimateCharge, setUltimateCharge] = useState<number>(40); // 0 - 100
  const [combo, setCombo] = useState<number>(0);
  const [isSurgeActive, setIsSurgeActive] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isDefeat, setIsDefeat] = useState<boolean>(false);
  const [perfectParries, setPerfectParries] = useState<number>(0);

  // Active enemies in wave
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [targetedEnemyIdx, setTargetedEnemyIdx] = useState<number>(0);

  // Telegraph alert state
  const [senseType, setSenseType] = useState<'yellow' | 'red'>('yellow');
  const [senseActive, setSenseActive] = useState<boolean>(false);

  // Visual effects
  const [sfxText, setSfxText] = useState<string | null>(null);
  const sfxOpacity = useRef(new Animated.Value(0)).current;
  const sfxScale = useRef(new Animated.Value(0.5)).current;
  const screenShake = useRef(new Animated.Value(0)).current;

  const triggerSfx = (text: string) => {
    setSfxText(text);
    sfxOpacity.setValue(1);
    sfxScale.setValue(0.7);
    Animated.parallel([
      Animated.timing(sfxOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(sfxScale, {
        toValue: 1.4,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shakeScreen = () => {
    Animated.sequence([
      Animated.timing(screenShake, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(screenShake, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(screenShake, { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(screenShake, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  // Generate initial enemies depending on encounter
  useEffect(() => {
    let initialList: Enemy[] = [];

    if (encounterType === 'venom_boss') {
      initialList = [
        {
          id: 'boss_venom',
          name: 'Venom (Symbiote King)',
          type: 'boss',
          health: 450,
          maxHealth: 450,
          attackTimer: 60,
          attackType: 'red',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: 0,
        },
        {
          id: 'sym_swarmer_1',
          name: 'Symbiote Lasher',
          type: 'symbiote',
          health: 70,
          maxHealth: 70,
          attackTimer: 90,
          attackType: 'yellow',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: -75,
        },
      ];
    } else if (encounterType === 'hunter') {
      initialList = [
        {
          id: 'hunter_elite',
          name: 'Kraven Talon Elite',
          type: 'hunter',
          health: 120,
          maxHealth: 120,
          attackTimer: 65,
          attackType: 'yellow',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: -60,
        },
        {
          id: 'hunter_hound',
          name: 'Robotic Hound Turret',
          type: 'hound',
          health: 90,
          maxHealth: 90,
          attackTimer: 85,
          attackType: 'red',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: 60,
        },
        {
          id: 'hunter_sniper',
          name: 'Crossbow Scout',
          type: 'hunter',
          health: 80,
          maxHealth: 80,
          attackTimer: 110,
          attackType: 'yellow',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: 0,
        },
      ];
    } else {
      // Symbiote nest outbreak
      initialList = [
        {
          id: 'sym_behemoth',
          name: 'Symbiote Behemoth',
          type: 'behemoth',
          health: 220,
          maxHealth: 220,
          attackTimer: 70,
          attackType: 'red',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: 0,
        },
        {
          id: 'sym_swarmer_1',
          name: 'Symbiote Tendril Lasher',
          type: 'symbiote',
          health: 80,
          maxHealth: 80,
          attackTimer: 55,
          attackType: 'yellow',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: -70,
        },
        {
          id: 'sym_swarmer_2',
          name: 'Agonizer Swarmer',
          type: 'symbiote',
          health: 65,
          maxHealth: 65,
          attackTimer: 90,
          attackType: 'yellow',
          isTelegraphing: false,
          webbedHits: 0,
          isStunned: false,
          xOffset: 70,
        },
      ];
    }

    setEnemies(initialList);
    setTargetedEnemyIdx(0);
  }, [encounterType]);

  // Main Combat Engine Loop (50ms tick)
  useEffect(() => {
    if (isVictory || isDefeat) return;

    const interval = setInterval(() => {
      setEnemies((prevEnemies) => {
        let anyTelegraphing = false;
        let alertType: 'yellow' | 'red' = 'yellow';

        const updated = prevEnemies.map((enemy) => {
          if (enemy.isStunned) {
            return enemy;
          }

          let nextTimer = enemy.attackTimer - 1;

          // Telegraph attack when timer is low (last 20 ticks)
          let telegraph = false;
          if (nextTimer <= 22 && nextTimer > 0) {
            telegraph = true;
            anyTelegraphing = true;
            alertType = enemy.attackType;
            if (nextTimer === 22) {
              sounds.playSpiderSense();
            }
          }

          // Attack executes!
          if (nextTimer <= 0) {
            // Player takes damage
            sounds.playPunch();
            shakeScreen();
            triggerSfx(enemy.attackType === 'red' ? 'HEAVY HIT!' : 'HIT!');

            const dmg = enemy.type === 'boss' ? 26 : enemy.type === 'behemoth' ? 22 : 14;
            setPlayerHealth((h) => {
              const nextH = h - dmg;
              if (nextH <= 0) {
                setIsDefeat(true);
              }
              return Math.max(0, nextH);
            });
            setCombo(0);

            // Reset timer
            nextTimer = 60 + Math.floor(Math.random() * 50);
          }

          return {
            ...enemy,
            attackTimer: nextTimer,
            isTelegraphing: telegraph,
          };
        });

        setSenseActive(anyTelegraphing);
        setSenseType(alertType);

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isVictory, isDefeat]);

  // Check victory condition
  useEffect(() => {
    if (enemies.length > 0 && enemies.every((e) => e.health <= 0) && !isVictory) {
      setIsVictory(true);
      sounds.playLevelUp();
      const techAward = encounterType === 'venom_boss' ? 80 : 45;
      const tokenAward = encounterType === 'venom_boss' ? 4 : 2;
      const xpAward = encounterType === 'venom_boss' ? 500 : 320;
      recordCombatVictory(
        enemies.length,
        encounterType === 'hunter' ? 'hunter' : 'symbiote',
        combo,
        perfectParries,
        techAward,
        tokenAward,
        xpAward,
        crimeId
      );
    }
  }, [enemies, isVictory, encounterType, combo, perfectParries, crimeId]);

  // Actions
  const currentTarget = enemies[targetedEnemyIdx] || enemies[0];

  const handleMeleeStrike = () => {
    if (!currentTarget || currentTarget.health <= 0) return;

    sounds.playPunch();
    if (isPeter) {
      sounds.playThwip();
    } else {
      sounds.playVenomZap();
    }
    shakeScreen();

    // Damage multiplier
    const surgeBoost = isSurgeActive ? 2.5 : 1;
    const webMultiplier = currentTarget.webbedHits >= 3 ? 2 : 1;
    const baseDamage = Math.floor((18 + Math.random() * 10) * surgeBoost * webMultiplier);

    triggerSfx(
      isSurgeActive
        ? 'TENDRIL SURGE! -' + baseDamage
        : isPeter
        ? 'BAM! -' + baseDamage
        : 'VENOM ZAP! -' + baseDamage
    );

    setEnemies((prev) =>
      prev.map((e) =>
        e.id === currentTarget.id
          ? { ...e, health: Math.max(0, e.health - baseDamage) }
          : e
      )
    );

    setCombo((c) => c + 1);
    setFocus((f) => Math.min(100, f + 10));
    setUltimateCharge((u) => Math.min(100, u + 8));
  };

  const handleWebShoot = () => {
    if (!currentTarget || currentTarget.health <= 0) return;

    sounds.playThwip();
    setEnemies((prev) =>
      prev.map((e) => {
        if (e.id === currentTarget.id) {
          const nextWebs = e.webbedHits + 1;
          if (nextWebs >= 3) {
            triggerSfx('WEBBED UP!');
            return {
              ...e,
              webbedHits: 3,
              isStunned: true,
              attackTimer: 120, // stunned for long time
            };
          }
          triggerSfx('THWIP!');
          return { ...e, webbedHits: nextWebs };
        }
        return e;
      })
    );

    setCombo((c) => c + 1);
    setFocus((f) => Math.min(100, f + 5));
  };

  const handleParry = () => {
    const telegraphingEnemy = enemies.find((e) => e.isTelegraphing);

    if (telegraphingEnemy && telegraphingEnemy.attackType === 'yellow') {
      // SUCCESSFUL PERFECT PARRY!
      sounds.playParry();
      shakeScreen();
      triggerSfx('PERFECT PARRY!');
      setPerfectParries((p) => p + 1);
      setCombo((c) => c + 3);
      setFocus((f) => Math.min(100, f + 30));
      setUltimateCharge((u) => Math.min(100, u + 20));

      // Counter-attack damage
      const counterDamage = 45;
      setEnemies((prev) =>
        prev.map((e) =>
          e.id === telegraphingEnemy.id
            ? {
                ...e,
                health: Math.max(0, e.health - counterDamage),
                isStunned: true,
                attackTimer: 80,
                isTelegraphing: false,
              }
            : e
        )
      );
      setSenseActive(false);
    } else {
      // Mistimed parry
      sounds.playClick();
      triggerSfx('BLOCKED');
    }
  };

  const handleDodge = () => {
    const telegraphingEnemy = enemies.find((e) => e.isTelegraphing);

    if (telegraphingEnemy) {
      // SUCCESSFUL PERFECT DODGE!
      sounds.playThwip();
      triggerSfx('PERFECT DODGE!');
      setCombo((c) => c + 2);
      setFocus((f) => Math.min(100, f + 20));

      // Reset enemy attack without taking damage
      setEnemies((prev) =>
        prev.map((e) =>
          e.id === telegraphingEnemy.id
            ? {
                ...e,
                attackTimer: 75,
                isTelegraphing: false,
              }
            : e
        )
      );
      setSenseActive(false);
    } else {
      sounds.playGlider();
      triggerSfx('EVADE');
    }
  };

  const handleWebGrabberGadget = () => {
    sounds.playThwip();
    shakeScreen();
    triggerSfx('WEB GRABBER AOE!');

    // Pull all enemies and stun them
    setEnemies((prev) =>
      prev.map((e) => ({
        ...e,
        health: Math.max(0, e.health - 25),
        isStunned: true,
        attackTimer: 90,
        isTelegraphing: false,
      }))
    );
    setCombo((c) => c + prevActiveCount());
    setFocus((f) => Math.min(100, f + 15));
  };

  const prevActiveCount = () => enemies.filter((e) => e.health > 0).length;

  const handleFinisher = () => {
    if (focus < 50 || !currentTarget || currentTarget.health <= 0) return;

    sounds.playLevelUp();
    shakeScreen();
    setFocus((f) => Math.max(0, f - 50));
    setCombo((c) => c + 5);

    const isBoss = currentTarget.type === 'boss';
    const finisherDmg = isBoss ? 110 : 250;
    triggerSfx(isPeter ? 'SYMBIOSE TAKEDOWN!' : 'VENOM FINISHER!');

    setEnemies((prev) =>
      prev.map((e) =>
        e.id === currentTarget.id
          ? {
              ...e,
              health: Math.max(0, e.health - finisherDmg),
              isStunned: true,
              attackTimer: 70,
            }
          : e
      )
    );
  };

  const handleHeal = () => {
    if (focus < 40 || playerHealth >= 100) return;
    sounds.playClick();
    setFocus((f) => Math.max(0, f - 40));
    setPlayerHealth((h) => Math.min(100, h + 35));
    triggerSfx('+35 HP RECOVERED');
  };

  const handleUltimate = () => {
    if (ultimateCharge < 100) return;

    shakeScreen();
    setUltimateCharge(0);

    if (isPeter) {
      // Symbiote Surge
      sounds.playSymbioteRoar();
      triggerSfx('SYMBIOSE SURGE ACTIVATED!');
      setIsSurgeActive(true);
      setTimeout(() => setIsSurgeActive(false), 9000);

      // Decimate all enemies
      setEnemies((prev) =>
        prev.map((e) => ({
          ...e,
          health: Math.max(0, e.health - 65),
          isStunned: true,
          attackTimer: 100,
        }))
      );
    } else {
      // Miles Mega Venom Blast
      sounds.playVenomZap();
      triggerSfx('MEGA VENOM BLAST!');

      setEnemies((prev) =>
        prev.map((e) => ({
          ...e,
          health: Math.max(0, e.health - 85),
          isStunned: true,
          attackTimer: 110,
        }))
      );
    }

    setCombo((c) => c + 10);
  };

  const switchTarget = (idx: number) => {
    sounds.playClick();
    setTargetedEnemyIdx(idx);
  };

  const restartCombat = () => {
    setPlayerHealth(100);
    setFocus(60);
    setUltimateCharge(40);
    setCombo(0);
    setIsSurgeActive(false);
    setIsVictory(false);
    setIsDefeat(false);
    setPerfectParries(0);

    setEnemies((prev) =>
      prev.map((e) => ({
        ...e,
        health: e.maxHealth,
        attackTimer: 60 + Math.floor(Math.random() * 40),
        webbedHits: 0,
        isStunned: false,
        isTelegraphing: false,
      }))
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: screenShake }],
          backgroundColor: isSurgeActive ? '#150A21' : '#070A13',
        },
      ]}
    >
      {/* Top Header & Boss Info */}
      <View style={styles.topBar}>
        <View style={styles.titleCol}>
          <Text style={styles.encounterTitle} numberOfLines={1}>
            {missionTitle || (encounterType === 'venom_boss' ? 'BOSS: CLASH WITH VENOM' : 'CITY COMBAT PATROL')}
          </Text>
          <Text style={styles.encounterSub}>
            {isPeter ? 'PETER PARKER (SYMBIOTE READY)' : 'MILES MORALES (BIO-ELECTRIC VENOM)'}
          </Text>
        </View>

        {onClose && (
          <TouchableOpacity style={styles.exitBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Spider-Sense Parry / Dodge Alert */}
      <SpiderSenseAlert active={senseActive} type={senseType} />

      {/* Floating Comic SFX Text */}
      {sfxText && (
        <Animated.View
          style={[
            styles.sfxBox,
            {
              opacity: sfxOpacity,
              transform: [{ scale: sfxScale }],
            },
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.sfxText,
              { color: isPeter ? '#F87171' : '#FDE047' },
            ]}
          >
            {sfxText}
          </Text>
        </Animated.View>
      )}

      {/* Arena Stage (Enemies & Combat Arena) */}
      <View style={styles.arenaStage}>
        {/* Enemy Lineup */}
        <View style={styles.enemiesRow}>
          {enemies.map((enemy, idx) => {
            const isAlive = enemy.health > 0;
            const isTargeted = idx === targetedEnemyIdx;
            const hpPercent = Math.max(0, Math.round((enemy.health / enemy.maxHealth) * 100));

            return (
              <TouchableOpacity
                key={enemy.id}
                style={[
                  styles.enemyCard,
                  isTargeted && styles.enemyCardTargeted,
                  !isAlive && styles.enemyCardDead,
                ]}
                onPress={() => switchTarget(idx)}
                activeOpacity={0.8}
              >
                {/* Target reticle */}
                {isTargeted && isAlive && (
                  <View style={styles.targetReticle}>
                    <Ionicons name="radio-button-on" size={12} color="#EF4444" />
                  </View>
                )}

                {/* Enemy Avatar */}
                <View
                  style={[
                    styles.enemyAvatar,
                    enemy.type === 'boss'
                      ? styles.bossAvatar
                      : enemy.type === 'behemoth'
                      ? styles.behemothAvatar
                      : enemy.type === 'hound'
                      ? styles.houndAvatar
                      : styles.genericAvatar,
                  ]}
                >
                  <Ionicons
                    name={
                      enemy.type === 'boss'
                        ? 'skull'
                        : enemy.type === 'behemoth'
                        ? 'warning'
                        : enemy.type === 'hound'
                        ? 'hardware-chip'
                        : 'shield'
                    }
                    size={enemy.type === 'boss' ? 32 : 22}
                    color={enemy.type === 'boss' ? '#A855F7' : '#EF4444'}
                  />

                  {/* Webbed status */}
                  {enemy.webbedHits > 0 && (
                    <View style={styles.webbedBadge}>
                      <Ionicons name="apps" size={12} color="#FFFFFF" />
                      <Text style={styles.webbedCount}>{enemy.webbedHits}/3</Text>
                    </View>
                  )}
                </View>

                {/* Name */}
                <Text style={styles.enemyName} numberOfLines={1}>
                  {enemy.name}
                </Text>

                {/* Health Bar */}
                <View style={styles.enemyHpBg}>
                  <View
                    style={[
                      styles.enemyHpFill,
                      {
                        width: `${hpPercent}%`,
                        backgroundColor:
                          hpPercent > 50 ? '#EF4444' : hpPercent > 20 ? '#F59E0B' : '#DC2626',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.hpText}>
                  {isAlive ? `${enemy.health} HP` : 'K.O.'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spidey in Combat Stance */}
        <View style={styles.spideyCenter}>
          <View
            style={[
              styles.spideyAura,
              isSurgeActive && styles.spideySurgeAura,
            ]}
          />
          <View
            style={[
              styles.spideyModel,
              {
                backgroundColor: currentSuit.colors.primary,
                borderColor: currentSuit.colors.glow,
              },
            ]}
          >
            <Ionicons
              name={isPeter ? 'shield' : 'flash'}
              size={24}
              color={currentSuit.colors.glow}
            />
          </View>
          <Text style={styles.heroStandLabel}>
            {isSurgeActive
              ? 'SYMBIOTE SURGE ACTIVE'
              : `${state.hero.toUpperCase()} (LVL ${state.level})`}
          </Text>
        </View>
      </View>

      {/* HUD: Player Health, Focus & Combo */}
      <View style={styles.playerHud}>
        {/* Health Row */}
        <View style={styles.hudRow}>
          <View style={styles.hudLabelCol}>
            <Text style={styles.hudMetricName}>HEALTH</Text>
            <Text style={styles.hudMetricVal}>{playerHealth}/100</Text>
          </View>
          <View style={styles.meterContainer}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${playerHealth}%`,
                  backgroundColor:
                    playerHealth > 40 ? '#10B981' : playerHealth > 20 ? '#F59E0B' : '#EF4444',
                },
              ]}
            />
          </View>
        </View>

        {/* Focus Row */}
        <View style={styles.hudRow}>
          <View style={styles.hudLabelCol}>
            <Text style={styles.hudMetricName}>FOCUS</Text>
            <Text style={[styles.hudMetricVal, { color: '#38BDF8' }]}>{focus}%</Text>
          </View>
          <View style={styles.meterContainer}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${focus}%`,
                  backgroundColor: '#38BDF8',
                },
              ]}
            />
          </View>
        </View>

        {/* Combo & Ultimate Charge */}
        <View style={styles.extraMetersRow}>
          <View style={styles.comboBadge}>
            <Ionicons name="flame" size={16} color="#EF4444" />
            <Text style={styles.comboNum}>{combo}</Text>
            <Text style={styles.comboLabel}>HIT COMBO</Text>
          </View>

          <View style={styles.ultimateBar}>
            <Text style={styles.ultimateLabel}>
              {isPeter ? 'SURGE' : 'MEGA VENOM'}: {ultimateCharge}%
            </Text>
            <View style={styles.miniBarBg}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${ultimateCharge}%`,
                    backgroundColor: isPeter ? '#A855F7' : '#F59E0B',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* COMBAT ACTION CONTROLS */}
      <View style={styles.actionControls}>
        {/* Top Control Bar: Finisher, Heal & Gadget */}
        <View style={styles.topControlRow}>
          {/* Heal button */}
          <TouchableOpacity
            style={[styles.smallActionBtn, focus < 40 && styles.btnDisabled]}
            onPress={handleHeal}
            disabled={focus < 40}
            activeOpacity={0.7}
          >
            <Ionicons name="medkit" size={18} color="#10B981" />
            <Text style={styles.smallBtnText}>HEAL</Text>
          </TouchableOpacity>

          {/* Web Grabber Gadget */}
          <TouchableOpacity
            style={styles.smallActionBtn}
            onPress={handleWebGrabberGadget}
            activeOpacity={0.7}
          >
            <Ionicons name="magnet" size={18} color="#38BDF8" />
            <Text style={styles.smallBtnText}>GRABBER</Text>
          </TouchableOpacity>

          {/* Finisher */}
          <TouchableOpacity
            style={[styles.smallActionBtn, styles.finisherBtn, focus < 50 && styles.btnDisabled]}
            onPress={handleFinisher}
            disabled={focus < 50}
            activeOpacity={0.7}
          >
            <Ionicons name="skull" size={18} color="#FDE047" />
            <Text style={[styles.smallBtnText, { color: '#FDE047' }]}>FINISHER</Text>
          </TouchableOpacity>

          {/* Ultimate (Surge / Mega Venom) */}
          <TouchableOpacity
            style={[
              styles.smallActionBtn,
              styles.ultimateBtn,
              ultimateCharge < 100 && styles.btnDisabled,
            ]}
            onPress={handleUltimate}
            disabled={ultimateCharge < 100}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPeter ? 'flash' : 'thunderstorm'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.ultimateBtnText}>
              {isPeter ? 'SURGE' : 'MEGA BLAST'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Action Buttons: Strike, Web-Shooter, Parry, Dodge */}
        <View style={styles.mainControlGrid}>
          {/* Parry Button */}
          <TouchableOpacity
            style={[styles.actionBigBtn, styles.parryBtn]}
            onPress={handleParry}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark" size={24} color="#FACC15" />
            <Text style={[styles.actionBtnLabel, { color: '#FDE047' }]}>PARRY</Text>
          </TouchableOpacity>

          {/* Strike Melee Combo Button */}
          <TouchableOpacity
            style={[styles.actionBigBtn, styles.strikeBtn]}
            onPress={handleMeleeStrike}
            activeOpacity={0.7}
          >
            <Ionicons name="fitness" size={26} color="#FFFFFF" />
            <Text style={styles.actionBtnLabel}>STRIKE</Text>
          </TouchableOpacity>

          {/* Web Shooters */}
          <TouchableOpacity
            style={[styles.actionBigBtn, styles.webBtn]}
            onPress={handleWebShoot}
            activeOpacity={0.7}
          >
            <Ionicons name="apps" size={24} color="#38BDF8" />
            <Text style={[styles.actionBtnLabel, { color: '#38BDF8' }]}>WEB SHOOT</Text>
          </TouchableOpacity>

          {/* Dodge Button */}
          <TouchableOpacity
            style={[styles.actionBigBtn, styles.dodgeBtn]}
            onPress={handleDodge}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={24} color="#EF4444" />
            <Text style={[styles.actionBtnLabel, { color: '#EF4444' }]}>DODGE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* VICTORY MODAL */}
      <Modal visible={isVictory} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="shield-checkmark" size={56} color="#10B981" />
            <Text style={styles.victoryTitle}>THREAT NEUTRALIZED!</Text>
            <Text style={styles.modalSub}>
              {encounterType === 'venom_boss'
                ? 'Venom has been repelled! New York City breathes a sigh of relief.'
                : 'Enemies incapacitated and webbed for NYPD pickup.'}
            </Text>

            <View style={styles.statsCard}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{combo}</Text>
                <Text style={styles.statLabel}>Max Combo</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: '#38BDF8' }]}>
                  +{encounterType === 'venom_boss' ? 80 : 45}
                </Text>
                <Text style={styles.statLabel}>Tech Parts</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: '#FDE047' }]}>
                  +{encounterType === 'venom_boss' ? 4 : 2}
                </Text>
                <Text style={styles.statLabel}>Hero Tokens</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              {onClose ? (
                <TouchableOpacity style={styles.primaryModalBtn} onPress={onClose}>
                  <Text style={styles.primaryModalBtnText}>CLAIM REWARDS & RETURN</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.primaryModalBtn} onPress={restartCombat}>
                  <Text style={styles.primaryModalBtnText}>FIGHT AGAIN</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* DEFEAT MODAL */}
      <Modal visible={isDefeat} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { borderColor: '#EF4444' }]}>
            <Ionicons name="heart-dislike" size={56} color="#EF4444" />
            <Text style={[styles.victoryTitle, { color: '#EF4444' }]}>SPIDER-MAN DOWN!</Text>
            <Text style={styles.modalSub}>
              Overwhelmed by enemy onslaught. Time your Parries and Dodges when the Spider-Sense flashes!
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.primaryModalBtn, { backgroundColor: '#DC2626' }]}
                onPress={restartCombat}
              >
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.primaryModalBtnText}>RETRY ENCOUNTER</Text>
              </TouchableOpacity>
              {onClose && (
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>RETURN TO PATROL</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleCol: {
    flex: 1,
  },
  encounterTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  encounterSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  exitBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  sfxBox: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    zIndex: 30,
    backgroundColor: '#000000BB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FACC15',
  },
  sfxText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  arenaStage: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  enemiesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
    paddingTop: 8,
  },
  enemyCard: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    minWidth: 95,
    maxWidth: 120,
  },
  enemyCardTargeted: {
    borderColor: '#EF4444',
    backgroundColor: '#201625',
  },
  enemyCardDead: {
    opacity: 0.35,
  },
  targetReticle: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  enemyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
  },
  bossAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E1065',
    borderColor: '#A855F7',
  },
  behemothAvatar: {
    backgroundColor: '#3B0764',
    borderColor: '#9333EA',
  },
  houndAvatar: {
    backgroundColor: '#31170A',
    borderColor: '#D97706',
  },
  genericAvatar: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
  },
  webbedBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  webbedCount: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  enemyName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 4,
  },
  enemyHpBg: {
    width: '100%',
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  enemyHpFill: {
    height: '100%',
    borderRadius: 3,
  },
  hpText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  spideyCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spideyAura: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#E5252122',
  },
  spideySurgeAura: {
    backgroundColor: '#A855F744',
    transform: [{ scale: 1.3 }],
  },
  spideyModel: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  heroStandLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  playerHud: {
    backgroundColor: '#0F172ACC',
    marginHorizontal: 14,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hudLabelCol: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudMetricName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  hudMetricVal: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
  },
  meterContainer: {
    flex: 1,
    height: 7,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  extraMetersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1116',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  comboNum: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EF4444',
  },
  comboLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F87171',
  },
  ultimateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ultimateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  miniBarBg: {
    width: 60,
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionControls: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  smallActionBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  finisherBtn: {
    backgroundColor: '#422006',
    borderColor: '#D97706',
  },
  ultimateBtn: {
    backgroundColor: '#581C87',
    borderColor: '#A855F7',
  },
  ultimateBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F5D0FE',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  smallBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mainControlGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBigBtn: {
    flex: 1,
    height: 62,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  parryBtn: {
    borderColor: '#EAB308',
    backgroundColor: '#231D08',
  },
  strikeBtn: {
    borderColor: '#DC2626',
    backgroundColor: '#300E11',
  },
  webBtn: {
    borderColor: '#0284C7',
    backgroundColor: '#08253B',
  },
  dodgeBtn: {
    borderColor: '#EF4444',
    backgroundColor: '#241014',
  },
  actionBtnLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000DD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    width: '92%',
    maxWidth: 380,
  },
  victoryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 12,
    letterSpacing: 1,
  },
  modalSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 18,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  primaryModalBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryModalBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
