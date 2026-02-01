import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MathQuestion } from '../types';

interface QuestionCardProps {
  questions: MathQuestion[];
  activeQuestions: MathQuestion[];
}

export default function QuestionCard({
  questions,
  activeQuestions,
}: QuestionCardProps) {
  const getQuestionStatus = (question: MathQuestion) => {
    // This should check if question is solved
    // For now, we'll keep it simple
    return 'active';
  };

  const renderQuestion = (question: MathQuestion, index: number) => {
    const isActive = activeQuestions.some((q) => q.id === question.id);

    return (
      <View
        key={question.id}
        style={[
          styles.questionItem,
          isActive && styles.activeQuestion,
        ]}
      >
        <View style={styles.questionHeader}>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>
              {question.direction === 'horizontal' ? '→' : '↓'}
            </Text>
          </View>
          <Text style={styles.questionId}>
            {question.id}
          </Text>
        </View>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soal:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {questions.map((q, i) => renderQuestion(q, i))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  questionItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    minWidth: 150,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  activeQuestion: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  questionBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
});