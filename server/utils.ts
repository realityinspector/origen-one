import { Lesson, InsertLesson, EnhancedLessonSpec } from "../shared/schema";
import { 
  generateLessonContent, 
  generateQuizQuestions as aiGenerateQuizQuestions, 
  generateKnowledgeGraph,
  generateEnhancedLesson 
} from "./services/ai";

// Grade level topics for lesson generation
const gradeTopics: Record<number, string[]> = {
  0: ["Alphabet", "Counting", "Colors", "Shapes", "Animals"],
  1: ["Numbers", "Letters", "Colors", "Shapes"],
  2: ["Addition", "Subtraction", "Reading", "Time"],
  3: ["Multiplication", "Division", "Geography", "Science"],
  4: ["Fractions", "Grammar", "History", "Animals"],
  5: ["Decimals", "Writing", "Solar System", "Plants"],
  6: ["Algebra", "Literature", "Ancient Civilizations", "Ecosystems"],
  7: ["Geometry", "Poetry", "World Geography", "Chemistry"],
  8: ["Statistics", "Essay Writing", "American History", "Biology"],
  9: ["Algebra II", "World Literature", "World History", "Biology II"],
  10: ["Trigonometry", "American Literature", "European History", "Chemistry"],
  11: ["Pre-Calculus", "British Literature", "Economics", "Physics"],
  12: ["Calculus", "Advanced Literature", "Government", "Advanced Science"]
};

import { USE_AI } from './config/flags';

/**
 * Formats an enhanced lesson spec into a standard content format
 * This allows enhanced lessons to be displayed in clients that don't support the full enhanced format
 */
function formatEnhancedContentForStandardSpec(enhancedSpec: EnhancedLessonSpec): string {
  // Start with the title and summary
  let formattedContent = `# ${enhancedSpec.title}\n\n`;
  
  if (enhancedSpec.subtitle) {
    formattedContent += `## ${enhancedSpec.subtitle}\n\n`;
  }
  
  formattedContent += `${enhancedSpec.summary}\n\n`;
  
  // Add each section
  enhancedSpec.sections.forEach(section => {
    formattedContent += `## ${section.title}\n\n${section.content}\n\n`;
  });
  
  // Add metadata at the end
  formattedContent += `---\n\n`;
  formattedContent += `**Keywords:** ${enhancedSpec.keywords.join(', ')}\n\n`;
  formattedContent += `**Related Topics:** ${enhancedSpec.relatedTopics.join(', ')}\n\n`;
  formattedContent += `**Estimated Duration:** ${enhancedSpec.estimatedDuration} minutes | `;
  formattedContent += `**Difficulty:** ${enhancedSpec.difficultyLevel}\n`;
  
  return formattedContent;
}

// Function to generate a lesson based on grade level and topic
export async function generateLesson(gradeLevel: number, topic?: string): Promise<InsertLesson['spec']> {
  // Check if we should use AI or static content based on feature flag

  if (USE_AI) {
    try {
      // Default to grade 3 if outside of range (0 = Kindergarten, 1-12 = grades 1-12)
      const safeGradeLevel = gradeLevel >= 0 && gradeLevel <= 12 ? gradeLevel : 3;
      
      // Select a random topic if none provided
      const availableTopics = gradeTopics[safeGradeLevel];
      const selectedTopic = topic || availableTopics[Math.floor(Math.random() * availableTopics.length)];

      // Try to generate an enhanced lesson first
      try {
        console.log(`Attempting to generate enhanced lesson for "${selectedTopic}" (Grade ${safeGradeLevel})`);
        const enhancedSpec = await generateEnhancedLesson(safeGradeLevel, selectedTopic);
        
        // Create a standard spec from the enhanced spec
        const standardSpec = {
          title: enhancedSpec.title,
          content: formatEnhancedContentForStandardSpec(enhancedSpec),
          questions: enhancedSpec.questions,
          graph: enhancedSpec.graph,
          // Store the enhanced spec in the main spec for clients that support it
          enhancedSpec: enhancedSpec
        };
        
        console.log('Enhanced lesson generated successfully');
        return standardSpec;
      } catch (enhancedError) {
        // Log the error but don't give up - fall back to standard generation
        console.error('Error generating enhanced lesson:', enhancedError);
        console.log('Falling back to standard lesson generation');
        
        // Create async calls for both content and questions using standard methods
        const contentPromise = generateLessonContent(safeGradeLevel, selectedTopic);
        const questionsPromise = aiGenerateQuizQuestions(safeGradeLevel, selectedTopic, 5);
        const graphPromise = generateKnowledgeGraph(selectedTopic, safeGradeLevel);
        
        // Wait for all to complete
        const [content, questions, graph] = await Promise.all([contentPromise, questionsPromise, graphPromise]);
        
        // Return the lesson spec
        return {
          title: `${selectedTopic} for ${safeGradeLevel === 0 ? 'Kindergarten' : `Grade ${safeGradeLevel}`}`,
          content: content,
          questions: questions,
          graph: graph
        };
      }
    } catch (error) {
      console.error('Error generating lesson with AI:', error);
      // Fall back to static content in case of AI service failure
      return generateStaticLesson(gradeLevel, topic);
    }
  } else {
    // Use static content when USE_AI is disabled
    console.log('Using static lesson content (USE_AI=0)');
    return generateStaticLesson(gradeLevel, topic);
  }
}

// Fallback function that provides static content if AI fails
function generateStaticLesson(gradeLevel: number, topic?: string): InsertLesson['spec'] {
  // Default to grade 3 if outside of range (0 = Kindergarten, 1-12 = grades 1-12)
  const safeGradeLevel = gradeLevel >= 0 && gradeLevel <= 12 ? gradeLevel : 3;
  
  // Select a random topic if none provided
  const availableTopics = gradeTopics[safeGradeLevel];
  const selectedTopic = topic || availableTopics[Math.floor(Math.random() * availableTopics.length)];
  
  // Generate basic lesson content
  const lessonContent = `
    # ${selectedTopic} for ${safeGradeLevel === 0 ? 'Kindergarten' : `Grade ${safeGradeLevel}`}
    
    Today we're going to learn about ${selectedTopic.toLowerCase()}.
    
    ${getStaticContentForTopic(selectedTopic, safeGradeLevel)}
  `;
  
  // Generate quiz questions
  const questions = generateStaticQuizQuestions(selectedTopic, safeGradeLevel);
  
  // Generate a simple knowledge graph
  const graph = {
    nodes: [
      { id: "main", label: selectedTopic },
      { id: "sub1", label: `Basic ${selectedTopic}` },
      { id: "sub2", label: `Advanced ${selectedTopic}` },
      { id: "related1", label: "Related Concept 1" },
      { id: "related2", label: "Related Concept 2" }
    ],
    edges: [
      { source: "main", target: "sub1" },
      { source: "main", target: "sub2" },
      { source: "main", target: "related1" },
      { source: "main", target: "related2" },
      { source: "sub1", target: "related1" }
    ]
  };
  
  return {
    title: `${selectedTopic} for ${safeGradeLevel === 0 ? 'Kindergarten' : `Grade ${safeGradeLevel}`}`,
    content: lessonContent,
    questions: questions,
    graph: graph
  };
}

function getStaticContentForTopic(topic: string, gradeLevel: number): string {
  // Special formatting for Kindergarten
  if (gradeLevel === 0) {
    const kindergartenContent: Record<string, string> = {
      "Alphabet": "A is for Apple. B is for Ball. C is for Cat.\n\nLetters make sounds. We use letters to make words!",
      "Counting": "Let's count together! 1, 2, 3, 4, 5.\n\nWe can count fingers. We can count toes. Counting is fun!",
      "Colors": "Red like an apple. Blue like the sky. Yellow like the sun.\n\nColors are all around us!",
      "Shapes": "Circle like a ball. Square like a box. Triangle has three sides.\n\nShapes are fun to find!",
      "Animals": "Dogs say 'woof'. Cats say 'meow'. Cows say 'moo'.\n\nAnimals are our friends!"
    };
    
    return kindergartenContent[topic] || `Let's learn about ${topic.toLowerCase()} together!`;
  }
  
  // Static content that doesn't rely on AI (for grades 1-12)
  const contentMap: Record<string, string> = {
    "Numbers": "Numbers are the building blocks of mathematics. We use them to count, measure, and understand the world around us.",
    "Letters": "Letters are symbols that represent sounds in our language. When we put letters together, we create words.",
    "Colors": "Colors are what we see when light reflects off objects. The primary colors are red, blue, and yellow.",
    "Shapes": "Shapes are forms and outlines of objects. Basic shapes include circles, squares, triangles, and rectangles.",
    "Addition": "Addition is when we combine groups of things to find the total. The + sign means we're adding numbers together.",
    "Subtraction": "Subtraction is finding the difference between two numbers. The - sign means we're taking away from a number.",
    "Reading": "Reading is understanding written text. We look at words and understand their meaning.",
    "Time": "Time is how we measure when events happen. We use clocks to tell time in hours, minutes, and seconds.",
    "Multiplication": "Multiplication is a fast way to add the same number multiple times. For example, 3 × 4 means 3 + 3 + 3 + 3.",
    "Division": "Division is sharing a number into equal groups. For example, 12 ÷ 3 means splitting 12 into 3 equal groups.",
    "Geography": "Geography is the study of Earth's features, including land, water, and where people live.",
    "Science": "Science is how we study and understand the natural world through observation and experiments.",
    "Fractions": "Fractions represent parts of a whole. For example, 1/4 means one out of four equal parts.",
    "Grammar": "Grammar is the set of rules that explain how words are used in a language.",
    "History": "History is the study of past events and how they have shaped our world today.",
    "Animals": "Animals are living organisms that can move, eat, and respond to their environment. There are many different types of animals.",
    "Decimals": "Decimals are a way of writing fractions. The decimal point separates the whole number from the fraction.",
    "Writing": "Writing is using letters and words to communicate ideas and stories.",
    "Solar System": "The Solar System consists of the Sun and everything that orbits around it, including planets, moons, asteroids, and comets.",
    "Plants": "Plants are living organisms that make their own food through a process called photosynthesis using sunlight, water, and carbon dioxide."
  };
  
  // Return content or a default message
  return contentMap[topic] || `Let's explore the fascinating world of ${topic.toLowerCase()}!`;
}

function generateStaticQuizQuestions(topic: string, gradeLevel: number) {
  // Static questions that don't rely on AI
  const questions: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[] = [];
  
  // Kindergarten-specific simpler questions with fewer options
  if (gradeLevel === 0) {
    switch (topic) {
      case "Alphabet":
        questions.push({
          text: "Which letter makes the 'mmm' sound?",
          options: ["A", "M", "Z"],
          correctIndex: 1,
          explanation: "M makes the 'mmm' sound like in 'mommy' and 'mouse'."
        });
        questions.push({
          text: "Which picture starts with the letter B?",
          options: ["Apple", "Ball", "Cat"],
          correctIndex: 1,
          explanation: "Ball starts with the letter B."
        });
        break;
      
      case "Counting":
        questions.push({
          text: "Count the stars: ★ ★ ★. How many stars?",
          options: ["2", "3", "4"],
          correctIndex: 1,
          explanation: "There are 3 stars."
        });
        questions.push({
          text: "What number comes after 2?",
          options: ["1", "3", "5"],
          correctIndex: 1,
          explanation: "3 comes after 2."
        });
        break;
      
      case "Colors":
        questions.push({
          text: "What color is the sky on a sunny day?",
          options: ["Red", "Blue", "Green"],
          correctIndex: 1,
          explanation: "The sky is blue on a sunny day."
        });
        questions.push({
          text: "What color are bananas?",
          options: ["Yellow", "Purple", "Orange"],
          correctIndex: 0,
          explanation: "Bananas are yellow."
        });
        break;
        
      case "Shapes":
        questions.push({
          text: "Which shape is round like a ball?",
          options: ["Square", "Circle", "Triangle"],
          correctIndex: 1,
          explanation: "A circle is round like a ball."
        });
        questions.push({
          text: "Which shape has 3 sides?",
          options: ["Circle", "Square", "Triangle"],
          correctIndex: 2,
          explanation: "A triangle has 3 sides."
        });
        break;
        
      case "Animals":
        questions.push({
          text: "Which animal says 'meow'?",
          options: ["Dog", "Cat", "Fish"],
          correctIndex: 1,
          explanation: "Cats say 'meow'."
        });
        questions.push({
          text: "Which animal has a very long neck?",
          options: ["Elephant", "Giraffe", "Monkey"],
          correctIndex: 1,
          explanation: "Giraffes have very long necks."
        });
        break;
        
      default:
        questions.push({
          text: `What do you like about ${topic}?`,
          options: ["It's fun!", "It's interesting!", "It's colorful!"],
          correctIndex: 0,
          explanation: `${topic} is really fun to learn about!`
        });
        questions.push({
          text: `Can you name something about ${topic}?`,
          options: ["Yes!", "Maybe!", "I'll try!"],
          correctIndex: 0,
          explanation: `Great job thinking about ${topic}!`
        });
    }
    
    return questions;
  }
  
  // Regular questions for grades 1-12
  // Generate a few sample questions based on topic
  switch (topic) {
    case "Numbers":
      questions.push({
        text: "Which number comes after 5?",
        options: ["4", "5", "6", "7"],
        correctIndex: 2,
        explanation: "The number that comes after 5 is 6."
      });
      questions.push({
        text: "What is 3 + 2?",
        options: ["4", "5", "6", "7"],
        correctIndex: 1,
        explanation: "3 + 2 = 5"
      });
      break;
    
    case "Addition":
      questions.push({
        text: "What is 7 + 3?",
        options: ["9", "10", "11", "12"],
        correctIndex: 1,
        explanation: "7 + 3 = 10"
      });
      questions.push({
        text: "What is 5 + 8?",
        options: ["12", "13", "14", "15"],
        correctIndex: 1,
        explanation: "5 + 8 = 13"
      });
      break;
    
    case "Multiplication":
      questions.push({
        text: "What is 3 × 4?",
        options: ["7", "10", "12", "15"],
        correctIndex: 2,
        explanation: "3 × 4 = 12, which means 3 + 3 + 3 + 3 = 12"
      });
      questions.push({
        text: "What is 5 × 2?",
        options: ["7", "8", "9", "10"],
        correctIndex: 3,
        explanation: "5 × 2 = 10, which means 5 + 5 = 10"
      });
      break;
      
    case "Plants":
      questions.push({
        text: "What do plants need to make their own food?",
        options: ["Water only", "Sunlight, water, and carbon dioxide", "Just soil", "Fertilizer"],
        correctIndex: 1,
        explanation: "Plants use sunlight, water, and carbon dioxide to create food through photosynthesis."
      });
      questions.push({
        text: "What is the process called when plants make their own food?",
        options: ["Respiration", "Germination", "Photosynthesis", "Pollination"],
        correctIndex: 2,
        explanation: "Photosynthesis is the process where plants convert sunlight, water, and carbon dioxide into food."
      });
      break;
    
    case "Decimals":
      questions.push({
        text: "Which of these is a decimal number?",
        options: ["1/4", "0.25", "25%", "25"],
        correctIndex: 1,
        explanation: "0.25 is a decimal number because it uses a decimal point to show part of a whole."
      });
      questions.push({
        text: "What is 0.5 + 0.7?",
        options: ["0.12", "1.2", "0.57", "1.5"],
        correctIndex: 1,
        explanation: "0.5 + 0.7 = 1.2"
      });
      break;
      
    // Default questions if topic doesn't match
    default:
      questions.push({
        text: `What is a key characteristic of ${topic}?`,
        options: [
          `${topic} is not real`, 
          `${topic} only exists in books`, 
          `${topic} is important to learn about`, 
          `${topic} is too advanced for Grade ${gradeLevel}`
        ],
        correctIndex: 2,
        explanation: `${topic} is an important subject to learn about in Grade ${gradeLevel}.`
      });
      questions.push({
        text: `Why do we study ${topic}?`,
        options: [
          "It's not useful", 
          "Only for tests", 
          `To better understand the world around us`, 
          "Because teachers say so"
        ],
        correctIndex: 2,
        explanation: `Studying ${topic} helps us understand the world around us better.`
      });
  }
  
  return questions;
}

// Function to check if an achievement should be awarded
export function checkForAchievements(lessonHistory: Lesson[], completedLesson?: Lesson) {
  const achievements: {
    type: string;
    payload: {
      title: string;
      description: string;
      icon: string;
    };
  }[] = [];
  
  // First lesson completed
  if (lessonHistory.filter(l => l.status === "DONE").length === 1) {
    achievements.push({
      type: "FIRST_LESSON",
      payload: {
        title: "First Steps",
        description: "Completed your very first lesson!",
        icon: "award"
      }
    });
  }
  
  // 5 lessons completed
  if (lessonHistory.filter(l => l.status === "DONE").length === 5) {
    achievements.push({
      type: "FIVE_LESSONS",
      payload: {
        title: "Learning Explorer",
        description: "Completed 5 lessons!",
        icon: "book-open"
      }
    });
  }
  
  // Perfect score on a quiz
  if (completedLesson && completedLesson.score === 100) {
    achievements.push({
      type: "PERFECT_SCORE",
      payload: {
        title: "Perfect Score!",
        description: "Got all answers correct in a quiz!",
        icon: "star"
      }
    });
  }
  
  return achievements;
}
