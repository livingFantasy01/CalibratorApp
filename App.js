import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// 1. IMPORT ADMOB TOOLS
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Professional Screen Suite
import BubbleLevelScreen from './src/screens/BubbleLevelScreen';
import GeneralCalibrateScreen from './src/screens/GeneralCalibrateScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import VisualLevelScreen from './src/screens/VisualLevelScreen';

// 2. AD CONFIGURATION
// Use TestIds.BANNER for development to avoid getting banned.
// Swap 'TestIds.BANNER' for your real 'Ad Unit ID' (the one with the "/") only for production.
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-7403534919707613/XXXXXXXXXX'; 

const Tab = createBottomTabNavigator();

function MyTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Level" 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Level') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Compass') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'AR Level') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
        tabBarStyle: { 
          backgroundColor: '#0A0C10', 
          borderTopColor: '#1F222B',
          borderTopWidth: 1,
          height: 65 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          letterSpacing: 0.5,
        },
        tabBarActiveTintColor: '#00FF88', 
        tabBarInactiveTintColor: '#555',
      })}
    >
      <Tab.Screen name="Level" component={BubbleLevelScreen} options={{ tabBarLabel: 'SURFACE' }} />
      <Tab.Screen name="Compass" component={GeneralCalibrateScreen} options={{ tabBarLabel: 'COMPASS' }} />
      <Tab.Screen name="AR Level" component={VisualLevelScreen} options={{ tabBarLabel: 'GPS' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'INFO' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  // 3. INITIALIZE ADS ON STARTUP
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob Initialized Successfully');
      })
      .catch(error => console.log('AdMob Init Error: ', error));
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: '#050608' }}>
          
          {/* 4. ACTUAL AD BANNER AT THE TOP */}
          <View style={{ 
            height: 100, // Slightly taller to account for status bars on some devices
            backgroundColor: '#0A0C10', 
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#1F222B',
            paddingBottom: 5 
          }}>
            <BannerAd
              unitId={adUnitId} 
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
              onAdFailedToLoad={(error) => console.log('Banner Error: ', error)}
            />
          </View>

          {/* Main App Content Area */}
          <View style={{ flex: 1 }}>
            <MyTabs />
          </View>

        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}