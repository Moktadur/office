import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, HeroId, SuitId } from '../types/game';
import { sounds } from './soundEffects';

const STORAGE_KEY = '@spiderman2_game_state_v1';

export const INITIAL_GAME_STATE: GameState = {
  hero: 'peter',
  peterSuit: 'peter_advanced_2',
  milesSuit: 'miles_upgraded',
  level: 12,
  xp: 1450,
  maxXp: 2000,
  techParts: 140,
  heroTokens: 8,
  // Stats
  totalDistance: 14200,
  highScoreTraversal: 4850,
  crimesCompleted: 7,
  symbiotesPurged: 38,
  huntersStopped: 44,
  highestCombo: 34,
  perfectParries: 19,
  // Unlocks
  unlockedSuits: ['peter_advanced_2', 'miles_upgraded', 'peter_symbiote_black'],
  techUpgrades: {
    traversal_web_wings: 2,
    traversal_slingshot: 1,
    traversal_point_launch: 1,
    damage_kinetic_strike: 2,
    damage_web_viscosity: 1,
    damage_aerial_combat: 1,
    health_ballistic_weave: 2,
    health_cellular_regen: 1,
    focus_flow_generator: 2,
    focus_ultimate_overdrive: 1,
  },
  collectedSpiderBots: ['bot_2099', 'bot_spider_gwen', 'bot_spider_punk'],
  completedCrimes: ['crime_fidi_speed_run', 'crime_astoria_prowler', 'crime_harlem_music_wings'],
  soundEnabled: true,
  hapticsEnabled: true,
};

export async function loadGameState(): Promise<GameState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: GameState = JSON.parse(raw);
      sounds.setSoundEnabled(parsed.soundEnabled ?? true);
      sounds.setHapticsEnabled(parsed.hapticsEnabled ?? true);
      return { ...INITIAL_GAME_STATE, ...parsed };
    }
  } catch (e) {
    // fallback
  }
  return INITIAL_GAME_STATE;
}

export async function saveGameState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}
