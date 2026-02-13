import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const openPrivacyPolicy = () => {
    // Replace this URL with your actual privacy policy link later
    Linking.openURL('https://your-website.com/privacy-policy');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SETTINGS</Text>
      
      <View style={styles.section}>
        <TouchableOpacity style={styles.item} onPress={openPrivacyPolicy}>
          <View style={styles.itemLeft}>
            <Ionicons name="document-text-outline" size={20} color="#00FF88" />
            <Text style={styles.itemText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="information-circle-outline" size={20} color="#555" />
            <Text style={styles.itemText}>Version 1.0.0</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footerText}>COM.PLAY.CALIBRATORAPP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050608', paddingHorizontal: 20, paddingTop: 80 },
  title: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 5, marginBottom: 30, textAlign: 'center' },
  section: { backgroundColor: '#0A0C10', borderRadius: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#1F222B' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemText: { color: '#EEE', fontSize: 14, marginLeft: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#1F222B', marginHorizontal: 15 },
  footerText: { color: '#222', fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 40, letterSpacing: 2 }
});