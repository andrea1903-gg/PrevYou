import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const attivitaOggi = [
    { id: 1, titolo: 'Inizia dieta liquida', descrizione: 'Solo brodi chiari, acqua e camomilla.', priorita: 'URGENTE' },
    { id: 2, titolo: 'Sospendi anticoagulanti', descrizione: 'Interrompi come concordato col medico.', priorita: 'URGENTE' },
    { id: 3, titolo: 'Conferma accompagnatore', descrizione: 'Assicurati che qualcuno possa accompagnarti.', priorita: 'IMPORTANTE' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerName}>Buongiorno, Elena</Text>
        <View style={styles.headerRight}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Intervento tra 12 giorni</Text>
          </View>
          <TouchableOpacity style={styles.profiloButton} onPress={() => router.push('/(tabs)/profilo')}>
            <Text style={styles.profiloIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.interventoCard}>
        <Text style={styles.interventoLabel}>PROSSIMO INTERVENTO</Text>
        <Text style={styles.interventoTitolo}>Colonscopia</Text>
        <Text style={styles.interventoData}>15 Maggio 2026</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>Stato della preparazione</Text>
            <Text style={styles.progressCount}>3 / 8 attività</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '37%' }]} />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Attività di Oggi</Text>

      {attivitaOggi.map((item) => (
        <View key={item.id} style={styles.taskCard}>
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitolo}>{item.titolo}</Text>
              <View style={[styles.badge, item.priorita === 'URGENTE' ? styles.badgeUrgente : styles.badgeImportante]}>
                <Text style={styles.badgeText}>{item.priorita}</Text>
              </View>
            </View>
            <Text style={styles.taskDescrizione}>{item.descrizione}</Text>
          </View>
          <View style={styles.checkbox} />
        </View>
      ))}
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
  taskContent: { flex: 1 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  taskTitolo: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', flex: 1 },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeUrgente: { backgroundColor: '#fff3e0' },
  badgeImportante: { backgroundColor: '#e8f5ee' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  taskDescrizione: { fontSize: 13, color: '#666' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#ddd', borderRadius: 4, marginLeft: 12 },
});