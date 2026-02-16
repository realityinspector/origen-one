/**
 * Content Validator Service
 *
 * Validates generated lesson content and quiz questions for age-appropriateness
 * Checks vocabulary level, sentence complexity, and question structure
 */

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  readabilityScore?: number;
  recommendations: string[];
}

interface QuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
 */
function calculateFleschKincaidGrade(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;

  return 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
}

/**
 * Count syllables in a word (simplified algorithm)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent e
  if (word.endsWith('e')) count--;

  // Adjust for edge cases
  if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
    count++;
  }

  return Math.max(count, 1);
}

/**
 * Grade-specific vocabulary restrictions
 */
const GRADE_BANNED_WORDS: Record<string, string[]> = {
  'K-2': [
    // Abstract concepts
    'process', 'system', 'adapt', 'adaptation', 'environment', 'organism',
    'function', 'structure', 'cycle', 'energy', 'nutrient', 'habitat',
    'ecosystem', 'photosynthesis', 'cells', 'billions', 'molecules',
    'chemical', 'reaction', 'evolution', 'species', 'classification',

    // Complex verbs
    'analyze', 'synthesize', 'evaluate', 'determine', 'conclude',
    'hypothesize', 'investigate', 'demonstrate', 'illustrate',

    // Academic terms
    'subsequently', 'furthermore', 'nevertheless', 'consequently',
    'therefore', 'however', 'although', 'whereas', 'moreover',

    // Complex comparatives
    'relationship', 'comparison', 'similarity', 'difference',
    'characteristic', 'property', 'attribute', 'feature'
  ],

  '3-4': [
    // Advanced scientific terms
    'molecular', 'cellular', 'genetic', 'heredity', 'chromosomes',
    'proteins', 'enzymes', 'metabolism', 'symbiosis', 'mutualism',

    // Complex processes
    'photosynthesis', 'respiration', 'digestion', 'circulation',
    'reproduction', 'metamorphosis', 'mitosis', 'meiosis',

    // Advanced math
    'polynomial', 'quadratic', 'exponential', 'logarithm',
    'derivative', 'integral', 'theorem', 'proof'
  ]
};

/**
 * Maximum sentence lengths by grade level
 */
const MAX_SENTENCE_WORDS: Record<number, number> = {
  0: 5,   // Kindergarten
  1: 5,   // 1st grade
  2: 5,   // 2nd grade
  3: 8,   // 3rd grade
  4: 8,   // 4th grade
  5: 12,  // 5th grade
  6: 12,  // 6th grade
  7: 15,  // 7th grade
  8: 15,  // 8th grade
};

/**
 * Validate question text for grade-appropriateness
 */
export function validateQuestionForGrade(
  question: QuizQuestion,
  gradeLevel: number
): ValidationResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check question text length
  const questionWords = question.text.split(/\s+/).filter(w => w.length > 0);
  const maxWords = MAX_SENTENCE_WORDS[gradeLevel] || 15;

  if (questionWords.length > maxWords) {
    issues.push(`Question too long: ${questionWords.length} words (max ${maxWords} for grade ${gradeLevel})`);
    recommendations.push('Break into simpler question or reduce unnecessary words');
  }

  // Check for multi-part questions (indicating complexity)
  if (question.text.includes(' and ') && question.text.includes('?')) {
    const parts = question.text.split(/\sand\s/i);
    if (parts.length > 2 && gradeLevel <= 4) {
      issues.push('Multi-part question too complex for grade level');
      recommendations.push('Ask one concept at a time');
    }
  }

  // Check readability of question
  const readabilityGrade = calculateFleschKincaidGrade(question.text);
  const targetMaxGrade = gradeLevel + 1; // Allow 1 grade above

  if (readabilityGrade > targetMaxGrade) {
    issues.push(`Question readability (${readabilityGrade.toFixed(1)}) above target (${targetMaxGrade})`);
    recommendations.push('Simplify vocabulary and sentence structure');
  }

  // Check for banned words by grade band
  const gradeBand = gradeLevel <= 2 ? 'K-2' : '3-4';
  const bannedWords = GRADE_BANNED_WORDS[gradeBand] || [];
  const questionLower = question.text.toLowerCase();

  bannedWords.forEach(word => {
    if (questionLower.includes(word)) {
      issues.push(`Banned word for grade ${gradeLevel}: "${word}"`);
      recommendations.push(`Replace "${word}" with simpler language`);
    }
  });

  // Check answer options
  question.options.forEach((option, idx) => {
    const optionWords = option.split(/\s+/).filter(w => w.length > 0);
    if (optionWords.length > maxWords) {
      issues.push(`Answer option ${idx + 1} too long: ${optionWords.length} words`);
      recommendations.push(`Simplify answer option ${idx + 1}`);
    }

    // Check for banned words in options
    const optionLower = option.toLowerCase();
    bannedWords.forEach(word => {
      if (optionLower.includes(word)) {
        issues.push(`Banned word in option ${idx + 1}: "${word}"`);
      }
    });
  });

  // Grade-specific checks
  if (gradeLevel <= 2) {
    // K-2: Should be yes/no or simple choice
    const isYesNo = question.options.some(opt =>
      opt.toLowerCase() === 'yes' || opt.toLowerCase() === 'no'
    );
    const hasNumbers = question.options.every(opt => /^\d+$/.test(opt));
    const hasSimpleWords = question.options.every(opt =>
      opt.split(/\s+/).length <= 2
    );

    if (!isYesNo && !hasNumbers && !hasSimpleWords) {
      issues.push('Question should have yes/no, number, or simple 1-2 word answers for grades K-2');
      recommendations.push('Use: "Yes/No", counting numbers, or simple choices like "Hot/Cold"');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
    readabilityScore: readabilityGrade
  };
}

/**
 * Validate entire lesson content
 */
export function validateLessonContent(
  content: string,
  gradeLevel: number
): ValidationResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Calculate readability
  const readabilityGrade = calculateFleschKincaidGrade(content);
  const targetMaxGrade = gradeLevel + 1.5; // Allow 1.5 grades above for lesson content

  if (readabilityGrade > targetMaxGrade) {
    issues.push(`Lesson readability (${readabilityGrade.toFixed(1)}) above target (${targetMaxGrade})`);
    recommendations.push('Simplify vocabulary and use shorter sentences');
  }

  // Check sentence lengths
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const maxWords = MAX_SENTENCE_WORDS[gradeLevel] || 15;

  let longSentenceCount = 0;
  sentences.forEach(sentence => {
    const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length > maxWords * 1.5) { // Allow 50% flexibility
      longSentenceCount++;
    }
  });

  if (longSentenceCount > sentences.length * 0.2) { // More than 20% too long
    issues.push(`${longSentenceCount} sentences exceed recommended length`);
    recommendations.push('Break long sentences into shorter, simpler ones');
  }

  // Check for banned words
  const gradeBand = gradeLevel <= 2 ? 'K-2' : '3-4';
  const bannedWords = GRADE_BANNED_WORDS[gradeBand] || [];
  const contentLower = content.toLowerCase();

  const foundBannedWords = bannedWords.filter(word => contentLower.includes(word));
  if (foundBannedWords.length > 0) {
    issues.push(`Found ${foundBannedWords.length} words too advanced for grade ${gradeLevel}`);
    recommendations.push(`Simplify: ${foundBannedWords.slice(0, 5).join(', ')}`);
  }

  // Check content length
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const maxContentWords: Record<number, number> = {
    0: 75, 1: 75, 2: 75,        // K-2
    3: 200, 4: 200,              // 3-4
    5: 400, 6: 400,              // 5-6
    7: 700, 8: 700,              // 7-8
  };

  const maxContentWordsLimit = maxContentWords[gradeLevel] || 1000;
  if (wordCount > maxContentWordsLimit * 1.2) { // 20% over limit
    issues.push(`Content too long: ${wordCount} words (recommended max ${maxContentWordsLimit})`);
    recommendations.push('Focus on core concepts and reduce unnecessary details');
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
    readabilityScore: readabilityGrade
  };
}

/**
 * Validate quiz questions array
 */
export function validateQuizQuestions(
  questions: QuizQuestion[],
  gradeLevel: number
): ValidationResult {
  const allIssues: string[] = [];
  const allRecommendations: string[] = [];
  let totalReadability = 0;

  questions.forEach((question, idx) => {
    const result = validateQuestionForGrade(question, gradeLevel);

    if (!result.isValid) {
      allIssues.push(`Question ${idx + 1}: ${result.issues.join(', ')}`);
      allRecommendations.push(...result.recommendations.map(r => `Q${idx + 1}: ${r}`));
    }

    totalReadability += result.readabilityScore || 0;
  });

  const avgReadability = questions.length > 0 ? totalReadability / questions.length : 0;

  return {
    isValid: allIssues.length === 0,
    issues: allIssues,
    recommendations: allRecommendations,
    readabilityScore: avgReadability
  };
}

/**
 * Generate validation report for logging
 */
export function generateValidationReport(
  result: ValidationResult,
  contentType: 'lesson' | 'quiz'
): string {
  const lines: string[] = [];

  lines.push(`\n=== ${contentType.toUpperCase()} VALIDATION REPORT ===`);
  lines.push(`Status: ${result.isValid ? '✓ PASS' : '✗ FAIL'}`);

  if (result.readabilityScore !== undefined) {
    lines.push(`Readability Grade Level: ${result.readabilityScore.toFixed(1)}`);
  }

  if (result.issues.length > 0) {
    lines.push(`\nIssues Found (${result.issues.length}):`);
    result.issues.forEach((issue, idx) => {
      lines.push(`  ${idx + 1}. ${issue}`);
    });
  }

  if (result.recommendations.length > 0) {
    lines.push(`\nRecommendations:`);
    result.recommendations.forEach((rec, idx) => {
      lines.push(`  ${idx + 1}. ${rec}`);
    });
  }

  lines.push('=====================================\n');

  return lines.join('\n');
}
