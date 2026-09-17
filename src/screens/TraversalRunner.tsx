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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'drone' | 'symbiote' | 'crane';
  passed: boolean;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'tech' | 'bot' | 'wind_ring';
  name?: string;
  collected: boolean;
}

interface TraversalRunnerProps {
  onClose?: () => void;
  crimeId?: string;
  missionTitle?: string;
}

export const TraversalRunner: React.FC<TraversalRunnerProps> = ({
  onClose,
  crimeId,
  missionTitle,
}) => {
  const { state, currentSuit, recordTraversalRun } = useGame();
  const isPeter = state.hero === 'peter';

  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Player physics
  const [playerY, setPlayerY] = useState<number>(240);
  const [velocityY, setVelocityY] = useState<number>(0);
  const [speedMph, setSpeedMph] = useState<number>(45);
  const [distance, setDistance] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [techCollected, setTechCollected] = useState<number>(0);
  const [botsFound, setBotsFound] = useState<string[]>([]);
  const [health, setHealth] = useState<number>(100);

  // Mode: 'swinging' | 'gliding' | 'falling'
  const [movementMode, setMovementMode] = useState<'swinging' | 'gliding' | 'falling'>('falling');
  const [swingSide, setSwingSide] = useState<'left' | 'right' | null>(null);
  const [sfxText, setSfxText] = useState<string | null>(null);
  const [spiderSenseActive, setSpiderSenseActive] = useState<boolean>(false);

  // Lists of obstacles and collectibles
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);

  // Parallax offsets
  const [skylineOffset, setSkylineOffset] = useState<number>(0);

  // Animation values
  const sfxOpacity = useRef(new Animated.Value(0)).current;
  const sfxScale = useRef(new Animated.Value(0.5)).current;

  // Trigger floating comic SFX
  const triggerSfx = (text: string) => {
    setSfxText(text);
    sfxOpacity.setValue(1);
    sfxScale.setValue(0.7);
    Animated.parallel([
      Animated.timing(sfxOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(sfxScale, {
        toValue: 1.3,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Target distance for missions
  const TARGET_DISTANCE = crimeId ? 1500 : 3500;

  // Initialize entities
  useEffect(() => {
    const initObstacles: Obstacle[] = [];
    const initCollectibles: Collectible[] = [];

    for (let i = 1; i <= 25; i++) {
      const x = 500 + i * 260 + Math.random() * 80;
      const typeChoice: ('drone' | 'symbiote' | 'crane')[] = ['drone', 'symbiote', 'crane'];
      const type = typeChoice[i % 3];
      initObstacles.push({
        id: i,
        x,
        y: type === 'drone' ? 140 + Math.random() * 120 : type === 'symbiote' ? 260 + Math.random() * 80 : 180,
        width: type === 'drone' ? 44 : 50,
        height: type === 'drone' ? 36 : 65,
        type,
        passed: false,
      });

      // Collectibles
      if (i % 2 === 0) {
        initCollectibles.push({
          id: i * 10,
          x: x - 120,
          y: 160 + (i % 3) * 60,
          type: i % 6 === 0 ? 'bot' : i % 4 === 0 ? 'wind_ring' : 'tech',
          name: i % 6 === 0 ? 'bot_superior' : undefined,
          collected: false,
        });
      }
    }

    setObstacles(initObstacles);
    setCollectibles(initCollectibles);
  }, [crimeId]);

  // Main 60fps Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver || isVictory) return;

    const interval = setInterval(() => {
      // 1. Update distance & speed
      const dt = 0.035;
      const currentSpeed = speedMph;

      setDistance((d) => {
        const nextD = d + Math.round(currentSpeed * 0.12);
        if (nextD >= TARGET_DISTANCE) {
          setIsVictory(true);
          sounds.playLevelUp();
          recordTraversalRun(score + 1000, nextD, techCollected + 25, botsFound, crimeId);
        }
        return nextD;
      });

      setSkylineOffset((prev) => (prev + currentSpeed * 0.08) % 320);

      // 2. Physics & Player position
      setPlayerY((currY) => {
        let newVel = velocityY;
        let newY = currY;

        if (movementMode === 'swinging') {
          // Pendulum swing lift
          newVel = -7;
          newY += newVel;
          if (newY < 80) newY = 80;
        } else if (movementMode === 'gliding') {
          // Stable aerodynamic glide
          newVel = 0.8;
          newY += newVel;
        } else {
          // Gravity pull down
          newVel = Math.min(newVel + 0.6, 9);
          newY += newVel;
        }

        setVelocityY(newVel);

        // Ground collision (street level)
        if (newY > SCREEN_HEIGHT - 220) {
          newY = SCREEN_HEIGHT - 220;
          setSpeedMph((s) => Math.max(30, s - 5));
        }
        // Sky roof
        if (newY < 40) newY = 40;

        return newY;
      });

      // 3. Move obstacles toward player
      setObstacles((prevObs) => {
        const shift = currentSpeed * 0.22;
        let senseAlert = false;

        const updated = prevObs.map((obs) => {
          const nextX = obs.x - shift;

          // Check for Spider-Sense warning (drone approaching within 200px)
          if (obs.type === 'drone' && nextX > 60 && nextX < 240 && !obs.passed) {
            senseAlert = true;
          }

          // Check Collision with player at x = 90
          const playerX = 90;
          const playerH = 50;
          const playerW = 50;

          if (
            !obs.passed &&
            nextX < playerX + playerW &&
            nextX + obs.width > playerX &&
            playerY < obs.y + obs.height &&
            playerY + playerH > obs.y
          ) {
            // Collision!
            sounds.playPunch();
            triggerSfx('CRASH!');
            setHealth((h) => {
              const nextH = h - 25;
              if (nextH <= 0) {
                setIsGameOver(true);
              }
              return Math.max(0, nextH);
            });
            setCombo(1);
            setSpeedMph((s) => Math.max(25, s - 25));
            return { ...obs, x: nextX, passed: true };
          }

          if (nextX < playerX - 60) {
            return { ...obs, x: nextX, passed: true };
          }
          return { ...obs, x: nextX };
        });

        setSpiderSenseActive(senseAlert);
        return updated;
      });

      // 4. Move Collectibles
      setCollectibles((prevColl) => {
        const shift = currentSpeed * 0.22;
        return prevColl.map((item) => {
          const nextX = item.x - shift;
          const playerX = 90;

          if (
            !item.collected &&
            nextX < playerX + 45 &&
            nextX + 35 > playerX &&
            Math.abs(playerY - item.y) < 55
          ) {
            // Collected!
            if (item.type === 'tech') {
              sounds.playClick();
              triggerSfx('+10 TECH!');
              setTechCollected((t) => t + 10);
              setScore((s) => s + 150 * combo);
            } else if (item.type === 'wind_ring') {
              sounds.playGlider();
              triggerSfx('WIND TUNNEL BOOST!');
              setSpeedMph((s) => Math.min(115, s + 35));
              setScore((s) => s + 500 * combo);
            } else if (item.type === 'bot') {
              sounds.playLevelUp();
              triggerSfx('SPIDER-BOT FOUND!');
              setBotsFound((b) => [...b, item.name || 'bot_superior']);
              setScore((s) => s + 1000);
            }
            return { ...item, x: nextX, collected: true };
          }

          return { ...item, x: nextX };
        });
      });
    }, 35);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    isGameOver,
    isVictory,
    movementMode,
    playerY,
    velocityY,
    speedMph,
    combo,
    botsFound,
    techCollected,
    score,
    crimeId,
    TARGET_DISTANCE,
  ]);

  // Actions
  const startSwing = (side: 'left' | 'right') => {
    sounds.playThwip();
    setMovementMode('swinging');
    setSwingSide(side);
    triggerSfx('THWIP!');
    setSpeedMph((s) => Math.min(105, s + 6));
  };

  const releaseSwing = () => {
    setMovementMode('falling');
    setSwingSide(null);
    sounds.playGlider();
    // Bonus for release at top of arc
    if (playerY < 180) {
      triggerSfx('PERFECT RELEASE!');
      setSpeedMph((s) => Math.min(120, s + 12));
      setCombo((c) => Math.min(8, c + 1));
      setScore((s) => s + 100 * combo);
    }
  };

  const startGlide = () => {
    sounds.playGlider();
    setMovementMode('gliding');
    triggerSfx('WEB-WINGS!');
    setSpeedMph((s) => Math.max(65, s + 10));
  };

  const stopGlide = () => {
    setMovementMode('falling');
  };

  const doTrick = () => {
    if (isPeter) {
      sounds.playThwip();
      triggerSfx('ACROBATIC FLIP!');
    } else {
      sounds.playVenomZap();
      triggerSfx('VENOM CORKSCREW!');
    }
    setCombo((c) => Math.min(10, c + 1));
    setScore((s) => s + 200 * combo);
  };

  const doSlingshot = () => {
    sounds.playThwip();
    triggerSfx('SUPER SLINGSHOT!');
    setSpeedMph(120);
    setScore((s) => s + 600);
    setPlayerY(120);
    setVelocityY(-8);
  };

  const restartRun = () => {
    setPlayerY(240);
    setVelocityY(0);
    setSpeedMph(45);
    setDistance(0);
    setScore(0);
    setCombo(1);
    setTechCollected(0);
    setBotsFound([]);
    setHealth(100);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPlaying(true);
  };

  const progressPercent = Math.min(100, Math.round((distance / TARGET_DISTANCE) * 100));

  return (
    <View style={styles.container}>
      {/* Background NYC Skyline (Stylized Parallax) */}
      <View style={styles.skyBackdrop}>
        {/* City Horizon Silhouette */}
        <View style={styles.skyGlow} />

        {/* Parallax Buildings */}
        <View style={[styles.skylineLayer, { transform: [{ translateX: -skylineOffset }] }]}>
          {[...Array(12)].map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.buildingSil,
                {
                  height: 180 + ((idx * 37) % 140),
                  width: 50 + ((idx * 23) % 40),
                  left: idx * 80,
                },
              ]}
            >
              <View style={styles.spire} />
              <View style={styles.windowGrid} />
            </View>
          ))}
        </View>

        {/* Speed lines when moving fast */}
        {speedMph > 70 && (
          <View style={styles.speedLinesOverlay} pointerEvents="none">
            <View style={[styles.speedLine, { top: 80, width: 140 }]} />
            <View style={[styles.speedLine, { top: 160, width: 180, left: 100 }]} />
            <View style={[styles.speedLine, { top: 250, width: 220, left: 40 }]} />
          </View>
        )}
      </View>

      {/* Top Traversal HUD */}
      <View style={styles.topHud}>
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle} numberOfLines={1}>
            {missionTitle || 'MANHATTAN FREE PATROL'}
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: isPeter ? '#E52521' : '#F59E0B',
                },
              ]}
            />
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.hudStatsRow}>
          {/* Speedometer */}
          <View style={styles.hudMetric}>
            <Ionicons name="speedometer" size={14} color="#38BDF8" />
            <Text style={styles.metricVal}>{Math.round(speedMph)}</Text>
            <Text style={styles.metricUnit}>MPH</Text>
          </View>

          {/* Distance */}
          <View style={styles.hudMetric}>
            <Ionicons name="navigate" size={14} color="#A855F7" />
            <Text style={styles.metricVal}>{distance}</Text>
            <Text style={styles.metricUnit}>M</Text>
          </View>

          {/* Combo Multiplier */}
          <View style={[styles.hudMetric, combo > 2 && styles.activeComboMetric]}>
            <Ionicons name="flame" size={14} color="#EF4444" />
            <Text style={[styles.metricVal, { color: '#EF4444' }]}>{combo}x</Text>
          </View>

          {/* Health */}
          <View style={styles.hudMetric}>
            <Ionicons name="heart" size={14} color="#10B981" />
            <Text style={[styles.metricVal, { color: '#10B981' }]}>{health}%</Text>
          </View>

          {/* Close button */}
          {onClose && (
            <TouchableOpacity style={styles.exitBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Spider-Sense Warning when Hunter Drone Approaches */}
      <SpiderSenseAlert active={spiderSenseActive} type="yellow" text="DRONE SCANNING!" />

      {/* Floating Comic SFX Text */}
      {sfxText && (
        <Animated.View
          style={[
            styles.sfxContainer,
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
              { color: isPeter ? '#FFFFFF' : '#FDE047' },
            ]}
          >
            {sfxText}
          </Text>
        </Animated.View>
      )}

      {/* RENDER OBSTACLES */}
      {obstacles.map((obs) => {
        if (obs.x < -100 || obs.x > SCREEN_WIDTH + 80) return null;
        return (
          <View
            key={obs.id}
            style={[
              styles.obstacleBase,
              {
                left: obs.x,
                top: obs.y,
                width: obs.width,
                height: obs.height,
              },
            ]}
          >
            {obs.type === 'drone' ? (
              <View style={styles.hunterDrone}>
                <Ionicons name="scan" size={26} color="#EF4444" />
                <View style={styles.laserBeam} />
              </View>
            ) : obs.type === 'symbiote' ? (
              <View style={styles.symbioteSpire}>
                <Ionicons name="warning" size={20} color="#A855F7" />
                <View style={styles.symbioteTendril} />
              </View>
            ) : (
              <View style={styles.craneObstacle}>
                <Ionicons name="construct" size={24} color="#F59E0B" />
              </View>
            )}
          </View>
        );
      })}

      {/* RENDER COLLECTIBLES */}
      {collectibles.map((coll) => {
        if (coll.collected || coll.x < -80 || coll.x > SCREEN_WIDTH + 80) return null;
        return (
          <View
            key={coll.id}
            style={[
              styles.collectibleBase,
              {
                left: coll.x,
                top: coll.y,
              },
            ]}
          >
            {coll.type === 'tech' ? (
              <View style={styles.techCrate}>
                <Ionicons name="hardware-chip" size={18} color="#38BDF8" />
              </View>
            ) : coll.type === 'wind_ring' ? (
              <View style={styles.windRing}>
                <Ionicons name="ellipse-outline" size={38} color="#00E5FF" />
              </View>
            ) : (
              <View style={styles.spiderBotIcon}>
                <Ionicons name="bug" size={20} color="#F59E0B" />
              </View>
            )}
          </View>
        );
      })}

      {/* WEB LINE RENDERING */}
      {movementMode === 'swinging' && (
        <View
          style={[
            styles.webLine,
            {
              left: swingSide === 'left' ? 40 : 120,
              top: Math.max(0, playerY - 140),
              height: 150,
              transform: [{ rotate: swingSide === 'left' ? '-22deg' : '22deg' }],
              borderColor: currentSuit.colors.webColor,
            },
          ]}
        />
      )}

      {/* SPIDER-MAN CHARACTER MODEL */}
      <View
        style={[
          styles.playerAvatar,
          {
            top: playerY,
            left: 90,
            borderColor: currentSuit.colors.primary,
          },
        ]}
      >
        {/* Glow halo */}
        <View
          style={[
            styles.playerAura,
            { backgroundColor: currentSuit.colors.glow + '44' },
          ]}
        />

        {/* Hero icon & Web Wings visual */}
        {movementMode === 'gliding' && (
          <View style={styles.webWingsGlider}>
            <View style={[styles.wingFoil, { backgroundColor: currentSuit.colors.glow }]} />
            <View style={[styles.wingFoil, styles.wingFoilRight, { backgroundColor: currentSuit.colors.glow }]} />
          </View>
        )}

        <View
          style={[
            styles.spiderMask,
            {
              backgroundColor: currentSuit.colors.primary,
            },
          ]}
        >
          <View style={styles.spiderEyeLeft} />
          <View style={styles.spiderEyeRight} />
        </View>

        {/* Trail particles */}
        {movementMode === 'gliding' && (
          <View
            style={[
              styles.glideTrail,
              { backgroundColor: currentSuit.colors.webColor },
            ]}
          />
        )}
      </View>

      {/* BOTTOM TOUCH CONTROLS */}
      <View style={styles.controlsOverlay}>
        {/* Left Swing trigger */}
        <TouchableOpacity
          style={[
            styles.controlBtn,
            styles.swingBtn,
            swingSide === 'left' && styles.swingActive,
          ]}
          onPressIn={() => startSwing('left')}
          onPressOut={releaseSwing}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          <Text style={styles.controlBtnLabel}>SWING LEFT</Text>
        </TouchableOpacity>

        {/* Center: Slingshot & Air Trick */}
        <View style={styles.centerActionCol}>
          <TouchableOpacity
            style={styles.trickBtn}
            onPress={doTrick}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={18} color="#FDE047" />
            <Text style={styles.trickBtnLabel}>TRICK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.slingshotBtn}
            onPress={doSlingshot}
            activeOpacity={0.7}
          >
            <Ionicons name="rocket" size={18} color="#FF6B6B" />
            <Text style={styles.slingshotLabel}>SLINGSHOT</Text>
          </TouchableOpacity>
        </View>

        {/* Web Wings Glider Hold Button */}
        <TouchableOpacity
          style={[
            styles.controlBtn,
            styles.wingsBtn,
            movementMode === 'gliding' && styles.wingsActive,
          ]}
          onPressIn={startGlide}
          onPressOut={stopGlide}
          activeOpacity={0.8}
        >
          <Ionicons name="airplane" size={22} color="#00E5FF" />
          <Text style={styles.controlBtnLabel}>WEB WINGS</Text>
        </TouchableOpacity>

        {/* Right Swing trigger */}
        <TouchableOpacity
          style={[
            styles.controlBtn,
            styles.swingBtn,
            swingSide === 'right' && styles.swingActive,
          ]}
          onPressIn={() => startSwing('right')}
          onPressOut={releaseSwing}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          <Text style={styles.controlBtnLabel}>SWING RIGHT</Text>
        </TouchableOpacity>
      </View>

      {/* GAME OVER MODAL */}
      <Modal visible={isGameOver} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.gameOverCard}>
            <Ionicons name="alert-circle" size={54} color="#EF4444" />
            <Text style={styles.gameOverTitle}>COLLISION DETECTED</Text>
            <Text style={styles.gameOverSub}>
              Spider-Man hit Kraven Hunter defenses or city obstacles!
            </Text>

            <View style={styles.resultsRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultVal}>{distance}m</Text>
                <Text style={styles.resultLabel}>Distance</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultVal}>{techCollected}</Text>
                <Text style={styles.resultLabel}>Tech Parts</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultVal}>{score}</Text>
                <Text style={styles.resultLabel}>Score</Text>
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.retryBtn} onPress={restartRun}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>RETRY SWING</Text>
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

      {/* VICTORY MODAL */}
      <Modal visible={isVictory} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.gameOverCard, styles.victoryCard]}>
            <Ionicons name="checkmark-circle" size={58} color="#10B981" />
            <Text style={styles.victoryTitle}>DESTINATION REACHED!</Text>
            <Text style={styles.gameOverSub}>
              Supersonic traversal complete! City sector secured.
            </Text>

            <View style={styles.resultsRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultVal}>{distance}m</Text>
                <Text style={styles.resultLabel}>Distance</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={[styles.resultVal, { color: '#38BDF8' }]}>
                  +{techCollected + (crimeId ? 35 : 15)}
                </Text>
                <Text style={styles.resultLabel}>Tech Parts</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={[styles.resultVal, { color: '#FDE047' }]}>
                  +{crimeId ? 2 : 1}
                </Text>
                <Text style={styles.resultLabel}>Tokens</Text>
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              {onClose ? (
                <TouchableOpacity style={styles.victoryBtn} onPress={onClose}>
                  <Text style={styles.victoryBtnText}>CLAIM REWARDS & RETURN</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.victoryBtn} onPress={restartRun}>
                  <Text style={styles.victoryBtnText}>SWING AGAIN</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
    overflow: 'hidden',
  },
  skyBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#090D1A',
  },
  skyGlow: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#1E1B4B',
    opacity: 0.35,
  },
  skylineLayer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    width: 1400,
    flexDirection: 'row',
  },
  buildingSil: {
    backgroundColor: '#0B1120',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
    position: 'absolute',
    bottom: 0,
  },
  spire: {
    width: 4,
    height: 20,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
  },
  windowGrid: {
    marginTop: 15,
    marginHorizontal: 6,
    height: '70%',
    backgroundColor: '#FDE04711',
  },
  speedLinesOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  speedLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#38BDF8',
    opacity: 0.6,
    borderRadius: 1,
  },
  topHud: {
    paddingTop: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  missionCard: {
    backgroundColor: '#0F172ACC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  missionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  hudStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  hudMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172AEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  activeComboMetric: {
    borderColor: '#EF4444',
    backgroundColor: '#270B0B',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  exitBtn: {
    backgroundColor: '#1E293B',
    padding: 6,
    borderRadius: 8,
  },
  sfxContainer: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    zIndex: 20,
    backgroundColor: '#000000AA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FACC15',
  },
  sfxText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  obstacleBase: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  hunterDrone: {
    alignItems: 'center',
    backgroundColor: '#1C1917',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  laserBeam: {
    width: 2,
    height: 30,
    backgroundColor: '#EF4444',
    opacity: 0.8,
  },
  symbioteSpire: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1035',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A855F7',
  },
  symbioteTendril: {
    width: 6,
    height: 35,
    backgroundColor: '#581C87',
    borderRadius: 3,
  },
  craneObstacle: {
    backgroundColor: '#261E0A',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  collectibleBase: {
    position: 'absolute',
    zIndex: 6,
  },
  techCrate: {
    backgroundColor: '#0C4A6E',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  windRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spiderBotIcon: {
    backgroundColor: '#451A03',
    padding: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  webLine: {
    position: 'absolute',
    width: 2,
    borderLeftWidth: 2,
    zIndex: 7,
  },
  playerAvatar: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  playerAura: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  spiderMask: {
    width: 38,
    height: 38,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  spiderEyeLeft: {
    width: 8,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '-15deg' }],
  },
  spiderEyeRight: {
    width: 8,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 4,
    transform: [{ rotate: '15deg' }],
  },
  webWingsGlider: {
    position: 'absolute',
    width: 68,
    height: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 12,
  },
  wingFoil: {
    width: 24,
    height: 12,
    borderTopLeftRadius: 10,
    opacity: 0.85,
  },
  wingFoilRight: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 10,
  },
  glideTrail: {
    position: 'absolute',
    width: 30,
    height: 3,
    left: -25,
    borderRadius: 2,
    opacity: 0.7,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
    gap: 8,
  },
  controlBtn: {
    flex: 1,
    height: 64,
    backgroundColor: '#1E293BCC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
    paddingHorizontal: 4,
  },
  swingBtn: {
    backgroundColor: '#1E1B4BCC',
    borderColor: '#4338CA',
  },
  swingActive: {
    backgroundColor: '#4338CA',
    borderColor: '#6366F1',
  },
  wingsBtn: {
    backgroundColor: '#083344CC',
    borderColor: '#06B6D4',
  },
  wingsActive: {
    backgroundColor: '#0891B2',
    borderColor: '#22D3EE',
  },
  controlBtnLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  centerActionCol: {
    gap: 6,
  },
  trickBtn: {
    backgroundColor: '#371B58',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: '#7E22CE',
  },
  trickBtnLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FDE047',
  },
  slingshotBtn: {
    backgroundColor: '#450A0A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  slingshotLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FCA5A5',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000CC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
    width: '90%',
    maxWidth: 380,
  },
  victoryCard: {
    borderColor: '#10B981',
  },
  gameOverTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EF4444',
    marginTop: 12,
    letterSpacing: 1,
  },
  victoryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 12,
    letterSpacing: 1,
  },
  gameOverSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  resultLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalBtnRow: {
    width: '100%',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: '#E52521',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  victoryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
