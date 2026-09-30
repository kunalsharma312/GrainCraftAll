import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { Address } from '../../redux/types';
import theme from '../../theme';
import PrimaryButton from './PrimaryButton';
import Text from '../ThemedText';
import TextField from './TextField';

interface AddressEntryFormProps {
  initialName?: string;
  onSave: (address: Address) => void;
}

type AddressFormValues = Omit<Address, 'id'>;

const emptyAddress: AddressFormValues = {
  fullName: '',
  phone: '',
  houseNumber: '',
  street: '',
  landmark: '',
  pincode: '',
  city: '',
  state: '',
};

export default function AddressEntryForm({ initialName = '', onSave }: AddressEntryFormProps) {
  const [values, setValues] = useState({ ...emptyAddress, fullName: initialName });

  const update = (key: keyof AddressFormValues, value: string) => {
    setValues(current => ({
      ...current,
      [key]: key === 'phone' || key === 'pincode' ? value.replace(/\D/g, '') : value,
    }));
  };

  const saveAddress = () => {
    if (!values.fullName.trim() || !values.houseNumber.trim() || !values.city.trim() || !values.state.trim()) {
      Alert.alert('Address details needed', 'Enter your name, flat/house number, city, and state.');
      return;
    }
    if (!/^\d{10}$/.test(values.phone)) {
      Alert.alert('Check phone number', 'Enter a valid 10-digit phone number.');
      return;
    }
    if (!/^\d{6}$/.test(values.pincode)) {
      Alert.alert('Check pincode', 'Enter a valid 6-digit Indian pincode.');
      return;
    }

    onSave({ ...values, id: `${Date.now()}` });
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Add a delivery address</Text>
      <TextField label="FULL NAME *" value={values.fullName} onChangeText={value => update('fullName', value)} autoCapitalize="words" />
      <TextField label="PHONE NUMBER * (10 DIGITS)" value={values.phone} onChangeText={value => update('phone', value)} keyboardType="phone-pad" maxLength={10} />
      <TextField label="FLAT / HOUSE / BUILDING *" value={values.houseNumber} onChangeText={value => update('houseNumber', value)} />
      <TextField label="STREET / AREA (OPTIONAL)" value={values.street} onChangeText={value => update('street', value)} />
      <TextField label="LANDMARK (OPTIONAL)" value={values.landmark} onChangeText={value => update('landmark', value)} />
      <TextField label="PINCODE * (6 DIGITS)" value={values.pincode} onChangeText={value => update('pincode', value)} keyboardType="number-pad" maxLength={6} />
      <TextField label="STATE *" value={values.state} onChangeText={value => update('state', value)} autoCapitalize="words" />
      <TextField label="CITY *" value={values.city} onChangeText={value => update('city', value)} autoCapitalize="words" />
      <PrimaryButton title="Save and use this address" onPress={saveAddress} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 14, padding: 12, borderRadius: theme.components.card.borderRadius, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  title: { fontSize: theme.typography.fontSize.bodyLarge, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, marginBottom: 12 },
});
