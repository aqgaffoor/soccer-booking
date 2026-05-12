import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { MapPin, Star, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

  const renderCourt = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('CourtDetails', { courtId: item.id, courtData: item })}
    >
      {/* Since we don't have local assets in Expo yet, we use a placeholder or handle the image_url logic */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>⚽ {item.name}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.courtName}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>{item.rating || '4.8'}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <MapPin size={14} color="#94a3b8" />
          <Text style={styles.locationText}>{item.location || item.location_area}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>R {item.hourly_rate_zar || item.priceNum || 350} /hr</Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('CourtDetails', { courtId: item.id, courtData: item })}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Find courts near you</Text>
        <View style={styles.searchBar}>
          <Search size={20} color="#94a3b8" />
          <Text style={styles.searchText}>Search location or court...</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={courts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCourt}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d10',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
  },
  searchText: {
    color: '#94a3b8',
    marginLeft: 10,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  bookButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
});
