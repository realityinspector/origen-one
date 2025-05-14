import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Linking, Image, TouchableOpacity } from 'react-native';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { colors, typography, commonStyles } from '../styles/theme';
import { GitHub, BookOpen, Eye, Shield, Users, Award, ExternalLink } from 'react-feather';

const WelcomePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Get current location and check if we need to redirect
  const [location] = useLocation();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : location;
  
  // Add debug output to help understand why we might be redirecting
  console.log("WelcomePage: Checking auth status", { 
    wouterPath: location,
    windowPath: typeof window !== 'undefined' ? window.location.pathname : 'not available', 
    isAuthenticated: !!user, 
    isLoading: isLoading, 
    userRole: user?.role
  });
  
  // Only redirect if explicitly on /welcome path AND authenticated (not on root path)
  if (user && !isLoading && (location === '/welcome' || currentPath === '/welcome')) {
    console.log("WelcomePage: Redirecting authenticated user to dashboard");
    
    // Use both redirection methods for consistency
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    return <Redirect to="/dashboard" />;
  }

  const openGitHub = () => {
    Linking.openURL('https://github.com/realityinspector/origen-one');
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroFlex}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroTitle}>ORIGEN™ AI TUTOR</Text>
                <Text style={styles.heroSubtitle}>Personalized learning powered by artificial intelligence</Text>
                <Text style={styles.heroOpenSource}>100% Open Source Educational Platform</Text>
                <View style={styles.heroCta}>
                  <TouchableOpacity 
                    style={[styles.ctaButton, {marginRight: 16}]} 
                    onPress={() => {
                      console.log("GET STARTED button clicked, navigating to /auth");
                      // Use both methods for navigation to ensure it works in all environments
                      if (typeof window !== 'undefined') {
                        window.location.href = '/auth';
                      }
                    }}
                  >
                    <Text style={styles.ctaButtonText}>GET STARTED</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.githubButton} onPress={openGitHub}>
                    <GitHub size={20} color={colors.onPrimary} />
                    <Text style={styles.githubButtonText}>VIEW ON GITHUB</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.heroGraphicContainer}>
                {/* SVG Graphic */}
                <svg width="300" height="300" viewBox="0 0 300 300">
                  {/* Brain outline */}
                  <path 
                    d="M150,50 C220,50 250,100 250,150 C250,220 200,250 150,250 C80,250 50,200 50,150 C50,80 100,50 150,50 Z" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="3"
                    opacity="0.6"
                  />
                  
                  {/* Neural network nodes */}
                  <circle cx="150" cy="100" r="12" fill="#ffffff" />
                  <circle cx="100" cy="150" r="12" fill="#ffffff" />
                  <circle cx="200" cy="150" r="12" fill="#ffffff" />
                  <circle cx="120" cy="200" r="12" fill="#ffffff" />
                  <circle cx="180" cy="200" r="12" fill="#ffffff" />
                  <circle cx="150" cy="150" r="18" fill="#ffffff" />
                  
                  {/* Neural network connections */}
                  <line x1="150" y1="100" x2="100" y2="150" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="150" y1="100" x2="200" y2="150" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="150" y1="100" x2="150" y2="150" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="100" y1="150" x2="120" y2="200" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="200" y1="150" x2="180" y2="200" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="150" y1="150" x2="120" y2="200" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="150" y1="150" x2="180" y2="200" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="100" y1="150" x2="150" y2="150" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  <line x1="200" y1="150" x2="150" y2="150" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                  
                  {/* Animated pulses */}
                  <circle cx="150" cy="150" r="18" fill="#ffffff" opacity="0.2">
                    <animate attributeName="r" values="18;30;18" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.1;0.2" dur="3s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Small book icon in the center */}
                  <rect x="140" y="145" width="20" height="15" fill="#6200EE" rx="2" />
                  <rect x="140" y="142" width="20" height="3" fill="#6200EE" rx="1" />
                  <line x1="150" y1="145" x2="150" y2="160" stroke="#ffffff" strokeWidth="1" />
                </svg>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Origen?</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <BookOpen size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Personalized Learning</Text>
              <Text style={styles.featureDescription}>AI-driven content that adapts to your child's learning pace and style</Text>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Eye size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Visual Learning</Text>
              <Text style={styles.featureDescription}>Interactive knowledge graphs that make complex topics easy to understand</Text>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Shield size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Safe Environment</Text>
              <Text style={styles.featureDescription}>Privacy-focused platform with age-appropriate content</Text>
            </View>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Users size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Parent Dashboard</Text>
              <Text style={styles.featureDescription}>Detailed insights into your child's progress and achievements</Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={[styles.section, styles.howItWorks]}>
          <Text style={[styles.sectionTitle, styles.lightText]}>How It Works</Text>
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>1</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Create an Account</Text>
                <Text style={styles.timelineText}>Sign up as a parent or educator and add your learners</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>2</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Set Learning Goals</Text>
                <Text style={styles.timelineText}>Choose topics and grade levels for personalized lessons</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>3</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Learn and Grow</Text>
                <Text style={styles.timelineText}>AI generates custom lessons and adaptive quizzes</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>4</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Track Progress</Text>
                <Text style={styles.timelineText}>Monitor achievements and learning milestones</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Transform Learning?</Text>
          <Text style={styles.ctaSubtitle}>Join thousands of families using Origen AI Tutor</Text>
          <TouchableOpacity 
            style={[styles.ctaButton, styles.ctaButtonLarge]}
            onPress={() => {
              console.log("Start Your Journey button clicked, navigating to /auth");
              // Use both methods for navigation to ensure it works in all environments
              if (typeof window !== 'undefined') {
                window.location.href = '/auth';
              }
            }}
          >
            <Text style={styles.ctaButtonText}>Start Your Journey</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerTop}>
              <View style={styles.footerMainInfo}>
                <Text style={styles.footerTitle}>ORIGEN AI TUTOR</Text>
                <Text style={styles.footerSubtitle}>An open source AI-powered educational platform</Text>
              
                <View style={styles.footerLinks}>
                  <View style={styles.footerLinkItem} onTouchEnd={openGitHub}>
                    <GitHub size={18} color={colors.onPrimary + 'DD'} />
                    <Text style={styles.footerLinkText}>GitHub Repository</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.footerLogoSection}>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://allonething.xyz')}
                  style={styles.footerLogoContainer}
                >
                  <Image 
                    source={{ uri: '/aot-labs-logo.png' }} 
                    style={styles.footerLogo}
                    resizeMode="contain"
                  />
                  <View style={styles.footerLogoLink}>
                    <ExternalLink size={14} color={colors.onPrimary + 'DD'} />
                    <Text style={styles.footerLogoLinkText}>allonething.xyz</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.footerDivider} />
            <Text style={styles.copyright}>All materials copyright © Sean McDonald {new Date().getFullYear()}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: colors.primary,
    padding: 32,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    maxWidth: 1000,
    width: '100%',
    alignItems: 'center',
  },
  heroFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  heroTextContent: {
    flex: 1,
    minWidth: 300,
    paddingRight: 20,
    alignItems: 'flex-start',
  },
  heroGraphicContainer: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOpenSource: {
    ...typography.h6,
    color: colors.secondary,
    marginBottom: 24,
    fontWeight: 'bold',
    // Note: textShadow isn't supported in React Native, so we're removing it
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.onPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.onPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    ...typography.subtitle1,
    fontSize: 20,
    color: colors.onPrimary + 'DD',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
  },
  heroCta: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    height: 50,
    marginRight: 16,
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  ctaButtonWrapper: {
    margin: 0,
    padding: 0,
    height: 50,
    justifyContent: 'center',
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.onPrimary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    height: 50,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  githubButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ctaButton: {
    backgroundColor: colors.onPrimary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  ctaButtonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    height: 56,
  },
  ctaButtonLargeWrapper: {
    margin: 0,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: 40,
    textAlign: 'center',
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  lightText: {
    color: colors.onPrimary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 1200,
    width: '100%',
  },
  featureCard: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    padding: 24,
    margin: 12,
    width: 260,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    ...typography.h4,
    marginBottom: 8,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  featureDescription: {
    ...typography.body2,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  howItWorks: {
    backgroundColor: colors.primary,
    width: '100%',
  },
  timelineContainer: {
    maxWidth: 800,
    width: '100%',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  timelineBullet: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.onPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.onPrimary,
  },
  timelineText: {
    fontSize: 16,
    color: colors.onPrimary + 'DD',
  },
  ctaSection: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: colors.surfaceColor,
  },
  ctaTitle: {
    ...typography.h2,
    marginBottom: 16,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  ctaSubtitle: {
    ...typography.subtitle1,
    marginBottom: 32,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  footer: {
    backgroundColor: colors.textPrimary,
    padding: 48,
    width: '100%',
    boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
  },
  footerContent: {
    maxWidth: 800,
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  footerTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  footerMainInfo: {
    flex: 1,
    minWidth: 300,
    marginRight: 20,
  },
  footerLogoSection: {
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerTitle: {
    ...typography.h3,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  footerSubtitle: {
    ...typography.body2,
    color: colors.onPrimary + '99',
    marginBottom: 24,
  },
  footerLinks: {
    marginBottom: 24,
  },
  footerLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLinkText: {
    ...typography.body2,
    color: colors.onPrimary + 'DD',
    marginLeft: 8,
  },
  footerLogoContainer: {
    alignItems: 'center',
  },
  footerLogo: {
    width: 180, 
    height: 55,
    marginBottom: 12,
  },
  footerLogoLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLogoLinkText: {
    ...typography.body2,
    color: colors.onPrimary + 'DD',
    marginLeft: 4,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.onPrimary + '22',
    marginBottom: 24,
  },
  copyright: {
    ...typography.caption,
    color: colors.onPrimary + '99',
    textAlign: 'center',
  },
});

export default WelcomePage;
