import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const giorniSettimana = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

const attivitaPerGiorno: { [key: number]: { titolo: string; descrizione: string }[] } = {
  1: [{ titolo: 'Sospendi anticoagulante', descrizione: 'Interrompi come concordato col medico.' }],
  3: [{ titolo: 'Esami del sangue', descrizione: 'Prelievo pre-operatorio al centro convenzionato.' }],
  8: [{ titolo: 'Elettrocardiogramma', descrizione: 'Porta la documentazione cardiologica.' }],
  14: [{ titolo: 'Digiuno dalla mezzanotte', descrizione: 'Non mangiare né bere nulla.' }, { titolo: 'Doccia antisettica', descrizione: 'Con il sapone disinfettante prescritto.' }],
  15: [{ titolo: 'Prepara la borsa', descrizione: 'Tessera sanitaria, documenti e farmaci.' }],
};

const giornoOggi = 1;
const giornoIntervento = 15;

export default function CalendarioScreen() {
  const [giornoSelezionato, setGiornoSelezionato] = useState(giornoOggi);

  const attivitaSelezionate = attivitaPerGiorno[giornoSelezionato] || [];

  const giorni = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.titolo}>Maggio 2026</Text>
          <View style={styles.interventoBadge}>
            <Text style={styles.interventoBadgeText}>🗓 Intervento il 15</Text>
          </View>
        </View>
      </View>

      <View style={styles.calendarioContainer}>
        <View style={styles.intestazioneGiorni}>
          {giorniSettimana.map(g => (
            <Text key={g} style={styles.intestazioneGiorno}>{g}</Text>
          ))}
        </View>
        <View style={styles.grigliaGiorni}>
          {giorni.map(giorno => (
            <TouchableOpacity
              key={giorno}
              style={[
                styles.giorno,
                giorno === giornoOggi && styles.giornoOggi,
                giorno === giornoIntervento && styles.giornoIntervento,
                giorno === giornoSelezionato && giorno !== giornoOggi && giorno !== giornoIntervento && styles.giornoSelezionato,
              ]}
              onPress={() => setGiornoSelezionato(giorno)}
            >
              <Text style={[
                styles.giornoTesto,
                giorno === giornoOggi && styles.giornoOggiTesto,
                giorno === giornoIntervento && styles.giornoInterventoTesto,
              ]}>
                {giorno}
              </Text>
              {attivitaPerGiorno[giorno] && giorno !== giornoOggi && giorno !== giornoIntervento && (
                <View style={styles.dot} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.attivitaSection}>
        <Text style={styles.attivitaTitolo}>
          Attività per {giornoSelezionato === giornoOggi ? 'Oggi' : `il ${giornoSelezionato} Maggio`}
        </Text>
        {attivitaSelezionate.length === 0 ? (
          <Text style={styles.nessunaAttivita}>Nessuna attività per questo giorno.</Text>
        ) : (
          attivitaSelezionate.map((a, i) => (
            <View key={i} style={styles.attivitaCard}>
              <View style={styles.attivitaContent}>
                <Text style={styles.attivitaNome}>{a.titolo}</Text>
                <Text style={styles.attivitaDesc}>{a.descrizione}</Text>
              </View>
              <View style={styles.checkbox} />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titolo: { fontSize: 24, fontWeight: 'bold', color: '#1a3a5c' },
  interventoBadge: { backgroundColor: '#fee2e2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  interventoBadgeText: { color: '#dc2626', fontSize: 12, fontWeight: 'bold' },
  calendarioContainer: { backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 16 },
  intestazioneGiorni: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  intestazioneGiorno: { fontSize: 11, color: '#999', fontWeight: 'bold', width: 36, textAlign: 'center' },
  grigliaGiorni: { flexDirection: 'row', flexWrap: 'wrap' },
  giorno: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  giornoOggi: { backgroundColor: '#1a3a5c', borderRadius: 20 },
  giornoIntervento: { borderWidth: 2, borderColor: '#dc2626', borderRadius: 20 },
  giornoSelezionato: { backgroundColor: '#e8f5ee', borderRadius: 20 },
  giornoTesto: { fontSize: 14, color: '#333' },
  giornoOggiTesto: { color: 'white', fontWeight: 'bold' },
  giornoInterventoTesto: { color: '#dc2626', fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2d8a5e', marginTop: 2 },
  attivitaSection: { backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 16 },
  attivitaTitolo: { fontSize: 18, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 12 },
  nessunaAttivita: { color: '#999', fontSize: 14 },
  attivitaCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8 },
  attivitaContent: { flex: 1 },
  attivitaNome: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 4 },
  attivitaDesc: { fontSize: 13, color: '#666' },
  checkbox: { width: 28, height: 28, borderWidth: 2, borderColor: '#ddd', borderRadius: 6, marginLeft: 12 },
});