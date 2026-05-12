import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft, Edit3 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function PlaceholderScreen({ route }: any) {
  const navigation = useNavigation();
  const title = route.params?.title || 'Screen';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Edit3 size={48} color="#10b981" />
        <Text style={styles.title}>{title} coming soon!</Text>
        <Text style={styles.subtitle}>This feature is currently under development and will be available in the next update.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f18' },
  header: {
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 24, textAlign: 'center' },
  subtitle: { color: '#94a3b8', fontSize: 16, marginTop: 12, textAlign: 'center', lineHeight: 24 },
});
