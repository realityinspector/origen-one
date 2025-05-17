import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { colors, typography } from '../styles/theme';
import { GitHub, BookOpen, Star, CheckCircle, Users, Award, BarChart2, ExternalLink } from 'react-feather';

// Get screen dimensions for responsive design
const windowWidth = Dimensions.get('window').width;

const WelcomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : location;

  // Add debug output
  console.log("WelcomePage: Checking auth status", { 
    wouterPath: location,
    windowPath: typeof window !== 'undefined' ? window.location.pathname : 'not available', 
    isAuthenticated: !!user, 
    isLoading: isLoading
  });

  // Redirect authenticated users
  if (user && !isLoading && (location === '/welcome' || currentPath === '/welcome')) {
    console.log("WelcomePage: Redirecting authenticated user to dashboard");
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    return <Redirect to="/dashboard" />;
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.sectionInner}>
            <View style={[styles.row, styles.spaceBetween, styles.gap40]}>
              {/* Hero Text Content */}
              <View style={styles.heroText}>
                <View style={styles.badge}>
                  <BookOpen size={16} color={colors.onPrimary} />
                  <Text style={styles.badgeText}>ORIGEN™</Text>
                </View>
                
                <Text style={styles.heroTitle}>The Learning Experience Your Child Deserves</Text>
                
                <Text style={styles.heroSubtitle}>
                  AI-powered education tailored to each child's unique learning style and pace
                </Text>
                
                {/* Benefits List */}
                <View style={styles.benefitsList}>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={14} color={colors.onPrimary} />
                    </View>
                    <Text style={styles.benefitText}>Personalized learning paths</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={14} color={colors.onPrimary} />
                    </View>
                    <Text style={styles.benefitText}>Interactive lessons and quizzes</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={14} color={colors.onPrimary} />
                    </View>
                    <Text style={styles.benefitText}>Real-time progress tracking</Text>
                  </View>
                </View>
                
                {/* CTA Buttons */}
                <View style={[styles.row, styles.gap20]}>
                  <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/auth';
                      }
                    }}
                  >
                    <Text style={styles.primaryButtonText}>GET STARTED</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.outlineButton}
                    onPress={() => {
                      window.open('https://github.com/realityinspector/origen-one', '_blank');
                    }}
                  >
                    <GitHub size={18} color={colors.onPrimary} />
                    <Text style={styles.outlineButtonText}>VIEW ON GITHUB</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Hero Graphic */}
              <View style={styles.heroGraphic}>
                <View style={styles.graphicCircle}>
                  <Text style={styles.graphicText}>O</Text>
                </View>
                <View style={styles.graphicOrbit}>
                  {[...Array(3)].map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.orbitPoint,
                        { 
                          transform: [{ rotate: `${i * 120}deg` }],
                          backgroundColor: i === 0 
                            ? colors.accent1 
                            : i === 1 
                              ? colors.accent2 
                              : colors.accent3
                        }
                      ]} 
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Features Section */}
        <View style={[styles.section, styles.featuresSection]}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            <View style={[styles.row, styles.spaceBetween]}>
              {/* Feature Cards */}
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Award size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Adaptive Learning</Text>
                <Text style={styles.featureDescription}>
                  Our AI adapts to your child's learning pace and style, creating personalized learning experiences.
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Users size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Parent Dashboard</Text>
                <Text style={styles.featureDescription}>
                  Keep track of your child's progress and areas where they might need additional support.
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Star size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Interactive Content</Text>
                <Text style={styles.featureDescription}>
                  Engaging lessons and quizzes that make learning fun and interactive for all ages.
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <BarChart2 size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Progress Tracking</Text>
                <Text style={styles.featureDescription}>
                  Comprehensive analytics and reports to visualize your child's educational journey.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* How It Works Section */}
        <View style={[styles.section, styles.howItWorksSection]}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, styles.lightTitle]}>How It Works</Text>
              <View style={[styles.titleUnderline, styles.lightUnderline]} />
            </View>
            
            <View style={styles.timelineContainer}>
              {/* Timeline Items */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <Text style={styles.timelineNumber}>1</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Create Your Account</Text>
                  <Text style={styles.timelineText}>
                    Sign up as a parent or educator to access our platform and set up your child's profile.
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <Text style={styles.timelineNumber}>2</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Set Learning Goals</Text>
                  <Text style={styles.timelineText}>
                    Define your child's educational objectives and areas of focus you'd like to emphasize.
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <Text style={styles.timelineNumber}>3</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Start Learning</Text>
                  <Text style={styles.timelineText}>
                    Your child begins their personalized learning journey with interactive, AI-guided lessons.
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <Text style={styles.timelineNumber}>4</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Track Progress</Text>
                  <Text style={styles.timelineText}>
                    Monitor advancements and adjust learning paths based on real-time analytics and feedback.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Testimonials Section */}
        <View style={[styles.section, styles.solutionsSection]}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Real Solutions for Real Challenges</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            <View style={[styles.row, styles.gap24]}>
              {/* Testimonial Cards */}
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Text style={styles.testimonialQuote}>"My child was struggling to stay engaged with standard curriculum materials."</Text>
                </View>
                <View style={styles.testimonialBody}>
                  <Text style={styles.testimonialText}>
                    Our interactive, game-like lessons capture attention and maintain engagement through personalized content and rewards.
                  </Text>
                </View>
              </View>
              
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Text style={styles.testimonialQuote}>"The standard curriculum isn't challenging enough for my child."</Text>
                </View>
                <View style={styles.testimonialBody}>
                  <Text style={styles.testimonialText}>
                    Our platform recognizes when your child masters concepts quickly and automatically increases difficulty to keep them engaged and growing.
                  </Text>
                </View>
              </View>
              
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Text style={styles.testimonialQuote}>"We're always on the move and need learning that works anywhere."</Text>
                </View>
                <View style={styles.testimonialBody}>
                  <Text style={styles.testimonialText}>
                    Access Origen on any device, anytime, with progress synced automatically across all platforms.
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.solutionsSummary}>
              <Text style={styles.summaryText}>
                Origen isn't just another learning app—it's a complete educational partner that grows with your family. 
                Our AI technology creates a truly personalized experience that makes learning a joy rather than a chore.
              </Text>
            </View>
          </View>
        </View>
        
        {/* CTA Section */}
        <View style={[styles.section, styles.ctaSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.ctaTitle}>Start Your Child's Learning Journey Today</Text>
            
            <View style={styles.ctaSteps}>
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <Text style={styles.ctaStepNumber}>1</Text>
                </View>
                <Text style={styles.ctaStepText}>Create your account</Text>
              </View>
              
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <Text style={styles.ctaStepNumber}>2</Text>
                </View>
                <Text style={styles.ctaStepText}>Add your child's profile</Text>
              </View>
              
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <Text style={styles.ctaStepNumber}>3</Text>
                </View>
                <Text style={styles.ctaStepText}>Set learning goals</Text>
              </View>
              
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <Text style={styles.ctaStepNumber}>4</Text>
                </View>
                <Text style={styles.ctaStepText}>Watch your child thrive</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.primaryButton, styles.ctaMainButton]}
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/auth';
                }
              }}
            >
              <Text style={styles.primaryButtonText}>GET STARTED NOW</Text>
            </TouchableOpacity>
            
            <Text style={styles.ctaSubtext}>
              No credit card required. Free access to basic content.
            </Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.sectionInner}>
            <View style={[styles.row, styles.spaceBetween]}>
              <View style={styles.footerInfo}>
                <Text style={styles.footerTitle}>Origen</Text>
                <Text style={styles.footerSubtitle}>The future of personalized education</Text>
                <View style={styles.footerLinks}>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>About Us</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Contact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Terms of Service</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.footerLogo}>
                <View style={styles.footerLogoCircle}>
                  <Text style={styles.footerLogoText}>O</Text>
                </View>
                <Text style={styles.footerCopyright}>© 2025 Origen Learning</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Modern styles with improved spacing, typography, and color usage
const styles = StyleSheet.create({
  // Base layout
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  section: {
    width: '100%',
    paddingVertical: windowWidth < 768 ? 48 : 80,
    paddingHorizontal: 16,
  },
  sectionInner: {
    width: '100%',
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  gap20: {
    gap: 20,
  },
  gap24: {
    gap: 24,
  },
  gap40: {
    gap: 40,
  },
  
  // Hero section with gradient-like color
  heroSection: {
    backgroundColor: colors.primary,
    paddingVertical: 64,
    paddingHorizontal: 16,
    minHeight: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    minWidth: 300,
    maxWidth: 600,
  },
  heroTitle: {
    fontSize: windowWidth < 768 ? 36 : 48,
    fontWeight: '300', // Lighter weight for headline with strategic bold elements
    color: colors.onPrimary,
    marginBottom: 20,
    lineHeight: windowWidth < 768 ? 44 : 58,
  },
  heroSubtitle: {
    fontSize: windowWidth < 768 ? 18 : 20,
    lineHeight: windowWidth < 768 ? 28 : 32,
    color: 'rgba(255, 255, 255, 0.9)', // Slightly transparent for hierarchy
    marginBottom: 32,
    fontWeight: '400',
  },
  
  // Brand badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
  
  // Benefits list with icon-paired statements
  benefitsList: {
    marginTop: 24,
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 28, 
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  benefitText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.onPrimary,
    fontWeight: '500',
  },
  
  // Hero graphic
  heroGraphic: {
    position: 'relative',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphicCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
  },
  graphicText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.primary,
  },
  graphicOrbit: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  orbitPoint: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    top: -12,
    left: 128,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  // Button styles with hover effects
  primaryButton: {
    backgroundColor: colors.onPrimary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 2,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  outlineButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Features section
  featuresSection: {
    backgroundColor: colors.background,
    paddingTop: 80,
    paddingBottom: 80,
  },
  featureCard: {
    width: windowWidth < 768 ? '100%' : windowWidth < 1024 ? '48%' : '23%',
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  
  // Section headers
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: windowWidth < 768 ? 28 : 36,
    fontWeight: '300', // Lighter weight for modern look
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  lightTitle: {
    color: colors.onPrimary,
  },
  lightUnderline: {
    backgroundColor: colors.onPrimary,
  },
  
  // How It Works section with consistent color
  howItWorksSection: {
    backgroundColor: colors.primaryDark,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 40,
    position: 'relative',
  },
  timelineBullet: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  },
  timelineNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 6,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onPrimary,
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  
  // Solutions/Testimonials section
  solutionsSection: {
    backgroundColor: colors.background,
  },
  testimonialCard: {
    flex: 1,
    minWidth: windowWidth < 768 ? '100%' : 300,
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
  },
  testimonialHeader: {
    backgroundColor: colors.primaryLight + '15',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  testimonialQuote: {
    fontSize: 17,
    fontWeight: '600',
    fontStyle: 'italic',
    color: colors.primary,
    lineHeight: 26,
  },
  testimonialBody: {
    padding: 24,
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  solutionsSummary: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    marginTop: 48,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  // CTA section
  ctaSection: {
    backgroundColor: colors.primaryLight + '15',
    alignItems: 'center',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.textPrimary,
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 700,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  ctaSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 48,
    gap: windowWidth < 768 ? 20 : 40,
  },
  ctaStep: {
    alignItems: 'center',
    width: windowWidth < 768 ? '45%' : 'auto',
    marginBottom: 24,
  },
  ctaStepCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  },
  ctaStepNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  ctaStepText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaMainButton: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    marginBottom: 16,
  },
  ctaSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  
  // Footer
  footer: {
    backgroundColor: colors.primaryDark,
    padding: 48,
  },
  footerInfo: {
    flex: 1,
    minWidth: windowWidth < 768 ? '100%' : 300,
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
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
  footerLinks: {
    marginTop: 20,
  },
  footerLink: {
    marginBottom: 12,
  },
  footerLinkText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  footerLogo: {
    alignItems: 'center',
  },
  footerLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerLogoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  footerCopyright: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  }
});

export default WelcomePage;