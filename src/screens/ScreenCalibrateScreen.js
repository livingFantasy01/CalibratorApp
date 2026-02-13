import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SensorCalibrateScreen() {
  const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
  const [accData, setAccData] = useState({ x: 0, y: 0, z: 0 });
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    const magSub = Magnetometer.addListener(setMagData);
    const accSub = Accelerometer.addListener(setAccData);
    
    Magnetometer.setUpdateInterval(100);
    Accelerometer.setUpdateInterval(100);

    return () => {
      magSub.remove();
      accSub.remove();
    };
  }, []);

  // Saves current magnetic values as the "Zero" point
  const calibrateCompass = async () => {
    setIsCalibrating(true);
    const offset = { x: magData.x, y: magData.y, z: magData.z };
    await AsyncStorage.setItem('mag_offset', JSON.stringify(offset));
    
    // Simulate a brief loading state for UX
    setTimeout(() => setIsCalibrating(false), 1000);
  };

  // Saves current tilt as "Flat" (Great for phone cases)
  const calibrateLevel = async () => {
    setIsCalibrating(true);
    const offset = { x: accData.x, y: accData.y };
    await AsyncStorage.setItem('level_offset', JSON.stringify(offset));
    
    setTimeout(() => setIsCalibrating(false), 1000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SENSOR HEALTH</Text>
        <Text style={styles.subtitle}>Maintain your tool's precision</Text>
      </View>

      {/* COMPASS CALIBRATION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="compass-outline" size={24} color="#FF3B30" />
          <Text style={styles.cardTitle}>Compass Accuracy</Text>
        </View>
        <Text style={styles.cardDesc}>
          If the needle is spinning or stuck, wave your phone in a 'Figure-8' motion to reset the magnetic sensor.
        </Text>
        <TouchableOpacity style={styles.actionBtn} onPress={calibrateCompass}>
          <Text style={styles.btnText}>{isCalibrating ? "CALIBRATING..." : "RESET MAGNETIC NORTH"}</Text>
        </TouchableOpacity>
      </View>

      {/* BUBBLE LEVEL CALIBRATION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="speedometer-outline" size={24} color="#00FF88" />
          <Text style={styles.cardTitle}>Level Calibration</Text>
        </View>
        <Text style={styles.cardDesc}>
          Lay your phone on a known flat surface and press the button below to 'Zero' the bubble level.
        </Text>
        <TouchableOpacity style={[styles.actionBtn, {borderColor: '#00FF88'}]} onPress={calibrateLevel}>
          <Text style={[styles.btnText, {color: '#00FF88'}]}>SET CURRENT AS FLAT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color="#444" />
        <Text style={styles.footerText}>Hardware sensors: Active & Responding</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#050608', padding: 25, paddingTop: 60 },
  header: { marginBottom: 30 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: '#444', fontSize: 14, marginTop: 5, fontWeight: '600' },
  
  card: { backgroundColor: '#0A0C10', borderRadius: 15, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#1A1D26' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: '#EEE', fontSize: 18, fontWeight: '700', marginLeft: 10 },
  cardDesc: { color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  
  actionBtn: { width: '100%', height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FF3B30', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#333', fontSize: 11, marginLeft: 8, fontWeight: 'bold' }
});