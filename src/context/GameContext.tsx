import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, HeroId, Suit, SuitId, TechUpgrade } from '../types/game';
import { INITIAL_GAME_STATE, loadGameState, saveGameState } from '../services/storage';
import { SUITS_DATA } from '../constants/suitsData';
import { TECH_UPGRADES_DATA } from '../constants/techData';
import { sounds } from '../services/soundEffects';

interface GameContextType {
  state: GameState;
  currentSuit: Suit;
  equippedPeterSuit: Suit;
  equippedMilesSuit: Suit;
  allSuits: Suit[];
  allTechUpgrades: TechUpgrade[];
  switchHero: () => void;
  equipSuit: (suitId: SuitId) => void;
  unlockSuit: (suitId: SuitId) => boolean;
  upgradeTech: (techId: string) => boolean;
  collectSpiderBot: (botId: string) => void;
  recordTraversalRun: (
    score: number,
    distance: number,
    techGained: number,
    botsFound: string[],
    crimeId?: string
  ) => void;
  recordCombatVictory: (
    enemiesDefeated: number,
    type: 'symbiote' | 'hunter',
    combo: number,
    parries: number,
    tech: number,
    tokens: number,
    xp: number,
    crimeId?: string
  ) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  addReward: (tech: number, tokens: number, xp: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadGameState().then((loadedState) => {
      setState(loadedState);
      setLoaded(true);
    });
  }, []);

  const updateState = (updater: (prev: GameState) => GameState) => {
    setState((prev) => {
      const next = updater(prev);
      saveGameState(next);
      return next;
    });
  };

  const equippedPeterSuit =
    SUITS_DATA.find((s) => s.id === state.peterSuit) || SUITS_DATA[0];
  const equippedMilesSuit =
    SUITS_DATA.find((s) => s.id === state.milesSuit) || SUITS_DATA[6];
  const currentSuit = state.hero === 'peter' ? equippedPeterSuit : equippedMilesSuit;

  const allSuits = SUITS_DATA.map((suit) => ({
    ...suit,
    unlocked: state.unlockedSuits.includes(suit.id),
  }));

  const allTechUpgrades = TECH_UPGRADES_DATA.map((tech) => ({
    ...tech,
    level: state.techUpgrades[tech.id] ?? tech.level,
  }));

  const switchHero = () => {
    sounds.playThwip();
    updateState((prev) => {
      const nextHero: HeroId = prev.hero === 'peter' ? 'miles' : 'peter';
      if (nextHero === 'miles') {
        sounds.playVenomZap();
      } else {
        sounds.playSymbioteRoar();
      }
      return {
        ...prev,
        hero: nextHero,
      };
    });
  };

  const equipSuit = (suitId: SuitId) => {
    const suit = SUITS_DATA.find((s) => s.id === suitId);
    if (!suit || !state.unlockedSuits.includes(suitId)) return;

    sounds.playClick();
    updateState((prev) => {
      if (suit.hero === 'peter') {
        return { ...prev, peterSuit: suitId };
      } else {
        return { ...prev, milesSuit: suitId };
      }
    });
  };

  const unlockSuit = (suitId: SuitId): boolean => {
    const suit = SUITS_DATA.find((s) => s.id === suitId);
    if (!suit) return false;
    if (state.unlockedSuits.includes(suitId)) return true;

    if (state.techParts >= suit.techCost && state.heroTokens >= suit.tokenCost) {
      sounds.playLevelUp();
      updateState((prev) => ({
        ...prev,
        techParts: prev.techParts - suit.techCost,
        heroTokens: prev.heroTokens - suit.tokenCost,
        unlockedSuits: [...prev.unlockedSuits, suitId],
      }));
      return true;
    }
    return false;
  };

  const upgradeTech = (techId: string): boolean => {
    const tech = TECH_UPGRADES_DATA.find((t) => t.id === techId);
    if (!tech) return false;
    const currentLvl = state.techUpgrades[techId] ?? tech.level;
    if (currentLvl >= tech.maxLevel) return false;

    const techCost = tech.costTech[currentLvl] ?? 50;
    const tokenCost = tech.costTokens[currentLvl] ?? 2;

    if (state.techParts >= techCost && state.heroTokens >= tokenCost) {
      sounds.playLevelUp();
      updateState((prev) => ({
        ...prev,
        techParts: prev.techParts - techCost,
        heroTokens: prev.heroTokens - tokenCost,
        techUpgrades: {
          ...prev.techUpgrades,
          [techId]: currentLvl + 1,
        },
      }));
      return true;
    }
    return false;
  };

  const collectSpiderBot = (botId: string) => {
    if (state.collectedSpiderBots.includes(botId)) return;
    sounds.playLevelUp();
    updateState((prev) => ({
      ...prev,
      collectedSpiderBots: [...prev.collectedSpiderBots, botId],
      techParts: prev.techParts + 25,
      heroTokens: prev.heroTokens + 1,
      xp: prev.xp + 150,
    }));
  };

  const recordTraversalRun = (
    score: number,
    distance: number,
    techGained: number,
    botsFound: string[],
    crimeId?: string
  ) => {
    updateState((prev) => {
      let nextBots = [...prev.collectedSpiderBots];
      botsFound.forEach((b) => {
        if (!nextBots.includes(b)) nextBots.push(b);
      });

      let nextCrimes = [...prev.completedCrimes];
      if (crimeId && !nextCrimes.includes(crimeId)) {
        nextCrimes.push(crimeId);
      }

      let xpGain = Math.floor(distance / 5) + (crimeId ? 250 : 50);
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      if (newXp >= newMaxXp) {
        newLevel += 1;
        newXp -= newMaxXp;
        newMaxXp = Math.floor(newMaxXp * 1.25);
        sounds.playLevelUp();
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        maxXp: newMaxXp,
        totalDistance: prev.totalDistance + distance,
        highScoreTraversal: Math.max(prev.highScoreTraversal, score),
        techParts: prev.techParts + techGained + (crimeId ? 35 : 0),
        heroTokens: prev.heroTokens + (crimeId ? 2 : 1),
        crimesCompleted: crimeId ? prev.crimesCompleted + 1 : prev.crimesCompleted,
        collectedSpiderBots: nextBots,
        completedCrimes: nextCrimes,
      };
    });
  };

  const recordCombatVictory = (
    enemiesDefeated: number,
    type: 'symbiote' | 'hunter',
    combo: number,
    parries: number,
    tech: number,
    tokens: number,
    xpReward: number,
    crimeId?: string
  ) => {
    updateState((prev) => {
      let nextCrimes = [...prev.completedCrimes];
      if (crimeId && !nextCrimes.includes(crimeId)) {
        nextCrimes.push(crimeId);
      }

      let newXp = prev.xp + xpReward;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      if (newXp >= newMaxXp) {
        newLevel += 1;
        newXp -= newMaxXp;
        newMaxXp = Math.floor(newMaxXp * 1.25);
        sounds.playLevelUp();
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        maxXp: newMaxXp,
        techParts: prev.techParts + tech,
        heroTokens: prev.heroTokens + tokens,
        highestCombo: Math.max(prev.highestCombo, combo),
        perfectParries: prev.perfectParries + parries,
        symbiotesPurged:
          type === 'symbiote' ? prev.symbiotesPurged + enemiesDefeated : prev.symbiotesPurged,
        huntersStopped:
          type === 'hunter' ? prev.huntersStopped + enemiesDefeated : prev.huntersStopped,
        crimesCompleted: crimeId ? prev.crimesCompleted + 1 : prev.crimesCompleted,
        completedCrimes: nextCrimes,
      };
    });
  };

  const addReward = (tech: number, tokens: number, xp: number) => {
    updateState((prev) => ({
      ...prev,
      techParts: prev.techParts + tech,
      heroTokens: prev.heroTokens + tokens,
      xp: prev.xp + xp,
    }));
  };

  const toggleSound = () => {
    updateState((prev) => {
      const next = !prev.soundEnabled;
      sounds.setSoundEnabled(next);
      return { ...prev, soundEnabled: next };
    });
  };

  const toggleHaptics = () => {
    updateState((prev) => {
      const next = !prev.hapticsEnabled;
      sounds.setHapticsEnabled(next);
      return { ...prev, hapticsEnabled: next };
    });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        currentSuit,
        equippedPeterSuit,
        equippedMilesSuit,
        allSuits,
        allTechUpgrades,
        switchHero,
        equipSuit,
        unlockSuit,
        upgradeTech,
        collectSpiderBot,
        recordTraversalRun,
        recordCombatVictory,
        toggleSound,
        toggleHaptics,
        addReward,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
