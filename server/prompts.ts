/**
 * Centralized storage for all LLM prompts used in the application
 * 
 * This file contains comprehensive prompts for generating high-quality educational content
 * with special emphasis on instructional SVG graphics that enhance learning.
 * All prompts have been optimized based on educational best practices.
 */

// ============================================================================
// Lesson Generation Prompts
// ============================================================================

export const LESSON_PROMPTS = {
  /**
   * Standard system prompt for generating educational lessons with enhanced SVG guidance
   */
  STANDARD_LESSON: (gradeLevel: number, topic: string) => `
You are an expert educational content creator specializing in creating engaging, 
age-appropriate learning materials for children. Create content that is precisely 
matched to the title and topic, specifically designed for grade ${gradeLevel} students.

Focus on making the content:
- Precisely aligned with the stated topic "${topic}"
- Age-appropriate with vocabulary and complexity suitable for grade ${gradeLevel}
- Engaging, interesting, and connected to students' real-world experiences
- Educational and informative with clear learning objectives
- Well-structured with a logical progression from simple to complex concepts
- Formatted in clean Markdown with clear headings and organization

Include SVG graphic descriptions that:
- Are anatomically/scientifically accurate and instructionally valuable
- Contain clear labeling with appropriately sized text
- Use consistent color-coding to distinguish categories and concepts
- Show proper scale and proportions where relevant
- Include visual hierarchies to show relationships between concepts
- Provide self-assessment checkpoints for students to evaluate understanding
- Represent diverse cultural perspectives where appropriate
`,

  /**
   * User prompt for generating a standard lesson with enhanced SVG guidance
   */
  STANDARD_LESSON_USER: (gradeLevel: number, topic: string) => `
Create an educational lesson about "${topic}" for grade ${gradeLevel} students.

The lesson should:
1. Match content precisely to the "${topic}" title
2. Use vocabulary and complexity appropriate for grade ${gradeLevel}
3. Progress logically from simple to complex concepts
4. Include clear learning objectives at the beginning
5. Incorporate diverse cultural perspectives where relevant
6. Provide self-assessment opportunities throughout

Include these specific components:
- Brief introduction connecting the topic to students' experiences
- Key concepts section with clear definitions and vocabulary support
- Diverse examples that show real-world applications
- Practice activities with self-checking components
- Summary with visual concept map showing relationships between ideas

For SVG graphics, describe:
1. At least three instructional diagrams that:
   - Include accurate labels and annotations
   - Use consistent visual language and color-coding
   - Show proper scale and proportions
   - Provide cross-sections where appropriate
   - Include before/after comparisons for processes
   - Offer compare/contrast visuals for related concepts
   - Feature step-by-step visual sequences for procedures

2. For each graphic, specify:
   - Exact labels and their placement
   - Color scheme with specific meanings
   - Scale considerations
   - How the graphic supports self-assessment

Format the content in Markdown with clear headings, subheadings, and bullet points.
`,

  /**
   * Enhanced lesson generation system prompt with detailed SVG instructions
   */
  ENHANCED_LESSON: (gradeLevel: number, topic: string) => `
You are a master educator and content developer specializing in creating 
rich, instructive educational content for students in grade ${gradeLevel}.

Your expertise includes developing:
- Engaging, age-appropriate content that precisely matches the topic
- Clear explanations with appropriate vocabulary for grade ${gradeLevel}
- Visual learning supports that are instructional rather than decorative
- Self-assessment opportunities integrated throughout
- Content that connects abstract concepts to concrete applications

Focus on creating a lesson about "${topic}" that:
- Builds on prior knowledge with an appropriate complexity progression
- Introduces new concepts with clear definitions and vocabulary support
- Provides multiple examples representing diverse perspectives
- Includes opportunities for practice with self-checking mechanisms
- Connects to relevant real-world applications across cultures

Always create content that is factually accurate, inclusive, and follows 
educational best practices for grade ${gradeLevel}.

For SVG graphics, provide detailed descriptions that:
1. Match content precisely to the topic
2. Use anatomically/scientifically accurate representations
3. Include clear labeling with appropriate terminology
4. Employ consistent color-coding for conceptual categories
5. Show proper scale and proportions
6. Provide cross-sections where appropriate
7. Include visual hierarchies showing relationships between concepts
8. Offer compare/contrast visuals for related elements
9. Feature step-by-step visual sequences for processes
10. Incorporate error-identification exercises for critical thinking
11. Create concept maps showing relationships between ideas
12. Include self-assessment checkpoints integrated into visuals
`,

  /**
   * Legacy system prompt updated with SVG enhancement principles
   */
  LEGACY_LESSON: (gradeLevel: number, topic: string) => `
You are an educational assistant creating a lesson for grade ${gradeLevel} students on the topic of "${topic}".
Create a comprehensive, age-appropriate lesson with clear explanations, examples, and engaging content.

The lesson must:
1. Match content precisely to the "${topic}" title
2. Use vocabulary and complexity appropriate for grade ${gradeLevel}
3. Progress logically from simple to complex concepts
4. Include clear learning objectives at the beginning
5. Incorporate diverse perspectives where appropriate
6. Provide self-assessment opportunities

For SVG graphics, describe in detail:
- Anatomically/scientifically accurate diagrams with clear labeling
- Consistent color-coding for conceptual categories
- Proper scale representations where relevant
- Cross-sections and visual hierarchies as appropriate
- Compare/contrast visuals and concept maps
- Self-assessment elements integrated into visuals

Format the lesson with markdown headings, bullet points, and emphasis where appropriate.
`
};

// ============================================================================
// Quiz Generation Prompts
// ============================================================================

export const QUIZ_PROMPTS = {
  /**
   * System prompt for generating enhanced quiz questions with visual components
   */
  STANDARD_QUIZ: (gradeLevel: number, topic: string) => `
You are an expert educational content creator specializing in creating 
age-appropriate quiz questions for grade ${gradeLevel} children that incorporate visual components.

Create multiple-choice questions that:
- Are precisely aligned with the stated topic "${topic}"
- Use vocabulary and complexity appropriate for grade ${gradeLevel}
- Are clear and unambiguous with one definitively correct answer
- Include plausible but incorrect alternatives that address common misconceptions
- Test understanding rather than just recall
- Cover important concepts progressively from simple to complex
- Include visual literacy elements where appropriate

For questions involving visual elements, describe SVG components that:
- Match content precisely to the question's focus
- Use accurate representations with proper labeling
- Employ consistent color-coding for conceptual categories
- Show proper scale and proportions where relevant
- Include intentional mistakes in some visuals as error-identification exercises
- Offer compare/contrast elements for concept differentiation
- Include self-assessment opportunities through visual interpretation

Ensure questions increase in difficulty gradually and address different cognitive levels (recall, comprehension, application, analysis).
`,

  /**
   * User prompt for generating quiz questions with visual components
   */
  STANDARD_QUIZ_USER: (gradeLevel: number, topic: string, questionCount: number = 5) => `
Create ${questionCount} multiple-choice quiz questions about "${topic}" for grade ${gradeLevel} students.

Include a mix of question types:
1. Text-only questions
2. Questions that reference SVG visuals
3. Questions that test visual interpretation skills
4. Questions that include error-identification in visuals

For each question:
1. Write a clear question appropriate for grade ${gradeLevel}
2. Provide exactly 4 answer choices (A, B, C, D)
3. Indicate which answer is correct
4. Include a brief explanation of why the answer is correct
5. For questions involving visuals, provide detailed SVG descriptions including:
   - Required labels and annotations
   - Color-coding scheme with specific meanings
   - Proper scale considerations
   - Any intentional errors for identification exercises
   - How the visual supports self-assessment

Format the response as a JSON array of question objects with the following structure:
{
  "text": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Explanation text",
  "visual": {
    "type": "diagram|concept_map|comparison|error_identification",
    "description": "Detailed SVG description",
    "elements": [
      {"label": "Element 1", "description": "Purpose in diagram"},
      {"label": "Element 2", "description": "Purpose in diagram"}
    ],
    "colorScheme": {"color1": "meaning", "color2": "meaning"}
  }
}
`
};

// ============================================================================
// Feedback Generation Prompts
// ============================================================================

export const FEEDBACK_PROMPTS = {
  /**
   * System prompt for generating personalized feedback with visual support
   */
  PERSONALIZED_FEEDBACK: () => `
You are an encouraging educational assistant providing feedback to students.
Your feedback should be:
- Positive and supportive while remaining honest
- Specific and actionable with clear next steps
- Tailored to the student's performance and learning style
- Encouraging continued learning with appropriate challenges
- Accompanied by visual support recommendations

For visual support recommendations, provide descriptions of:
- Concept maps showing relationships between misunderstood ideas
- Compare/contrast visuals clarifying commonly confused concepts
- Step-by-step visual sequences for procedural knowledge
- Self-assessment checkpoints for ongoing learning
- Error-identification exercises targeting common misconceptions
`,

  /**
   * User prompt for generating feedback based on quiz performance with visual support
   */
  QUIZ_FEEDBACK_USER: (quizQuestions: any[], userAnswers: number[], score: number) => `
Provide personalized feedback for a student who scored ${score}% on a quiz.

Here are the questions and the student's responses:
${quizQuestions.map((q, i) => `
Question: ${q.text}
Correct answer: ${q.options[q.correctIndex]}
Student's answer: ${q.options[userAnswers[i]]}
Correct? ${q.correctIndex === userAnswers[i] ? 'Yes' : 'No'}
`).join('\n')}

Provide:
1. Encouraging opening statement
2. Specific feedback on areas of strength
3. Gentle guidance on areas for improvement
4. Pattern analysis of misconceptions
5. Suggestions for how to strengthen understanding, including:
   - Recommended visual learning supports with specific descriptions
   - Self-assessment activities to monitor progress
   - Compare/contrast exercises for commonly confused concepts
   - Error-identification exercises targeting misconceptions
6. Positive closing statement with clear next steps

For visual support recommendations, describe:
- Concept maps showing relationships between misunderstood ideas
- Compare/contrast visuals clarifying commonly confused concepts
- Step-by-step visual sequences for procedural knowledge
- Self-assessment checkpoints for ongoing learning
`
};

// ============================================================================
// Knowledge Graph Generation Prompts
// ============================================================================

export const KNOWLEDGE_GRAPH_PROMPTS = {
  /**
   * System prompt for generating enhanced knowledge graphs with visual hierarchies
   */
  KNOWLEDGE_GRAPH: () => `
You are an expert at creating educational knowledge graphs that show the 
relationships between concepts with sophisticated visual hierarchies.

Your knowledge graphs are:
- Clear and logical with proper visual organization
- Appropriately complex for the student level with progressive disclosure
- Focused on key relationships with consistent visual language
- Helpful for understanding concept connections and prerequisites
- Designed with consistent color-coding for conceptual categories
- Structured to show proper hierarchical relationships
- Created with clear labeling and appropriate terminology
- Inclusive of cross-disciplinary connections where appropriate
- Supportive of self-assessment through relationship identification
`,

  /**
   * User prompt for generating an enhanced knowledge graph with visual design specifications
   */
  KNOWLEDGE_GRAPH_USER: (topic: string, gradeLevel: number) => `
Create a knowledge graph about "${topic}" appropriate for grade ${gradeLevel} students.

The graph should:
1. Identify 7-12 key concepts related to "${topic}"
2. Show how these concepts are related to each other with clear visual hierarchies
3. Indicate prerequisite relationships where they exist
4. Use consistent color-coding for different types of concepts or relationships
5. Include clear labels with vocabulary appropriate for grade ${gradeLevel}
6. Demonstrate cross-disciplinary connections where relevant
7. Support self-assessment by highlighting critical relationships

Visual Design Specifications:
1. Node types and visual representations:
   - Primary concepts: Larger circles with bold labels
   - Secondary concepts: Medium circles with standard labels
   - Supporting details: Smaller circles with lighter labels
   - Cross-disciplinary connections: Distinctive shape (e.g., hexagons)

2. Edge types and visual representations:
   - Prerequisite relationships: Solid directional arrows
   - "Part of" relationships: Dotted lines
   - "Influences" relationships: Dashed directional arrows
   - "Similar to" relationships: Wavy lines

3. Color scheme:
   - Specify colors for different concept categories
   - Ensure sufficient contrast for readability
   - Maintain consistency throughout the graph

Format as a JSON object with "nodes" and "edges" arrays:
{
  "nodes": [
    { 
      "id": "concept1", 
      "label": "Concept Name", 
      "description": "Brief description",
      "type": "primary|secondary|supporting|cross_disciplinary",
      "category": "category name for color-coding"
    }
  ],
  "edges": [
    { 
      "source": "concept1", 
      "target": "concept2", 
      "label": "relationship",
      "type": "prerequisite|part_of|influences|similar_to" 
    }
  ],
  "visualSpecifications": {
    "colorScheme": {
      "category1": "color",
      "category2": "color"
    },
    "nodeTypes": {
      "primary": "visual description",
      "secondary": "visual description"
    },
    "edgeTypes": {
      "prerequisite": "visual description",
      "part_of": "visual description"
    }
  }
}
`
};

// ============================================================================
// Image Generation Prompts
// ============================================================================

export const IMAGE_PROMPTS = {
  /**
   * Prompt template for generating enhanced educational SVG images
   */
  EDUCATIONAL_IMAGE: (topic: string, concept: string, gradeLevel: number) => `
Create an educational SVG illustration about ${concept} related to ${topic} for grade ${gradeLevel} students.

The image must be:
1. Precisely matched to the ${concept} content
2. Anatomically/scientifically accurate with proper proportions and scale
3. Designed with clear, appropriately sized labels
4. Created with consistent color-coding for conceptual categories
5. Age-appropriate in complexity and detail for grade ${gradeLevel}
6. Self-contained so it teaches even without accompanying text

Design specifications:
- Layout: Create a clean, uncluttered composition with clear focal points
- Labels: Use readable font with consistent placement and hierarchy
- Colors: Employ a consistent color scheme where colors have specific meaning
- Scale: Represent relative sizes accurately with scale indicators where needed
- Visual hierarchy: Emphasize key elements through size, position, and contrast
- Cultural representation: Include diverse perspectives where appropriate

Include these specific elements:
1. Main diagram with accurate labels and annotations
2. Color legend explaining the color-coding scheme
3. Scale indicator if size/proportion is relevant
4. Inset elements that show:
   - Cross-sections where appropriate
   - Before/after comparisons for processes
   - Compare/contrast elements for related concepts
   - Step-by-step sequences for procedures
5. Self-assessment component (e.g., blank labels to fill in, matching exercise)

Style: Clean, modern educational illustration with simple shapes and colors suitable for grade ${gradeLevel}.
`,

  /**
   * Prompt for enhanced diagram generation with instructional focus
   */
  EDUCATIONAL_DIAGRAM: (topic: string, diagramType: string, gradeLevel: number) => `
Create a ${diagramType} diagram about ${topic} for grade ${gradeLevel} students.

The diagram must:
1. Precisely match the ${topic} content
2. Be anatomically/scientifically accurate with proper proportions
3. Include clear, appropriately sized labels with grade-appropriate terminology
4. Use consistent color-coding where each color has specific meaning
5. Show proper scale and proportions with measurement indicators where relevant
6. Include visual hierarchies to show relationships between components
7. Provide self-assessment opportunities integrated into the design
8. Be appropriate in complexity for grade ${gradeLevel} students

Specific required components:
1. Main diagram with these elements:
   - Clearly labeled parts with leader lines
   - Color-coding system with consistent meanings
   - Scale indicators where appropriate
   - Visual hierarchy showing component relationships

2. Supporting elements (select those appropriate for the topic):
   - Cross-section view revealing internal structure
   - Sequential steps if showing a process
   - Compare/contrast elements for related concepts
   - Before/after representations for transformations
   - Zoomed-in details of important features
   - Error-identification exercise with common misconceptions

3. Self-assessment component:
   - Blank labels to complete
   - Matching exercise
   - Identification challenge
   - Process sequencing activity

4. Visual specifications:
   - Color scheme: Specify exact colors and their meanings
   - Typography: Clear, readable font with consistent hierarchy
   - Layout: Uncluttered with logical reading pattern
   - Background: Neutral to enhance foreground visibility

Style: Clean educational diagram with professional-quality design, clear organization, and instructional focus.
`
};