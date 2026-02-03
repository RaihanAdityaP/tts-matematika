import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimerDisplayProps {
  timeElapsed: number; // in seconds
}

export default function TimerDisplay({ timeElapsed }: TimerDisplayProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Waktu</Text>
      <Text style={styles.value}>{formatTime(timeElapsed)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontVariant: ['tabular-nums'],
  },
});