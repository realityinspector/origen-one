import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Link, useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { colors, typography } from '../styles/theme';
import { GitHub, BookOpen, Star, CheckCircle, Users, Award, BarChart2, ExternalLink, Sun, Wifi } from 'react-feather';

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
                  <img 
                    src="/images/sunschool-logo.png" 
                    style={{width: 120, height: 'auto', marginBottom: 15}}
                    alt="SUNSCHOOL Logo"
                  />
                </View>
                
                <Text style={styles.heroTitle}>SUNSCHOOL by AOT LABS</Text>
                
                <Text style={styles.heroSubtitle}>
                  AI-powered learning. Built into every AOT space.
                </Text>
                
                <Text style={styles.heroSubtitle}>
                  School...anywhere under the sun.
                </Text>
                
                {/* Benefits List */}
                <View style={styles.benefitsList}>
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={14} color={colors.onPrimary} />
                    </View>
                    <Text style={styles.benefitText}>Solar Powered - Runs off-grid in barns, lodges, or yurts</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={14} color={colors.onPrimary} />
                    </View>
                    <Text style={styles.benefitText}>Satellite Connected- AI learning anywhere</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <View style={styles.benefitIcon}>
                      <CheckCircle size={14} color={colors.onPrimary} />
                    </View>
                    <Text style={styles.benefitText}>Open-Source, Device-Friendly - Works on any device</Text>
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
                <img 
                  src="/images/sunschool-artboard@2x.png" 
                  style={{
                    width: 300, 
                    height: 'auto', 
                    objectFit: 'contain',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  alt="SUNSCHOOL Solar & Satellite powered learning"
                />
              </View>
            </View>
          </View>
        </View>
        
        {/* Features Section */}
        <View style={[styles.section, styles.featuresSection]}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What's Origen™?</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            <Text style={{...typography.body1, fontSize: 18, textAlign: 'center', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40}}>
              Origen™ is the open-source AI tutor at the heart of SUNSCHOOL. It's not just edtech—it's the learning layer inside AOT, syncing seamlessly between learning goals and lived experience.
            </Text>
            
            <View style={[styles.row, styles.spaceBetween]}>
              {/* Feature Cards */}
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Award size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Adaptive AI Lessons</Text>
                <Text style={styles.featureDescription}>
                  Personalized by pace, age, and interest - helps each learner progress at their optimal level.
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Users size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Dual Interface</Text>
                <Text style={styles.featureDescription}>
                  "Learner mode" for kids, "Grown-up mode" for caregivers with parent dashboard and data sync capabilities.
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Star size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Interactive Knowledge Maps</Text>
                <Text style={styles.featureDescription}>
                  Visual representations that show kids how concepts connect and build upon each other.
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <BarChart2 size={24} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Game Mechanics + Badges</Text>
                <Text style={styles.featureDescription}>
                  Because learning should be joyful - achievement tracking makes progress rewarding and fun.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* How It Works Section */}
        <View style={[styles.section, styles.howItWorksSection]}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, styles.lightTitle]}>What Is SUNSCHOOL?</Text>
              <View style={[styles.titleUnderline, styles.lightUnderline]} />
            </View>
            
            <Text style={[styles.summaryText, {color: colors.onPrimary, marginBottom: 30}]}>
              A solar- and satellite-ready, device-agnostic software stack built to embed AI learning experiences into the heart of the All One Thing lifestyle.
            </Text>
            
            <View style={styles.timelineContainer}>
              {/* Timeline Items */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <Sun size={18} color={colors.onPrimary} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Solar Powered</Text>
                  <Text style={styles.timelineText}>
                    Runs off-grid in barns, lodges, or yurts - designed to work anywhere the sun shines.
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <Wifi size={18} color={colors.onPrimary} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Satellite Connected (Starlink-ready)</Text>
                  <Text style={styles.timelineText}>
                    Fast-enough-for-AI wherever you hold events, with minimal infrastructure requirements.
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <BookOpen size={18} color={colors.onPrimary} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Open-Source, Device-Friendly</Text>
                  <Text style={styles.timelineText}>
                    Works on Chromebooks, Raspberry Pi, Linux laptops - making education accessible on any device.
                  </Text>
                </View>
              </View>
              
              <View style={styles.timelineItem}>
                <View style={styles.timelineBullet}>
                  <Award size={18} color={colors.onPrimary} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Origen™ AI Learning Engine</Text>
                  <Text style={styles.timelineText}>
                    Personalized, intuitive, and community-compatible - the perfect companion for learning anywhere.
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
              <Text style={styles.sectionTitle}>Why SUNSCHOOL at AOT?</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            <Text style={[styles.summaryText, {marginBottom: 30}]}>
              Because our spaces are already schools.
            </Text>
            
            <View style={[styles.row, styles.gap24]}>
              {/* Testimonial Cards */}
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Text style={styles.testimonialQuote}>Sunset Sunday becomes science class</Text>
                </View>
                <View style={styles.testimonialBody}>
                  <Text style={styles.testimonialText}>
                    Natural learning environments turn everyday experiences into rich educational opportunities.
                  </Text>
                </View>
              </View>
              
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Text style={styles.testimonialQuote}>Bonfire storytelling becomes literature hour</Text>
                </View>
                <View style={styles.testimonialBody}>
                  <Text style={styles.testimonialText}>
                    Community experiences transform into engaging learning moments with SUNSCHOOL's adaptable platform.
                  </Text>
                </View>
              </View>
              
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Text style={styles.testimonialQuote}>Community cooking becomes chemistry</Text>
                </View>
                <View style={styles.testimonialBody}>
                  <Text style={styles.testimonialText}>
                    SUNSCHOOL gives founders a plug-and-play AI learning experience to integrate across all SUNSCHOOL pods, event tents, and lodge lounges.
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.solutionsSummary}>
              <Text style={styles.summaryText}>
                This is infrastructure for the new town square. Cowork. Colearn. Coexist.
                With SUNSCHOOL + Origen™, every AOT location becomes a micro-campus.
                Every retreat becomes a learning expedition. Every event, a chance to grow.
              </Text>
            </View>
          </View>
        </View>
        
        {/* CTA Section */}
        <View style={[styles.section, styles.ctaSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.ctaTitle}>What's Next?</Text>
            
            <View style={styles.ctaSteps}>
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <BookOpen size={20} color={colors.onPrimary} />
                </View>
                <Text style={styles.ctaStepText}>Producing a short video: "Anywhere the Sun Touches, A Child Can Learn."</Text>
              </View>
              
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <Star size={20} color={colors.onPrimary} />
                </View>
                <Text style={styles.ctaStepText}>Assembling a prototype kit (Origen + Chromebook + solar panel + Starlink Mini)</Text>
              </View>
              
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <Wifi size={20} color={colors.onPrimary} />
                </View>
                <Text style={styles.ctaStepText}>Tagging @Starlink on X and launching a public dev thread</Text>
              </View>
              
              <View style={styles.ctaStep}>
                <View style={styles.ctaStepCircle}>
                  <Award size={20} color={colors.onPrimary} />
                </View>
                <Text style={styles.ctaStepText}>Seeking microgrants and founder partners to pilot in 3+ AOT cities</Text>
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
                <Text style={styles.footerTitle}>SUNSCHOOL</Text>
                <Text style={styles.footerSubtitle}>Start where you are. Learn anywhere under the sun.</Text>
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
                <img 
                  src="/images/sunschool-logo.png" 
                  style={{width: 100, height: 'auto', marginBottom: 10}}
                  alt="SUNSCHOOL Logo"
                />
                <Text style={styles.footerCopyright}>© 2025 SUNSCHOOL by AOT LABS, powered by Origen™ technology</Text>
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