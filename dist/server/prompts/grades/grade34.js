"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grade34Prompts = void 0;
exports.Grade34Prompts = {
    getSystemPrompt: (topic, gradeLevel) => `
  ### TEACHING 8-10 YEAR OLD CHILDREN
  
  Create content for children developing reading fluency.
  
  REQUIREMENTS:
  - Maximum 8 words per sentence
  - Maximum 200 words total
  - Use grade 3-4 vocabulary
  - Introduce one new concept at a time
  - Connect to their experiences
  
  Create engaging lesson about "${topic}".
  `,
    getUserPrompt: (topic, gradeLevel) => `
  Create a lesson about "${topic}" for grade ${gradeLevel}.
  
  STRUCTURE (200 words maximum):
  
  Introduction (30 words)
  Connect to what they know.
  
  Main Ideas (80 words)
  - First main point
  - Second main point
  - Third main point
  
  Examples (50 words)
  Real things from their life.
  
  Activity (40 words)
  Something they can do at home or school.
  `,
    getEnhancedPrompt: (topic, gradeLevel) => `
  ENHANCED GRADE ${gradeLevel} LESSON
  
  Apply Chain-of-Thought:
  1. What do 9-year-olds know about "${topic}"?
  2. What single new idea can I add?
  3. How does this connect to their life?
  
  Maximum 200 words. Grade 3-4 reading level.
  `,
    getQuizSystemPrompt: (topic, gradeLevel) => `
  Create grade ${gradeLevel} questions about "${topic}".
  
  REQUIREMENTS:
  - 10 words maximum per question
  - Multiple choice with 4 options
  - Test understanding, not memorization
  - Include "which" and "what" questions
  `,
    getQuizUserPrompt: (topic, gradeLevel, questionCount) => `
  Create ${questionCount} questions about "${topic}" for grade ${gradeLevel}.
  
  Question types:
  1. "Which one is [characteristic]?"
  2. "What happens when [action]?"
  3. "How many [measurement]?"
  4. "Why does [phenomenon]?"
  5. "What do all [category] have?"
  
  Provide 4 choices (A, B, C, D).
  `,
    getFeedbackSystemPrompt: (gradeLevel) => `
  Give encouraging feedback to a grade ${gradeLevel} student.
  Use grade-appropriate vocabulary.
  Be specific about what they did well.
  `,
    getQuizFeedbackPrompt: (questions, answers, score, gradeLevel) => `
  Provide feedback for ${score}% score.
  
  Structure:
  "Nice work! You got ${score}%!"
  
  What you did well:
  [Specific examples]
  
  Practice these:
  [2-3 specific skills]
  
  Try these problems:
  [2 practice problems]
  `,
    getKnowledgeGraphPrompt: (topic, gradeLevel) => `
  Create concept map for "${topic}" - grade ${gradeLevel}.
  - 7-10 concepts
  - Two-word labels maximum
  - Show "causes", "needs", "makes", "helps" relationships
  `,
    getImagePrompt: (topic, concept, gradeLevel) => `
  Create educational diagram about ${concept} for grade ${gradeLevel}.
  - Clear labels (1-2 words)
  - Show parts and wholes
  - Include size comparisons
  - Use familiar objects for scale
  `,
    getDiagramPrompt: (topic, diagramType, gradeLevel) => `
  Create ${diagramType} about ${topic} for grade ${gradeLevel}.
  - Label important parts
  - Show how things connect
  - Include a "What to Notice" box
  - Compare to familiar objects
  `,
    getReadingLevelInstructions: () => `
  Grade 3-4 students:
  - Know about 4,000-6,000 words
  - Read 100-150 words per minute
  - Understanding cause and effect
  - Can follow 2-3 step instructions
  `,
    getMathematicalNotationRules: () => `
  MATH for grades 3-4:
  - Multiplication: 7 × 8 = __
  - Division: 56 ÷ 7 = __
  - Fractions: 1/2, 1/4, 3/4
  - Word problems with 2 steps
  - Numbers up to 10,000
  `
};
//# sourceMappingURL=grade34.js.map