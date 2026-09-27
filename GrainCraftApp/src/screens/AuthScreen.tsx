import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { login } from '../redux/slices/authSlice';
import theme from '../theme';
import BrandLogo from '../components/BrandLogo';
import Text from '../components/ThemedText';
import AppScreen from '../components/ui/AppScreen';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SegmentedControl from '../components/ui/SegmentedControl';
import TextField from '../components/ui/TextField';

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
    <AppScreen contentStyle={styles.container}>
      <View style={styles.header}>
        <BrandLogo />
      </View>

      <AppCard variant="warm" style={styles.card}>
        <View style={styles.millBadge}>
          <Text style={styles.millBadgeText}>🌾 FRESH STONE-MILLED FLOUR ON-DEMAND</Text>
        </View>
        <Text style={styles.title}>Welcome to the Grainery</Text>
        <Text style={styles.desc}>Sign in to access your bespoke grain vault, track live millstones, and receive unheated flour within hours of grinding.</Text>
        <Text style={styles.statusText}>🟢 Bedstone Mill #04 Active • 82°F Cool-Crush</Text>

        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: 'otp', label: '📱 Mobile OTP' },
            { value: 'email', label: '✉️ Email & Password' },
          ]}
        />

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
            <TextField label="BAKER'S EMAIL ADDRESS" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextField label="HEARTH PASSWORD" secureTextEntry value={password} onChangeText={setPassword} />
          </View>
        )}

        <PrimaryButton title="🔒 Enter Grainery & Unlock Vault →" onPress={handleLogin} style={styles.actionBtn} />
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  header: { marginBottom: 20 },
  card: { padding: 20 },
  millBadge: { backgroundColor: theme.colors.surfaceTint, padding: 6, borderRadius: theme.components.badge.borderRadius, alignSelf: 'flex-start', marginBottom: 10 },
  millBadgeText: { fontSize: theme.typography.fontSize.label, color: theme.colors.primary, fontWeight: theme.typography.fontWeight.bold },
  title: { fontSize: theme.typography.fontSize.display, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 8 },
  desc: { fontSize: theme.typography.fontSize.bodySmall, color: theme.colors.detail, marginBottom: 12 },
  statusText: { fontSize: theme.typography.fontSize.small, color: theme.colors.success, marginBottom: 20, fontWeight: theme.typography.fontWeight.medium },
  label: { fontSize: theme.typography.fontSize.label, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.textMuted, marginBottom: 6 },
  inputBox: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong, borderRadius: theme.components.input.borderRadius, padding: 12, alignItems: 'center', marginBottom: 15 },
  phoneInput: { flex: 1, fontSize: theme.typography.fontSize.subtitle, color: theme.colors.text },
  verificationHeading: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  smsStatus: { color: theme.colors.primary, fontSize: theme.typography.fontSize.small },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: { backgroundColor: theme.colors.surface, borderWidth: theme.components.input.borderWidth, borderColor: theme.colors.borderStrong, padding: 12, borderRadius: theme.components.input.borderRadius, width: 42, alignItems: 'center' },
  otpDigit: { fontSize: theme.typography.fontSize.subtitle, fontWeight: theme.typography.fontWeight.bold },
  actionBtn: { marginTop: 10 },
});
