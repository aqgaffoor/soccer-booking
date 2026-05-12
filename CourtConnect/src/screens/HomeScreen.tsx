import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Platform, ImageBackground } from 'react-native';
import { supabase } from '../lib/supabase';
import { MapPin, Search, Bell, Menu, Calendar, Trophy, Users, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

// Vibrant Soccer Action Buttons
const ACTION_BUTTONS = [
  { id: 'book', icon: Calendar, label: 'Book a Court' },
  { id: 'compete', icon: Trophy, label: 'Competitions' },
  { id: 'match', icon: Users, label: 'Find a Match' },
];

// Stock images for courts if none exist in the database
const STOCK_COURT_IMAGES = [
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop', // Aerial pitch
  'https://images.unsplash.com/photo-1551280857-2b9ebf241ac4?q=80&w=1000&auto=format&fit=crop', // Night lights
  'https://images.unsplash.com/photo-1524015368236-fb5be1bce6dc?q=80&w=1000&auto=format&fit=crop', // Sunset pitch
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
    const imageUrl = STOCK_COURT_IMAGES[index % STOCK_COURT_IMAGES.length];

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CourtDetails', { courtId: item.id, courtData: item })}
      >
        <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>⭐ {item.rating || '4.8'}</Text>
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.95)']} // Dark Carbon gradient
            style={styles.cardOverlay}
          >
            <Text style={styles.courtName}>{item.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#10b981" />
              <Text style={styles.locationText}>{item.location || item.location_area}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>R {item.hourly_rate_zar || item.priceNum || 350}</Text>
              <Text style={styles.priceLabel}>/ hour</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header - Dark Carbon with Emerald Accent */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COURT<Text style={{ color: '#10b981' }}>CONNECT</Text></Text>
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
                <TouchableOpacity 
                  key={action.id} 
                  style={styles.actionCard}
                  onPress={() => {
                    if (action.id === 'compete') navigation.navigate('Competitions');
                    if (action.id === 'match') navigation.navigate('Matchmaking');
                  }}
                >
                  <View style={styles.actionIconWrap}>
                    <Icon color="#fff" size={24} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pitches Near You</Text>
          <TouchableOpacity style={styles.exploreBtn}>
            <Text style={styles.exploreText}>View Map</Text>
            <ChevronRight size={16} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Search Bar - Sleek Carbon */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#64748b" />
            <Text style={styles.searchText}>Search by location or pitch name...</Text>
          </View>
        </View>

        {/* Courts List */}
        {loading ? (
          <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />
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
    backgroundColor: '#0a0f18', // Deep space carbon
  },
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    fontStyle: 'italic',
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
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    width: 140,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10b981', // Pitch Emerald
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionLabel: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchText: {
    color: '#64748b',
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  badgeWrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#fbbf24', // Gold star
    fontSize: 13,
    fontWeight: '800',
  },
  cardOverlay: {
    padding: 20,
    paddingTop: 40,
  },
  courtName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10b981',
  },
  priceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 4,
    fontWeight: '600',
  },
});
