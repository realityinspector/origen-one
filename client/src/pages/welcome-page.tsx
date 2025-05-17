import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, Linking, Image, TouchableOpacity } from 'react-native';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { colors, typography, commonStyles } from '../styles/theme';
import { GitHub, BookOpen, Eye, Shield, Users, Award, ExternalLink, BarChart2 } from 'react-feather';

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
                <Text style={styles.heroTitle}>ORIGEN™</Text>
                <Text style={styles.heroSubtitle}>Your Child's AI Learning Partner</Text>
                <Text style={styles.heroTagline}>Designed for Busy Parents and Curious Kids</Text>
                <Text style={styles.heroDescription}>
                  Welcome to Origen, the AI-powered learning platform that makes education fun, personalized, and effective for your children.
                </Text>
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
          <Text style={styles.sectionTitle}>What Origen Does for You and Your Family</Text>
          
          {/* For Parents Section */}
          <Text style={styles.subSectionTitle}>For Parents</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Eye size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>See Your Child's Learning Journey</Text>
              <Text style={styles.featureDescription}>
                Watch your child's progress in real-time. Get insights into strengths and areas needing improvement. 
                Receive regular updates on achievements and milestones.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Users size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Easy Account Management</Text>
              <Text style={styles.featureDescription}>
                Create separate profiles for each of your children. No need to remember multiple passwords - 
                children's accounts link directly to yours. Easily switch between parent view and learner view with one click.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <BarChart2 size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Simple Progress Tracking</Text>
              <Text style={styles.featureDescription}>
                Beautiful visual reports show exactly what your child is learning. Track improvement across 
                different subjects. Identify areas where your child might need extra support.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Shield size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Access Anywhere</Text>
              <Text style={styles.featureDescription}>
                Use Origen on any device - computer, tablet, or phone. Data syncs automatically 
                so you never lose progress. Optional backup to your own database for complete peace of mind.
              </Text>
            </View>
          </View>

          {/* For Learners Section */}
          <Text style={styles.subSectionTitle}>For Learners</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Award size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Learning That Feels Like Play</Text>
              <Text style={styles.featureDescription}>
                Interactive lessons that adapt to your child's learning style. Knowledge presented through 
                engaging visuals and activities. Achievement system that rewards progress and encourages exploration.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <BookOpen size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Personalized Learning Experience</Text>
              <Text style={styles.featureDescription}>
                Content adjusts to your child's grade level automatically. Lessons build on previous knowledge. 
                Difficulty increases gradually as skills improve.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Eye size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Explore Any Subject</Text>
              <Text style={styles.featureDescription}>
                Start with core subjects like Math, Reading, and Science. Add custom subjects based on your 
                child's interests. Visual knowledge maps show how different topics connect.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Award size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Celebrate Every Achievement</Text>
              <Text style={styles.featureDescription}>
                Earn badges and rewards for completing lessons. Track progress with visual indicators. 
                Build confidence through steady improvement.
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={[styles.section, styles.howItWorks]}>
          <Text style={[styles.sectionTitle, styles.lightText]}>How It Works</Text>
          
          {/* Getting Started Section */}
          <Text style={[styles.subSectionTitle, styles.lightText]}>Getting Started Is Easy</Text>
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
                <Text style={styles.timelineText}>Create profiles for each child. Just enter their name and grade level. No email or passwords needed for children's accounts.</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>3</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Start Learning</Text>
                <Text style={styles.timelineText}>Switch to Learner View to see what your child will experience. Choose subjects that interest your child. Watch as our AI creates personalized learning content.</Text>
              </View>
            </View>
          </View>
          
          {/* Daily Learning Section */}
          <Text style={[styles.subSectionTitle, styles.lightText]}>Daily Learning Made Simple</Text>
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>1</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Choose a Subject</Text>
                <Text style={styles.timelineText}>Select from recommended subjects or explore new ones. Each subject has age-appropriate content for your child.</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>2</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Complete Interactive Lessons</Text>
                <Text style={styles.timelineText}>Engage with multimedia content. Answer questions to check understanding. Receive immediate feedback and guidance.</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>3</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Build Knowledge Connections</Text>
                <Text style={styles.timelineText}>See how different topics connect through our Knowledge Graph. Add new topics and watch the connections grow. Visualize learning progress across subjects.</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineBullet}>
                <Text style={styles.timelineNumber}>4</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Track Progress Together</Text>
                <Text style={styles.timelineText}>Parents can review completed lessons and quiz results. Celebrate achievements together. Identify opportunities for additional support or challenges.</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Real Solutions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real Solutions for Real Families</Text>
          
          <View style={styles.solutionsContainer}>
            <View style={styles.solutionItem}>
              <Text style={styles.solutionProblem}>"I don't have time to research educational content for three different grade levels."</Text>
              <Text style={styles.solutionAnswer}>→ Origen automatically generates grade-appropriate content for each child, saving you hours of research and planning.</Text>
            </View>
            
            <View style={styles.solutionItem}>
              <Text style={styles.solutionProblem}>"My child loses interest in traditional learning apps after a few days."</Text>
              <Text style={styles.solutionAnswer}>→ Our AI creates fresh, engaging content that adapts to your child's interests, keeping learning exciting day after day.</Text>
            </View>
            
            <View style={styles.solutionItem}>
              <Text style={styles.solutionProblem}>"My child is struggling with certain concepts and needs more support."</Text>
              <Text style={styles.solutionAnswer}>→ Origen identifies areas where your child needs help and provides additional practice and explanations tailored to their learning style.</Text>
            </View>
            
            <View style={styles.solutionItem}>
              <Text style={styles.solutionProblem}>"The standard curriculum isn't challenging enough for my child."</Text>
              <Text style={styles.solutionAnswer}>→ Our platform recognizes when your child masters concepts quickly and automatically increases difficulty to keep them engaged and growing.</Text>
            </View>
            
            <View style={styles.solutionItem}>
              <Text style={styles.solutionProblem}>"We're always on the move and need learning that works anywhere."</Text>
              <Text style={styles.solutionAnswer}>→ Access Origen on any device, anytime, with progress synced automatically across all platforms.</Text>
            </View>
          </View>
          
          <Text style={styles.solutionsConclusion}>
            Origen isn't just another learning app—it's a complete educational partner that grows with your family. 
            Our AI technology creates a truly personalized experience that makes learning a joy rather than a chore.
          </Text>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Begin?</Text>
          <View style={styles.ctaSteps}>
            <Text style={styles.ctaStep}>1. Log in to your account</Text>
            <Text style={styles.ctaStep}>2. Add your first learner profile</Text>
            <Text style={styles.ctaStep}>3. Explore subjects together</Text>
            <Text style={styles.ctaStep}>4. Watch the magic of personalized learning unfold!</Text>
          </View>
          <TouchableOpacity 
            style={[styles.ctaButton, styles.ctaButtonLarge]}
            onPress={() => {
              console.log("Get Started button clicked, navigating to /auth");
              // Use both methods for navigation to ensure it works in all environments
              if (typeof window !== 'undefined') {
                window.location.href = '/auth';
              }
            }}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.ctaSupport}>Have questions? We're here to help at support@origen.edu</Text>
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