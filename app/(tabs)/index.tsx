import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function HomeScreen() {
  const [paziente, setPaziente] = useState<any>(null);
  const [attivita, setAttivita] = useState<any[]>([]);
  const [completate, setCompletate] = useState<Set<number>>(new Set());
  const [totaleAttivita, setTotaleAttivita] = useState(0);

  useFocusEffect(
    useCallback(() => {
      caricaDati();
    }, [])
  );

  const caricaDati = async () => {
    const pazienteJson = await AsyncStorage.getItem('paziente');
    if (!pazienteJson) { router.replace('/'); return; }
    const p = JSON.parse(pazienteJson);
    setPaziente(p);

    const { data, count } = await supabase
      .from('protocol_activities')
      .select('*', { count: 'exact' })
      .eq('intervention_types_id', 1)
      .not('giorni_prima', 'is', null)
      .order('giorni_prima', { ascending: false });

    setTotaleAttivita(count || 0);

    const dataIntervento = new Date(p.data_intervento);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const attivitaConData = (data || [])
      .map(a => {
        const dataAttivita = new Date(dataIntervento);
        dataAttivita.setDate(dataIntervento.getDate() - a.giorni_prima);
        dataAttivita.setHours(0, 0, 0, 0);
        return { ...a, dataAttivita };
      })
      .filter(a => a.dataAttivita >= oggi)
      .sort((a, b) => a.dataAttivita.getTime() - b.dataAttivita.getTime())
      .slice(0, 3);

    setAttivita(attivitaConData);

    const { data: compData } = await supabase
      .from('patient_activities')
      .select('activity_id')
      .eq('patient_id', p.id)
      .eq('completata', true);

    setCompletate(new Set((compData || []).map((r: any) => r.activity_id)));
  };

  const toggleCompletata = async (activityId: number, dataAttivita: Date) => {
    if (!paziente) return;
    const oggi = new Date();
    oggi.setHours(23, 59, 59, 0);
    if (dataAttivita > oggi) return;

    const eraCompletata = completate.has(activityId);
    setCompletate(prev => {
      const nuove = new Set(prev);
      if (nuove.has(activityId)) nuove.delete(activityId);
      else nuove.add(activityId);
      return nuove;
    });

    if (eraCompletata) {
      await supabase.from('patient_activities').delete()
        .eq('patient_id', paziente.id).eq('activity_id', activityId);
    } else {
      await supabase.from('patient_activities').upsert({
        patient_id: paziente.id,
        activity_id: activityId,
        completata: true,
        completata_at: new Date().toISOString(),
      });
    }
  };

  if (!paziente) return null;

  const giorniMancanti = Math.ceil(
    (new Date(paziente.data_intervento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const nCompletate = completate.size;
  const percentuale = totaleAttivita > 0 ? Math.round((nCompletate / totaleAttivita) * 100) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerName}>Buongiorno, {paziente.Nome}</Text>
        <View style={styles.headerRight}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Intervento tra {giorniMancanti} giorni</Text>
          </View>
          <TouchableOpacity style={styles.profiloButton} onPress={() => router.push('/(tabs)/profilo')}>
            <Text style={styles.profiloIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.interventoCard}>
        <Text style={styles.interventoLabel}>PROSSIMO INTERVENTO</Text>
        <Text style={styles.interventoTitolo}>{paziente.tipo_intervento}</Text>
        <Text style={styles.interventoData}>
          {new Date(paziente.data_intervento).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>Stato della preparazione</Text>
            <Text style={styles.progressCount}>{nCompletate} / {totaleAttivita} attività</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentuale}%` }]} />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Prossime Attività</Text>

      {attivita.length === 0 ? (
        <View style={styles.taskCard}>
          <Text style={styles.taskDescrizione}>Nessuna attività imminente 🎉</Text>
        </View>
      ) : (
        attivita.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.taskCard, item.dataAttivita > new Date() && styles.taskCardBloccata]}
            onPress={() => toggleCompletata(item.id, item.dataAttivita)}
          >
            <View style={styles.taskContent}>
              <View style={styles.taskHeader}>
                <Text style={[styles.taskTitolo, completate.has(item.id) && styles.taskTitoloCompletato]}>
                  {item.titolo}
                </Text>
                <View style={[styles.badge, item.priorità === 'URGENTE' ? styles.badgeUrgente : styles.badgeImportante]}>
                  <Text style={styles.badgeText}>{item.priorità}</Text>
                </View>
              </View>
              <Text style={styles.taskData}>
                📅 {item.dataAttivita.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                {item.dataAttivita > new Date() ? ' 🔒' : ''}
              </Text>
              <Text style={styles.taskDescrizione}>{item.descrizione}</Text>
            </View>
            <View style={[styles.checkbox, completate.has(item.id) && styles.checkboxCompletato]}>
              {completate.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'white' },
  headerName: { fontSize: 18, fontWeight: 'bold', color: '#1a3a5c' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBadge: { backgroundColor: '#1a3a5c', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  headerBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  profiloButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a3a5c', alignItems: 'center', justifyContent: 'center' },
  profiloIcon: { fontSize: 18 },
  interventoCard: { backgroundColor: '#1a3a5c', margin: 16, borderRadius: 16, padding: 20 },
  interventoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1, marginBottom: 8 },
  interventoTitolo: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  interventoData: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 },
  progressContainer: { marginTop: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  progressCount: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: '#2d8a5e', borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a3a5c', paddingHorizontal: 16, paddingVertical: 8 },
  taskCard: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  taskCardBloccata: { opacity: 0.5 },
  taskContent: { flex: 1 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  taskTitolo: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', flex: 1 },
  taskTitoloCompletato: { textDecorationLine: 'line-through', color: '#999' },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeUrgente: { backgroundColor: '#fff3e0' },
  badgeImportante: { backgroundColor: '#e8f5ee' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  taskData: { fontSize: 12, color: '#2d8a5e', marginBottom: 4 },
  taskDescrizione: { fontSize: 13, color: '#666' },
  checkboxCompletato: { backgroundColor: '#2d8a5e', borderColor: '#2d8a5e' },
  checkmark: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#ddd', borderRadius: 4, marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
});