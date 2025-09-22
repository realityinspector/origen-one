export const Grade56Prompts = {
    getSystemPrompt: (topic: string, gradeLevel: number) => `
  ### TEACHING 10-12 YEAR OLD STUDENTS
  
  Create content for developing abstract thinking.
  
  REQUIREMENTS:
  - Maximum 12 words per sentence average
  - Maximum 400 words total
  - Introduce academic vocabulary with context
  - Build conceptual understanding
  - Include cause-effect relationships
  
  Create comprehensive lesson about "${topic}".
  `,
  
    getUserPrompt: (topic: string, gradeLevel: number) => `
  Create a lesson about "${topic}" for grade ${gradeLevel}.
  
  STRUCTURE (400 words maximum):
  
  Introduction (60 words)
  Connect to prior knowledge and introduce objective.
  
  Core Concepts (160 words)
  Explain 3-4 main ideas with definitions.
  
  Examples and Applications (100 words)
  Real-world connections and applications.
  
  Practice Activity (80 words)
  Hands-on investigation or analysis task.
  `,
  
    getEnhancedPrompt: (topic: string, gradeLevel: number) => `
  GRADE ${gradeLevel} ADVANCED LESSON
  
  Use Chain-of-Thought reasoning:
  1. Prerequisite concepts students should know
  2. New vocabulary to introduce (with definitions)
  3. Conceptual progression from simple to complex
  4. Real-world applications
  
  Topic: "${topic}"
  Output: 400 words maximum with grade-appropriate complexity.
  `,
  
    getQuizSystemPrompt: (topic: string, gradeLevel: number) => `
  Create grade ${gradeLevel} assessment questions about "${topic}".
  
  Include questions testing:
  - Factual knowledge (20%)
  - Conceptual understanding (40%)
  - Application skills (40%)
  
  Use academic vocabulary appropriately.
  `,
  
    getQuizUserPrompt: (topic: string, gradeLevel: number, questionCount: number) => `
  Generate ${questionCount} questions about "${topic}" for grade ${gradeLevel}.
  
  Include mix of:
  - Comprehension: "What is the relationship between..."
  - Application: "How would you use..."
  - Analysis: "Why does this happen when..."
  - Comparison: "How are X and Y similar/different..."
  
  Format as multiple choice with explanations.
  `,
  
    getFeedbackSystemPrompt: (gradeLevel: number) => `
  Provide constructive feedback for grade ${gradeLevel} student.
  Balance encouragement with specific guidance.
  Use academic language appropriately.
  `,
  
    getQuizFeedbackPrompt: (questions: any[], answers: number[], score: number, gradeLevel: number) => `
  Feedback for ${score}% performance:
  
  Overall Performance:
  [2-3 sentences analyzing patterns]
  
  Strengths Demonstrated:
  - [Specific skill 1]
  - [Specific skill 2]
  
  Areas for Growth:
  - [Concept 1]: Try [specific strategy]
  - [Concept 2]: Practice [specific skill]
  
  Next Steps:
  [3-4 practice problems with increasing difficulty]
  `,
  
    getKnowledgeGraphPrompt: (topic: string, gradeLevel: number) => `
  Design concept map for "${topic}" - grade ${gradeLevel}.
  - 10-15 interconnected concepts
  - Show hierarchical relationships
  - Include cross-connections
  - Label relationships clearly
  `,
  
    getImagePrompt: (topic: string, concept: string, gradeLevel: number) => `
  Create detailed educational diagram about ${concept} for grade ${gradeLevel}.
  - Include labels with brief descriptions
  - Show processes and relationships
  - Add scale or measurements
  - Include "Key Points" callout box
  `,
  
    getDiagramPrompt: (topic: string, diagramType: string, gradeLevel: number) => `
  Design ${diagramType} about ${topic} for grade ${gradeLevel}.
  - Include detailed labels and annotations
  - Show cause-and-effect relationships
  - Add comparison elements
  - Include self-check questions
  `,
  
    getReadingLevelInstructions: () => `
  Grade 5-6 students:
  - Vocabulary of 10,000+ words
  - Read 150-200 words per minute
  - Understand complex sentences
  - Can think abstractly
  - Follow multi-step processes
  `,
  
    getMathematicalNotationRules: () => `
  MATH for grades 5-6:
  - Decimals: 3.45 × 2.1 = __
  - Fractions: 3/4 + 2/3 = __
  - Percentages: 15% of 80 = __
  - Basic algebra: 3x + 5 = 20
  - Area and volume formulas
  - Ratios: 3:5 = 12:__
  `
  };