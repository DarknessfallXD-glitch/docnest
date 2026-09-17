'use client';

import { View, Text, StyleSheet, Modal as RNModal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './Button';
import { TextInput } from 'react-native';
import { colors } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    full: styles.sizeFull,
  }[size];

  if (!visible) return null;

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity onPress={onClose} style={styles.overlay} activeOpacity={1}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoiding}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.modalContainer, sizeStyles, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.header, { borderBottomColor: themeColors.outlineVariant }]}>
              <Text style={[styles.title, { color: themeColors.onSurface }]}>{title}</Text>
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close">
                  <Feather name="x" size={24} color={themeColors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </RNModal>
  );
}

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttonRow}>
        <Button variant="ghost" size="md" onPress={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} size="md" onPress={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </View>
    </Modal>
  );
}

interface InputDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  label: string;
  placeholder: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  validation?: (value: string) => string | null;
  autoFocus?: boolean;
}

export function InputDialog({
  visible,
  onClose,
  title,
  label,
  placeholder,
  initialValue = '',
  onConfirm,
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  validation,
  autoFocus = true,
}: InputDialogProps) {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState<string | null>(null);
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  React.useEffect(() => {
    setValue(initialValue);
    setError(null);
  }, [visible, initialValue]);

  const handleConfirm = () => {
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    onConfirm(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <Text style={[styles.label, { color: themeColors.onSurface }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => {
          setValue(text);
          if (error) setError(null);
        }}
        placeholder={placeholder}
        placeholderTextColor={themeColors.onSurfaceVariant}
        style={[
          styles.input,
          { 
            backgroundColor: themeColors.surfaceVariant,
            borderColor: error ? '#EF4444' : themeColors.outlineVariant,
            color: themeColors.onSurface,
          }
        ]}
        autoFocus={autoFocus}
        autoCapitalize="words"
        autoCorrect={false}
        spellCheck={false}
        onSubmitEditing={handleConfirm}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.buttonRow}>
        <Button variant="ghost" size="md" onPress={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="primary" size="md" onPress={handleConfirm}>
          {confirmLabel}
        </Button>
      </View>
    </Modal>
  );
}

import React from 'react';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  modalContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  sizeSm: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  sizeMd: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  sizeLg: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  sizeFull: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
});