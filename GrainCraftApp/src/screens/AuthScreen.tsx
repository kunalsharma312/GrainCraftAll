import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { login } from '../redux/slices/authSlice';
import theme from '../theme';
import BrandLogo from '../components/BrandLogo';
import Text from '../components/ThemedText';

export default function AuthScreen() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'otp' | 'email'>('otp');
  const [mobile, setMobile] = useState('5554182902');
  const [otp] = useState(['7', '3', '9', '•', '•', '•']);
  const [email, setEmail] = useState('baker@hearthandcrust.com');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = () => {
    dispatch(login({ addresses: [{ id: '1', address: 'Brooklyn Hub, NY' }] }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <BrandLogo />
      </View>

      <View style={styles.card}>
        <View style={styles.millBadge}>
          <Text style={styles.millBadgeText}>🌾 FRESH STONE-MILLED FLOUR ON-DEMAND</Text>
        </View>
        <Text style={styles.title}>Welcome to the Grainery</Text>
        <Text style={styles.desc}>Sign in to access your bespoke grain vault, track live millstones, and receive unheated flour within hours of grinding.</Text>
        <Text style={styles.statusText}>🟢 Bedstone Mill #04 Active • 82°F Cool-Crush</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'otp' && styles.activeTab]} onPress={() => setTab('otp')}>
            <Text style={[styles.tabText, tab === 'otp' && styles.activeTabText]}>📱 Mobile OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'email' && styles.activeTab]} onPress={() => setTab('email')}>
            <Text style={[styles.tabText, tab === 'email' && styles.activeTabText]}>✉️ Email & Password</Text>
          </TouchableOpacity>
        </View>

        {tab === 'otp' ? (
          <View>
            <Text style={styles.label}>ARTISAN MOBILE NUMBER</Text>
            <View style={styles.inputBox}>
              <Text style={{ fontWeight: theme.typography.fontWeight.bold }}>🇺🇸 +1 </Text>
              <TextInput style={styles.phoneInput} value={mobile} onChangeText={setMobile} />
              <Text style={{ color: theme.colors.successBright }}>✔</Text>
            </View>

            <View style={styles.verificationHeading}>
              <Text style={styles.label}>VERIFICATION CODE</Text>
              <Text style={styles.smsStatus}>SMS Dispatched</Text>
            </View>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpBox}>
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>BAKER'S EMAIL ADDRESS</Text>
            <TextInput style={styles.formInput} value={email} onChangeText={setEmail} />
            <Text style={styles.label}>HEARTH PASSWORD</Text>
            <TextInput style={styles.formInput} secureTextEntry value={password} onChangeText={setPassword} />
          </View>
        )}

        <TouchableOpacity style={styles.actionBtn} onPress={handleLogin}>
          <Text style={styles.actionBtnText}>🔒 Enter Grainery & Unlock Vault →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.colors.background, padding: 20, justifyContent: 'center' },
  header: { marginBottom: 20 },
  card: { backgroundColor: theme.colors.surfaceWarm, borderRadius: theme.components.card.borderRadius, padding: 20, borderWidth: theme.components.card.borderWidth, borderColor: theme.colors.border },
  millBadge: { backgroundColor: theme.colors.surfaceTint, padding: 6, borderRadius: theme.components.badge.borderRadius, alignSelf: 'flex-start', marginBottom: 10 },
  millBadgeText: { fontSize: theme.typography.fontSize.label, color: theme.colors.primary, fontWeight: theme.typography.fontWeight.bold },
  title: { fontSize: theme.typography.fontSize.display, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 8 },
  desc: { fontSize: theme.typography.fontSize.bodySmall, color: theme.colors.detail, marginBottom: 12 },
  statusText: { fontSize: theme.typography.fontSize.small, color: theme.colors.success, marginBottom: 20, fontWeight: theme.typography.fontWeight.medium },
  tabRow: { flexDirection: 'row', backgroundColor: theme.colors.border, borderRadius: theme.components.button.borderRadius, padding: 3, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: theme.colors.surfaceWarm, shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: theme.typography.fontSize.bodySmall, color: theme.colors.textSecondary, fontWeight: theme.typography.fontWeight.medium },
  activeTabText: { color: theme.colors.text },
  label: { fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textMuted, marginBottom: 6 },
  inputBox: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong, borderRadius: theme.components.input.borderRadius, padding: 12, alignItems: 'center', marginBottom: 15 },
  phoneInput: { flex: 1, fontSize: theme.typography.fontSize.subtitle, color: theme.colors.text },
  formInput: { backgroundColor: theme.colors.surface, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong, borderRadius: theme.components.input.borderRadius, padding: 12, marginBottom: 15, color: theme.colors.text },
  verificationHeading: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  smsStatus: { color: theme.colors.primary, fontSize: theme.typography.fontSize.small },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: { backgroundColor: theme.colors.surface, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong, padding: 12, borderRadius: theme.components.input.borderRadius, width: 42, alignItems: 'center' },
  otpDigit: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold },
  actionBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.components.button.borderRadius, alignItems: 'center', marginTop: 10 },
  actionBtnText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.bodyLarge },
});
