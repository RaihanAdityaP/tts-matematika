import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HINT_COSTS } from '../constants/Levels';

interface HintModalProps {
  visible: boolean;
  currentScore: number;
  onClose: () => void;
  onSelectHint: (hintType: 'reveal_cell' | 'highlight_wrong' | 'show_cage') => void;
}

export default function HintModal({
  visible,
  currentScore,
  onClose,
  onSelectHint,
}: HintModalProps) {
  const hints = [
    {
      type: 'show_cage' as const,
      title: 'Tampilkan Cage',
      description: 'Highlight cage dari sel yang dipilih',
      cost: HINT_COSTS.show_cage,
    },
    {
      type: 'highlight_wrong' as const,
      title: 'Highlight Salah',
      description: 'Tandai semua sel yang salah',
      cost: HINT_COSTS.highlight_wrong,
    },
    {
      type: 'reveal_cell' as const,
      title: 'Buka Sel',
      description: 'Tampilkan jawaban untuk sel yang dipilih',
      cost: HINT_COSTS.reveal_cell,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Pilih Bantuan</Text>
          <Text style={styles.scoreText}>Skor kamu: {currentScore}</Text>

          <View style={styles.hintsList}>
            {hints.map((hint) => (
              <TouchableOpacity
                key={hint.type}
                style={[
                  styles.hintButton,
                  currentScore < hint.cost && styles.disabledButton,
                ]}
                onPress={() => onSelectHint(hint.type)}
                disabled={currentScore < hint.cost}
                activeOpacity={0.7}
              >
                <View style={styles.hintContent}>
                  <Text style={styles.hintTitle}>{hint.title}</Text>
                  <Text style={styles.hintDescription}>{hint.description}</Text>
                </View>
                <Text
                  style={[
                    styles.costText,
                    currentScore < hint.cost && styles.disabledCost,
                  ]}
                >
                  -{hint.cost}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  hintsList: {
    gap: 12,
    marginBottom: 20,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  disabledButton: {
    opacity: 0.5,
  },
  hintContent: {
    flex: 1,
  },
  hintTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  hintDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  costText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 12,
  },
  disabledCost: {
    color: '#CBD5E1',
  },
  closeButton: {
    backgroundColor: '#64748B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});