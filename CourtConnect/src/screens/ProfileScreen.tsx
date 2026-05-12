import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { User, LogOut, Settings, CreditCard, Activity, HelpCircle, ChevronRight, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  const SettingsRow = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      <View style={styles.settingsIconWrap}>
        <Icon color="#0f172a" size={20} />
      </View>
      <View style={styles.settingsTextWrap}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight color="#94a3b8" size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Top Header - Blue */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>PROFILE</Text>
            <TouchableOpacity><Bell color="#fff" size={24} /></TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 'AQ'}
              </Text>
            </View>
            <View style={styles.nameWrap}>
              <Text style={styles.nameText}>{user?.user_metadata?.full_name || 'Player'}</Text>
              <Text style={styles.locationText}>Plays in Durban, South Africa</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{bookings.length}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.premiumBtn}>
              <Text style={styles.premiumBtnText}>Go Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.content}>
          
          {/* Player Level Card */}
          <LinearGradient
            colors={['#0f172a', '#1e293b']}
            style={styles.levelCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.levelTitle}>Level 0.50</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level reliability: 15% LOW</Text>
            </View>
            <TouchableOpacity style={styles.levelArrow}>
              <ChevronRight color="#fff" size={24} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Settings Section */}
          <Text style={styles.sectionTitle}>Your account</Text>
          <View style={styles.settingsCard}>
            <SettingsRow 
              icon={User} 
              title="Edit profile" 
              subtitle="Name, email, phone, location, gender" 
            />
            <View style={styles.rowDivider} />
            <SettingsRow 
              icon={Activity} 
              title="Your activity" 
              subtitle="Matches, classes, competitions" 
            />
            <View style={styles.rowDivider} />
            <SettingsRow 
              icon={CreditCard} 
              title="Your payments" 
              subtitle="Payment methods, transactions" 
            />
            <View style={styles.rowDivider} />
            <SettingsRow 
              icon={Settings} 
              title="Settings" 
              subtitle="Configure privacy, notifications" 
            />
          </View>

          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingsRow 
              icon={HelpCircle} 
              title="Help" 
            />
            <View style={styles.rowDivider} />
            <SettingsRow 
              icon={LogOut} 
              title="Sign Out" 
              onPress={handleSignOut}
            />
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray background to match inspiration
  },
  header: {
    backgroundColor: '#2563eb', // Blue top
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  nameWrap: {
    flex: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#cbd5e1',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15,
  },
  premiumBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  premiumBtnText: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 15,
  },
  content: {
    padding: 20,
  },
  levelCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ccff00', // Neon green
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelBadgeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  levelArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIconWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsTextWrap: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  settingsSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72, // Align with text
  },
});
