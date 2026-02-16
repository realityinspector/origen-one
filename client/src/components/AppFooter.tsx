import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LogOut, ExternalLink } from 'react-feather';
import { Linking } from 'react-native-web';
import { colors, typography } from '../styles/theme';
import { useAuth } from '../hooks/use-auth';

interface AppFooterProps {
  // Add any props if needed
}

const AppFooter: React.FC<AppFooterProps> = () => {
  const { logoutMutation } = useAuth();

  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.footerLeft}>
          <View>
            <Text style={styles.footerTitle}>SUNSCHOOL™ AI TUTOR</Text>
            <Text style={styles.footerCopyright}>All materials copyright Sean McDonald {new Date().getFullYear()}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => Linking.openURL('https://allonething.xyz')}
            style={styles.footerLogoContainer}
          >
            <Image 
              source={{ uri: '/aot-labs-logo.png' }} 
              style={styles.footerLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => logoutMutation.mutate()}
        >
          <LogOut size={18} color={colors.onPrimary} style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerTitle: {
    ...typography.subtitle2,
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  footerCopyright: {
    ...typography.caption,
    color: colors.onPrimary,
    opacity: 0.8,
    marginTop: 4,
  },
  footerLogoContainer: {
    marginLeft: 20,
  },
  footerLogo: {
    width: 120, 
    height: 36,
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});

export default AppFooter;