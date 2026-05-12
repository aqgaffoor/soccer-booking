import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard } from 'lucide-react-native';

export default function CourtDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { courtData } = route.params || {};

  const [selectedDate, setSelectedDate] = useState('2026-05-15');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        court_id: courtData.id,
        booking_date: selectedDate,
        start_time: selectedTime,
        duration: 60,
        total_price: courtData.hourly_rate_zar || 350,
        status: 'confirmed'
      }]);

      if (error) throw error;
      Alert.alert('Success', 'Court booked successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Profile') }
      ]);
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!courtData) return null;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.heroPlaceholder}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.heroText}>{courtData.name}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{courtData.name}</Text>
            <Text style={styles.location}><MapPin size={14} color="#94a3b8" /> {courtData.location}</Text>
          </View>

          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesRow}>
            {['2026-05-15', '2026-05-16', '2026-05-17', '2026-05-18'].map(date => (
              <TouchableOpacity 
                key={date} 
                style={[styles.dateCard, selectedDate === date && styles.dateCardActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateText, selectedDate === date && styles.dateTextActive]}>
                  {date.split('-')[2]} May
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timesGrid}>
            {['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => (
              <TouchableOpacity 
                key={time} 
                style={[styles.timeCard, selectedTime === time && styles.timeCardActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>R {courtData.hourly_rate_zar || 350}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutBtn}
          onPress={handleBooking}
          disabled={loading}
        >
          <Text style={styles.checkoutBtnText}>{loading ? 'Confirming...' : 'Confirm Booking'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0d10' },
  heroPlaceholder: { height: 250, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  heroText: { color: '#94a3b8', fontSize: 20, fontWeight: '700' },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  location: { fontSize: 16, color: '#94a3b8' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 16, marginTop: 8 },
  datesRow: { flexDirection: 'row', marginBottom: 24 },
  dateCard: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#1e293b', borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: '#334155' },
  dateCardActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' },
  dateText: { color: '#94a3b8', fontWeight: '600' },
  dateTextActive: { color: '#10b981' },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeCard: { width: '30%', paddingVertical: 12, backgroundColor: '#1e293b', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  timeCardActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  timeText: { color: '#fff', fontWeight: '600' },
  timeTextActive: { color: '#000' },
  footer: { padding: 20, backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: '#1f2937', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceInfo: { flex: 1 },
  priceLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  priceValue: { color: '#fff', fontSize: 20, fontWeight: '700' },
  checkoutBtn: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  checkoutBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
