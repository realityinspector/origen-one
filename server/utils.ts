import { Lesson, InsertLesson } from "../shared/schema";
import { generateLessonContent, generateQuizQuestions as aiGenerateQuizQuestions, generateKnowledgeGraph } from "./openrouter";

// Grade level topics for lesson generation
const gradeTopics: Record<number, string[]> = {
  1: ["Numbers", "Letters", "Colors", "Shapes"],
  2: ["Addition", "Subtraction", "Reading", "Time"],
  3: ["Multiplication", "Division", "Geography", "Science"],
  4: ["Fractions", "Grammar", "History", "Animals"],
  5: ["Decimals", "Writing", "Solar System", "Plants"],
  6: ["Algebra", "Literature", "Ancient Civilizations", "Ecosystems"],
  7: ["Geometry", "Poetry", "World Geography", "Chemistry"],
  8: ["Statistics", "Essay Writing", "American History", "Biology"],
};

// Function to generate an AI lesson based on grade level and topic
export async function generateLesson(gradeLevel: number, topic?: string): Promise<InsertLesson['spec']> {
  try {
    // Default to grade 3 if outside of range
    const safeGradeLevel = gradeLevel >= 1 && gradeLevel <= 8 ? gradeLevel : 3;
    
    // Select a random topic if none provided
    const availableTopics = gradeTopics[safeGradeLevel];
    const selectedTopic = topic || availableTopics[Math.floor(Math.random() * availableTopics.length)];

    // Create async calls for both content and questions
    const contentPromise = generateLessonContent(safeGradeLevel, selectedTopic);
    const questionsPromise = aiGenerateQuizQuestions(safeGradeLevel, selectedTopic, 5);
    const graphPromise = generateKnowledgeGraph(selectedTopic, safeGradeLevel);
    
    // Wait for both to complete
    const [content, questions, graph] = await Promise.all([contentPromise, questionsPromise, graphPromise]);
    
    // Return the lesson spec
    return {
      title: `${selectedTopic} for Grade ${safeGradeLevel}`,
      content: content,
      questions: questions,
      graph: graph
    };
  } catch (error) {
    console.error('Error generating lesson with AI:', error);
    // Fall back to static content in case of AI service failure
    return generateStaticLesson(gradeLevel, topic);
  }
}

// Fallback function that provides static content if AI fails
function generateStaticLesson(gradeLevel: number, topic?: string): InsertLesson['spec'] {
  // Default to grade 3 if outside of range
  const safeGradeLevel = gradeLevel >= 1 && gradeLevel <= 8 ? gradeLevel : 3;
  
  // Select a random topic if none provided
  const availableTopics = gradeTopics[safeGradeLevel];
  const selectedTopic = topic || availableTopics[Math.floor(Math.random() * availableTopics.length)];
  
  // Generate basic lesson content
  const lessonContent = `
    # ${selectedTopic} for Grade ${safeGradeLevel}
    
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
    title: `${selectedTopic} for Grade ${safeGradeLevel}`,
    content: lessonContent,
    questions: questions,
    graph: graph
  };
}

function getStaticContentForTopic(topic: string, gradeLevel: number): string {
  // Static content that doesn't rely on AI
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
      
    // Default questions if topic doesn't match
    default:
      questions.push({
        text: `What grade level is this ${topic} lesson for?`,
        options: ["Grade 1", "Grade 2", `Grade ${gradeLevel}`, "Grade 5"],
        correctIndex: 2,
        explanation: `This ${topic} lesson is designed for students in Grade ${gradeLevel}.`
      });
      questions.push({
        text: `What subject are we learning about?`,
        options: ["Math", "Science", topic, "History"],
        correctIndex: 2,
        explanation: `We are learning about ${topic} in this lesson.`
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
