export type HeroId = 'peter' | 'miles';

export type SuitId =
  // Peter suits
  | 'peter_advanced_2'
  | 'peter_symbiote_black'
  | 'peter_anti_venom'
  | 'peter_superior'
  | 'peter_raimi_webbed'
  | 'peter_iron_spider'
  // Miles suits
  | 'miles_upgraded'
  | 'miles_2099'
  | 'miles_bodega_cat'
  | 'miles_the_end'
  | 'miles_10th_anniversary'
  | 'miles_strike';

export interface Suit {
  id: SuitId;
  hero: HeroId;
  name: string;
  subtitle: string;
  description: string;
  unlocked: boolean;
  techCost: number;
  tokenCost: number;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    webColor: string;
    accent: string;
  };
  stats: {
    traversal: number;
    damage: number;
    defense: number;
    focusRate: number;
  };
  specialPerk: string;
  perkIcon: string;
}

export type TechCategory = 'traversal' | 'damage' | 'health' | 'focus';

export interface TechUpgrade {
  id: string;
  category: TechCategory;
  title: string;
  description: string;
  level: number;
  maxLevel: number;
  costTech: number[];
  costTokens: number[];
  statBoost: string;
}

export interface CrimeAlert {
  id: string;
  title: string;
  districtId: string;
  type: 'hunter_base' | 'symbiote_nest' | 'marko_memory' | 'car_chase' | 'unidentified_target';
  description: string;
  threat: 'Low' | 'Moderate' | 'High' | 'Severe';
  heroTokens: number;
  techParts: number;
  xpReward: number;
  completed: boolean;
  gameMode: 'traversal' | 'combat';
}

export interface District {
  id: string;
  name: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens';
  completion: number; // 0 - 100
  threat: 'Clean' | 'Moderate' | 'High' | 'Symbiote Surge';
  crimes: CrimeAlert[];
}

export interface SpiderBot {
  id: string;
  name: string;
  universe: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  district: string;
  primaryColor: string;
  secondaryColor: string;
  quote: string;
  collected: boolean;
}

export interface GameState {
  hero: HeroId;
  peterSuit: SuitId;
  milesSuit: SuitId;
  level: number;
  xp: number;
  maxXp: number;
  techParts: number;
  heroTokens: number;
  // Stats
  totalDistance: number;
  highScoreTraversal: number;
  crimesCompleted: number;
  symbiotesPurged: number;
  huntersStopped: number;
  highestCombo: number;
  perfectParries: number;
  // Unlocks
  unlockedSuits: SuitId[];
  techUpgrades: Record<string, number>;
  collectedSpiderBots: string[];
  completedCrimes: string[];
  // Settings
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}
