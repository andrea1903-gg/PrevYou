import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function ProfiloScreen() {
  const [paziente, setPaziente] = useState<any>(null);
  const [totaleAttivita, setTotaleAttivita] = useState(0);
  const [attivitaCompletate, setAttivitaCompletate] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      caricaDati();
    }, [])
  );

  const caricaDati = async () => {
    const pazienteJson = await AsyncStorage.getItem('paziente');
    if (!pazienteJson) return;
    const p = JSON.parse(pazienteJson);
    setPaziente(p);

    const { count } = await supabase
      .from('protocol_activities')
      .select('*', { count: 'exact', head: true })
      .eq('intervention_types_id', 1)
      .not('giorni_prima', 'is', null);

    setTotaleAttivita(count || 0);

    const { data: compData } = await supabase
      .from('patient_activities')
      .select('activity_id, completata_at')
      .eq('patient_id', p.id)
      .eq('completata', true);

    if (compData && compData.length > 0) {
      const ids = compData.map((r: any) => r.activity_id);
      const { data: attData } = await supabase
        .from('protocol_activities')
        .select('titolo')
        .in('id', ids);

      const completateConData = (attData || []).map((a: any, i: number) => ({
        titolo: a.titolo,
        data: new Date(compData[i].completata_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }),
      }));

      setAttivitaCompletate(completateConData);
    } else {
      setAttivitaCompletate([]);
    }
  };

  const handleEsci = async () => {
  await AsyncStorage.removeItem('paziente');
  router.replace('/(tabs)');
};

  if (!paziente) return null;

  const nCompletate = attivitaCompletate.length;
  const inAttesa = totaleAttivita - nCompletate;
  const percentuale = totaleAttivita > 0 ? Math.round((nCompletate / totaleAttivita) * 100) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>SCHEDA PAZIENTE</Text>
        <Text style={styles.nome}>{paziente.Nome} {paziente.Cognome}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>INTERVENTO</Text>
          <Text style={styles.infoValore}>{paziente.tipo_intervento}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>DATA CHIRURGIA</Text>
          <Text style={styles.infoValore}>
            {new Date(paziente.data_intervento).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>CLINICA ASSEGNATA</Text>
          <Text style={styles.infoValore}>📍 Ospedale di Cuneo</Text>
        </View>
      </View>

      <View style={styles.riepilogoSection}>
        <Text style={styles.sectionTitle}>Riepilogo Attività</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.statBoxVerde]}>
            <Text style={styles.statNumero}>{nCompletate}</Text>
            <Text style={styles.statLabel}>Task Completati</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGrigio]}>
            <Text style={styles.statNumero}>{inAttesa}</Text>
            <Text style={styles.statLabel}>In Attesa</Text>
          </View>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>{percentuale}% Completato</Text>
        </View>
      </View>

      {attivitaCompletate.length > 0 && (
        <View style={styles.taskSection}>
          <Text style={styles.sectionTitle}>Attività Completate</Text>
          {attivitaCompletate.map((t, i) => (
            <View key={i} style={[styles.taskCard, styles.taskCardCompletato]}>
              <Text style={styles.taskCheckmark}>✓</Text>
              <View>
                <Text style={styles.taskTitoloCompletato}>{t.titolo}</Text>
                <Text style={styles.taskData}>Completato il {t.data}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.exitButton} onPress={handleEsci}>
        <Text style={styles.exitButtonText}>Esci</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60, marginBottom: 8 },
  label: { fontSize: 11, color: '#999', letterSpacing: 1, marginBottom: 4 },
  nome: { fontSize: 28, fontWeight: 'bold', color: '#1a3a5c' },
  infoSection: { backgroundColor: 'white', marginBottom: 8 },
  infoCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 11, color: '#999', letterSpacing: 1, marginBottom: 4 },
  infoValore: { fontSize: 16, color: '#333' },
  riepilogoSection: { backgroundColor: 'white', padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statBoxVerde: { backgroundColor: '#e8f5ee' },
  statBoxGrigio: { backgroundColor: '#f5f5f5' },
  statNumero: { fontSize: 32, fontWeight: 'bold', color: '#1a3a5c' },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  progressBadge: { backgroundColor: '#e8f5ee', borderRadius: 8, padding: 8, alignItems: 'center' },
  progressBadgeText: { color: '#2d8a5e', fontWeight: 'bold' },
  taskSection: { backgroundColor: 'white', padding: 16, marginBottom: 8 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#f9f9f9', marginBottom: 8 },
  taskCardCompletato: { backgroundColor: '#f0f8f4' },
  taskCheckmark: { fontSize: 18, color: '#2d8a5e', marginRight: 12 },
  taskTitoloCompletato: { fontSize: 14, color: '#666' },
  taskData: { fontSize: 12, color: '#999' },
  exitButton: { margin: 16, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  exitButtonText: { color: '#dc2626', fontWeight: 'bold', fontSize: 16 },
});