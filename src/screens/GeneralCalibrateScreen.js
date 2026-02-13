import * as Location from 'expo-location';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const DIAL_SIZE = width * 0.85;

export default function GeneralCalibrateScreen() {
  const [displayHeading, setDisplayHeading] = useState(0);
  const [gpsActive, setGpsActive] = useState(false);
  const [declination, setDeclination] = useState(0); // The "True North" correction
  const [accData, setAccData] = useState({ x: 0, y: 0 });
  const lastHeading = useRef(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setGpsActive(true);
        // Get coordinates once to set the regional correction
        let loc = await Location.getCurrentPositionAsync({});
        
        /* CALCULATING TRUE NORTH:
          Magnetic declination changes based on location. 
          For most of India, it is ~1.3°. For NYC, it's ~12°.
          This regional fix is why the pro apps are more accurate.
        */
        const lat = loc.coords.latitude;
        // Simple approximation for regional declination
        const regionalFix = lat > 0 ? 1.3 : -1.3; 
        setDeclination(regionalFix);
      }
    })();

    Magnetometer.setUpdateInterval(16);
    const magSub = Magnetometer.addListener((data) => {
      let raw = Math.atan2(-data.x, data.y) * (180 / Math.PI);
      let heading = (raw + 360) % 360;

      // APPLY GPS CORRECTION HERE
      let correctedHeading = (heading + declination + 360) % 360;

      let diff = correctedHeading - lastHeading.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const alpha = 0.08;
      const finalHeading = (lastHeading.current + diff * alpha + 360) % 360;
      lastHeading.current = finalHeading;
      setDisplayHeading(finalHeading);
    });

    Accelerometer.setUpdateInterval(30);
    const accSub = Accelerometer.addListener(data => {
      setAccData({ x: data.x, y: data.y });
    });

    return () => {
      magSub.remove();
      accSub.remove();
    };
  }, [declination]); // Re-run if declination is found

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>COMPASS</Text>
        {gpsActive && (
          <View style={styles.gpsBadge}>
            <Text style={styles.gpsText}>GPS ACTIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.compassWrapper}>
        <View style={styles.needle} />
        
        <View style={[styles.dial, { transform: [{ rotate: `-${displayHeading.toFixed(1)}deg` }] }]}>
          {['N', 'E', 'S', 'W'].map((label, i) => (
            <View key={label} style={[styles.markerWrap, { transform: [{ rotate: `${i * 90}deg` }] }]}>
              <Text style={[styles.cardinalText, label === 'N' && { color: '#FF3B30' }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.centerCircle}>
          <Text style={styles.headingValue}>{Math.round(displayHeading)}°</Text>
          
          <View style={styles.levelerRing}>
            <View style={[styles.levelerDot, {
              transform: [
                { translateX: accData.x * -25 }, 
                { translateY: accData.y * 25 }
              ],
              backgroundColor: (Math.abs(accData.x) < 0.05 && Math.abs(accData.y) < 0.05) ? '#00FF88' : '#FFBB00'
            }]} />
          </View>
        </View>
      </View>

      <View style={styles.footer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050608', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 100 },
  header: { alignItems: 'center' },
  screenTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 8 },
  gpsBadge: { marginTop: 8, backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#00FF88' },
  gpsText: { color: '#00FF88', fontSize: 10, fontWeight: '900' },
  compassWrapper: { width: DIAL_SIZE, height: DIAL_SIZE, justifyContent: 'center', alignItems: 'center' },
  needle: { position: 'absolute', top: -10, width: 2, height: 35, backgroundColor: '#00FF88', zIndex: 10 },
  dial: { width: '100%', height: '100%', borderRadius: DIAL_SIZE/2, backgroundColor: '#0A0C10', borderWidth: 1, borderColor: '#1F222B' },
  markerWrap: { position: 'absolute', top: 20, left: '40%', height: '100%', alignItems: 'center', width: 60 },
  cardinalText: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  centerCircle: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#050608', justifyContent: 'center', alignItems: 'center' },
  headingValue: { color: '#FFF', fontSize: 68, fontWeight: '100' },
  levelerRing: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#222', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  levelerDot: { width: 8, height: 8, borderRadius: 4 },
  footer: { height: 40 }
});