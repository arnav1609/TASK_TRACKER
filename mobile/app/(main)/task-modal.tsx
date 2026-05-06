import React, { useState } from 'react';
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '../../constants/Theme';
import { NeonButton } from '../../components/NeonButton';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks';

export default function TaskModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string; description?: string }>();

  const isEditing = !!params.id;

  const [title, setTitle] = useState(params.title || '');
  const [description, setDescription] = useState(params.description || '');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      if (isEditing && params.id) {
        await updateMutation.mutateAsync({ id: params.id, input: { title: title.trim(), description: description.trim() } });
      } else {
        await createMutation.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
      }
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.dragIndicator} />

          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={Theme.colors.textMuted}
            autoFocus
          />

          <TextInput
            style={styles.descInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details (optional)"
            placeholderTextColor={Theme.colors.cardBorder}
            multiline
          />

          <View style={styles.actions}>
            <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <NeonButton
              title={isLoading ? 'Saving...' : (isEditing ? 'Update Task' : 'Save Task')}
              onPress={handleSave}
              style={styles.button}
              disabled={isLoading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Theme.colors.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.md,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    borderWidth: 1,
    borderColor: Theme.colors.danger,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.danger,
    fontSize: 13,
  },
  titleInput: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.cardBorder,
    paddingBottom: Theme.spacing.sm,
  },
  descInput: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    marginBottom: Theme.spacing.xl,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  cancelBtn: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
  },
  cancelText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
  },
  button: {
    flex: 1,
  },
});
