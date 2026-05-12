import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { Users, Star, ArrowLeft, UserPlus, Shield } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MatchmakingScreen() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch other users to matchmake
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .order('rating', { ascending: false });
      
      if (data) setPlayers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlayer = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{item.full_name?.substring(0, 2).toUpperCase() || 'P'}</Text>
        </View>
        <View style={styles.infoWrap}>
          <Text style={styles.playerName}>{item.full_name || 'Player'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Star size={12} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.statText}>{item.rating || '5.0'}</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Shield size={12} color="#10b981" />
              <Text style={[styles.statText, { color: '#10b981' }]}>Lvl {item.level || '1.0'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.followBtn}>
          <UserPlus size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Matches Played: <Text style={{color: '#fff', fontWeight: '700'}}>{item.matches_played || 0}</Text></Text>
        <Text style={styles.footerText}>Position: <Text style={{color: '#fff', fontWeight: '700'}}>{item.preferred_position || 'Any'}</Text></Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FIND A MATCH</Text>
        <View style={{ width: 24 }} />
      </View>

      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.banner}>
        <Users size={32} color="#10b981" />
        <View style={styles.bannerTextWrap}>
          <Text style={styles.bannerTitle}>Matchmaking</Text>
          <Text style={styles.bannerSub}>Find players near your skill level</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f18',
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  bannerTextWrap: {
    marginLeft: 16,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  bannerSub: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  infoWrap: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    gap: 4,
  },
  statText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  followBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
