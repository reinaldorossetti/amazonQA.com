import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function ShopTopBar() {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <MaterialCommunityIcons name="menu" size={34} color="#202124" />
        <View style={styles.logoWrapper}>
          <Text style={styles.logoText}>amazon</Text>
          <View style={styles.smileRow}>
            <View style={styles.smileArc} />
            <MaterialCommunityIcons name="arrow-right-thin" size={18} color="#E7A900" style={styles.arrow} />
          </View>
        </View>
      </View>

      <View style={styles.locationSection}>
        <MaterialCommunityIcons name="map-marker-outline" size={34} color="#2A2A2A" />
        <Text style={styles.locationText}>Deliver to{`\n`}New York 10150</Text>
      </View>

      <View style={styles.notificationSection}>
        <MaterialCommunityIcons name="bell-outline" size={38} color="#222" />
        <Text style={styles.badge}>0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 170,
  },
  logoWrapper: {
    justifyContent: 'center',
  },
  logoText: {
    color: '#1F1F25',
    fontSize: 56 / 2,
    lineHeight: 56 / 2,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  smileRow: {
    marginTop: -3,
    marginLeft: 34,
    height: 12,
    width: 68,
    justifyContent: 'center',
  },
  smileArc: {
    position: 'absolute',
    left: 0,
    width: 56,
    height: 10,
    borderBottomWidth: 4,
    borderBottomColor: '#E7A900',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  arrow: {
    position: 'absolute',
    right: -2,
    bottom: -3,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 8,
  },
  locationText: {
    color: '#222',
    fontSize: 19 / 2,
    lineHeight: 24 / 2,
    fontWeight: '500',
  },
  notificationSection: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: 0,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E7A900',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '700',
    fontSize: 12,
    overflow: 'hidden',
  },
});
