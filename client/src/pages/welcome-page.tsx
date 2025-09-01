import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { colors, typography } from '../styles/theme';
import { GitHub, BookOpen, Eye, Shield, Users, Award, BarChart2, BookOpen as Book, Star, Menu, Grid, PlusCircle, ArrowRight, Compass, CheckCircle } from 'react-feather';

// Get screen dimensions for responsive design
const windowWidth = Dimensions.get('window').width;

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
        {/* Modern Navbar with Logo */}
        <View style={styles.navbar}>
          <View style={styles.navbarInner}>
            <View style={styles.logoContainer}>
              <img 
                src="/aot-labs-logo.png" 
                alt="AOT Labs Logo" 
                style={{
                  height: 40,
                  marginRight: 10
                }}
              />
            </View>
            <View style={styles.navLinks}>
              <TouchableOpacity style={styles.navLink}>
                <Text style={styles.navLinkText}>Features</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink}>
                <Text style={styles.navLinkText}>How It Works</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/auth';
                  }
                }}
              >
                <Text style={styles.navButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      
        {/* Modern Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.sectionInner}>
            <View style={styles.heroLayout}>
              {/* Hero Text Content */}
              <View style={styles.heroTextContent}>
                <View style={styles.heroTagBadge}>
                  <Star size={14} color="#FFFFFF" />
                  <Text style={styles.heroTagText}>SUNSCHOOL</Text>
                </View>
                
                <Text style={styles.heroTitle}>
                  SUNSCHOOL by AOT LABS
                </Text>
                
                <Text style={styles.heroSubtitle}>
                  AI-powered learning where parents own the prompt. Built into every AOT space.
                </Text>
                
                <Text style={styles.heroSubtitle}>
                  School...anywhere under the sun. Open source, transparent, community-driven.
                </Text>
                
                {/* Hero Benefits with Iconography */}
                <View style={styles.heroBenefits}>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.benefitText}>Go from zero to AI tutor in less than 10 minutes, in any location, no IT</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.benefitText}>Satellite Connected - AI learning anywhere</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.benefitText}>Open-Source & Parent-Controlled - You own your data and prompts</Text>
                  </View>
                </View>
                
                {/* CTAs */}
                <View style={styles.heroCta}>
                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={() => {
                      console.log("GET STARTED button clicked, navigating to /auth");
                      if (typeof window !== 'undefined') {
                        window.location.href = '/auth';
                      }
                    }}
                  >
                    <Text style={styles.primaryButtonText}>GET STARTED</Text>
                    <ArrowRight size={16} color="#000000" style={{marginLeft: 8}} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.outlineButton} onPress={openGitHub}>
                    <GitHub size={18} color="#FFFFFF" />
                    <Text style={styles.outlineButtonText}>GITHUB</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Hero Image Container */}
              <View style={styles.heroImageContainer}>
                <View style={styles.imageWrapper}>
                  <img 
                    src="/images/sunschool-artboard@2x.png" 
                    alt="Sunschool Hero" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px'
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Why Families Love Origen</Text>
              <View style={styles.sectionTitleUnderline} />
            </View>
            
            {/* For Parents Section */}
            <View style={styles.audienceSection}>
              <View style={styles.audienceTitleContainer}>
                <Text style={styles.audienceTitle}>For Parents</Text>
              </View>
              
              <View style={styles.featuresGrid}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Eye size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Real-time Learning Journey</Text>
                  <Text style={styles.featureDescription}>
                    Watch your child's progress as it happens. Get detailed insights into strengths and areas that need improvement.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Users size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Parent-Owned Learning Control</Text>
                  <Text style={styles.featureDescription}>
                    Create separate profiles for each child where YOU control prompts, learning paths, and data. Children's accounts link directly to yours.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <BarChart2 size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Beautiful Progress Tracking</Text>
                  <Text style={styles.featureDescription}>
                    View intuitive visual reports of your child's learning journey. Easily track improvement across various subjects.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Shield size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Seamless Multi-device Access</Text>
                  <Text style={styles.featureDescription}>
                    Use Origen on any device with automatic data synchronization. Your child can start on a tablet and continue on a computer.
                  </Text>
                </View>
              </View>
            </View>

            {/* For Learners Section */}
            <View style={styles.audienceSection}>
              <View style={styles.audienceTitleContainer}>
                <Text style={styles.audienceTitle}>For Learners</Text>
              </View>
              
              <View style={styles.featuresGrid}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Award size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Learning That Feels Like Play</Text>
                  <Text style={styles.featureDescription}>
                    Enjoy interactive lessons that adapt to your unique learning style. Discover knowledge through engaging visuals.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <BookOpen size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Made Just For You</Text>
                  <Text style={styles.featureDescription}>
                    Experience content that automatically adjusts to your grade level. Lessons intelligently build on what you've learned.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Eye size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Explore What Interests You</Text>
                  <Text style={styles.featureDescription}>
                    Begin with core subjects and add custom topics based on what fascinates you. See how different subjects connect.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Award size={24} color="#000000" />
                  </View>
                  <Text style={styles.featureTitle}>Celebrate Your Progress</Text>
                  <Text style={styles.featureDescription}>
                    Collect badges and rewards as you complete lessons. Watch your progress grow with visual indicators.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Open vs Closed Section */}
        <View style={styles.openVsClosedSection}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Open Source vs. Closed Systems</Text>
              <View style={styles.sectionTitleUnderline} />
            </View>
            
            <Text style={[styles.sectionSubtitle, {textAlign: 'center', marginBottom: 40}]}>
              Why transparency matters when it comes to your child's education
            </Text>
            
            <View style={styles.comparisonContainer}>
              <View style={styles.closedSystemCard}>
                <Text style={styles.comparisonTitle}>❌ Closed AI Systems</Text>
                <View style={styles.comparisonList}>
                  <Text style={styles.comparisonItem}>• Platform controls all prompts and content</Text>
                  <Text style={styles.comparisonItem}>• Your data locked in their system</Text>
                  <Text style={styles.comparisonItem}>• No visibility into AI decision-making</Text>
                  <Text style={styles.comparisonItem}>• Expensive recurring subscriptions</Text>
                  <Text style={styles.comparisonItem}>• Limited customization options</Text>
                </View>
              </View>
              
              <View style={styles.openSystemCard}>
                <Text style={styles.comparisonTitle}>✅ SUNSCHOOL Open Source</Text>
                <View style={styles.comparisonList}>
                  <Text style={styles.comparisonItem}>• Parents own and customize every prompt</Text>
                  <Text style={styles.comparisonItem}>• Your data syncs to your own database</Text>
                  <Text style={styles.comparisonItem}>• Full transparency in AI interactions</Text>
                  <Text style={styles.comparisonItem}>• Free access to core functionality</Text>
                  <Text style={styles.comparisonItem}>• Community-driven improvements</Text>
                </View>
              </View>
            </View>
            
            <Text style={[styles.sectionSubtitle, {textAlign: 'center', marginTop: 32, fontWeight: '600'}]}>
              Your family's learning journey shouldn't be locked away in someone else's black box.
            </Text>
          </View>
        </View>

        {/* Enhanced How It Works Section */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, styles.lightText]}>How It Works</Text>
              <View style={[styles.sectionTitleUnderline, styles.lightUnderline]} />
            </View>
            
            {/* Getting Started Section */}
            <View style={styles.processSection}>
              <Text style={styles.processSectionTitle}>Getting Started Is Easy</Text>
              
              <View style={styles.timelineContainer}>
                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>1</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Create Your Parent Account</Text>
                    <Text style={styles.timelineText}>Sign up with your email and password. No credit card required to begin.</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>2</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Add Your Child's Profile</Text>
                    <Text style={styles.timelineText}>Create a learner profile with your child's grade level and interests.</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>3</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Start Learning Together</Text>
                    <Text style={styles.timelineText}>Access personalized lessons instantly. Track progress and achievements through your dashboard.</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <View style={styles.sectionContainer}>
            <View style={styles.footerContent}>
              <Text style={styles.footerTitle}>SUNSCHOOL</Text>
              <Text style={styles.footerSubtitle}>AI-powered learning where parents own the prompt</Text>
              
              <View style={styles.footerLinks}>
                <TouchableOpacity 
                  onPress={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/privacy';
                    }
                  }}
                  style={styles.footerLink}
                >
                  <Text style={styles.footerLinkText}>Privacy Policy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/terms';
                    }
                  }}
                  style={styles.footerLink}
                >
                  <Text style={styles.footerLinkText}>Terms of Service</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => {
                    if (typeof window !== 'undefined') {
                      window.open('mailto:info@sunschool.xyz');
                    }
                  }}
                  style={styles.footerLink}
                >
                  <Text style={styles.footerLinkText}>Contact</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.footerCopyright}>
                © 2025 SUNSCHOOL. Open source education for all.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Base layout
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  
  // Modern Navbar
  navbar: {
    width: '100%',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 100,
  },
  navbarInner: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPill: {
    height: 36,
    backgroundColor: '#121212', 
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 10,
    letterSpacing: 1,
  },
  logoTextPill: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLink: {
    marginHorizontal: 16,
  },
  navLinkText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  navButton: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginLeft: 16,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Reusable section styles
  section: {
    width: '100%',
    paddingVertical: windowWidth < 768 ? 40 : 60,
    paddingHorizontal: 16,
  },
  sectionInner: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    padding: 20,
  },
  
  // Hero section with black background
  heroSection: {
    backgroundColor: '#121212',
    minHeight: windowWidth < 768 ? 800 : 650,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  
  // Hero Layout
  heroLayout: {
    width: '100%',
    flexDirection: windowWidth < 1024 ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: windowWidth < 768 ? 30 : 60,
  },
  heroTextContent: {
    flex: windowWidth < 1024 ? 0 : 1,
    width: '100%',
    maxWidth: 540,
    marginBottom: windowWidth < 1024 ? 40 : 0,
  },
  heroTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: windowWidth < 768 ? 36 : 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: windowWidth < 768 ? 44 : 56,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: windowWidth < 768 ? 18 : 20,
    lineHeight: windowWidth < 768 ? 26 : 30,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
  },
  
  // Benefits with iconography
  heroBenefits: {
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  // Hero CTAs
  heroCta: {
    flexDirection: windowWidth < 480 ? 'column' : 'row',
    alignItems: windowWidth < 480 ? 'flex-start' : 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  outlineButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  
  // Hero Image Container
  heroImageContainer: {
    flex: windowWidth < 1024 ? 0 : 1,
    width: '100%',
    maxWidth: 540,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: windowWidth < 768 ? 30 : 0,
    marginBottom: windowWidth < 768 ? 40 : 0,
  },
  imageWrapper: {
    width: '100%',
    height: windowWidth < 768 ? 260 : 380,
    position: 'relative',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 3,
  },
  
  // Features section
  featuresSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#000000',
    marginTop: 8,
  },
  lightText: {
    color: '#FFFFFF',
  },
  lightUnderline: {
    backgroundColor: '#FFFFFF',
  },
  
  // Audience sections
  audienceSection: {
    marginBottom: 60,
  },
  audienceTitleContainer: {
    marginBottom: 30,
  },
  audienceTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  
  // Feature cards
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 24,
  },
  featureCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    padding: 24,
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#707070',
  },
  
  // How it works section
  howItWorksSection: {
    backgroundColor: '#121212',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  processSection: {
    marginBottom: 40,
  },
  processSectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  
  // Timeline components
  timelineContainer: {
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  timelineBullet: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  timelineNumber: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  gap20: {
    gap: 20,
  },
  gap40: {
    gap: 40,
  },
  
  // Open vs Closed section styles
  openVsClosedSection: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: '#666666',
    textAlign: 'center',
  },
  comparisonContainer: {
    flexDirection: windowWidth < 768 ? 'column' : 'row',
    justifyContent: 'space-between',
    gap: 32,
    maxWidth: 1000,
    marginHorizontal: 'auto',
  },
  closedSystemCard: {
    flex: 1,
    minWidth: windowWidth < 768 ? '100%' : 300,
    backgroundColor: '#fff5f5',
    padding: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  openSystemCard: {
    flex: 1,
    minWidth: windowWidth < 768 ? '100%' : 300,
    backgroundColor: '#f0fdf4',
    padding: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000000',
  },
  comparisonList: {
    gap: 8,
  },
  comparisonItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    marginBottom: 4,
  },
  
  // Footer styles
  footerSection: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerContent: {
    alignItems: 'center',
    maxWidth: 600,
    marginHorizontal: 'auto',
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: windowWidth < 480 ? 'column' : 'row',
    alignItems: 'center',
    gap: windowWidth < 480 ? 16 : 32,
    marginBottom: 24,
  },
  footerLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerLinkText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footerCopyright: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default WelcomePage;
