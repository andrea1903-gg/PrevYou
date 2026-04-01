import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const attivita = [
  { id: 1, titolo: 'Sospendi anticoagulante', descrizione: 'Fondamentale interrompere l\'assunzione come concordato col medico.', timing: 'OGGI', priorita: 'URGENTE', completata: false },
  { id: 2, titolo: 'Conferma accompagnatore', descrizione: 'Assicurati che un familiare sia disponibile per il rientro a casa.', timing: 'OGGI', priorita: 'IMPORTANTE', completata: false },
  { id: 3, titolo: 'Esami del sangue', descrizione: 'Effettua il prelievo per gli esami di routine pre-operatori.', timing: 'QUESTA SETTIMANA', priorita: 'URGENTE', completata: true },
  { id: 4, titolo: 'Elettrocardiogramma (ECG)', descrizione: 'Porta tutta la documentazione cardiologica recente.', timing: 'QUESTA SETTIMANA', priorita: 'IMPORTANTE', completata: false },
  { id: 5, titolo: 'Digiuno dalla mezzanotte', descrizione: 'Non mangiare né bere nulla a partire dalle 24:00.', timing: 'IL GIORNO PRIMA', priorita: 'URGENTE', completata: false },
  { id: 6, titolo: 'Doccia antisettica', descrizione: 'Effettua una doccia con il sapone disinfettante prescritto.', timing: 'IL GIORNO PRIMA', priorita: 'IMPORTANTE', completata: false },
  { id: 7, titolo: 'Prepara la borsa', descrizione: 'Includi tessera sanitaria, documenti e farmaci abituali.', timing: 'IL GIORNO STESSO', priorita: 'NORMALE', completata: false },
  { id: 8, titolo: 'Acquista soluzione lavante', descrizione: 'Procurati in farmacia la soluzione preparatoria prescritta.', timing: 'QUESTA SETTIMANA', priorita: 'IMPORTANTE', completata: false },
];

const gruppi = ['OGGI', 'QUESTA SETTIMANA', 'IL GIORNO PRIMA', 'IL GIORNO STESSO'];

export default function ChecklistScreen() {
  const [items, setItems] = useState(attivita);

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completata: !item.completata } : item
    ));
  };

  const completate = items.filter(i => i.completata).length;
  const totale = items.length;
  const percentuale = Math.round((completate / totale) * 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titolo}>Lista di Controllo</Text>
        <Text style={styles.sottotitolo}>Segui questi passi per prepararti al meglio.</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{completate} di {totale} attività completate</Text>
          <Text style={styles.progressPerc}>{percentuale}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentuale}%` }]} />
        </View>
      </View>

      {gruppi.map(gruppo => {
        const itemsGruppo = items.filter(i => i.timing === gruppo);
        if (itemsGruppo.length === 0) return null;
        return (
          <View key={gruppo}>
            <Text style={styles.gruppoTitolo}>{gruppo}</Text>
            {itemsGruppo.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.taskCard, item.priorita === 'URGENTE' && styles.taskCardUrgente]}
                onPress={() => toggleItem(item.id)}
              >
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text style={[styles.taskTitolo, item.completata && styles.taskTitoloCompletato]}>
                      {item.titolo}
                    </Text>
                  </View>
                  <Text style={[styles.taskDescrizione, item.completata && styles.taskDescrizioneCompletata]}>
                    {item.descrizione}
                  </Text>
                </View>
                <View style={[styles.checkbox, item.completata && styles.checkboxCompletato]}>
                  {item.completata && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    marginBottom: 8,
  },
  titolo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 4,
  },
  sottotitolo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#333',
  },
  progressPerc: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d8a5e',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#2d8a5e',
    borderRadius: 4,
  },
  gruppoTitolo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 1,
  },
  taskCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  taskCardUrgente: {
    borderLeftColor: '#f5a623',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    marginBottom: 4,
  },
  taskTitolo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  taskTitoloCompletato: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescrizione: {
    fontSize: 13,
    color: '#666',
  },
  taskDescrizioneCompletata: {
    color: '#bbb',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompletato: {
    backgroundColor: '#2d8a5e',
    borderColor: '#2d8a5e',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});