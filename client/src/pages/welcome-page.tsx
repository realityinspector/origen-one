import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Linking, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { colors, typography, commonStyles, animations } from '../styles/theme';
import { GitHub, BookOpen, Eye, Shield, Users, Award, ExternalLink, BarChart2, BookOpen as Book, Star, Menu, Grid, PlusCircle, ArrowRight, Compass } from 'react-feather';

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
    <ScrollView style={newStyles.scrollView}>
      <View style={newStyles.container}>
        {/* Modern Navbar with Logo */}
        <View style={newStyles.navbar}>
          <View style={newStyles.navbarInner}>
            <View style={newStyles.logoContainer}>
              <Book size={24} color="#000000" />
              <Text style={newStyles.logoText}>ORIGEN</Text>
            </View>
            <View style={newStyles.navLinks}>
              <TouchableOpacity style={newStyles.navLink}>
                <Text style={newStyles.navLinkText}>Features</Text>
              </TouchableOpacity>
              <TouchableOpacity style={newStyles.navLink}>
                <Text style={newStyles.navLinkText}>How It Works</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={newStyles.navButton}
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/auth';
                  }
                }}
              >
                <Text style={newStyles.navButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      
        {/* Modern Hero Section */}
        <View style={newStyles.heroSection}>
          <View style={newStyles.sectionInner}>
            <View style={newStyles.heroLayout}>
              {/* Hero Text Content */}
              <View style={newStyles.heroTextContent}>
                <View style={newStyles.heroTagBadge}>
                  <Star size={14} color="#FFFFFF" />
                  <Text style={newStyles.heroTagText}>INTUITIVE LEARNING</Text>
                </View>
                
                <Text style={newStyles.heroTitle}>
                  The Learning Experience Your Child Deserves
                </Text>
                
                <Text style={newStyles.heroSubtitle}>
                  AI-powered education tailored to each child's unique learning style and pace
                </Text>
                
                {/* Hero Benefits with Iconography */}
                <View style={newStyles.heroBenefits}>
                  <View style={newStyles.benefitItem}>
                    <View style={newStyles.benefitIcon}>
                      <Compass size={16} color="#FFFFFF" />
                    </View>
                    <Text style={newStyles.benefitText}>Personalized learning paths</Text>
                  </View>
                  
                  <View style={newStyles.benefitItem}>
                    <View style={newStyles.benefitIcon}>
                      <Grid size={16} color="#FFFFFF" />
                    </View>
                    <Text style={newStyles.benefitText}>Interactive lessons and quizzes</Text>
                  </View>
                  
                  <View style={newStyles.benefitItem}>
                    <View style={newStyles.benefitIcon}>
                      <BarChart2 size={16} color="#FFFFFF" />
                    </View>
                    <Text style={newStyles.benefitText}>Real-time progress tracking</Text>
                  </View>
                </View>
                
                {/* CTAs */}
                <View style={newStyles.heroCta}>
                  <TouchableOpacity 
                    style={newStyles.primaryButton} 
                    onPress={() => {
                      console.log("GET STARTED button clicked, navigating to /auth");
                      if (typeof window !== 'undefined') {
                        window.location.href = '/auth';
                      }
                    }}
                  >
                    <Text style={newStyles.primaryButtonText}>GET STARTED</Text>
                    <ArrowRight size={16} color="#000000" style={{marginLeft: 8}} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={newStyles.outlineButton} onPress={openGitHub}>
                    <GitHub size={18} color="#FFFFFF" />
                    <Text style={newStyles.outlineButtonText}>GITHUB</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Hero Image Container */}
              <View style={newStyles.heroImageContainer}>
                <View style={newStyles.imageWrapper}>
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
                    <Eye size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Real-time Learning Journey</Text>
                  <Text style={styles.featureDescription}>
                    Watch your child's progress as it happens. Get detailed insights into strengths and areas that need improvement. Receive notifications for achievements and milestones.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Users size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Effortless Account Management</Text>
                  <Text style={styles.featureDescription}>
                    Create separate profiles for each child without multiple passwords. Children's accounts link directly to yours with seamless switching between parent and learner views.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <BarChart2 size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Beautiful Progress Tracking</Text>
                  <Text style={styles.featureDescription}>
                    View intuitive visual reports of your child's learning journey. Easily track improvement across various subjects and identify areas where your child might need extra support.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Shield size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Seamless Multi-device Access</Text>
                  <Text style={styles.featureDescription}>
                    Use Origen on any device with automatic data synchronization. Your child can start on a tablet and continue on a computer with no interruption to their learning flow.
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
                    <Award size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Learning That Feels Like Play</Text>
                  <Text style={styles.featureDescription}>
                    Enjoy interactive lessons that adapt to your unique learning style. Discover knowledge through engaging visuals and fun activities with rewards that encourage exploration.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <BookOpen size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Made Just For You</Text>
                  <Text style={styles.featureDescription}>
                    Experience content that automatically adjusts to your grade level. Lessons intelligently build on what you've already learned as difficulty increases with your growing skills.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Eye size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Explore What Interests You</Text>
                  <Text style={styles.featureDescription}>
                    Begin with core subjects and add custom topics based on what fascinates you. See how different subjects connect through visual knowledge maps that grow with your learning.
                  </Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Award size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>Celebrate Your Progress</Text>
                  <Text style={styles.featureDescription}>
                    Collect badges and rewards as you complete lessons. Watch your progress grow with colorful visual indicators that help build confidence through consistent improvement.
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
              <Text style={[styles.processSectionTitle, styles.lightText]}>Getting Started Is Easy</Text>
              
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
                    <Text style={styles.timelineTitle}>Add Your Children</Text>
                    <Text style={styles.timelineText}>Create profiles for each child with just their name and grade level. No separate accounts or passwords needed for children.</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>3</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Start Learning</Text>
                    <Text style={styles.timelineText}>Switch to Learner View to preview the experience. Choose subjects that interest your child and watch as our AI creates personalized content.</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Daily Learning Section */}
            <View style={styles.processSection}>
              <Text style={[styles.processSectionTitle, styles.lightText]}>Daily Learning Made Simple</Text>
              
              <View style={styles.timelineContainer}>
                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>1</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Choose a Subject</Text>
                    <Text style={styles.timelineText}>Select from recommended subjects or explore new ones based on interests. All content is age-appropriate and engaging.</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>2</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Complete Interactive Lessons</Text>
                    <Text style={styles.timelineText}>Engage with multimedia content designed to be both educational and entertaining. Receive immediate feedback as you learn.</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>3</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Build Knowledge Connections</Text>
                    <Text style={styles.timelineText}>Visualize how different topics connect through our Knowledge Graph and see your learning journey expand across subjects.</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineBullet}>
                    <Text style={styles.timelineNumber}>4</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Track Progress Together</Text>
                    <Text style={styles.timelineText}>Parents can easily review completed lessons and celebrate achievements with their children, identifying new learning opportunities.</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Real Solutions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Real Solutions for Modern Families</Text>
            <View style={styles.sectionTitleUnderline} />
          </View>
          
          <View style={styles.testimonialsWrapper}>
            <View style={styles.solutionsGrid}>
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialQuoteContainer}>
                  <Text style={styles.testimonialQuote}>"I don't have time to research educational content for three different grade levels."</Text>
                </View>
                <View style={styles.testimonialSolution}>
                  <Text style={styles.testimonialSolutionText}>
                    Origen automatically generates grade-appropriate content for each child, saving you hours of research and planning.
                  </Text>
                </View>
              </View>

              <View style={styles.testimonialCard}>
                <View style={styles.testimonialQuoteContainer}>
                  <Text style={styles.testimonialQuote}>"My child loses interest in traditional learning apps after a few days."</Text>
                </View>
                <View style={styles.testimonialSolution}>
                  <Text style={styles.testimonialSolutionText}>
                    Our AI creates fresh, engaging content that adapts to your child's interests, keeping learning exciting day after day.
                  </Text>
                </View>
              </View>

              <View style={styles.testimonialCard}>
                <View style={styles.testimonialQuoteContainer}>
                  <Text style={styles.testimonialQuote}>"My child is struggling with certain concepts and needs more support."</Text>
                </View>
                <View style={styles.testimonialSolution}>
                  <Text style={styles.testimonialSolutionText}>
                    Origen identifies areas where your child needs help and provides additional practice and explanations tailored to their learning style.
                  </Text>
                </View>
              </View>

              <View style={styles.testimonialCard}>
                <View style={styles.testimonialQuoteContainer}>
                  <Text style={styles.testimonialQuote}>"The standard curriculum isn't challenging enough for my child."</Text>
                </View>
                <View style={styles.testimonialSolution}>
                  <Text style={styles.testimonialSolutionText}>
                    Our platform recognizes when your child masters concepts quickly and automatically increases difficulty to keep them engaged and growing.
                  </Text>
                </View>
              </View>
              
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialQuoteContainer}>
                  <Text style={styles.testimonialQuote}>"We're always on the move and need learning that works anywhere."</Text>
                </View>
                <View style={styles.testimonialSolution}>
                  <Text style={styles.testimonialSolutionText}>
                    Access Origen on any device, anytime, with progress synced automatically across all platforms.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.solutionsSummaryContainer}>
            <Text style={styles.solutionsSummaryText}>
              Origen isn't just another learning app—it's a complete educational partner that grows with your family. 
              Our AI technology creates a truly personalized experience that makes learning a joy rather than a chore.
            </Text>
          </View>
        </View>

        {/* Enhanced CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaContainer}>
            <View style={styles.ctaContentWrapper}>
              <Text style={styles.ctaTitle}>Start Your Child's Learning Journey Today</Text>
              
              <View style={styles.ctaStepsContainer}>
                <View style={styles.ctaStepItem}>
                  <View style={styles.ctaStepNumber}>
                    <Text style={styles.ctaStepNumberText}>1</Text>
                  </View>
                  <Text style={styles.ctaStepText}>Create your account</Text>
                </View>
                <View style={styles.ctaStepItem}>
                  <View style={styles.ctaStepNumber}>
                    <Text style={styles.ctaStepNumberText}>2</Text>
                  </View>
                  <Text style={styles.ctaStepText}>Add your child's profile</Text>
                </View>
                <View style={styles.ctaStepItem}>
                  <View style={styles.ctaStepNumber}>
                    <Text style={styles.ctaStepNumberText}>3</Text>
                  </View>
                  <Text style={styles.ctaStepText}>Explore subjects together</Text>
                </View>
                <View style={styles.ctaStepItem}>
                  <View style={styles.ctaStepNumber}>
                    <Text style={styles.ctaStepNumberText}>4</Text>
                  </View>
                  <Text style={styles.ctaStepText}>Watch personalized learning unfold</Text>
                </View>
              </View>
              
              <View style={styles.ctaButtonWrapper}>
                <TouchableOpacity 
                  style={styles.ctaButtonLarge}
                  onPress={() => {
                    console.log("Get Started button clicked, navigating to /auth");
                    if (typeof window !== 'undefined') {
                      window.location.href = '/auth';
                    }
                  }}
                >
                  <Text style={styles.ctaButtonText}>Get Started Free</Text>
                </TouchableOpacity>
                <Text style={styles.ctaSubtext}>No credit card required • Set up in minutes</Text>
              </View>
              
              <Text style={styles.ctaSupport}>Have questions? We're here to help at <Text style={styles.ctaSupportLink}>support@origen.edu</Text></Text>
            </View>
          </View>
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

// Define modern, cleanly separated styles for the Welcome Page
const newStyles = StyleSheet.create({
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
  gap20: {
    gap: 20,
  },
  gap40: {
    gap: 40,
  },
  
  // Badge and icon styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 1,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: colors.onPrimary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.onPrimary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  outlineButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Benefits list
  benefitsList: {
    marginTop: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    width: 24, 
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onPrimary,
  },
  
  // Feature cards
  featureCard: {
    width: windowWidth < 768 ? '100%' : windowWidth < 1024 ? '45%' : '22%',
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  
  // Section headers
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: windowWidth < 768 ? 28 : 36,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  lightTitle: {
    color: colors.onPrimary,
  },
  lightUnderline: {
    backgroundColor: colors.onPrimary,
  },
  
  // Timeline process
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  timelineBullet: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  timelineNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onPrimary,
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onPrimary + 'DD',
  },
  
  // Testimonial/solutions cards
  testimonialCard: {
    flex: 1,
    minWidth: windowWidth < 768 ? '100%' : 300,
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    overflow: 'hidden',
  },
  testimonialHeader: {
    backgroundColor: colors.primaryLight + '20',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  testimonialQuote: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    color: colors.primary,
    lineHeight: 24,
  },
  testimonialBody: {
    padding: 24,
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  
  // CTA section
  ctaSection: {
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 32,
    textAlign: 'center',
  },
  ctaSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: windowWidth < 768 ? 20 : 40,
  },
  ctaStep: {
    alignItems: 'center',
    width: windowWidth < 768 ? '40%' : 'auto',
    marginBottom: 16,
  },
  ctaStepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaStepNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  ctaStepText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    backgroundColor: colors.primaryDark,
    padding: 32,
  }
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Features section styles
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
  
  // Legacy compatibility styles
  heroFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  heroTextContent: {
    flex: 1,
  },
  brandBadge: {
    flexDirection: 'row',
  },
  brandBadgeText: {
    color: '#ffffff',
  },
  heroTitle: {
    fontSize: 32,
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#ffffff',
  },
  heroBenefits: {
    marginTop: 16,
  },
  benefitItem: {
    flexDirection: 'row',
  },
  benefitIcon: {
    width: 24,
    height: 24,
  },
  benefitText: {
    fontSize: 16,
    color: '#ffffff',
  },
  heroCta: {
    flexDirection: 'row',
  },
  ctaButton: {
    backgroundColor: '#ffffff',
  },
  ctaButtonText: {
    color: '#000000',
  },
  githubButton: {
    flexDirection: 'row',
  },
  githubButtonText: {
    color: '#ffffff',
  },
  heroGraphicContainer: {
    flex: 1,
  },
  graphicWrapper: {
    position: 'relative',
  },
});
  },
  heroContent: {
    width: '100%',
  },
  heroFlex: {
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
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  brandBadgeText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: windowWidth < 768 ? 32 : 42,
    fontWeight: '700',
    color: colors.onPrimary,
    marginBottom: 20,
    lineHeight: windowWidth < 768 ? 40 : 52,
  },
  heroSubtitle: {
    fontSize: windowWidth < 768 ? 18 : 20,
    lineHeight: windowWidth < 768 ? 26 : 30,
    color: colors.onPrimary + 'DD',
    marginBottom: 24,
  },
  heroBenefits: {
    marginTop: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    width: 24, 
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onPrimary,
  },
  heroCta: {
    flexDirection: windowWidth < 480 ? 'column' : 'row',
    alignItems: windowWidth < 480 ? 'flex-start' : 'center',
    gap: 16,
  },
  ctaButton: {
    backgroundColor: colors.onPrimary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 2,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  ctaButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.onPrimary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  githubButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  heroGraphicContainer: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphicWrapper: {
    position: 'relative',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Features Section
  featuresSection: {
    padding: 60,
    backgroundColor: colors.background,
  },
  sectionContainer: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
    padding: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: windowWidth < 768 ? 28 : 36,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitleUnderline: {
    width: 80,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  lightText: {
    color: colors.onPrimary,
  },
  lightUnderline: {
    backgroundColor: colors.onPrimary,
  },
  audienceSection: {
    marginBottom: 60,
  },
  audienceTitleContainer: {
    marginBottom: 24,
  },
  audienceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -12,
  },
  featureCard: {
    width: windowWidth < 768 ? '100%' : windowWidth < 1024 ? '50%' : '25%',
    padding: 12,
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  
  // How It Works Section
  howItWorksSection: {
    backgroundColor: colors.primary,
    backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    padding: 60,
  },
  processSection: {
    marginBottom: 48,
  },
  processSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onPrimary,
    marginBottom: 32,
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
    position: 'relative',
    zIndex: 1,
  },
  timelineBullet: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  timelineNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
    paddingRight: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onPrimary,
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onPrimary + 'DD',
  },
  
  // Testimonials/Solutions Section
  testimonialSection: {
    backgroundColor: colors.background,
    padding: 60,
  },
  testimonialsWrapper: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
  },
  solutionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 40,
  },
  testimonialCard: {
    flex: 1,
    minWidth: windowWidth < 768 ? '100%' : 300,
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)',
  },
  testimonialQuoteContainer: {
    backgroundColor: colors.primaryLight + '20',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  testimonialQuote: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    color: colors.primary,
    lineHeight: 24,
  },
  testimonialSolution: {
    padding: 24,
  },
  testimonialSolutionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  solutionsSummaryContainer: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    marginTop: 40,
    textAlign: 'center',
  },
  solutionsSummaryText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  // Enhanced CTA Section
  ctaSection: {
    backgroundColor: colors.primaryLight + '20',
    padding: 60,
  },
  ctaContainer: {
    maxWidth: 900,
    marginHorizontal: 'auto',
  },
  ctaContentWrapper: {
    alignItems: 'center',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 32,
    textAlign: 'center',
  },
  ctaStepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: windowWidth < 768 ? 20 : 40,
  },
  ctaStepItem: {
    alignItems: 'center',
    width: windowWidth < 768 ? '40%' : 'auto',
    marginBottom: 16,
  },
  ctaStepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaStepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  ctaStepText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  ctaButtonWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaButtonLarge: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  },
  ctaSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  ctaSupport: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 24,
  },
  ctaSupportLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Footer
  footer: {
    backgroundColor: colors.primaryDark,
    padding: 32,
  },
  footerContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  footerTop: {
    flexDirection: windowWidth < 768 ? 'column' : 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  footerMainInfo: {
    marginBottom: windowWidth < 768 ? 32 : 0,
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onPrimary,
    marginBottom: 8,
  },
  footerSubtitle: {
    fontSize: 16,
    color: colors.onPrimary + 'AA',
    marginBottom: 24,
  },
  footerLinks: {
    marginTop: 16,
  },
  footerLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLinkText: {
    fontSize: 16,
    color: colors.onPrimary + 'DD',
    marginLeft: 10,
  },
  footerLogoSection: {
    alignItems: windowWidth < 768 ? 'flex-start' : 'flex-end',
  },
  footerLogoContainer: {
    alignItems: 'center',
  },
  // Legacy styles kept for compatibility
  section: {
    padding: 32,
    alignItems: 'center',
  },
  solutionsContainer: {
    width: '100%',
    maxWidth: 1200,
  },
  howItWorks: {
    backgroundColor: colors.primary,
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
    ...typography.subtitle2,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  heroTagline: {
    ...typography.subtitle2,
    color: colors.textSecondary,
    marginBottom: 8,
    maxWidth: 600,
  },
  heroDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 20,
    maxWidth: 600,
    lineHeight: 22,
  },
  heroPhilosophy: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 24,
    maxWidth: 600,
    lineHeight: 22,
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
  subSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 20,
    color: colors.textPrimary,
    textAlign: 'left',
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
  ctaSteps: {
    marginBottom: 30,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  ctaStep: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSupport: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  solutionsContainer: {
    width: '100%',
    maxWidth: 800,
    marginVertical: 20,
    alignSelf: 'center',
  },
  solutionItem: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  solutionProblem: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  solutionAnswer: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  solutionsConclusion: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 700,
    marginTop: 20,
    marginHorizontal: 'auto',
    color: colors.textSecondary,
    paddingHorizontal: 20,
  },
});

export default WelcomePage;