import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { GitHub, BookOpen, Eye, Shield, Users, Award, BarChart2, Star, ArrowRight, CheckCircle, Zap, Lock, Globe } from 'react-feather';

const windowWidth = Dimensions.get('window').width;

// Sunschool brand colors (from learnerColors)
const brand = {
  primary: '#4A90D9',
  primaryDark: '#2E6BB5',
  secondary: '#FF8C42',
  secondaryDark: '#E5732A',
  green: '#6BCB77',
  gold: '#FFD93D',
  purple: '#C084FC',
  bg: '#F8FAFF',
  text: '#2D3436',
  textLight: '#636E72',
  divider: '#DFE6E9',
  white: '#FFFFFF',
};

const WelcomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : location;

  if (user && !isLoading && (location === '/welcome' || currentPath === '/welcome')) {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    return <Redirect to="/dashboard" />;
  }

  const openGitHub = () => {
    Linking.openURL('https://github.com/realityinspector/sunschool');
  };

  const goToAuth = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>

        {/* ── Navbar ── */}
        <View style={styles.navbar}>
          <View style={styles.navInner}>
            <View style={styles.logoWrap}>
              <View style={styles.logoIcon}>
                <Text style={{ fontSize: 20 }}>&#9728;</Text>
              </View>
              <Text style={styles.logoText}>Sunschool</Text>
            </View>
            <View style={styles.navLinks}>
              {windowWidth >= 600 && (
                <>
                  <TouchableOpacity style={styles.navLink}>
                    <Text style={styles.navLinkText}>Features</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navLink}>
                    <Text style={styles.navLinkText}>How It Works</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={styles.navCta} onPress={goToAuth}>
                <Text style={styles.navCtaText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Where Learning{'\n'}Comes Alive</Text>
              <Text style={styles.heroSub}>
                AI-powered lessons that adapt to your child.{'\n'}Fun for kids. Peace of mind for parents.
              </Text>

              <View style={styles.heroBenefits}>
                {[
                  { icon: <Zap size={16} color={brand.gold} />, text: 'Personalized AI lessons for every learner' },
                  { icon: <Shield size={16} color={brand.green} />, text: 'Parents own the data and control the prompts' },
                  { icon: <Globe size={16} color={brand.purple} />, text: 'Open source, transparent, community-driven' },
                ].map((b, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <View style={styles.benefitIcon}>{b.icon}</View>
                    <Text style={styles.benefitText}>{b.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.heroCtas}>
                <TouchableOpacity style={styles.ctaPrimary} onPress={goToAuth}>
                  <Text style={styles.ctaPrimaryText}>Get Started Free</Text>
                  <ArrowRight size={16} color={brand.white} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaOutline} onPress={openGitHub}>
                  <GitHub size={16} color={brand.white} />
                  <Text style={styles.ctaOutlineText}>View on GitHub</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right side: abstract sun graphic */}
            {windowWidth >= 768 && (
              <View style={styles.heroRight}>
                <View style={styles.sunGraphic}>
                  <Text style={{ fontSize: 72 }}>&#9728;&#65039;</Text>
                  {/* Orbit dots */}
                  {[
                    { color: brand.secondary, top: 10, left: 100 },
                    { color: brand.green, top: 90, left: 150 },
                    { color: brand.purple, top: 160, left: 120 },
                    { color: brand.gold, top: 140, left: 30 },
                    { color: brand.primary, top: 50, left: 0 },
                  ].map((dot, i) => (
                    <View
                      key={i}
                      style={{
                        position: 'absolute',
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: dot.color,
                        top: dot.top,
                        left: dot.left,
                        opacity: 0.85,
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Trust Bar ── */}
        <View style={styles.trustBar}>
          <View style={styles.trustInner}>
            {[
              { icon: <Globe size={20} color={brand.primary} />, label: 'Open Source' },
              { icon: <BookOpen size={20} color={brand.secondary} />, label: 'K-12' },
              { icon: <Zap size={20} color={brand.gold} />, label: 'AI-Powered' },
              { icon: <Lock size={20} color={brand.green} />, label: 'Parent-Controlled' },
            ].map((item, i) => (
              <View key={i} style={styles.trustItem}>
                {item.icon}
                <Text style={styles.trustLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── For Kids Section ── */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Kids Love Learning with Sunschool</Text>
            <Text style={styles.sectionSub}>Interactive, personalized, and actually fun.</Text>

            <View style={styles.cardGrid}>
              {[
                { icon: <BookOpen size={28} color={brand.white} />, bg: brand.primary, title: 'Lessons Made for You', desc: 'AI adapts to your grade level, learning style, and pace. Every lesson feels just right.' },
                { icon: <Award size={28} color={brand.white} />, bg: brand.secondary, title: 'Fun Challenges', desc: 'Quizzes and activities that make learning feel like play, not homework.' },
                { icon: <Star size={28} color={brand.white} />, bg: brand.green, title: 'Earn Trophies', desc: 'Collect badges, unlock achievements, and celebrate every milestone.' },
                { icon: <BarChart2 size={28} color={brand.white} />, bg: brand.purple, title: 'Watch Yourself Grow', desc: 'See your knowledge grow on a visual map. Connect subjects and discover new interests.' },
              ].map((card, i) => (
                <View key={i} style={styles.featureCard}>
                  <View style={[styles.featureIconCircle, { backgroundColor: card.bg }]}>
                    {card.icon}
                  </View>
                  <Text style={styles.featureCardTitle}>{card.title}</Text>
                  <Text style={styles.featureCardDesc}>{card.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── For Parents Section ── */}
        <View style={styles.sectionTinted}>
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Parents Love the Control</Text>
            <Text style={styles.sectionSub}>Full visibility. Full ownership. Full peace of mind.</Text>

            <View style={styles.cardGrid}>
              {[
                { icon: <Eye size={28} color={brand.white} />, bg: brand.primary, title: 'Real-Time Progress', desc: 'Watch your child learn in real time. See strengths, gaps, and growth at a glance.' },
                { icon: <Shield size={28} color={brand.white} />, bg: brand.green, title: 'You Own the Data', desc: 'Your family\'s learning data stays yours. Export anytime, delete anytime.' },
                { icon: <Users size={28} color={brand.white} />, bg: brand.secondary, title: 'Multi-Child Support', desc: 'One parent account, unlimited learner profiles. Each child gets their own journey.' },
                { icon: <GitHub size={28} color={brand.white} />, bg: brand.text, title: 'Open Source & Transparent', desc: 'See exactly how the AI works. Contribute, audit, or self-host.' },
              ].map((card, i) => (
                <View key={i} style={styles.featureCard}>
                  <View style={[styles.featureIconCircle, { backgroundColor: card.bg }]}>
                    {card.icon}
                  </View>
                  <Text style={styles.featureCardTitle}>{card.title}</Text>
                  <Text style={styles.featureCardDesc}>{card.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── How It Works ── */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <Text style={styles.sectionSub}>Up and running in minutes.</Text>

            <View style={styles.stepsContainer}>
              {[
                { num: '1', color: brand.primary, title: 'Create Your Account', desc: 'Sign up with email and password. No credit card needed.' },
                { num: '2', color: brand.secondary, title: 'Add Your Child', desc: 'Create a learner profile with their grade level and interests.' },
                { num: '3', color: brand.green, title: 'Start Learning!', desc: 'Access personalized AI lessons instantly. Track progress from your dashboard.' },
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepCircle, { backgroundColor: step.color }]}>
                    <Text style={styles.stepNum}>{step.num}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Testimonial / Social Proof ── */}
        <View style={styles.sectionTinted}>
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>What Parents Are Saying</Text>
            <View style={styles.testimonialGrid}>
              {[
                { quote: 'My daughter actually asks to do her lessons now. The AI adapts perfectly to her pace.', name: 'Sarah M.', detail: 'Parent of a 3rd grader', color: brand.primary },
                { quote: 'I love that I can see exactly what the AI is teaching. Transparency matters to our family.', name: 'James T.', detail: 'Parent of 2 kids', color: brand.secondary },
                { quote: 'We travel full-time and Sunschool makes it possible to keep learning structured and fun.', name: 'Mia L.', detail: 'Homeschool parent', color: brand.green },
              ].map((t, i) => (
                <View key={i} style={[styles.testimonialCard, { borderLeftColor: t.color }]}>
                  <Text style={styles.testimonialQuote}>"{t.quote}"</Text>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <Text style={styles.testimonialDetail}>{t.detail}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Final CTA ── */}
        <View style={styles.finalCta}>
          <View style={styles.finalCtaInner}>
            <Text style={styles.finalCtaTitle}>Ready to Start Your Child's{'\n'}Learning Adventure?</Text>
            <TouchableOpacity style={styles.finalCtaButton} onPress={goToAuth}>
              <Text style={styles.finalCtaButtonText}>Get Started Free</Text>
              <ArrowRight size={18} color={brand.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <Text style={styles.finalCtaNote}>No credit card needed. Free forever for core features.</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <View style={styles.footerBrand}>
              <Text style={{ fontSize: 18 }}>&#9728;&#65039;</Text>
              <Text style={styles.footerLogo}>Sunschool</Text>
            </View>
            <Text style={styles.footerTagline}>AI-powered learning where parents own the prompt.</Text>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => { if (typeof window !== 'undefined') window.location.href = '/privacy'; }}>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (typeof window !== 'undefined') window.location.href = '/terms'; }}>
                <Text style={styles.footerLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openGitHub}>
                <Text style={styles.footerLinkText}>GitHub</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (typeof window !== 'undefined') window.open('mailto:info@sunschool.xyz'); }}>
                <Text style={styles.footerLinkText}>Contact</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerCopy}>&copy; 2025 Sunschool. Open source education for all.</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: brand.bg,
  },
  container: {
    flex: 1,
  },

  /* Navbar */
  navbar: {
    width: '100%',
    height: 70,
    backgroundColor: brand.white,
    borderBottomWidth: 1,
    borderBottomColor: brand.divider,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  navInner: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: brand.primary,
    letterSpacing: -0.3,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLink: {
    marginHorizontal: 14,
  },
  navLinkText: {
    fontSize: 15,
    color: brand.text,
    fontWeight: '500',
  },
  navCta: {
    backgroundColor: brand.secondary,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 24,
    marginLeft: 12,
  },
  navCtaText: {
    color: brand.white,
    fontSize: 14,
    fontWeight: '600',
  },

  /* Hero */
  hero: {
    backgroundColor: brand.primary,
    backgroundImage: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
    paddingTop: windowWidth < 768 ? 50 : 80,
    paddingBottom: windowWidth < 768 ? 60 : 90,
    paddingHorizontal: 20,
    alignItems: 'center',
  } as any,
  heroInner: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    flexDirection: windowWidth < 768 ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
  },
  heroLeft: {
    flex: windowWidth < 768 ? 0 : 1,
    maxWidth: 580,
    width: '100%',
  },
  heroTitle: {
    fontSize: windowWidth < 768 ? 34 : 50,
    fontWeight: '800',
    color: brand.white,
    lineHeight: windowWidth < 768 ? 42 : 60,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: windowWidth < 768 ? 17 : 20,
    lineHeight: windowWidth < 768 ? 26 : 30,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 28,
  },
  heroBenefits: {
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  benefitText: {
    fontSize: 16,
    color: brand.white,
    fontWeight: '500',
  },
  heroCtas: {
    flexDirection: windowWidth < 480 ? 'column' : 'row',
    gap: 14,
    alignItems: windowWidth < 480 ? 'stretch' : 'center',
  },
  ctaPrimary: {
    backgroundColor: brand.secondary,
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    color: brand.white,
    fontSize: 17,
    fontWeight: '700',
  },
  ctaOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 28,
    gap: 8,
  },
  ctaOutlineText: {
    color: brand.white,
    fontSize: 15,
    fontWeight: '600',
  },

  /* Hero right graphic */
  heroRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunGraphic: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  /* Trust Bar */
  trustBar: {
    backgroundColor: brand.white,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: brand.divider,
  },
  trustInner: {
    maxWidth: 900,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  trustLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: brand.text,
  },

  /* Sections */
  sectionWhite: {
    backgroundColor: brand.white,
    paddingVertical: windowWidth < 768 ? 50 : 80,
    paddingHorizontal: 20,
  },
  sectionTinted: {
    backgroundColor: brand.bg,
    paddingVertical: windowWidth < 768 ? 50 : 80,
    paddingHorizontal: 20,
  },
  sectionWrap: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  sectionTitle: {
    fontSize: windowWidth < 768 ? 26 : 34,
    fontWeight: '700',
    color: brand.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSub: {
    fontSize: 17,
    color: brand.textLight,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },

  /* Feature cards */
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  featureCard: {
    width: windowWidth < 768 ? '100%' : windowWidth < 1024 ? '46%' : '22%',
    backgroundColor: brand.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    minWidth: 240,
  } as any,
  featureIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: brand.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  featureCardDesc: {
    fontSize: 15,
    lineHeight: 23,
    color: brand.textLight,
    textAlign: 'center',
  },

  /* How It Works steps */
  stepsContainer: {
    maxWidth: 700,
    marginHorizontal: 'auto',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 36,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    flexShrink: 0,
  },
  stepNum: {
    color: brand.white,
    fontSize: 20,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: brand.text,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 24,
    color: brand.textLight,
  },

  /* Testimonials */
  testimonialGrid: {
    flexDirection: windowWidth < 768 ? 'column' : 'row',
    gap: 24,
    justifyContent: 'center',
  },
  testimonialCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: brand.white,
    borderRadius: 12,
    padding: 24,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  testimonialQuote: {
    fontSize: 15,
    lineHeight: 24,
    color: brand.text,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialName: {
    fontSize: 15,
    fontWeight: '700',
    color: brand.text,
  },
  testimonialDetail: {
    fontSize: 13,
    color: brand.textLight,
    marginTop: 2,
  },

  /* Final CTA */
  finalCta: {
    backgroundColor: brand.primary,
    backgroundImage: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.purple} 100%)`,
    paddingVertical: windowWidth < 768 ? 60 : 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  } as any,
  finalCtaInner: {
    maxWidth: 700,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: windowWidth < 768 ? 26 : 36,
    fontWeight: '800',
    color: brand.white,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: windowWidth < 768 ? 34 : 46,
  },
  finalCtaButton: {
    backgroundColor: brand.secondary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  finalCtaButtonText: {
    color: brand.white,
    fontSize: 19,
    fontWeight: '700',
  },
  finalCtaNote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  /* Footer */
  footer: {
    backgroundColor: '#F0F2F5',
    paddingVertical: 48,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: brand.divider,
  },
  footerInner: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: '700',
    color: brand.primary,
  },
  footerTagline: {
    fontSize: 15,
    color: brand.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: windowWidth < 480 ? 16 : 28,
    marginBottom: 24,
  },
  footerLinkText: {
    fontSize: 14,
    color: brand.text,
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: 13,
    color: brand.textLight,
    textAlign: 'center',
  },
});

export default WelcomePage;
