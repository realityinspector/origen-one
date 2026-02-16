// Centralized query key factories to ensure consistent cache invalidation
// Every query key used in the app should be created through these factories

export const queryKeys = {
  // Auth
  user: () => ['/api/user'] as const,

  // Learners
  learners: (parentId?: number, role?: string) => ['/api/learners', parentId, role] as const,
  learnerProfile: (userId: number) => ['/api/learner-profile', userId] as const,
  learnerProfiles: (learnerIds: number[]) => ['/api/learner-profiles', ...learnerIds] as const,

  // Lessons
  activeLessons: (learnerId?: number) => ['/api/lessons/active', learnerId] as const,
  lesson: (lessonId: string) => ['/api/lessons', lessonId] as const,
  lessonHistory: (learnerId?: number) => ['/api/lessons/history', learnerId] as const,

  // Achievements
  achievements: (learnerId?: number) => ['/api/achievements', learnerId] as const,

  // Reports
  reports: (learnerId?: number, type?: string) => ['/api/reports', learnerId, type] as const,

  // Points
  points: (learnerId?: number) => ['/api/points', learnerId] as const,

  // Concept mastery
  mastery: (learnerId?: number) => ['/api/mastery', learnerId] as const,
} as const;

// Stale time presets
export const staleTimes = {
  // Learner-scoped data changes frequently — keep fresh
  learnerData: 30 * 1000, // 30 seconds
  // Static/semi-static data
  staticData: 5 * 60 * 1000, // 5 minutes
  // User session data
  session: 0, // always revalidate
} as const;
