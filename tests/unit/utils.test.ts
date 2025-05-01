import { generateLesson, checkForAchievements } from '../../server/utils';

describe('Utils functions', () => {
  describe('generateLesson', () => {
    it('should generate a lesson for specific grade level', async () => {
      const gradeLevel = 3;
      const lesson = await generateLesson(gradeLevel);
      
      expect(lesson).toBeDefined();
      expect(lesson.title).toBeDefined();
      expect(lesson.content).toBeDefined();
      expect(lesson.questions).toBeInstanceOf(Array);
      expect(lesson.questions.length).toBeGreaterThan(0);
    });
  });
  
  describe('checkForAchievements', () => {
    it('should return an empty array if no achievements are earned', () => {
      const lessons = [];
      const achievements = checkForAchievements(lessons);
      
      expect(achievements).toBeInstanceOf(Array);
      expect(achievements.length).toBe(0);
    });
  });
});