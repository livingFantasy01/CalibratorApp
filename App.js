import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react'; // Added useEffect
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// 1. IMPORT ADMOB TOOLS
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Professional Screen Suite
import BubbleLevelScreen from './src/screens/BubbleLevelScreen';
import GeneralCalibrateScreen from './src/screens/GeneralCalibrateScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import VisualLevelScreen from './src/screens/VisualLevelScreen';

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
  // 2. INITIALIZE ADS ON STARTUP
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob Initialized Successfully');
      });
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: '#050608' }}>
          
          {/* 3. ACTUAL AD BANNER AT THE TOP */}
          <View style={{ 
            height: 90, 
            backgroundColor: '#0A0C10', 
            justifyContent: 'flex-end', // Aligns ad to bottom of this container
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#1F222B',
            paddingBottom: 5 // Small gap before the app content starts
          }}>
            <BannerAd
              unitId={TestIds.BANNER} // Always use TestIds during development
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
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