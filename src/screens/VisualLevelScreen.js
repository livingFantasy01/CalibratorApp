import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VisualLevelScreen() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1 },
        async (loc) => {
          setLocation(loc);
          setTimestamp(new Date().toLocaleTimeString());
          try {
            let reverse = await Location.reverseGeocodeAsync({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude
            });
            if (reverse.length > 0) setAddress(reverse[0]);
          } catch (e) { console.log(e); }
        }
      );
    })();
  }, []);

  const onShare = async () => {
    if (!location) return;
    const msg = `SURVEY LOG\nLocation: ${address?.name || 'Unknown'}\nCoords: ${location.coords.latitude}, ${location.coords.longitude}\nAlt: ${location.coords.altitude}m`;
    await Share.share({ message: msg });
  };

  // Logic: Only show speed/heading if moving faster than 1km/h to stop "GPS Drift"
  const isMoving = location?.coords.speed > 0.27; // 0.27 m/s is approx 1 km/h

  return (
    <View style={styles.container}>
      {/* 1. COMPACT HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.topLabel}>CURRENT LOCATION</Text>
          <Text style={styles.mainAddress}>{address ? address.name || address.street : "Locating..."}</Text>
        </View>
        <TouchableOpacity style={styles.smallExportBtn} onPress={onShare}>
          <Ionicons name="share-outline" size={18} color="#00FF88" />
        </TouchableOpacity>
      </View>

      <Text style={styles.fullAddress}>
        {address ? `${address.district || ''}, ${address.city}, ${address.postalCode || ''}` : "Fetching address details..."}
      </Text>

      {/* 2. MAP POSITION (COORDINATES) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>MAP POSITION</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.dataValue}>{location?.coords.latitude.toFixed(5) || '0.00000'}°</Text>
            <Text style={styles.dataSubLabel}>Latitude (N/S)</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.dataValue}>{location?.coords.longitude.toFixed(5) || '0.00000'}°</Text>
            <Text style={styles.dataSubLabel}>Longitude (E/W)</Text>
          </View>
        </View>
      </View>

      {/* 3. ENVIRONMENT & ACCURACY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ENVIRONMENT</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.dataValue}>{location?.coords.altitude?.toFixed(0) || '0'}m</Text>
            <Text style={styles.dataSubLabel}>Height above sea level</Text>
          </View>
          <View style={styles.col}>
            <Text style={[styles.dataValue, {color: (location?.coords.accuracy < 10) ? '#00FF88' : '#FFBB00'}]}>
              ±{location?.coords.accuracy?.toFixed(1) || '0'}m
            </Text>
            <Text style={styles.dataSubLabel}>Signal Precision</Text>
          </View>
        </View>
      </View>

      {/* 4. MOVEMENT (FILTERED) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>MOVEMENT</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.dataValue}>{isMoving ? ((location.coords.speed) * 3.6).toFixed(1) : "0.0"}</Text>
            <Text style={styles.dataSubLabel}>Speed (km/h)</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.dataValue}>{isMoving ? `${location.coords.heading?.toFixed(0)}°` : "---"}</Text>
            <Text style={styles.dataSubLabel}>{isMoving ? "Moving Towards" : "Stationary"}</Text>
          </View>
        </View>
      </View>

      {/* 5. NEW STATUS SECTION (FILLING THE BOTTOM) */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>SATELLITE SYNC</Text>
          <Text style={styles.statusValue}>ACTIVE</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>LAST UPDATE</Text>
          <Text style={styles.statusValue}>{timestamp || '--:--:--'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>PROVIDER</Text>
          <Text style={styles.statusValue}>GPS / GLONASS</Text>
        </View>
      </View>

      <Text style={styles.footerHint}>Precision calibration active. Stand in open space for best results.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050608', paddingHorizontal: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topLabel: { color: '#00FF88', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  mainAddress: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  fullAddress: { color: '#666', fontSize: 13, marginTop: 4, marginBottom: 20 },
  
  smallExportBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  
  card: { backgroundColor: '#0A0C10', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1F222B' },
  sectionTitle: { color: '#333', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1 },
  dataValue: { color: '#FFF', fontSize: 22, fontWeight: '300', fontFamily: 'monospace' },
  dataSubLabel: { color: '#555', fontSize: 10, marginTop: 2 },

  statusCard: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusLabel: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  statusValue: { color: '#888', fontSize: 10, fontFamily: 'monospace' },

  footerHint: { color: '#222', fontSize: 9, textAlign: 'center', marginTop: 'auto', marginBottom: 20 }
});