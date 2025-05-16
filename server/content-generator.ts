import crypto from "crypto";

/**
 * Generates educational SVG images for different subjects
 */
export function getSubjectSVG(subject: string, category: string): string {
  // Create educational SVG images with actual educational content
  switch (subject.toLowerCase()) {
    case 'math':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#f0f8ff" />
        <text x="150" y="30" font-family="Arial" font-size="16" text-anchor="middle" fill="#333" font-weight="bold">${category} in ${subject}</text>
        ${category.toLowerCase() === 'fractions' ? 
          `<circle cx="75" cy="100" r="50" fill="none" stroke="#333" stroke-width="2"/>
           <path d="M 75 50 L 75 150" stroke="#333" stroke-width="2" />
           <text x="45" y="90" font-family="Arial" font-size="14" fill="#333">1/2</text>
           <text x="95" y="90" font-family="Arial" font-size="14" fill="#333">1/2</text>
           <circle cx="200" cy="100" r="50" fill="none" stroke="#333" stroke-width="2"/>
           <path d="M 150 100 L 250 100" stroke="#333" stroke-width="2" />
           <text x="180" y="90" font-family="Arial" font-size="14" fill="#333">1/2</text>
           <text x="180" y="120" font-family="Arial" font-size="14" fill="#333">1/2</text>` :
        category.toLowerCase() === 'geometry' ?
          `<polygon points="75,50 125,150 25,150" fill="none" stroke="#333" stroke-width="2"/>
           <text x="75" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Triangle</text>
           <rect x="175" y="70" width="80" height="80" fill="none" stroke="#333" stroke-width="2"/>
           <text x="215" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Square</text>` :
        `<text x="75" y="100" font-family="Arial" font-size="16" fill="#333">1 + 2 = 3</text>
         <text x="200" y="100" font-family="Arial" font-size="16" fill="#333">4 × 5 = 20</text>`}
      </svg>`;
      
    case 'science':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#e6ffe6" />
        <text x="150" y="30" font-family="Arial" font-size="16" text-anchor="middle" fill="#333" font-weight="bold">${category} in ${subject}</text>
        ${category.toLowerCase() === 'biology' ?
          `<circle cx="80" cy="100" r="40" fill="#d1f0d1" stroke="#333" stroke-width="1"/>
           <circle cx="90" cy="90" r="10" fill="#333"/>
           <path d="M 80 120 Q 90 140 100 120" stroke="#333" stroke-width="1" fill="none"/>
           <text x="80" y="160" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Cell</text>
           <path d="M 160 60 L 160 140" stroke="#076607" stroke-width="3"/>
           <path d="M 150 70 L 170 70" stroke="#076607" stroke-width="1"/>
           <path d="M 140 90 L 180 90" stroke="#076607" stroke-width="1"/>
           <path d="M 150 110 L 170 110" stroke="#076607" stroke-width="1"/>
           <path d="M 145 130 L 175 130" stroke="#076607" stroke-width="1"/>
           <text x="160" y="160" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Plant</text>
           <path d="M 230 80 L 250 80 L 240 100 L 260 100 L 245 120 L 265 120 L 250 140" stroke="#333" stroke-width="1" fill="none"/>
           <text x="245" y="160" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">DNA</text>` :
        category.toLowerCase() === 'ecology' ?
          `<path d="M 0 140 Q 50 100 100 140 Q 150 100 200 140 Q 250 100 300 140" fill="#81c784" stroke="#388e3c" stroke-width="1"/>
           <circle cx="50" cy="100" r="20" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <circle cx="90" cy="110" r="15" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <circle cx="150" cy="105" r="25" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <circle cx="200" cy="110" r="15" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <circle cx="240" cy="100" r="20" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <path d="M 70 70 L 85 90" stroke="#795548" stroke-width="3"/>
           <path d="M 70 70 L 55 90" stroke="#795548" stroke-width="2"/>
           <path d="M 70 70 L 75 55" stroke="#795548" stroke-width="2"/>
           <path d="M 70 70 L 60 55" stroke="#795548" stroke-width="2"/>
           <path d="M 200 70 L 210 90" stroke="#795548" stroke-width="3"/>
           <path d="M 200 70 L 190 90" stroke="#795548" stroke-width="2"/>
           <path d="M 200 70 L 205 55" stroke="#795548" stroke-width="2"/>
           <path d="M 200 70 L 190 55" stroke="#795548" stroke-width="2"/>
           <text x="150" y="160" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Ecosystem</text>` :
        `<circle cx="150" cy="100" r="40" fill="#ffeb3b" stroke="#333" stroke-width="2"/>
         <circle cx="150" cy="100" r="30" fill="#fdd835" stroke="#333" stroke-width="1"/>
         <path d="M 150 60 L 150 40" stroke="#333" stroke-width="1"/>
         <path d="M 150 140 L 150 160" stroke="#333" stroke-width="1"/>
         <path d="M 110 100 L 90 100" stroke="#333" stroke-width="1"/>
         <path d="M 190 100 L 210 100" stroke="#333" stroke-width="1"/>
         <text x="150" y="160" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Solar System</text>`}
      </svg>`;
      
    case 'history':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#fff8e1" />
        <text x="150" y="30" font-family="Arial" font-size="16" text-anchor="middle" fill="#333" font-weight="bold">${category} in ${subject}</text>
        ${category.toLowerCase().includes('ancient') ?
          `<path d="M 50 150 L 80 150 L 80 100 L 110 100 L 110 150 L 140 150 L 140 80 L 170 80 L 170 150 L 200 150 L 200 60 L 230 60 L 230 150 L 260 150" stroke="#5d4037" stroke-width="1" fill="none"/>
           <path d="M 70 60 L 90 40 L 110 60" stroke="#5d4037" stroke-width="2" fill="none"/>
           <rect x="70" y="60" width="40" height="40" fill="none" stroke="#5d4037" stroke-width="2"/>
           <path d="M 180 60 L 200 30 L 220 60" stroke="#5d4037" stroke-width="2" fill="none"/>
           <rect x="180" y="60" width="40" height="50" fill="none" stroke="#5d4037" stroke-width="2"/>
           <text x="150" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Ancient Civilizations Timeline</text>` :
          `<path d="M 30 100 L 280 100" stroke="#333" stroke-width="2"/>
           <path d="M 50 95 L 50 105" stroke="#333" stroke-width="2"/>
           <text x="50" y="85" font-family="Arial" font-size="10" text-anchor="middle" fill="#333">1700</text>
           <path d="M 100 95 L 100 105" stroke="#333" stroke-width="2"/>
           <text x="100" y="85" font-family="Arial" font-size="10" text-anchor="middle" fill="#333">1800</text>
           <path d="M 150 95 L 150 105" stroke="#333" stroke-width="2"/>
           <text x="150" y="85" font-family="Arial" font-size="10" text-anchor="middle" fill="#333">1900</text>
           <path d="M 200 95 L 200 105" stroke="#333" stroke-width="2"/>
           <text x="200" y="85" font-family="Arial" font-size="10" text-anchor="middle" fill="#333">2000</text>
           <path d="M 250 95 L 250 105" stroke="#333" stroke-width="2"/>
           <text x="250" y="85" font-family="Arial" font-size="10" text-anchor="middle" fill="#333">Present</text>
           <text x="150" y="130" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Historical Timeline</text>`}
      </svg>`;
      
    case 'literature':
    case 'reading':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#efebe9" />
        <text x="150" y="30" font-family="Arial" font-size="16" text-anchor="middle" fill="#333" font-weight="bold">${category} in ${subject}</text>
        ${category.toLowerCase() === 'poetry' ?
          `<path d="M 50 50 L 250 50" stroke="#333" stroke-width="1"/>
           <text x="90" y="70" font-family="Arial" font-size="12" fill="#333">Roses are red,</text>
           <text x="100" y="90" font-family="Arial" font-size="12" fill="#333">Violets are blue,</text>
           <text x="110" y="110" font-family="Arial" font-size="12" fill="#333">Sugar is sweet,</text>
           <text x="120" y="130" font-family="Arial" font-size="12" fill="#333">And so are you!</text>
           <path d="M 50 150 L 250 150" stroke="#333" stroke-width="1"/>` :
        category.toLowerCase() === 'fiction' ?
          `<rect x="70" y="70" width="40" height="60" fill="none" stroke="#795548" stroke-width="2"/>
           <text x="90" y="100" font-family="Arial" font-size="10" text-anchor="middle" fill="#333" transform="rotate(-90, 90, 100)">NOVEL</text>
           <rect x="120" y="70" width="40" height="60" fill="none" stroke="#795548" stroke-width="2"/>
           <text x="140" y="100" font-family="Arial" font-size="10" text-anchor="middle" fill="#333" transform="rotate(-90, 140, 100)">STORY</text>
           <rect x="170" y="70" width="40" height="60" fill="none" stroke="#795548" stroke-width="2"/>
           <text x="190" y="100" font-family="Arial" font-size="10" text-anchor="middle" fill="#333" transform="rotate(-90, 190, 100)">FABLE</text>` :
        `<rect x="75" y="60" width="50" height="80" fill="#d7ccc8" stroke="#333" stroke-width="1"/>
         <path d="M 75 60 Q 100 50 125 60" fill="none" stroke="#333" stroke-width="1"/>
         <path d="M 75 140 Q 100 150 125 140" fill="none" stroke="#333" stroke-width="1"/>
         <rect x="175" y="60" width="50" height="80" fill="#d7ccc8" stroke="#333" stroke-width="1"/>
         <path d="M 175 60 Q 200 50 225 60" fill="none" stroke="#333" stroke-width="1"/>
         <path d="M 175 140 Q 200 150 225 140" fill="none" stroke="#333" stroke-width="1"/>
         <text x="150" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Books</text>`}
      </svg>`;
      
    case 'geography':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#e0f7fa" />
        <text x="150" y="30" font-family="Arial" font-size="16" text-anchor="middle" fill="#333" font-weight="bold">${category} in ${subject}</text>
        ${category.toLowerCase() === 'continents' ?
          `<path d="M 50 100 Q 70 80 90 100 Q 110 120 130 100 Q 150 80 170 100 Q 190 120 210 100 Q 230 80 250 100" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <path d="M 40 100 L 260 100" fill="none" stroke="#0288d1" stroke-width="2"/>
           <text x="150" y="150" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">World Map</text>` :
        category.toLowerCase() === 'countries' ?
          `<path d="M 70 70 L 100 70 L 120 90 L 80 120 L 70 100 Z" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <path d="M 120 90 L 140 70 L 180 70 L 190 90 L 170 120 L 130 110 Z" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <path d="M 190 90 L 200 70 L 230 70 L 240 90 L 220 120 L 190 110 Z" fill="#a5d6a7" stroke="#388e3c" stroke-width="1"/>
           <text x="150" y="150" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Countries Map</text>` :
        `<path d="M 50 80 Q 100 50 150 80 Q 200 110 250 80" fill="#81d4fa" stroke="#0288d1" stroke-width="1"/>
         <path d="M 50 110 Q 100 80 150 110 Q 200 140 250 110" fill="#81d4fa" stroke="#0288d1" stroke-width="1"/>
         <path d="M 50 140 Q 100 110 150 140 Q 200 170 250 140" fill="#81d4fa" stroke="#0288d1" stroke-width="1"/>
         <text x="150" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Geography</text>`}
      </svg>`;
      
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#f5f5f5" />
        <text x="150" y="30" font-family="Arial" font-size="16" text-anchor="middle" fill="#333" font-weight="bold">${category} in ${subject}</text>
        <text x="150" y="100" font-family="Arial" font-size="14" text-anchor="middle" fill="#333">Learning about ${category}</text>
        <rect x="75" y="120" width="150" height="30" fill="#e0e0e0" stroke="#333" stroke-width="1" rx="5" ry="5"/>
        <text x="150" y="140" font-family="Arial" font-size="12" text-anchor="middle" fill="#333">Educational Content</text>
      </svg>`;
  }
}

/**
 * Generate rich lesson content based on subject, category and grade level
 */
export function generateLessonContent(subject: string, category: string, gradeLevel: number): string {
  // Create detailed, educational content appropriate for grade level
  let content = `# ${category} in ${subject}\n\n`;
  
  switch (subject.toLowerCase()) {
    case 'math':
      if (category.toLowerCase() === 'fractions') {
        content += `Fractions are numbers that represent parts of a whole. They are written with a numerator (top number) and a denominator (bottom number).\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- A fraction shows parts of a whole\n`;
        content += `- The numerator (top number) tells how many parts we have\n`;
        content += `- The denominator (bottom number) tells how many equal parts the whole is divided into\n`;
        content += `- Equivalent fractions are different fractions that have the same value\n\n`;
        content += `## Examples\n\n`;
        content += `- If you cut a pizza into 8 equal slices and eat 3 slices, you've eaten 3/8 of the pizza\n`;
        content += `- Half of a cookie can be written as 1/2\n`;
        content += `- 2/4 is equivalent to 1/2 because they represent the same amount\n\n`;
        content += `## Practice\n\n`;
        content += `Let's practice identifying fractions in everyday situations. If you have 10 markers and 4 are blue, what fraction of the markers are blue? The answer is 4/10, which can be simplified to 2/5.`;
      } else if (category.toLowerCase() === 'geometry') {
        content += `Geometry is the study of shapes, sizes, positions, and dimensions. It helps us understand the space around us.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- A point is a location in space with no size\n`;
        content += `- A line is a straight path that extends infinitely in both directions\n`;
        content += `- A polygon is a closed figure made up of line segments\n`;
        content += `- Common polygons include triangles (3 sides), squares (4 sides), and pentagons (5 sides)\n\n`;
        content += `## Examples\n\n`;
        content += `- The corners of a square are called vertices\n`;
        content += `- A circle is a round shape where all points are the same distance from the center\n`;
        content += `- Your classroom has many geometric shapes - the walls form rectangles, the clock is a circle\n\n`;
        content += `## Practice\n\n`;
        content += `Look around you and try to identify different shapes. How many rectangles can you see in your room? Can you find any triangles or circles?`;
      } else {
        content += `Mathematics helps us understand numbers, quantities, shapes, and patterns. It's a fundamental subject that we use every day.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Numbers represent quantities and can be added, subtracted, multiplied, and divided\n`;
        content += `- Patterns help us predict what comes next in a sequence\n`;
        content += `- Mathematical operations follow specific rules and order\n`;
        content += `- Math is all around us in everyday activities\n\n`;
        content += `## Examples\n\n`;
        content += `- When you count money, you're using addition and subtraction\n`;
        content += `- Following a recipe requires measuring and sometimes dividing or multiplying quantities\n`;
        content += `- Playing games often involves counting spaces, adding scores, or calculating probabilities\n\n`;
        content += `## Practice\n\n`;
        content += `Think about how you used math today. Did you count objects, measure something, or solve a problem using numbers?`;
      }
      break;
      
    case 'science':
      if (category.toLowerCase() === 'ecology') {
        content += `Ecology is the study of how living things interact with each other and their environment. It helps us understand the connections in nature.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- An ecosystem includes all living organisms in an area, plus the non-living parts of their environment\n`;
        content += `- A food chain shows how energy passes from one organism to another\n`;
        content += `- Habitats are natural homes for plants and animals\n`;
        content += `- All living things depend on each other in some way\n\n`;
        content += `## Examples\n\n`;
        content += `- In a forest ecosystem, trees provide oxygen, shelter, and food for many animals\n`;
        content += `- A simple food chain: grass → rabbit → fox\n`;
        content += `- Plants need sunlight, water, and air to survive in their habitat\n\n`;
        content += `## Practice\n\n`;
        content += `Think about your local park or backyard. What plants and animals live there? How might they depend on each other? For example, birds might eat insects that live on plants.`;
      } else if (category.toLowerCase() === 'biology') {
        content += `Biology is the study of living things. It helps us understand plants, animals, humans, and tiny organisms we can't see with our eyes.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- All living things are made of cells, which are like tiny building blocks\n`;
        content += `- Plants make their own food using sunlight through a process called photosynthesis\n`;
        content += `- Animals need to eat plants or other animals to get energy\n`;
        content += `- Living things can adapt, or change, to survive in their environments\n\n`;
        content += `## Examples\n\n`;
        content += `- Your body has billions of cells that work together to keep you healthy\n`;
        content += `- A seed grows into a plant that produces flowers and more seeds\n`;
        content += `- Some animals hibernate (sleep) during winter when food is scarce\n\n`;
        content += `## Practice\n\n`;
        content += `Observe a plant in your home or outside. What parts can you identify? How do you think each part helps the plant survive?`;
      } else {
        content += `Science helps us understand the world around us through observation and experimentation. It's how we learn about nature, technology, and even ourselves.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Scientists ask questions and conduct experiments to find answers\n`;
        content += `- The scientific method is a process for solving problems: ask a question, make a hypothesis, test it, analyze results\n`;
        content += `- Different branches of science study different things (biology, chemistry, physics, etc.)\n`;
        content += `- Science is always changing as we make new discoveries\n\n`;
        content += `## Examples\n\n`;
        content += `- Weather forecasters use science to predict if it will rain tomorrow\n`;
        content += `- Doctors use science to understand how to keep people healthy\n`;
        content += `- Engineers use science to design buildings, bridges, and technology\n\n`;
        content += `## Practice\n\n`;
        content += `Try a simple science experiment: place a bean on a wet paper towel in a clear plastic bag. Tape it to a sunny window and observe what happens over several days. Can you explain the changes you see?`;
      }
      break;
      
    case 'history':
      if (category.toLowerCase().includes('ancient')) {
        content += `Ancient civilizations were some of the first human societies that developed writing, architecture, and organized governments thousands of years ago.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Ancient civilizations developed around river valleys where farming was easier\n`;
        content += `- Many ancient peoples built magnificent structures like pyramids, temples, and palaces\n`;
        content += `- Writing systems were invented to keep records and share ideas\n`;
        content += `- These early societies created laws, art, and religious practices\n\n`;
        content += `## Examples\n\n`;
        content += `- The Ancient Egyptians built pyramids and wrote using hieroglyphics\n`;
        content += `- Ancient Greece gave us democracy, the Olympics, and famous philosophers\n`;
        content += `- The Ancient Maya created a complex calendar and built stepped pyramids in Central America\n\n`;
        content += `## Practice\n\n`;
        content += `Imagine you lived in Ancient Egypt. What would your daily life be like? What kinds of food might you eat? What jobs might people have had?`;
      } else {
        content += `History is the study of past events and how they have shaped our world today. It helps us understand where we came from and learn from earlier times.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Historical events are connected to each other and have causes and effects\n`;
        content += `- Primary sources are materials created during the time being studied\n`;
        content += `- Secondary sources are created later, looking back at historical events\n`;
        content += `- Timelines help us visualize when events happened in relation to each other\n\n`;
        content += `## Examples\n\n`;
        content += `- Explorers like Christopher Columbus changed how people understood the world\n`;
        content += `- The invention of the printing press made books more available and spread knowledge\n`;
        content += `- Local history shows how your own community has changed over time\n\n`;
        content += `## Practice\n\n`;
        content += `Create a timeline of your life with 5-10 important events. How have these events influenced who you are today?`;
      }
      break;
      
    case 'reading':
    case 'literature':
      if (category.toLowerCase() === 'poetry') {
        content += `Poetry is a type of writing that uses carefully chosen words to express ideas and feelings. Poems often have rhythm, rhyme, and creative language.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Poems can have different patterns of rhythm and rhyme\n`;
        content += `- Poets use descriptive language to paint pictures with words\n`;
        content += `- Similes compare things using "like" or "as" (example: "quick as a fox")\n`;
        content += `- Metaphors make comparisons without using "like" or "as" (example: "the moon was a silver coin")\n\n`;
        content += `## Examples\n\n`;
        content += `- Haiku is a Japanese poetry form with three lines (5-7-5 syllables)\n`;
        content += `- Nursery rhymes are simple poems for children\n`;
        content += `- Many songs are actually poems set to music\n\n`;
        content += `## Practice\n\n`;
        content += `Try writing a simple poem about your favorite season. Use your five senses: what do you see, hear, smell, taste, and feel during this season?`;
      } else if (category.toLowerCase() === 'fiction') {
        content += `Fiction refers to stories that come from an author's imagination rather than real events. Fiction includes novels, short stories, fables, and fantasy.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Characters are the people or animals in a story\n`;
        content += `- Setting is where and when a story takes place\n`;
        content += `- Plot is the sequence of events in a story\n`;
        content += `- Theme is the main message or lesson in a story\n\n`;
        content += `## Examples\n\n`;
        content += `- Fairy tales often begin with "Once upon a time" and include magical elements\n`;
        content += `- Realistic fiction tells made-up stories that could happen in real life\n`;
        content += `- Science fiction imagines future technologies and worlds\n\n`;
        content += `## Practice\n\n`;
        content += `Think about your favorite story or book. Who are the main characters? What is the setting? What problem does the main character face, and how is it solved?`;
      } else {
        content += `Reading and literature help us explore ideas, learn new information, and enjoy stories. Reading is a fundamental skill that opens doors to knowledge and imagination.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Reading involves understanding the meaning of written words\n`;
        content += `- Comprehension means understanding what you read\n`;
        content += `- Different types of books serve different purposes\n`;
        content += `- Good readers ask questions and make connections as they read\n\n`;
        content += `## Examples\n\n`;
        content += `- Nonfiction books give factual information about real topics\n`;
        content += `- Fiction books tell stories from the author's imagination\n`;
        content += `- Poetry uses carefully chosen words to create images and express feelings\n\n`;
        content += `## Practice\n\n`;
        content += `Choose a book you enjoy. As you read, pause occasionally to ask yourself questions like "What might happen next?" or "Why did the character make that choice?"`;
      }
      break;
      
    case 'geography':
      if (category.toLowerCase() === 'continents') {
        content += `Continents are the Earth's largest land areas. There are seven continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- The seven continents vary greatly in size, with Asia being the largest\n`;
        content += `- Continents are surrounded by oceans and seas\n`;
        content += `- Each continent has unique physical features, climates, and cultures\n`;
        content += `- Continents are made up of multiple countries (except Antarctica)\n\n`;
        content += `## Examples\n\n`;
        content += `- North America includes Canada, the United States, and Mexico\n`;
        content += `- Africa is home to the Sahara Desert, the world's largest hot desert\n`;
        content += `- Antarctica is covered almost entirely in ice and has no permanent residents\n\n`;
        content += `## Practice\n\n`;
        content += `Look at a world map. Can you name all seven continents? Which continent do you live on? Which continent would you like to visit someday and why?`;
      } else if (category.toLowerCase() === 'countries') {
        content += `Countries are areas of land with their own governments, borders, people, and cultures. There are nearly 200 countries in the world today.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Each country has its own flag, capital city, and government\n`;
        content += `- Countries have borders that separate them from neighboring countries\n`;
        content += `- Many countries have their own language, currency, and customs\n`;
        content += `- The United Nations is an organization where countries work together\n\n`;
        content += `## Examples\n\n`;
        content += `- Japan is an island country in Asia known for technology and traditional arts\n`;
        content += `- Brazil is the largest country in South America and home to part of the Amazon Rainforest\n`;
        content += `- Kenya is an African country known for wildlife safaris and long-distance runners\n\n`;
        content += `## Practice\n\n`;
        content += `Choose a country you'd like to learn more about. What is its capital city? What languages do people speak there? What foods are popular there?`;
      } else {
        content += `Geography is the study of Earth's lands, features, inhabitants, and environments. It helps us understand the world and our place in it.\n\n`;
        content += `## Key Concepts\n\n`;
        content += `- Geography includes physical features like mountains, rivers, and oceans\n`;
        content += `- Maps are tools that show where places are located\n`;
        content += `- The equator divides Earth into the Northern and Southern Hemispheres\n`;
        content += `- Climate describes the typical weather patterns in a place over time\n\n`;
        content += `## Examples\n\n`;
        content += `- The Nile is the longest river in the world\n`;
        content += `- Mount Everest is the highest mountain on Earth\n`;
        content += `- The Pacific is the largest ocean\n\n`;
        content += `## Practice\n\n`;
        content += `Draw a map of your neighborhood showing important places. Include a compass rose showing north, south, east, and west.`;
      }
      break;
      
    default:
      content += `Let's explore ${category} in the field of ${subject}! This lesson is designed for grade ${gradeLevel} students.\n\n`;
      content += `## Key Concepts\n\n`;
      content += `- ${category} is an important part of ${subject}\n`;
      content += `- Learning about ${category} helps us understand the world better\n`;
      content += `- There are many interesting facts to discover about this topic\n\n`;
      content += `## Examples\n\n`;
      content += `- Example 1: A real-world application of ${category}\n`;
      content += `- Example 2: How ${category} works in everyday situations\n`;
      content += `- Example 3: An interesting fact about ${category}\n\n`;
      content += `## Practice\n\n`;
      content += `Think about how ${category} might be used in your daily life. Can you find examples around you?`;
  }
  
  return content;
}

/**
 * Generate age-appropriate quiz questions for specific grade levels
 */
export function generateQuizQuestions(subject: string, category: string, gradeLevel: number): any[] {
  // Create age-appropriate quiz questions
  const questions = [];
  
  // Math questions
  if (subject.toLowerCase() === 'math') {
    if (category.toLowerCase() === 'fractions') {
      questions.push({
        text: "Which fraction represents half of a whole?",
        options: ["1/2", "1/4", "2/3", "3/4"],
        correctIndex: 0,
        explanation: "1/2 means one out of two equal parts, which is half of a whole."
      });
      
      questions.push({
        text: "If you cut a pizza into 8 slices and eat 2 slices, what fraction of the pizza have you eaten?",
        options: ["2/8", "1/4", "Both A and B are correct", "8/2"],
        correctIndex: 2,
        explanation: "2/8 and 1/4 are equivalent fractions - they represent the same amount."
      });
      
      questions.push({
        text: "Which fraction is larger?",
        options: ["1/3", "1/5", "They are equal", "It depends"],
        correctIndex: 0,
        explanation: "1/3 is larger than 1/5 because when the denominator (bottom number) is smaller, each piece is larger."
      });
    } else if (category.toLowerCase() === 'geometry') {
      questions.push({
        text: "How many sides does a triangle have?",
        options: ["3", "4", "5", "6"],
        correctIndex: 0,
        explanation: "A triangle has exactly 3 sides."
      });
      
      questions.push({
        text: "Which shape has 4 equal sides and 4 equal angles?",
        options: ["Rectangle", "Square", "Rhombus", "Trapezoid"],
        correctIndex: 1,
        explanation: "A square has 4 equal sides and 4 equal angles (90 degrees each)."
      });
      
      questions.push({
        text: "What is the name for a solid shape with 6 square faces?",
        options: ["Cylinder", "Sphere", "Cone", "Cube"],
        correctIndex: 3,
        explanation: "A cube has 6 square faces. Think of a dice or a box with equal sides."
      });
    } else {
      questions.push({
        text: "What is 25 × 4?",
        options: ["100", "29", "125", "95"],
        correctIndex: 0,
        explanation: "25 × 4 = 100. You can think of it as 25 + 25 + 25 + 25 = 100."
      });
      
      questions.push({
        text: "If you have 3 pencils and your friend gives you 5 more, how many pencils do you have now?",
        options: ["5", "8", "15", "2"],
        correctIndex: 1,
        explanation: "3 + 5 = 8 pencils."
      });
      
      questions.push({
        text: "What comes next in this pattern? 2, 4, 6, 8, __",
        options: ["9", "10", "12", "16"],
        correctIndex: 1,
        explanation: "This pattern counts by 2s, so after 8 comes 10."
      });
    }
  }
  
  // Science questions
  else if (subject.toLowerCase() === 'science') {
    if (category.toLowerCase() === 'ecology') {
      questions.push({
        text: "What is an ecosystem?",
        options: [
          "A community of living things and their environment", 
          "Only the plants in an area", 
          "Only the animals in an area", 
          "The weather in a location"
        ],
        correctIndex: 0,
        explanation: "An ecosystem includes all living organisms in an area and their physical environment."
      });
      
      questions.push({
        text: "Which of these is an example of a food chain?",
        options: [
          "Sun → Tree → Bird", 
          "Grass → Rabbit → Fox", 
          "Rock → Water → Air", 
          "Tree → Sun → Soil"
        ],
        correctIndex: 1,
        explanation: "A food chain shows how energy passes from one organism to another. Grass is eaten by rabbits, which may be eaten by foxes."
      });
      
      questions.push({
        text: "Why are plants important in an ecosystem?",
        options: [
          "They provide oxygen and food for animals", 
          "They make the ecosystem look pretty", 
          "They keep the soil warm", 
          "They chase away dangerous animals"
        ],
        correctIndex: 0,
        explanation: "Plants produce oxygen through photosynthesis and serve as food for many animals, making them essential to ecosystems."
      });
    } else if (category.toLowerCase() === 'biology') {
      questions.push({
        text: "What do plants need to make their own food?",
        options: [
          "Sunlight, water, and air", 
          "Soil, meat, and water", 
          "Darkness and cold temperatures", 
          "Other plants to eat"
        ],
        correctIndex: 0,
        explanation: "Plants make food through photosynthesis, which requires sunlight, water, and carbon dioxide from the air."
      });
      
      questions.push({
        text: "Which part of a plant absorbs water from the soil?",
        options: [
          "Leaves", 
          "Flowers", 
          "Roots", 
          "Stems"
        ],
        correctIndex: 2,
        explanation: "A plant's roots absorb water and nutrients from the soil."
      });
      
      questions.push({
        text: "What is a cell?",
        options: [
          "A small room where plants grow", 
          "The basic building block of all living things", 
          "A type of battery", 
          "A place to make phone calls"
        ],
        correctIndex: 1,
        explanation: "Cells are the tiny building blocks that make up all living organisms."
      });
    } else {
      questions.push({
        text: "What state of matter takes the shape of its container but maintains its volume?",
        options: [
          "Solid", 
          "Liquid", 
          "Gas", 
          "Plasma"
        ],
        correctIndex: 1,
        explanation: "Liquids take the shape of their container but maintain their volume. Think of water in different shaped containers."
      });
      
      questions.push({
        text: "Which force pulls objects toward Earth?",
        options: [
          "Magnetism", 
          "Friction", 
          "Gravity", 
          "Electricity"
        ],
        correctIndex: 2,
        explanation: "Gravity is the force that pulls objects toward Earth."
      });
      
      questions.push({
        text: "Which planet is known as the 'Red Planet'?",
        options: [
          "Venus", 
          "Mars", 
          "Jupiter", 
          "Saturn"
        ],
        correctIndex: 1,
        explanation: "Mars is often called the 'Red Planet' because of its reddish appearance."
      });
    }
  }
  
  // Default questions for other subjects
  else {
    questions.push({
      text: `What is one important fact about ${category} in ${subject}?`,
      options: [
        `${category} is a fundamental concept in ${subject}`, 
        `${category} is rarely studied in ${subject}`, 
        `${category} is not related to ${subject}`, 
        `${category} was invented in the 21st century`
      ],
      correctIndex: 0,
      explanation: `${category} is indeed an important concept within the field of ${subject}.`
    });
    
    questions.push({
      text: `Which of these is true about ${category}?`,
      options: [
        `It helps us understand important aspects of ${subject}`, 
        `It is no longer taught in schools`, 
        `It has no practical applications`, 
        `It was recently discovered`
      ],
      correctIndex: 0,
      explanation: `Learning about ${category} helps us better understand many aspects of ${subject}.`
    });
    
    questions.push({
      text: `Why is it important to learn about ${category}?`,
      options: [
        `To understand the world around us better`, 
        `It's not actually important`, 
        `Only scientists need to know about it`, 
        `To become famous`
      ],
      correctIndex: 0,
      explanation: `Learning about ${category} in ${subject} helps us understand our world better and builds important knowledge.`
    });
  }
  
  return questions;
}

/**
 * Generate a unique ID for resources
 */
export function generateId(length: number = 6): string {
  return crypto.randomBytes(length).toString('hex');
}