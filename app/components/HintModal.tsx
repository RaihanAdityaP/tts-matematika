import {
    Dimensions,
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
  onSelectHint: (hintType: 'reveal_cell' | 'highlight_wrong' | 'show_operation') => void;
}

const { width } = Dimensions.get('window');

export default function HintModal({
  visible,
  currentScore,
  onClose,
  onSelectHint,
}: HintModalProps) {
  const hints = [
    {
      type: 'show_operation' as const,
      title: 'Tampilkan Operasi',
      description: 'Lihat operator matematika untuk soal yang dipilih',
      icon: '🔍',
      cost: HINT_COSTS.show_operation,
    },
    {
      type: 'highlight_wrong' as const,
      title: 'Tandai Yang Salah',
      description: 'Sorot sel dengan jawaban yang salah',
      icon: '⚠️',
      cost: HINT_COSTS.highlight_wrong,
    },
    {
      type: 'reveal_cell' as const,
      title: 'Buka Satu Sel',
      description: 'Tampilkan jawaban untuk satu sel',
      icon: '💡',
      cost: HINT_COSTS.reveal_cell,
    },
  ];

  const canAfford = (cost: number) => currentScore >= cost;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Pilih Bantuan</Text>
            <Text style={styles.scoreText}>
              Skor Anda: {currentScore}
            </Text>
          </View>

          <View style={styles.hintsContainer}>
            {hints.map((hint) => (
              <TouchableOpacity
                key={hint.type}
                style={[
                  styles.hintButton,
                  !canAfford(hint.cost) && styles.hintButtonDisabled,
                ]}
                onPress={() => {
                  if (canAfford(hint.cost)) {
                    onSelectHint(hint.type);
                  }
                }}
                disabled={!canAfford(hint.cost)}
              >
                <Text style={styles.hintIcon}>{hint.icon}</Text>
                <View style={styles.hintInfo}>
                  <Text style={styles.hintTitle}>{hint.title}</Text>
                  <Text style={styles.hintDescription}>
                    {hint.description}
                  </Text>
                  <View style={styles.costBadge}>
                    <Text style={styles.costText}>
                      {hint.cost} poin
                    </Text>
                  </View>
                </View>
                {!canAfford(hint.cost) && (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedText}>🔒</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  hintsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  hintButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f9f9f9',
  },
  hintIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  hintInfo: {
    flex: 1,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hintDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  costBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  costText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  lockedText: {
    fontSize: 20,
  },
  closeButton: {
    backgroundColor: '#666',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});