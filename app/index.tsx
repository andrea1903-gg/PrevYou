import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

export default function LoginScreen() {
  const [codice, setCodice] = useState('');
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  const handleAccedi = async () => {
    if (codice.length === 0) return;
    
    setLoading(true);
    setErrore('');

    const { data, error } = await supabase
      .from('Patients')
      .select('*')
      .eq('codice_accesso', codice.toUpperCase())
      .single();

    setLoading(false);

    if (error || !data) {
      setErrore('Codice non valido. Controlla e riprova.');
      return;
    }

    await AsyncStorage.setItem('paziente', JSON.stringify(data));
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>+</Text>
          </View>
          <Text style={styles.logoText}>PrevYou+</Text>
          <Text style={styles.logoSubtitle}>Il tuo compagno di recupero</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accesso Paziente</Text>
          <Text style={styles.cardLabel}>INSERISCI IL CODICE RICEVUTO DALLA CLINICA</Text>
          <TextInput
            style={styles.input}
            placeholder="Es. CUN-482"
            placeholderTextColor="#999"
            value={codice}
            onChangeText={setCodice}
            autoCapitalize="characters"
          />
          {errore ? <Text style={styles.errore}>{errore}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleAccedi} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Accedi</Text>}
          </TouchableOpacity>
          <Text style={styles.footerText}>Riceverai il codice dalla tua struttura sanitaria</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#e8f5ee', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, backgroundColor: '#1a3a5c', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoIcon: { fontSize: 40, color: 'white', fontWeight: 'bold' },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#1a3a5c' },
  logoSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 16 },
  cardLabel: { fontSize: 11, color: '#666', marginBottom: 8, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 8, color: '#333' },
  errore: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  button: { backgroundColor: '#1a3a5c', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footerText: { fontSize: 12, color: '#999', textAlign: 'center' },
});