import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NumberPadProps {
  onNumberSelect: (num: number) => void;
  onDelete: () => void;
  onClear: () => void;
  selectedNumber: number | null;
  maxNumber: number; // Based on grid size
}

export default function NumberPad({
  onNumberSelect,
  onDelete,
  onClear,
  selectedNumber,
  maxNumber,
}: NumberPadProps) {
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilih Angka</Text>
      
      <View style={styles.numberGrid}>
        {numbers.map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.numberButton,
              selectedNumber === number && styles.selectedButton,
            ]}
            onPress={() => onNumberSelect(number)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.numberText,
                selectedNumber === number && styles.selectedText,
              ]}
            >
              {number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>Hapus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={onClear}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>Bersihkan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  numberButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  numberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  clearButton: {
    backgroundColor: '#64748B',
    borderColor: '#64748B',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});