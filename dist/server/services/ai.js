"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLesson = generateLesson;
exports.generateQuiz = generateQuiz;
exports.generateFeedback = generateFeedback;
exports.generateKnowledgeGraph = generateKnowledgeGraph;
exports.generateEducationalImage = generateEducationalImage;
exports.generateEducationalDiagram = generateEducationalDiagram;
exports.generateLessonPackage = generateLessonPackage;
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("../prompts"); // This now points to the modular system
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Configuration for different AI models based on complexity requirements
 * Lower grades use faster models, higher grades can leverage more sophisticated reasoning
 */
const getModelConfig = (gradeLevel) => {
    if (gradeLevel <= 2) {
        // K-2: Simple, consistent outputs
        return { model: 'gpt-4-turbo-preview', temperature: 0.3 };
    }
    else if (gradeLevel <= 6) {
        // 3-6: Balanced creativity and accuracy
        return { model: 'gpt-4-turbo-preview', temperature: 0.5 };
    }
    else if (gradeLevel <= 8) {
        // 7-8: More sophisticated reasoning
        return { model: 'gpt-4-turbo-preview', temperature: 0.6 };
    }
    else {
        // 9+: Advanced analytical capabilities
        return { model: 'gpt-4-turbo-preview', temperature: 0.7 };
    }
};
/**
 * Generates a lesson using the modular prompt system
 * Automatically selects appropriate prompting strategy based on grade level
 */
async function generateLesson(topic, gradeLevel, style = 'standard') {
    try {
        const { model, temperature } = getModelConfig(gradeLevel);
        // Select appropriate prompt based on style preference
        let systemPrompt;
        let userPrompt;
        switch (style) {
            case 'enhanced':
                systemPrompt = prompts_1.LESSON_PROMPTS.ENHANCED_LESSON(gradeLevel, topic);
                userPrompt = prompts_1.LESSON_PROMPTS.STANDARD_LESSON_USER(gradeLevel, topic);
                break;
            case 'legacy':
                // Legacy support for existing implementations
                systemPrompt = prompts_1.LESSON_PROMPTS.STANDARD_LESSON(gradeLevel, topic);
                userPrompt = prompts_1.LESSON_PROMPTS.STANDARD_LESSON_USER(gradeLevel, topic);
                break;
            default:
                systemPrompt = prompts_1.LESSON_PROMPTS.STANDARD_LESSON(gradeLevel, topic);
                userPrompt = prompts_1.LESSON_PROMPTS.STANDARD_LESSON_USER(gradeLevel, topic);
        }
        const completion = await openai.chat.completions.create({
            model,
            temperature,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: gradeLevel <= 2 ? 500 : gradeLevel <= 6 ? 1000 : 2000,
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content generated from AI model');
        }
        // Validate content meets grade-level constraints
        const validation = validateContentLength(content, gradeLevel);
        if (!validation.valid) {
            console.warn(`Content length validation failed: ${validation.message}`);
            // In production, you might want to retry with stricter constraints
        }
        return content;
    }
    catch (error) {
        console.error('Error generating lesson:', error);
        throw new Error('Failed to generate lesson content');
    }
}
/**
 * Generates quiz questions using grade-appropriate complexity
 */
async function generateQuiz(topic, gradeLevel, questionCount = 5) {
    try {
        const { model, temperature } = getModelConfig(gradeLevel);
        const completion = await openai.chat.completions.create({
            model,
            temperature: temperature * 0.8, // Lower temperature for more consistent quiz generation
            messages: [
                { role: 'system', content: prompts_1.QUIZ_PROMPTS.STANDARD_QUIZ(gradeLevel, topic) },
                { role: 'user', content: prompts_1.QUIZ_PROMPTS.STANDARD_QUIZ_USER(gradeLevel, topic, questionCount) }
            ],
            max_tokens: 2000,
            response_format: { type: "json_object" } // Ensure JSON response for quiz parsing
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No quiz content generated');
        }
        try {
            const quizData = JSON.parse(content);
            // Ensure quiz questions array exists and has the expected structure
            const questions = Array.isArray(quizData) ? quizData : quizData.questions || [];
            // Validate question format for grade level
            questions.forEach((question, index) => {
                if (gradeLevel <= 2 && question.text.split(' ').length > 5) {
                    console.warn(`Question ${index + 1} too complex for grade ${gradeLevel}`);
                }
            });
            return questions;
        }
        catch (parseError) {
            console.error('Error parsing quiz JSON:', parseError);
            throw new Error('Invalid quiz format generated');
        }
    }
    catch (error) {
        console.error('Error generating quiz:', error);
        throw new Error('Failed to generate quiz questions');
    }
}
/**
 * Generates personalized feedback based on quiz performance
 */
async function generateFeedback(quizQuestions, userAnswers, score, gradeLevel) {
    try {
        const { model, temperature } = getModelConfig(gradeLevel);
        const completion = await openai.chat.completions.create({
            model,
            temperature: temperature * 1.2, // Slightly higher for more personalized feedback
            messages: [
                { role: 'system', content: prompts_1.FEEDBACK_PROMPTS.PERSONALIZED_FEEDBACK(gradeLevel) },
                { role: 'user', content: prompts_1.FEEDBACK_PROMPTS.QUIZ_FEEDBACK_USER(quizQuestions, userAnswers, score, gradeLevel) }
            ],
            max_tokens: gradeLevel <= 2 ? 200 : gradeLevel <= 6 ? 400 : 800,
        });
        const feedback = completion.choices[0]?.message?.content;
        if (!feedback) {
            throw new Error('No feedback generated');
        }
        return feedback;
    }
    catch (error) {
        console.error('Error generating feedback:', error);
        throw new Error('Failed to generate feedback');
    }
}
/**
 * Generates a knowledge graph for visualizing concept relationships
 */
async function generateKnowledgeGraph(topic, gradeLevel) {
    try {
        const { model, temperature } = getModelConfig(gradeLevel);
        const completion = await openai.chat.completions.create({
            model,
            temperature: temperature * 0.7, // Lower for more structured output
            messages: [
                { role: 'system', content: prompts_1.KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH() },
                { role: 'user', content: prompts_1.KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH_USER(topic, gradeLevel) }
            ],
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No knowledge graph generated');
        }
        try {
            const graphData = JSON.parse(content);
            // Validate graph structure
            if (!graphData.nodes || !graphData.edges) {
                throw new Error('Invalid graph structure');
            }
            // Ensure appropriate complexity for grade level
            const nodeCount = graphData.nodes.length;
            const expectedNodes = gradeLevel <= 2 ? 5 : gradeLevel <= 6 ? 10 : gradeLevel <= 8 ? 15 : 20;
            if (nodeCount > expectedNodes * 1.5) {
                console.warn(`Graph complexity (${nodeCount} nodes) may be too high for grade ${gradeLevel}`);
            }
            return graphData;
        }
        catch (parseError) {
            console.error('Error parsing knowledge graph:', parseError);
            throw new Error('Invalid knowledge graph format');
        }
    }
    catch (error) {
        console.error('Error generating knowledge graph:', error);
        throw new Error('Failed to generate knowledge graph');
    }
}
/**
 * Generates educational image descriptions for visual learning
 */
async function generateEducationalImage(topic, concept, gradeLevel) {
    try {
        const { model, temperature } = getModelConfig(gradeLevel);
        const completion = await openai.chat.completions.create({
            model,
            temperature: temperature * 0.8,
            messages: [
                {
                    role: 'user',
                    content: prompts_1.IMAGE_PROMPTS.EDUCATIONAL_IMAGE(topic, concept, gradeLevel)
                }
            ],
            max_tokens: 1000,
        });
        const imageDescription = completion.choices[0]?.message?.content;
        if (!imageDescription) {
            throw new Error('No image description generated');
        }
        return imageDescription;
    }
    catch (error) {
        console.error('Error generating image description:', error);
        throw new Error('Failed to generate educational image description');
    }
}
/**
 * Generates educational diagram specifications
 */
async function generateEducationalDiagram(topic, diagramType, gradeLevel) {
    try {
        const { model, temperature } = getModelConfig(gradeLevel);
        const completion = await openai.chat.completions.create({
            model,
            temperature: temperature * 0.8,
            messages: [
                {
                    role: 'user',
                    content: prompts_1.IMAGE_PROMPTS.EDUCATIONAL_DIAGRAM(topic, diagramType, gradeLevel)
                }
            ],
            max_tokens: 1000,
        });
        const diagramSpec = completion.choices[0]?.message?.content;
        if (!diagramSpec) {
            throw new Error('No diagram specification generated');
        }
        return diagramSpec;
    }
    catch (error) {
        console.error('Error generating diagram specification:', error);
        throw new Error('Failed to generate diagram specification');
    }
}
/**
 * Utility function to validate content meets grade-level requirements
 */
function validateContentLength(content, gradeLevel) {
    const wordCount = content.split(/\s+/).length;
    const limits = {
        2: { max: 75, sentenceLength: 5 },
        4: { max: 200, sentenceLength: 8 },
        6: { max: 400, sentenceLength: 12 },
        8: { max: 700, sentenceLength: 15 },
        12: { max: 2000, sentenceLength: null }
    };
    const limit = limits[Math.min(12, Math.max(2, Math.ceil(gradeLevel / 2) * 2))];
    if (wordCount > limit.max) {
        return {
            valid: false,
            message: `Content exceeds maximum word count (${wordCount} > ${limit.max})`
        };
    }
    if (limit.sentenceLength) {
        const sentences = content.split(/[.!?]+/);
        const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > limit.sentenceLength);
        if (longSentences.length > sentences.length * 0.2) {
            return {
                valid: false,
                message: `Too many sentences exceed length limit for grade ${gradeLevel}`
            };
        }
    }
    return { valid: true };
}
/**
 * Batch generation for efficiency when creating multiple related items
 */
async function generateLessonPackage(topic, gradeLevel) {
    try {
        // Generate all components in parallel for efficiency
        const [lesson, quiz, knowledgeGraph] = await Promise.all([
            generateLesson(topic, gradeLevel),
            generateQuiz(topic, gradeLevel),
            generateKnowledgeGraph(topic, gradeLevel)
        ]);
        // Optionally generate an image for visual learners
        let image;
        if (gradeLevel <= 6) {
            // Younger students benefit more from visual aids
            image = await generateEducationalImage(topic, topic, gradeLevel);
        }
        return {
            lesson,
            quiz,
            knowledgeGraph,
            image
        };
    }
    catch (error) {
        console.error('Error generating lesson package:', error);
        throw new Error('Failed to generate complete lesson package');
    }
}
exports.default = {
    generateLesson,
    generateQuiz,
    generateFeedback,
    generateKnowledgeGraph,
    generateEducationalImage,
    generateEducationalDiagram,
    generateLessonPackage
};
//# sourceMappingURL=ai.js.map