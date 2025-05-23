import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { colors, typography } from '../styles/theme';
import { GitHub, BookOpen, Eye, Shield, Users, Award, BarChart2, BookOpen as Book, Star, Menu, Grid, PlusCircle, ArrowRight, Compass } from 'react-feather';

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
              <Book size={24} color="#000000" />
              <Text style={styles.logoText}>ORIGEN</Text>
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
                  <Text style={styles.heroTagText}>INTUITIVE LEARNING</Text>
                </View>
                
                <Text style={styles.heroTitle}>
                  The Learning Experience Your Child Deserves
                </Text>
                
                <Text style={styles.heroSubtitle}>
                  AI-powered education tailored to each child's unique learning style and pace
                </Text>
                
                {/* Hero Benefits with Iconography */}
                <View style={styles.heroBenefits}>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <Compass size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.benefitText}>Personalized learning paths</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <Grid size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.benefitText}>Interactive lessons and quizzes</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <BarChart2 size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.benefitText}>Real-time progress tracking</Text>
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
                  <svg width="100%" height="100%" viewBox="0 0 400 400">
                    {/* Background shapes */}
                    <rect x="50" y="50" width="300" height="300" fill="#000000" opacity="0.03" />
                    <rect x="70" y="70" width="260" height="260" fill="#000000" opacity="0.05" />
                    
                    {/* Grid pattern */}
                    <pattern id="grid" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="20" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
                    </pattern>
                    <rect x="20" y="20" width="360" height="360" fill="url(#grid)" />
                    
                    {/* Main circular element */}
                    <circle cx="200" cy="200" r="120" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                    
                    {/* Brain network visualization */}
                    <path 
                      d="M200,110 C270,110 290,160 290,200 C290,270 240,290 200,290 C130,290 110,240 110,200 C110,130 160,110 200,110 Z" 
                      fill="none" 
                      stroke="#000000" 
                      strokeWidth="2"
                      opacity="0.8"
                    />

                    {/* Connection nodes */}
                    <circle cx="200" cy="130" r="8" fill="#000000" />
                    <circle cx="150" cy="170" r="8" fill="#000000" />
                    <circle cx="250" cy="170" r="8" fill="#000000" />
                    <circle cx="170" cy="230" r="8" fill="#000000" />
                    <circle cx="230" cy="230" r="8" fill="#000000" />
                    <circle cx="200" cy="200" r="12" fill="#000000" />

                    {/* Connection lines */}
                    <line x1="200" y1="130" x2="150" y2="170" stroke="#000000" strokeWidth="1.5" />
                    <line x1="200" y1="130" x2="250" y2="170" stroke="#000000" strokeWidth="1.5" />
                    <line x1="200" y1="130" x2="200" y2="200" stroke="#000000" strokeWidth="1.5" />
                    <line x1="150" y1="170" x2="170" y2="230" stroke="#000000" strokeWidth="1.5" />
                    <line x1="250" y1="170" x2="230" y2="230" stroke="#000000" strokeWidth="1.5" />
                    <line x1="200" y1="200" x2="170" y2="230" stroke="#000000" strokeWidth="1.5" />
                    <line x1="200" y1="200" x2="230" y2="230" stroke="#000000" strokeWidth="1.5" />
                    <line x1="150" y1="170" x2="200" y2="200" stroke="#000000" strokeWidth="1.5" />
                    <line x1="250" y1="170" x2="200" y2="200" stroke="#000000" strokeWidth="1.5" />
                    
                    {/* Abstract book icon */}
                    <rect x="185" y="193" width="30" height="20" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
                    <line x1="200" y1="193" x2="200" y2="213" stroke="#000000" strokeWidth="0.75" />
                  </svg>
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
                  <Text style={styles.featureTitle}>Effortless Account Management</Text>
                  <Text style={styles.featureDescription}>
                    Create separate profiles for each child without multiple passwords. Children's accounts link directly to yours.
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
    position: 'sticky',
    top: 0,
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
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 10,
    letterSpacing: 1,
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
    minHeight: 600,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  
  // Hero Layout
  heroLayout: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
  },
  heroTextContent: {
    flex: 1,
    minWidth: 300,
    maxWidth: 600,
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
    flex: 1,
    minWidth: 300,
    maxWidth: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 400,
    position: 'relative',
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
});

export default WelcomePage;
