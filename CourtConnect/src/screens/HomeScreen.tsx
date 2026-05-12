import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView, Platform, Dimensions } from 'react-native';
import { supabase } from '../lib/supabase';
import { MapPin, Search, Bell, Menu, Calendar, BookOpen, Trophy, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ACTION_BUTTONS = [
  { id: 'book', icon: Calendar, label: 'Book a court' },
  { id: 'learn', icon: BookOpen, label: 'Learn' },
  { id: 'compete', icon: Trophy, label: 'Compete' },
  { id: 'match', icon: Users, label: 'Find a match' },
];

export default function HomeScreen() {
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase.from('courts').select('*');
      if (data) {
        setCourts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourt = ({ item, index }: { item: any, index: number }) => {
    // Generate a beautiful dark gradient based on index if no image exists
    const colors = [
      ['#1e3a8a', '#172554'], // Blue
      ['#14532d', '#052e16'], // Green
      ['#581c87', '#3b0764'], // Purple
    ];
    const gradient = colors[index % colors.length];

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CourtDetails', { courtId: item.id, courtData: item })}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imagePlaceholder}
        >
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>⭐ {item.rating || '4.8'}</Text>
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.cardOverlay}
          >
            <Text style={styles.courtName}>{item.name}</Text>
            <Text style={styles.locationText}>{item.location || item.location_area}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>R {item.hourly_rate_zar || item.priceNum || 350}</Text>
              <Text style={styles.priceLabel}>/ hour</Text>
            </View>
          </LinearGradient>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header - Blue */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COURTCONNECT</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}><Bell color="#fff" size={24} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Menu color="#fff" size={24} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Quick Actions Row */}
        <View style={styles.actionsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsContainer}>
            {ACTION_BUTTONS.map((action) => {
              const Icon = action.icon;
              return (
                <View key={action.id} style={styles.actionItem}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon color="#000" size={28} />
                  </TouchableOpacity>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Courts near you</Text>
          <TouchableOpacity>
            <Text style={styles.exploreText}>Explore more</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar - Stylized as an inset pill */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94a3b8" />
            <Text style={styles.searchText}>Search by location or name...</Text>
          </View>
        </View>

        {/* Courts List */}
        {loading ? (
          <ActivityIndicator color="#ccff00" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={courts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCourt}
            scrollEnabled={false} // Since we are inside a ScrollView
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Changed to light background to match inspiration
  },
  header: {
    backgroundColor: '#2563eb', // Vibrant blue
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  actionsWrapper: {
    paddingVertical: 24,
    backgroundColor: '#ffffff',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  actionItem: {
    alignItems: 'center',
    width: 72,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ccff00', // Neon green/yellow
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  exploreText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 16,
  },
  searchText: {
    color: '#64748b',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  badgeWrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40, // Fade gradient start
  },
  courtName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ccff00',
  },
  priceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 4,
    fontWeight: '500',
  },
});
