import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.9;
const BUBBLE_SIZE = 40; 
const MAX_DISTANCE = (CIRCLE_SIZE / 2) - (BUBBLE_SIZE / 2);

export default function BubbleLevelScreen() {
  const [data, setData] = useState({ x: 0, y: 0, z: 1 });
  
  useEffect(() => {
    Accelerometer.setUpdateInterval(16);
    
    const sub = Accelerometer.addListener((s) => {
      const scale = Math.abs(s.x) > 1.5 || Math.abs(s.y) > 1.5 ? 9.81 : 1;
      const alpha = 0.07; 
      
      setData((prev) => ({
        x: prev.x + ((s.x / scale) - prev.x) * alpha,
        y: prev.y + ((s.y / scale) - prev.y) * alpha,
        z: prev.z + ((s.z / scale) - prev.z) * alpha,
      }));
    });
    return () => sub.remove();
  }, []);

  const acceleration = Math.sqrt(data.x ** 2 + data.y ** 2);
  const totalAngle = Math.atan2(acceleration, Math.abs(data.z)) * (180 / Math.PI);
  const xAngle = Math.atan2(data.x, Math.abs(data.z)) * (180 / Math.PI);
  const yAngle = Math.atan2(data.y, Math.abs(data.z)) * (180 / Math.PI);
  const isLevel = totalAngle < 1.0; 

  const sensitivity = CIRCLE_SIZE * 0.9;
  let posX = data.x * sensitivity;
  let posY = -data.y * sensitivity;
  const currentDist = Math.sqrt(posX * posX + posY * posY);
  if (currentDist > MAX_DISTANCE) {
    const ratio = MAX_DISTANCE / currentDist;
    posX *= ratio;
    posY *= ratio;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. MEANINGFUL TITLE HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>SURFACE LEVEL</Text>
          <Text style={[styles.statusText, { color: isLevel ? '#00FF88' : '#FFBB00' }]}>
            {isLevel ? 'SURFACE IS LEVEL' : 'SURFACE IS TILTING'}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setData({x:0, y:0, z:1})} 
          style={styles.resetBtn}
        >
          <Ionicons name="refresh" size={20} color="#00FF88" />
        </TouchableOpacity>
      </View>

      {/* 2. THE LEVEL DIAL */}
      <View style={[styles.outerCircle, isLevel && styles.outerCircleLevel]}>
        <View style={styles.guideLineV} />
        <View style={styles.guideLineH} />
        <View style={styles.targetRingFocus} />
        <View style={styles.targetRingOuter} />

        <View style={[styles.bubble, { 
          transform: [{ translateX: posX }, { translateY: posY }],
          backgroundColor: isLevel ? '#00FF88' : '#FFBB00',
          shadowColor: isLevel ? '#00FF88' : '#FFBB00',
        }]}>
          <View style={styles.bubbleGloss} />
        </View>
      </View>

      {/* 3. MEANINGFUL DATA PANEL */}
      <View style={styles.dataPanel}>
        <View style={styles.axisRow}>
          <View style={styles.axisItem}>
            <Text style={styles.axisLabel}>X-SLOPE</Text>
            <Text style={styles.axisValue}>{xAngle.toFixed(1)}°</Text>
          </View>
          
          <View style={styles.mainAngleItem}>
            <Text style={[styles.totalAngle, isLevel && { color: '#00FF88' }]}>
              {totalAngle.toFixed(1)}°
            </Text>
            <Text style={styles.angleLabel}>TOTAL TILT</Text>
          </View>

          <View style={styles.axisItem}>
            <Text style={styles.axisLabel}>Y-SLOPE</Text>
            <Text style={styles.axisValue}>{yAngle.toFixed(1)}°</Text>
          </View>
        </View>

        <View style={styles.barContainer}>
          <View style={[styles.barFill, { 
            width: `${Math.min((totalAngle / 45) * 100, 100)}%`,
            backgroundColor: isLevel ? '#00FF88' : '#FF3B30'
          }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050608', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 30 },
  screenTitle: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 5, opacity: 0.8 },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },
  
  resetBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#12141A', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#2A2E3D' },
  
  outerCircle: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE/2, backgroundColor: '#0A0C10', borderWidth: 4, borderColor: '#2A2E3D', justifyContent: 'center', alignItems: 'center', elevation: 20 },
  outerCircleLevel: { borderColor: '#00FF88', backgroundColor: '#0D1A14' },
  guideLineV: { position: 'absolute', width: 1.5, height: '100%', backgroundColor: '#2A2E3D' },
  guideLineH: { position: 'absolute', height: 1.5, width: '100%', backgroundColor: '#2A2E3D' },
  targetRingFocus: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#00FF88', borderStyle: 'dashed', opacity: 1 },
  targetRingOuter: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1.5, borderColor: '#444', borderStyle: 'dashed', opacity: 0.6 },
  
  bubble: { width: BUBBLE_SIZE, height: BUBBLE_SIZE, borderRadius: BUBBLE_SIZE/2, position: 'absolute', elevation: 15, shadowOpacity: 0.8, shadowRadius: 12 },
  bubbleGloss: { width: '30%', height: '30%', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 10, marginTop: '15%', marginLeft: '15%' },
  
  dataPanel: { width: '90%', alignItems: 'center' },
  axisRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  axisItem: { alignItems: 'center', width: '25%' },
  axisLabel: { fontSize: 10, color: '#444', fontWeight: '900', letterSpacing: 1.5 },
  axisValue: { fontSize: 18, color: '#888', fontWeight: '300', marginTop: 4 },
  
  mainAngleItem: { alignItems: 'center', width: '40%' },
  totalAngle: { fontSize: 56, fontWeight: '100', color: '#FFF' },
  angleLabel: { fontSize: 10, color: '#555', fontWeight: '900', letterSpacing: 2, marginTop: -5 },
  
  barContainer: { width: '100%', height: 4, backgroundColor: '#12141A', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%' }
});