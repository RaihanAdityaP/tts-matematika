import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimerDisplayProps {
  timeElapsed: number;
  timeLimit?: number;
  onTimeUp?: () => void;
}

export default function TimerDisplay({
  timeElapsed,
  timeLimit,
  onTimeUp,
}: TimerDisplayProps) {
  const timeRemaining = timeLimit ? Math.max(0, timeLimit - timeElapsed) : 0;
  const isLowTime = timeLimit && timeRemaining < 60;

  useEffect(() => {
    if (timeLimit && timeRemaining === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeRemaining, timeLimit, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Waktu</Text>
      <Text style={[styles.time, isLowTime ? styles.lowTime : undefined]}>
        {timeLimit ? formatTime(timeRemaining) : formatTime(timeElapsed)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  lowTime: {
    color: '#f44336',
  },
});