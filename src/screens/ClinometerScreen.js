import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ClinometerScreen() {
  const [angle, setAngle] = useState(0);
  const [distance, setDistance] = useState(10); // Default distance: 10 meters

  useEffect(() => {
    Accelerometer.setUpdateInterval(30);
    const sub = Accelerometer.addListener((data) => {
      // Calculate pitch angle
      let rad = Math.atan2(-data.y, data.z);
      let deg = rad * (180 / Math.PI);
      setAngle(deg);
    });

    return () => sub.remove();
  }, []);

  // The Math: Height = distance * tan(angle)
  // We add 1.6 meters (average eye level height)
  const calculatedHeight = (distance * Math.tan(Math.abs(angle) * (Math.PI / 180))) + 1.6;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>SMART CLINOMETER</Text>
        <Text style={styles.statusText}>POINT TOP OF PHONE TO ROOF</Text>
      </View>

      <View style={styles.gaugeContainer}>
        {/* Rotating Angle Scale */}
        <View style={[styles.dial, { transform: [{ rotate: `${angle}deg` }] }]}>
           <View style={styles.levelLine} />
        </View>

        <View style={styles.centerInfo}>
          <Text style={styles.angleDisplay}>{Math.abs(angle).toFixed(1)}°</Text>
          <View style={styles.divider} />
          <Text style={styles.heightDisplay}>{calculatedHeight.toFixed(1)}m</Text>
          <Text style={styles.heightLabel}>EST. HEIGHT</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Text style={styles.distLabel}>DISTANCE TO OBJECT: {distance}m</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setDistance(d => Math.max(1, d - 1))} style={styles.btn}>
            <Ionicons name="remove" size={24} color="#00FF88" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDistance(d => d + 1)} style={styles.btn}>
            <Ionicons name="add" size={24} color="#00FF88" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050608', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60 },
  header: { alignItems: 'center' },
  screenTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 5 },
  statusText: { color: '#00FF88', fontSize: 10, fontWeight: 'bold', marginTop: 8 },
  
  gaugeContainer: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center' },
  dial: { position: 'absolute', width: '100%', height: '100%', borderRadius: 140, borderWidth: 1, borderColor: '#1F222B', borderStyle: 'dashed' },
  levelLine: { position: 'absolute', top: '50%', width: '100%', height: 2, backgroundColor: '#00FF88', opacity: 0.5 },
  
  centerInfo: { alignItems: 'center' },
  angleDisplay: { color: '#888', fontSize: 24, fontWeight: '300' },
  divider: { width: 40, height: 1, backgroundColor: '#333', marginVertical: 10 },
  heightDisplay: { color: '#FFF', fontSize: 52, fontWeight: '100' },
  heightLabel: { color: '#00FF88', fontSize: 10, fontWeight: '900', letterSpacing: 2 },

  controls: { width: '80%', alignItems: 'center' },
  distLabel: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', gap: 20 },
  btn: { width: 60, height: 40, backgroundColor: '#12141A', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' }
});