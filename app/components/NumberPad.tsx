import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NumberPadProps {
  onNumberSelect: (number: number) => void;
  selectedNumber: number | null;
}

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 60) / 5;

export default function NumberPad({ onNumberSelect, selectedNumber }: NumberPadProps) {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilih Angka:</Text>
      <View style={styles.numberGrid}>
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.numberButton,
              selectedNumber === num && styles.selectedButton,
            ]}
            onPress={() => onNumberSelect(num)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.numberText,
                selectedNumber === num && styles.selectedText,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  numberButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
    transform: [{ scale: 1.05 }],
  },
  numberText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
});