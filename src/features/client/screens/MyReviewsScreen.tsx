import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { memo, useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ClientStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import {
  useMyReviews,
  useUpdateReview,
  type CustomerReview,
} from '@/services/api/hooks/useCustomerAPI';
import { ReviewModal } from '@/features/client/components/ReviewModal';

const colors = {
  bg: '#FFFAF5',
  white: '#FFFFFF',
  gold: '#F89E07',
  star: '#F89E07',
  starEmpty: '#D9C3AD',
  heading: '#221A11',
  text: '#534433',
  muted: '#78716C',
  border: '#E7D7C9',
  cardCream: '#FFF1E6',
  pillBorder: 'rgba(217, 195, 173, 0.3)',
};

type Navigation = NativeStackNavigationProp<ClientStackParamList, 'MyReviews'>;

function formatDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          color={n <= rating ? colors.star : colors.starEmpty}
          name={n <= rating ? 'star' : 'star-outline'}
          size={15}
        />
      ))}
    </View>
  );
}

export function MyReviewsScreen() {
  const navigation = useNavigation<Navigation>();
  const { isAuthenticated, user } = useAuth();
  const canReview = isAuthenticated && !user?.guest;

  const { data, isLoading, isError, refetch } = useMyReviews(canReview);
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();

  const [editing, setEditing] = useState<CustomerReview | null>(null);

  const reviews = data?.reviews ?? [];

  const submitEdit = ({ rating, comment }: { rating: number; comment: string }) => {
    if (!editing) return;
    updateReview(
      { reviewId: editing.id, rating, comment },
      {
        onSuccess: () => {
          setEditing(null);
          Alert.alert('Updated', 'Your review has been updated.');
        },
        onError: (err: any) => Alert.alert('Could not update', err.message || 'Please try again.'),
      },
    );
  };

  const renderBody = () => {
    if (!canReview) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="star-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>Sign in to see your reviews</Text>
        </View>
      );
    }
    if (isLoading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateSubtitle}>Couldn't load your reviews.</Text>
          <Pressable onPress={() => refetch()} style={styles.stateBtn}>
            <Text style={styles.stateBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (reviews.length === 0) {
      return (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <Ionicons color={colors.gold} name="star-outline" size={26} />
          </View>
          <Text style={styles.stateTitle}>No reviews yet</Text>
          <Text style={styles.stateSubtitle}>
            After a completed visit, write a review from the Bookings tab.
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderReview = useCallback(
    ({ item }: { item: CustomerReview }) => <ReviewCard onEdit={setEditing} review={item} />,
    [],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons color={colors.heading} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={canReview && !isLoading && !isError ? reviews : EMPTY_REVIEWS}
        keyExtractor={reviewKey}
        renderItem={renderReview}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ReviewSeparator}
        ListEmptyComponent={renderBody()}
      />

      <ReviewModal
        visible={editing != null}
        mode="edit"
        salonName={editing?.salon_name ?? 'Salon'}
        initialRating={editing?.rating ?? 0}
        initialComment={editing?.comment ?? ''}
        submitting={isUpdating}
        onSubmit={submitEdit}
        onDismiss={() => setEditing(null)}
      />
    </SafeAreaView>
  );
}

const EMPTY_REVIEWS: CustomerReview[] = [];

const reviewKey = (review: CustomerReview) => review.id;

function ReviewSeparator() {
  return <View style={styles.separator} />;
}

const ReviewCard = memo(function ReviewCard({
  review,
  onEdit,
}: {
  review: CustomerReview;
  onEdit: (review: CustomerReview) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text numberOfLines={1} style={styles.salonName}>
          {review.salon_name ?? 'Salon'}
        </Text>
        <Pressable hitSlop={8} onPress={() => onEdit(review)} style={styles.editBtn}>
          <Ionicons color={colors.gold} name="create-outline" size={16} />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
      <View style={styles.metaRow}>
        <Stars rating={review.rating} />
        {review.created_at ? (
          <Text style={styles.date}>{formatDate(review.updated_at ?? review.created_at)}</Text>
        ) : null}
      </View>
      {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.bg, flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: 'rgba(248, 158, 7, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  backBtn: { height: 28, justifyContent: 'center', width: 44 },
  headerTitle: { color: colors.heading, fontFamily: 'Montserrat_600SemiBold', fontSize: 20, letterSpacing: -0.2 },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 16 },
  separator: { height: 14 },
  card: {
    backgroundColor: colors.cardCream,
    borderColor: colors.pillBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  salonName: { color: colors.heading, flex: 1, fontFamily: 'Montserrat_600SemiBold', fontSize: 17, paddingRight: 10 },
  editBtn: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  editText: { color: colors.gold, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  starsRow: { flexDirection: 'row', gap: 2 },
  date: { color: colors.muted, fontFamily: 'Inter_400Regular', fontSize: 12 },
  comment: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  state: { alignItems: 'center', gap: 12, paddingHorizontal: 32, paddingTop: 96 },
  stateIcon: {
    alignItems: 'center',
    backgroundColor: '#FDEDDF',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  stateTitle: { color: colors.heading, fontFamily: 'Poppins_700Bold', fontSize: 18, textAlign: 'center' },
  stateSubtitle: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  stateBtn: { backgroundColor: colors.gold, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12 },
  stateBtnText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
