import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Check, Trash2, Pencil } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Theme } from '../constants/Theme';
import { Task } from '../hooks/useTasks';
import { GlassCard } from './GlassCard';
import { useToggleTask, useDeleteTask } from '../hooks/useTasks';
import { useRouter } from 'expo-router';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();
  const router = useRouter();

  const swipeableRef = React.useRef<Swipeable>(null);

  const handleToggle = () => {
    swipeableRef.current?.close();
    toggleMutation.mutate({ id: task.id, completed: !task.completed });
  };
  const handleDelete = () => deleteMutation.mutate(task.id);

  const renderRightActions = () => (
    <Pressable style={styles.deleteAction} onPress={handleDelete}>
      <Trash2 color={Theme.colors.text} size={24} />
    </Pressable>
  );

  const renderLeftActions = () => (
    <Pressable style={styles.completeAction} onPress={handleToggle}>
      <Check color={Theme.colors.background} size={32} />
    </Pressable>
  );

  const checkboxStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(task.completed ? Theme.colors.success : 'transparent', { duration: 200 }),
    borderColor: withTiming(task.completed ? Theme.colors.success : Theme.colors.pending, { duration: 200 }),
  }));

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableRightOpen={handleDelete}
      onSwipeableLeftOpen={handleToggle}
      overshootRight={false}
      overshootLeft={false}
    >
      <View style={styles.cardWrapper}>
        <GlassCard style={styles.card}>
          <Pressable onPress={handleToggle} style={styles.cardInner}>
            <Animated.View style={[styles.checkbox, checkboxStyle]}>
              {task.completed && <Check color={Theme.colors.background} size={14} />}
            </Animated.View>
            <View style={styles.content}>
              <Text
                style={[
                  styles.title,
                  task.completed && styles.titleCompleted,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.description ? (
                <Text style={styles.description} numberOfLines={1}>
                  {task.description}
                </Text>
              ) : null}
              <Text style={styles.timestamp}>
                {new Date(task.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push({ pathname: '/(main)/task-modal', params: { id: task.id, title: task.title, description: task.description || '' } })}
              style={styles.editBtn}
            >
              <Pencil size={16} color={Theme.colors.textMuted} />
            </Pressable>
          </Pressable>
        </GlassCard>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: Theme.spacing.sm,
  },
  card: {
    borderRadius: Theme.borderRadius.md,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  titleCompleted: {
    color: Theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  description: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  timestamp: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  editBtn: {
    padding: Theme.spacing.sm,
    marginLeft: Theme.spacing.sm,
  },
  deleteAction: {
    backgroundColor: Theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  completeAction: {
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
});
