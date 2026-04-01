import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function ChecklistScreen() {
  const [attivita, setAttivita] = useState<any[]>([]);
  const [completate, setCompletate] = useState<Set<number>>(new Set());
  const [pazienteId, setPazienteId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      caricaDati();
    }, [])
  );

  const caricaDati = async () => {
    const pazienteJson = await AsyncStorage.getItem('paziente');
    if (!pazienteJson) return;
    const p = JSON.parse(pazienteJson);
    setPazienteId(p.id);

    const { data: attData } = await supabase
      .from('protocol_activities')
      .select('*')
      .eq('intervention_types_id', 1)
      .not('giorni_prima', 'is', null)
      .order('giorni_prima', { ascending: false });

    const dataInt = new Date(p.data_intervento);
    const attivitaConData = (attData || []).map(a => {
      const dataAttivita = new Date(dataInt);
      dataAttivita.setDate(dataInt.getDate() - a.giorni_prima);
      return { ...a, dataAttivita };
    }).sort((a, b) => a.dataAttivita.getTime() - b.dataAttivita.getTime());

    setAttivita(attivitaConData);

    const { data: compData } = await supabase
      .from('patient_activities')
      .select('activity_id')
      .eq('patient_id', p.id)
      .eq('completata', true);

    const ids = new Set<number>((compData || []).map((r: any) => r.activity_id));
    setCompletate(ids);
  };

  const toggleCompletata = async (activityId: number, dataAttivita: Date) => {
    const oggi = new Date();
    oggi.setHours(23, 59, 59, 0);
    if (dataAttivita > oggi) return;
    if (!pazienteId) return;

    const eraCompletata = completate.has(activityId);

    setCompletate(prev => {
      const nuove = new Set(prev);
      if (nuove.has(activityId)) nuove.delete(activityId);
      else nuove.add(activityId);
      return nuove;
    });

    if (eraCompletata) {
      await supabase
        .from('patient_activities')
        .delete()
        .eq('patient_id', pazienteId)
        .eq('activity_id', activityId);
    } else {
      await supabase
        .from('patient_activities')
        .upsert({
          patient_id: pazienteId,
          activity_id: activityId,
          completata: true,
          completata_at: new Date().toISOString(),
        });
    }
  };

  const totale = attivita.length;
  const nCompletate = completate.size;
  const percentuale = totale > 0 ? Math.round((nCompletate / totale) * 100) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titolo}>Lista di Controllo</Text>
        <Text style={styles.sottotitolo}>Segui questi passi per prepararti al meglio.</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{nCompletate} di {totale} attività completate</Text>
          <Text style={styles.progressPerc}>{percentuale}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentuale}%` }]} />
        </View>
      </View>

      {attivita.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.taskCard,
            item.priorità === 'URGENTE' && styles.taskCardUrgente,
            item.dataAttivita > new Date() && styles.taskCardBloccata,
          ]}
          onPress={() => toggleCompletata(item.id, item.dataAttivita)}
        >
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitolo, completate.has(item.id) && styles.taskTitoloCompletato]}>
              {item.titolo}
            </Text>
            <Text style={styles.taskData}>
              📅 {item.dataAttivita.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
              {item.dataAttivita > new Date() ? ' 🔒' : ''}
            </Text>
            <Text style={[styles.taskDescrizione, completate.has(item.id) && styles.taskDescrizioneCompletata]}>
              {item.descrizione}
            </Text>
          </View>
          <View style={[styles.checkbox, completate.has(item.id) && styles.checkboxCompletato]}>
            {completate.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60, marginBottom: 8 },
  titolo: { fontSize: 24, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 4 },
  sottotitolo: { fontSize: 14, color: '#666', marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 13, color: '#333' },
  progressPerc: { fontSize: 13, fontWeight: 'bold', color: '#2d8a5e' },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: '#2d8a5e', borderRadius: 4 },
  taskCard: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: 'transparent' },
  taskCardUrgente: { borderLeftColor: '#f5a623' },
  taskCardBloccata: { opacity: 0.5 },
  taskContent: { flex: 1 },
  taskTitolo: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 2 },
  taskTitoloCompletato: { textDecorationLine: 'line-through', color: '#999' },
  taskData: { fontSize: 12, color: '#2d8a5e', marginBottom: 4 },
  taskDescrizione: { fontSize: 13, color: '#666' },
  taskDescrizioneCompletata: { color: '#bbb' },
  checkbox: { width: 28, height: 28, borderWidth: 2, borderColor: '#ddd', borderRadius: 6, marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxCompletato: { backgroundColor: '#2d8a5e', borderColor: '#2d8a5e' },
  checkmark: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});