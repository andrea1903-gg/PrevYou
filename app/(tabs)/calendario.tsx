import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

const GIORNI = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

export default function CalendarioScreen() {
  const [attivita, setAttivita] = useState<any[]>([]);
  const [completate, setCompletate] = useState<Set<number>>(new Set());
  const [paziente, setPaziente] = useState<any>(null);
  const [dataIntervento, setDataIntervento] = useState<Date | null>(null);
  const [meseMostrato, setMeseMostrato] = useState(new Date());
  const [giornoSelezionato, setGiornoSelezionato] = useState(new Date());

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
    const dataInt = new Date(p.data_intervento);
    setDataIntervento(dataInt);
    setMeseMostrato(new Date(dataInt.getFullYear(), dataInt.getMonth(), 1));

    const { data } = await supabase
      .from('protocol_activities')
      .select('*')
      .eq('intervention_types_id', 1)
      .not('giorni_prima', 'is', null);

    const attivitaConData = (data || []).map(a => {
      const dataAttivita = new Date(dataInt);
      dataAttivita.setDate(dataInt.getDate() - a.giorni_prima);
      dataAttivita.setHours(0, 0, 0, 0);
      return { ...a, dataAttivita };
    });

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

  const attivitaDelGiorno = attivita.filter(a =>
    a.dataAttivita.toDateString() === giornoSelezionato.toDateString()
  );

  const haAttivita = (giorno: Date) =>
    attivita.some(a => a.dataAttivita.toDateString() === giorno.toDateString());

  const primoGiornoMese = new Date(meseMostrato.getFullYear(), meseMostrato.getMonth(), 1);
  const giorniNelMese = new Date(meseMostrato.getFullYear(), meseMostrato.getMonth() + 1, 0).getDate();
  const offset = (primoGiornoMese.getDay() + 6) % 7;

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setMeseMostrato(new Date(meseMostrato.getFullYear(), meseMostrato.getMonth() - 1, 1))}>
            <Text style={styles.freccia}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.titolo}>{MESI[meseMostrato.getMonth()]} {meseMostrato.getFullYear()}</Text>
          <TouchableOpacity onPress={() => setMeseMostrato(new Date(meseMostrato.getFullYear(), meseMostrato.getMonth() + 1, 1))}>
            <Text style={styles.freccia}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarioContainer}>
        <View style={styles.intestazione}>
          {GIORNI.map(g => <Text key={g} style={styles.intestazioneGiorno}>{g}</Text>)}
        </View>
        <View style={styles.griglia}>
          {Array.from({ length: offset }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.giorno} />
          ))}
          {Array.from({ length: giorniNelMese }).map((_, i) => {
            const giorno = new Date(meseMostrato.getFullYear(), meseMostrato.getMonth(), i + 1);
            giorno.setHours(0, 0, 0, 0);
            const isOggi = giorno.toDateString() === oggi.toDateString();
            const isIntervento = dataIntervento && giorno.toDateString() === new Date(dataIntervento.getFullYear(), dataIntervento.getMonth(), dataIntervento.getDate()).toDateString();
            const isSelezionato = giorno.toDateString() === giornoSelezionato.toDateString();
            const haAtt = haAttivita(giorno);

            return (
              <TouchableOpacity
                key={i}
                style={[styles.giorno, isOggi && styles.giornoOggi, isIntervento && styles.giornoIntervento, isSelezionato && !isOggi && !isIntervento && styles.giornoSelezionato]}
                onPress={() => setGiornoSelezionato(giorno)}
              >
                <Text style={[styles.giornoTesto, isOggi && styles.giornoOggiTesto, isIntervento && styles.giornoInterventoTesto]}>
                  {i + 1}
                </Text>
                {haAtt && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.attivitaSection}>
        <Text style={styles.attivitaTitolo}>
          {giornoSelezionato.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        {dataIntervento && giornoSelezionato.toDateString() === new Date(dataIntervento.getFullYear(), dataIntervento.getMonth(), dataIntervento.getDate()).toDateString() && (
  <View style={[styles.attivitaCard, { backgroundColor: '#fee2e2', borderLeftWidth: 4, borderLeftColor: '#dc2626' }]}>
    <View style={styles.attivitaContent}>
      <Text style={[styles.attivitaNome, { color: '#dc2626' }]}>🏥 Intervento Chirurgico</Text>
      <Text style={styles.attivitaDesc}>Oggi è il giorno del tuo intervento. In bocca al lupo!</Text>
    </View>
  </View>
)}
{attivitaDelGiorno.length === 0 && !(dataIntervento && giornoSelezionato.toDateString() === new Date(dataIntervento.getFullYear(), dataIntervento.getMonth(), dataIntervento.getDate()).toDateString()) ? (
  <Text style={styles.nessunaAttivita}>Nessuna attività per questo giorno.</Text>
) : (
          attivitaDelGiorno.map((a, i) => {
            const bloccata = a.dataAttivita > oggi;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.attivitaCard, bloccata && styles.attivitaBloccata]}
                onPress={() => toggleCompletata(a.id, a.dataAttivita)}
              >
                <View style={styles.attivitaContent}>
                  <Text style={[styles.attivitaNome, completate.has(a.id) && styles.attivitaCompletata]}>
                    {a.titolo} {bloccata ? '🔒' : ''}
                  </Text>
                  <Text style={styles.attivitaDesc}>{a.descrizione}</Text>
                </View>
                <View style={[styles.checkbox, completate.has(a.id) && styles.checkboxCompletato]}>
                  {completate.has(a.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titolo: { fontSize: 20, fontWeight: 'bold', color: '#1a3a5c' },
  freccia: { fontSize: 28, color: '#1a3a5c', paddingHorizontal: 12 },
  calendarioContainer: { backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 16 },
  intestazione: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  intestazioneGiorno: { fontSize: 11, color: '#999', fontWeight: 'bold', width: 36, textAlign: 'center' },
  griglia: { flexDirection: 'row', flexWrap: 'wrap' },
  giorno: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  giornoOggi: { backgroundColor: '#1a3a5c', borderRadius: 20 },
  giornoIntervento: { borderWidth: 2, borderColor: '#dc2626', borderRadius: 20 },
  giornoSelezionato: { backgroundColor: '#e8f5ee', borderRadius: 20 },
  giornoTesto: { fontSize: 14, color: '#333' },
  giornoOggiTesto: { color: 'white', fontWeight: 'bold' },
  giornoInterventoTesto: { color: '#dc2626', fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2d8a5e', marginTop: 1 },
  attivitaSection: { backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 16 },
  attivitaTitolo: { fontSize: 16, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 12, textTransform: 'capitalize' },
  nessunaAttivita: { color: '#999', fontSize: 14 },
  attivitaCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8 },
  attivitaBloccata: { opacity: 0.5 },
  attivitaContent: { flex: 1 },
  attivitaNome: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 4 },
  attivitaCompletata: { textDecorationLine: 'line-through', color: '#999' },
  attivitaDesc: { fontSize: 13, color: '#666' },
  checkbox: { width: 28, height: 28, borderWidth: 2, borderColor: '#ddd', borderRadius: 6, marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxCompletato: { backgroundColor: '#2d8a5e', borderColor: '#2d8a5e' },
  checkmark: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});