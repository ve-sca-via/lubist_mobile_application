import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const colors = {
  overlay: 'rgba(0, 0, 0, 0.45)',
  white: '#FFFFFF',
  gold: '#F89E07',
  star: '#F89E07',
  starEmpty: '#D9C3AD',
  heading: '#221A11',
  text: '#534433',
  muted: '#867461',
  border: '#E7D7C9',
  inputBg: '#FFF8F4',
  disabled: '#C7C7C7',
};

const MIN_COMMENT = 10;
const MAX_COMMENT = 500;

export interface ReviewModalProps {
  visible: boolean;
  /** Heading context, e.g. the salon name being reviewed. */
  salonName?: string;
  /** Prefill for editing an existing review. */
  initialRating?: number;
  initialComment?: string;
  /** "create" gates a minimum rating of 1; both modes validate the comment length. */
  mode?: 'create' | 'edit';
  submitting?: boolean;
  onSubmit: (values: { rating: number; comment: string }) => void;
  onDismiss: () => void;
}

export function ReviewModal({
  visible,
  salonName,
  initialRating = 0,
  initialComment = '',
  mode = 'create',
  submitting = false,
  onSubmit,
  onDismiss,
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  // Reset the form to the latest props each time the modal opens.
  useEffect(() => {
    if (visible) {
      setRating(initialRating);
      setComment(initialComment);
    }
  }, [visible, initialRating, initialComment]);

  const trimmed = comment.trim();
  const isValid = rating >= 1 && trimmed.length >= MIN_COMMENT && trimmed.length <= MAX_COMMENT;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{mode === 'edit' ? 'Edit your review' : 'Rate your visit'}</Text>
            <Pressable hitSlop={8} onPress={onDismiss}>
              <Ionicons color={colors.muted} name="close" size={22} />
            </Pressable>
          </View>
          {salonName ? <Text style={styles.subtitle}>{salonName}</Text> : null}

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} hitSlop={6} onPress={() => setRating(n)}>
                <Ionicons
                  color={n <= rating ? colors.star : colors.starEmpty}
                  name={n <= rating ? 'star' : 'star-outline'}
                  size={34}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Share a few words about your experience…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={MAX_COMMENT}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>
            {trimmed.length < MIN_COMMENT
              ? `At least ${MIN_COMMENT} characters`
              : `${comment.length}/${MAX_COMMENT}`}
          </Text>

          <Pressable
            disabled={!isValid || submitting}
            onPress={() => onSubmit({ rating, comment: trimmed })}
            style={[styles.submit, (!isValid || submitting) && styles.submitDisabled]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>{mode === 'edit' ? 'Update review' : 'Submit review'}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: { backgroundColor: colors.white, borderRadius: 20, gap: 12, padding: 22, width: '100%' },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 18 },
  subtitle: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: -6 },
  stars: { alignSelf: 'center', flexDirection: 'row', gap: 8, paddingVertical: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    minHeight: 96,
    padding: 14,
  },
  counter: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: -4, textAlign: 'right' },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 15,
  },
  submitDisabled: { backgroundColor: colors.disabled },
  submitText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});
