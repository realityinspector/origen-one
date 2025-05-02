import { StyleSheet } from 'react-native';

// Color palette - Refined with complementary accent colors
export const colors = {
  primary: '#6200EE',
  primaryDark: '#3700B3',
  primaryLight: '#BB86FC',
  secondary: '#03DAC6',
  secondaryDark: '#018786',
  accent1: '#FF7043', // New orange accent
  accent2: '#5C6BC0', // New indigo accent
  accent3: '#26A69A', // New teal accent
  background: '#F9F9F9', // Slightly lighter
  surfaceColor: '#FFFFFF',
  error: '#B00020',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
  onError: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  divider: '#E0E0E0', // Slightly darker for better contrast
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  inputBackground: '#F9F9F9',
  text: '#000000',  // Added for compatibility
  border: '#E0E0E0',  // Added for border colors
};

// Typography - Improved with modern font hierarchy and better line spacing
export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    lineHeight: 26,
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
    lineHeight: 24,
  },
  h6: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

// Animation durations for consistent animation effects
export const animations = {
  // Short durations for micro-interactions
  short: 150,  // milliseconds
  medium: 300,  // milliseconds
  long: 500,  // milliseconds
};

// Common styles for components with improved spacing, shadow effects, and consistent button styling
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Improved card with better shadow
  card: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 12, // More rounded corners
    padding: 20, // More padding for content breathing
    marginVertical: 12, // More spacing between cards
    marginHorizontal: 16,
    elevation: 3, // Slightly stronger shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Improved spacing in scroll views
  scrollViewContent: {
    flexGrow: 1,
    padding: 20, // More padding for better spacing
  },
  // Form elements
  input: {
    height: 52, // Slightly taller
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8, // More consistent with other elements
    paddingHorizontal: 16, // More padding
    marginBottom: 20, // More margin for better spacing
    fontSize: 16,
    backgroundColor: colors.surfaceColor,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.textPrimary,
    fontWeight: '500', // Slightly bolder label
  },
  // Standardized button styling with hover and active states
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8, // Consistent border radius
    paddingVertical: 14, // More padding for better touch targets
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Adding subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
    // Pseudo-element styles added via CSS in global.css
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5, // Slight letter spacing for readability
  },
  outlineButton: {
    borderWidth: 2, // Slightly thicker border
    borderColor: colors.primary,
    borderRadius: 8, // Consistent with primary button
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Secondary action button (accent color)
  secondaryButton: {
    backgroundColor: colors.accent2,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  secondaryButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Accent button (using accent1 color)
  accentButton: {
    backgroundColor: colors.accent1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  accentButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Other UI elements
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 24, // More spacing around dividers
  },
  chip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 10,
    elevation: 1, // Subtle elevation
  },
  chipText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.onSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  error: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  // Section spacing
  section: {
    marginBottom: 32, // Good spacing between major sections
  },
  // Micro-spacing
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mv8: { marginVertical: 8 },
  mv16: { marginVertical: 16 },
  mh8: { marginHorizontal: 8 },
  mh16: { marginHorizontal: 16 },
});
