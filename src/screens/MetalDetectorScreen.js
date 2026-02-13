import { Ionicons } from '@expo/vector-icons';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function MetalDetectorScreen() {
  const [magnitude, setMagnitude] = useState(0);
  const [baseline, setBaseline] = useState(45); 
  const [isDetected, setIsDetected] = useState(false);
  
  // Ref to handle smoothing without unnecessary re-renders
  const lastValue = useRef(0);

  useEffect(() => {
    // 1. High-speed polling for real-time scanning
    Magnetometer.setUpdateInterval(25); 
    
    const sub = Magnetometer.addListener((data) => {
      // 2. Calculate raw magnitude
      const rawTotal = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      
      // 3. Smoothing Filter (prevents jittery numbers)
      const smoothed = lastValue.current + (rawTotal - lastValue.current) * 0.2;
      lastValue.current = smoothed;
      setMagnitude(smoothed);

      // 4. Sensitivity Logic
      // If the field increases by more than 15uT above your "Zero", metal is present.
      const threshold = 15; 
      if (smoothed > baseline + threshold) {
        if (!isDetected) {
          setIsDetected(true);
          Vibration.vibrate(70); // Stronger pulse upon initial discovery
        }
      } else {
        setIsDetected(false);
      }
    });

    return () => sub.remove();
  }, [baseline, isDetected]);

  const handleCalibrate = () => {
    // This resets the "Normal" state of the room
    setBaseline(magnitude);
    Vibration.vibrate(10); // Haptic feedback for button press
  };

  // UI Progress: We map 0-150 uT to the visual meter
  const progress = Math.min(((magnitude - (baseline - 20)) / 150) * 100, 100);

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>METAL DETECTOR</Text>
          <Text style={styles.subtitle}>MAGNETIC FLUX SENSOR</Text>
        </View>
        <TouchableOpacity onPress={handleCalibrate} style={styles.calibrateBtn}>
          <Ionicons name="refresh-circle" size={24} color="#00FF88" />
          <Text style={styles.calibrateText}>ZERO BASIS</Text>
        </TouchableOpacity>
      </View>

      {/* VISUAL METER SECTION */}
      <View style={styles.meterContainer}>
        <View style={[styles.outerRing, isDetected && styles.outerRingDetected]}>
            {/* The "Liquid" fill indicator */}
            <View style={[
                styles.fill, 
                { 
                  height: `${Math.max(progress, 0)}%`, 
                  backgroundColor: isDetected ? '#FF3B30' : '#00FF88' 
                }
            ]} />
            
            <View style={styles.centerHole}>
                <Text style={styles.valueText}>{magnitude.toFixed(0)}</Text>
                <Text style={styles.unitText}>μT</Text>
            </View>
        </View>
        
        <View style={styles.statusBox}>
          <Text style={[styles.statusText, { color: isDetected ? '#FF3B30' : '#444' }]}>
            {isDetected ? "METAL DETECTED" : "SCANNING FOR STUDS..."}
          </Text>
          {isDetected && <View style={styles.warningLine} />}
        </View>
      </View>

      {/* FOOTER HINT SECTION */}
      <View style={styles.infoBox}>
        <View style={styles.iconCircle}>
          <Ionicons name="magnet" size={18} color="#00FF88" />
        </View>
        <View style={styles.hintContent}>
          <Text style={styles.hintTitle}>PRO TIP</Text>
          <Text style={styles.hintText}>
            The sensor is usually near the top camera. Move that area slowly across the wall.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050608', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 50 },
  
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  screenTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 5 },
  subtitle: { color: '#333', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 },
  
  calibrateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12141A', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  calibrateText: { color: '#00FF88', fontSize: 10, fontWeight: '900', marginLeft: 5 },
  
  meterContainer: { alignItems: 'center', justifyContent: 'center' },
  outerRing: { width: 250, height: 250, borderRadius: 125, backgroundColor: '#0A0C10', borderWidth: 2, borderColor: '#1F222B', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  outerRingDetected: { borderColor: '#FF3B30', backgroundColor: '#1A0D0D' },
  
  fill: { width: '100%', position: 'absolute', bottom: 0, opacity: 0.3 },
  centerHole: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#050608', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1F222B', zIndex: 10, elevation: 10 },
  
  valueText: { color: '#FFF', fontSize: 68, fontWeight: '100' },
  unitText: { color: '#00FF88', fontSize: 14, fontWeight: '900', marginTop: -5 },
  
  statusBox: { alignItems: 'center', marginTop: 30, height: 40 },
  statusText: { fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  warningLine: { width: 40, height: 2, backgroundColor: '#FF3B30', marginTop: 8 },

  infoBox: { width: '85%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0C10', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#1A1D26' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#050608', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1F222B' },
  hintContent: { marginLeft: 15, flex: 1 },
  hintTitle: { color: '#00FF88', fontSize: 10, fontWeight: '900', marginBottom: 2 },
  hintText: { color: '#666', fontSize: 11, lineHeight: 16, fontWeight: '500' }
});