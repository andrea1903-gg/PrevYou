import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfiloScreen() {
  const taskCompletati = [
    { titolo: 'Esami del sangue', data: 'Completato il 10 Maggio' },
    { titolo: 'Visita anestesiologica', data: 'Completato il 12 Maggio' },
  ];

  const taskInAttesa = [
    { titolo: 'Consenso informato', nota: 'Richiesto entro domani' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>SCHEDA PAZIENTE</Text>
        <Text style={styles.nome}>Elena Bianchi</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>INTERVENTO</Text>
          <Text style={styles.infoValore}>Colonscopia</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>DATA CHIRURGIA</Text>
          <Text style={styles.infoValore}>15 Maggio 2026</Text>
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
            <Text style={styles.statNumero}>12</Text>
            <Text style={styles.statLabel}>Task Completati</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGrigio]}>
            <Text style={styles.statNumero}>3</Text>
            <Text style={styles.statLabel}>In Attesa</Text>
          </View>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>80% Completato</Text>
        </View>
      </View>

      <View style={styles.taskSection}>
        <Text style={styles.sectionTitle}>Dettagli Task</Text>
        {taskInAttesa.map((t, i) => (
          <View key={i} style={styles.taskCard}>
            <Text style={styles.taskTitolo}>{t.titolo}</Text>
            <Text style={styles.taskNota}>{t.nota}</Text>
          </View>
        ))}
        {taskCompletati.map((t, i) => (
          <View key={i} style={[styles.taskCard, styles.taskCardCompletato]}>
            <Text style={styles.taskCheckmark}>✓</Text>
            <View>
              <Text style={styles.taskTitoloCompletato}>{t.titolo}</Text>
              <Text style={styles.taskData}>{t.data}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={() => router.replace('/')}>
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
  taskTitolo: { fontSize: 14, fontWeight: 'bold', color: '#1a3a5c' },
  taskNota: { fontSize: 12, color: '#f5a623' },
  taskCheckmark: { fontSize: 18, color: '#2d8a5e', marginRight: 12 },
  taskTitoloCompletato: { fontSize: 14, color: '#666' },
  taskData: { fontSize: 12, color: '#999' },
  exitButton: { margin: 16, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  exitButtonText: { color: '#dc2626', fontWeight: 'bold', fontSize: 16 },
});
