import React, { useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, FlatList,
  Pressable, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { Theme } from '../../constants/Theme';
import { TaskCard } from '../../components/TaskCard';
import { Plus } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTasks } from '../../hooks/useTasks';

type Filter = 'all' | 'pending' | 'completed';

export default function Dashboard() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [filter, setFilter] = useState<Filter>('all');

  const { data: tasks = [], isLoading, isError, refetch, isFetching } = useTasks(filter);
  const { data: allTasks = [] } = useTasks('all');

  const completedCount = useMemo(() => allTasks.filter(t => t.completed).length, [allTasks]);
  const progress = allTasks.length > 0 ? completedCount / allTasks.length : 0;

  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference - progress * circumference;

  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.subtitle}>
          {tasks.length > 0
            ? `${completedCount} of ${tasks.length} tasks done`
            : 'Ready to start your day?'}
        </Text>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
      <View style={styles.progressContainer}>
        <Svg height="80" width="80" viewBox="0 0 80 80">
          <Circle cx="40" cy="40" r="30" stroke={Theme.colors.cardBorder} strokeWidth="6" fill="none" />
          <Circle
            cx="40" cy="40" r="30"
            stroke={Theme.colors.primary}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="40, 40"
          />
        </Svg>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersRow}>
      {(['all', 'pending', 'completed'] as Filter[]).map((f) => (
        <Pressable
          key={f}
          onPress={() => setFilter(f)}
          style={[styles.filterChip, filter === f && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <Animated.View entering={ZoomIn.duration(500)} style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyTitle}>
          {filter === 'completed' ? 'No completed tasks yet' :
           filter === 'pending' ? 'All caught up!' :
           "No tasks yet. Let's get started!"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {filter === 'all' ? 'Tap the + button to add your first task.' : ''}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilters()}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load tasks.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskCard task={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
        />
      )}

      <Animated.View
        entering={ZoomIn.delay(300).springify()}
        style={styles.fabContainer}
      >
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(main)/task-modal')}
        >
          <Plus color={Theme.colors.background} size={32} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: Theme.spacing.md,
  },
  greeting: {
    color: Theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 13,
  },
  logoutBtn: {
    marginTop: 8,
  },
  logoutText: {
    color: Theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.round,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Theme.colors.background,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  loadingText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.danger,
    fontSize: 16,
  },
  retryBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  retryText: {
    color: Theme.colors.background,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    gap: Theme.spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    elevation: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
