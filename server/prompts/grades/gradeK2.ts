export const GradeK2Prompts = {
    getSystemPrompt: (topic: string, gradeLevel: number) => `
  ### TEACHING 5-7 YEAR OLD CHILDREN
  
  You are creating content for children who have just learned to read.
  
  ABSOLUTE REQUIREMENTS:
  - Maximum 5 words per sentence
  - Maximum 75 words total
  - Only use words a 5-year-old knows
  - Only concrete things they can see and touch
  
  BANNED WORDS: process, system, adapt, environment, organism, function, structure, cycle, energy, nutrient, habitat, ecosystem, photosynthesis, cells, billions, molecules
  
  ALLOWED WORDS: big, small, hot, cold, wet, dry, up, down, eat, drink, run, walk, jump, play, red, blue, green, yellow, sun, moon, water, food, home, mom, dad, dog, cat, tree, flower
  
  Create lesson about "${topic}".
  `,
  
    getUserPrompt: (topic: string, gradeLevel: number) => `
  Create an EXTREMELY SIMPLE lesson about "${topic}" for ${gradeLevel === 0 ? 'kindergarten' : gradeLevel === 1 ? 'first grade' : 'second grade'}.
  
  STRUCTURE (75 words total):
  "${topic}"
  
  What is it? (15 words)
  [Three sentences. Five words each.]
  
  See it: (20 words)
  [Four sentences. Five words each. Things they know.]
  
  Do this: (15 words)
  [Simple activity. Three sentences.]
  
  Example output for "Water":
  "Water
  
  What is it?
  Water is wet. We drink water. Rain is water.
  
  See it:
  Water is in cups. Water comes from taps. Rivers have water. Ice is cold water.
  
  Do this:
  Fill a cup. Feel the water. Is it cold?"
  `,
  
    getEnhancedPrompt: (topic: string, gradeLevel: number) => `
  GRADE ${gradeLevel} CRITICAL CONSTRAINTS
  
  Before writing ANYTHING, verify:
  - Can a 5-year-old say this word? If no, STOP
  - Is this something they can touch? If no, STOP
  - Is this sentence over 5 words? If yes, STOP
  
  Topic: "${topic}"
  Output: 75 words maximum using ONLY kindergarten vocabulary.
  `,
  
    getQuizSystemPrompt: (topic: string, gradeLevel: number) => `
  Create questions for 5-7 year olds about "${topic}".
  
  REQUIREMENTS:
  - 5 words maximum per question
  - Yes/no or counting questions only
  - Use pictures when possible
  - No reading required beyond basic words
  `,
  
    getQuizUserPrompt: (topic: string, gradeLevel: number, questionCount: number) => `
  Create ${questionCount} VERY SIMPLE questions about "${topic}".
  
  Format:
  1. "Is [thing] [quality]?" (Yes/No)
  2. "How many [things]?" (1, 2, 3, 4)
  3. "What color is [thing]?" (red, blue, green, yellow)
  4. "Is it big?" (Yes/No)
  5. "Can it [action]?" (Yes/No)
  
  Example: "Is water wet?" Answer: Yes
  `,
  
    getFeedbackSystemPrompt: (gradeLevel: number) => `
  Give feedback to a ${gradeLevel === 0 ? 'kindergarten' : gradeLevel === 1 ? 'first grade' : 'second grade'} student.
  Use only simple words. Maximum 5 words per sentence.
  `,
  
    getQuizFeedbackPrompt: (questions: any[], answers: number[], score: number, gradeLevel: number) => `
  Tell the child: "Good job! You got ${score}%!"
  
  Use only:
  - "You did great!"
  - "Try again!"
  - "Good work!"
  - "Almost right!"
  - "Keep going!"
  `,
  
    getKnowledgeGraphPrompt: (topic: string, gradeLevel: number) => `
  Create a VERY SIMPLE concept map for "${topic}".
  Maximum 5 concepts. One word labels only.
  Connect with simple relationships: "needs", "has", "is".
  `,
  
    getImagePrompt: (topic: string, concept: string, gradeLevel: number) => `
  Create a SIMPLE picture for young children about ${concept}.
  - Big, clear shapes
  - Bright colors
  - Maximum 5 labels
  - One word labels only
  - Familiar objects only
  `,
  
    getDiagramPrompt: (topic: string, diagramType: string, gradeLevel: number) => `
  Create a VERY SIMPLE ${diagramType} about ${topic}.
  - Maximum 5 parts
  - One word labels
  - Bright colors
  - Big shapes
  - Things children recognize
  `,
  
    getReadingLevelInstructions: () => `
  CRITICAL: These are 5-7 year old children.
  - They know about 2,000 words total
  - They can barely read
  - They need pictures
  - Everything must be concrete
  - No abstract thinking yet
  `,
  
    getMathematicalNotationRules: () => `
  MATH for ages 5-7:
  - Count to 20 only
  - Simple addition: 2 + 3 = __
  - No subtraction beyond 10
  - Use objects: 🍎🍎 + 🍎 = __
  - Show fingers for counting
  `
  };