import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PartyScreen from '../screens/PartyScreen';
import PartyDetailScreen from '../screens/PartyDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Party screens
const PartyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PartyList"
        component={PartyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PartyDetail"
        component={PartyDetailScreen}
        options={{
          headerTitle: 'Detalle de Fiesta',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Analysis') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            } else if (route.name === 'Party') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E5EA',
            paddingBottom: Platform.OS === 'ios' ? 20 : 5,
            paddingTop: 5,
            height: Platform.OS === 'ios' ? 84 : 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#007AFF',
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Inicio',
            headerTitle: 'Cuentas Claras',
          }}
        />
        <Tab.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{
            title: 'Análisis',
            headerTitle: 'Análisis Financiero',
          }}
        />
        <Tab.Screen
          name="Party"
          component={PartyStack}
          options={{
            title: 'Fiestas',
            headerTitle: 'Gestión de Fiestas',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Configuración',
            headerTitle: 'Configuración',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
