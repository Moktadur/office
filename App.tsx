import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { GameProvider, useGame } from './src/context/GameContext';
import { HeaderHeroSwitcher } from './src/components/HeaderHeroSwitcher';
import { PatrolScreen } from './src/screens/PatrolScreen';
import { FnsmAppScreen } from './src/screens/FnsmAppScreen';
import { SuitsScreen } from './src/screens/SuitsScreen';
import { SpiderBotsScreen } from './src/screens/SpiderBotsScreen';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const { state } = useGame();
  const isPeter = state.hero === 'peter';
  const activeColor = isPeter ? '#E52521' : '#F59E0B';

  return (
    <View style={styles.appContainer}>
      <HeaderHeroSwitcher />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#090D18',
            borderTopColor: '#1E293B',
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: '#64748B',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.5,
          },
        }}
      >
        <Tab.Screen
          name="Patrol"
          component={PatrolScreen}
          options={{
            tabBarLabel: 'PATROL',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size - 1} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="FnsmApp"
          component={FnsmAppScreen}
          options={{
            tabBarLabel: 'FNSM APP',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size - 1} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Suits"
          component={SuitsScreen}
          options={{
            tabBarLabel: 'SUITS & TECH',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shirt" size={size - 1} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SpiderBots"
          component={SpiderBotsScreen}
          options={{
            tabBarLabel: 'SPIDER-BOTS',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bug" size={size - 1} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  // Preload icon fonts for web so icons never render as boxes
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <StatusBar style="light" backgroundColor="#0F172A" />
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#070A13',
  },
});
