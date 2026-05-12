import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { User, LogOut, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('bookings')
          .select(`*, court:courts(name, location)`)
          .eq('user_id', user.id)
          .order('booking_date', { ascending: false });
        
        setBookings(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.nameText}>{user?.user_metadata?.full_name || 'Player'}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          {loading ? (
            <ActivityIndicator color="#10b981" />
          ) : bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={24} color="#94a3b8" />
              <Text style={styles.emptyText}>No bookings yet</Text>
            </View>
          ) : (
            bookings.map((booking, idx) => (
              <View key={idx} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingCourt}>{booking.court?.name || 'Soccer Court'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <Text style={[styles.statusText, { color: booking.status === 'confirmed' ? '#10b981' : '#ef4444' }]}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bookingDate}>
                  <Calendar size={12} color="#94a3b8" /> {booking.booking_date} at {booking.start_time}
                </Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0d10' },
  header: { alignItems: 'center', padding: 40, backgroundColor: '#111827', borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#000', textTransform: 'uppercase' },
  nameText: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  emailText: { fontSize: 16, color: '#94a3b8' },
  content: { padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  emptyState: { alignItems: 'center', padding: 32, backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
  bookingCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingCourt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  bookingDate: { color: '#94a3b8', fontSize: 14, flexDirection: 'row', alignItems: 'center' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  signOutText: { color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
