'use client';

import { View, Text, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  rightIcon?: string;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyles = styles.base;
  const variantStyles = styles[variant];
  const sizeStyles = styles[size];
  const widthStyle = fullWidth ? styles.fullWidth : {};

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[baseStyles, variantStyles, sizeStyles, widthStyle, style]}
      activeOpacity={0.85}
      {...props}
    >
      {loading ? (
        <View style={styles.spinnerContainer}>
          <Feather name="loader" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} color={variantStyles.color || '#fff'} />
        </View>
      ) : (
        <>
          {leftIcon && <Feather name={leftIcon} size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} style={styles.icon} color={variantStyles.color || '#fff'} />}
          <Text style={[styles.text, sizeStyles.text, { color: variantStyles.color || '#fff' }]}>{children}</Text>
          {rightIcon && <Feather name={rightIcon} size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} style={styles.icon} color={variantStyles.color || '#fff'} />}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: '#0EA5E9',
  },
  secondary: {
    backgroundColor: '#64748B',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  text: {
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 17,
  },
  icon: {
    marginTop: 1,
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});