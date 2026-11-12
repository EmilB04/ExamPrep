import { complexLessons } from './complex-systems'
export type Topic = { title: string; description: string; lessonId?: string }
export type Question = {
  id: string
  question: string
  options: string[]
  answer: number
  explanation: string
  hint?: string
  context?: string
}
export type Lesson = {
  id: string
  title: string
  eyebrow: string
  minutes: number
  intro: string
  paragraphs: string[]
  takeaway: string
  question: string
  options: string[]
  answer: number
  explanation: string
  recall: string
  recallAnswer: string
  reading?: string
  provenance?: string
  caution?: string
  exercise?: string
  questions?: Question[]
}
export type Course = {
  id: string
  code: string
  title: string
  shortTitle: string
  color: 'green' | 'violet' | 'orange'
  description: string
  assessment: string
  topics: Topic[]
  lesson: Lesson
  lessons?: Lesson[]
}
export const courses: Course[] = [
  {
    id: 'machine-learning',
    code: 'ITI41720',
    title: 'Machine Learning and Deep Learning',
    shortTitle: 'Machine Learning',
    color: 'green',
    description:
      'From learning patterns to understanding the models behind them.',
    assessment: 'Written exam · 3 hours · 35% / portfolio · 65%',
    topics: [
      {
        title: 'Learning & generalisation',
        description: 'Learning types, preprocessing, and overfitting',
      },
      {
        title: 'Trees & ensembles',
        description: 'Decision trees, random forests, and XGBoost',
      },
      {
        title: 'Neural networks',
        description: 'Representations, deep learning, and CNNs',
      },
      {
        title: 'Sequence models',
        description: 'RNNs, state space models, and transformers',
      },
    ],
    lesson: {
      id: 'ml-generalisation',
      title: 'Learning beyond the training data',
      eyebrow: 'Learning & generalisation',
      minutes: 8,
      intro:
        'A model should learn useful patterns, so it can make predictions on examples it has never seen.',
      paragraphs: [
        'Training data lets a model adjust its parameters. Validation data helps you compare model choices and hyperparameters. A held-out test set provides a final estimate of performance after those choices are made.',
        'A very flexible model can fit the training observations closely while also learning noise. This is overfitting: a low training error does not guarantee a low error on new observations.',
      ],
      takeaway:
        'Choose model complexity using validation performance. Keep the test set separate from model selection.',
      question:
        'You are choosing the maximum depth of a decision tree. Which data should guide this choice?',
      options: [
        'The training set alone',
        'The validation set or cross-validation folds',
        'The final test set',
      ],
      answer: 1,
      explanation:
        'Use validation data or cross-validation to tune depth. Repeatedly using the test set to choose a model makes it part of model selection and compromises the final evaluation.',
      recall:
        'Why can a model with excellent training performance still perform poorly on new data?',
      recallAnswer:
        'It may have learned noise or details specific to the training set. Generalisation must be checked on unseen data; validation guides model choices and the test set is reserved for final evaluation.',
    },
  },
  {
    id: 'complex-systems',
    code: 'ITI41225',
    title: 'Complex Systems Modelling and Digital Evolution',
    shortTitle: 'Complex Systems',
    color: 'violet',
    description:
      'Explore how simple local rules create unexpected global behaviour.',
    assessment: 'Oral exam · 20–30 minutes · 50% / project · 50%',
    topics: [
      {
        title: 'Emergence & self-organisation',
        description: 'Local interactions and collective behaviour',
      },
      {
        title: 'Modelling systems',
        description: 'Cellular automata, networks, and agents',
      },
      {
        title: 'Digital evolution',
        description: 'Selection, mutation, crossover, and diversity',
      },
      {
        title: 'Evolving intelligence',
        description: 'Neuro-evolution and evolutionary robotics',
      },
    ],
    lesson: {
      id: 'cs-emergence',
      title: 'From local rules to global patterns',
      eyebrow: 'Emergence & self-organisation',
      minutes: 8,
      intro:
        'A flock has no conductor. Each bird responds to nearby birds, yet the group forms a coordinated pattern.',
      paragraphs: [
        'Complex systems contain interacting components. Emergence describes system-level behaviour arising from those interactions. You cannot usually understand the collective behaviour by studying an isolated component alone.',
        'Cellular automata make this idea concrete: each cell updates from its own state and neighbouring states. Repeating a simple rule can produce travelling structures, stable regions, or irregular patterns.',
      ],
      takeaway:
        'A model specifies components, local interactions, and update rules. Observe the collective behaviour that follows.',
      question: 'Which example best illustrates emergence?',
      options: [
        'A controller assigns every bird its flight path',
        'A flock forms a pattern through interactions between nearby birds',
        'One isolated bird follows a fixed route',
      ],
      answer: 1,
      explanation:
        'The flock pattern arises from interactions between individuals without a controller prescribing the global shape.',
      recall: 'How would you explain emergence using a cellular automaton?',
      recallAnswer:
        'Cells follow local update rules based on neighbouring states. Across many cells and time steps, those interactions can create larger patterns that no individual cell directly specifies.',
    },
  },
  {
    id: 'scientific-methods',
    code: 'ITI41020',
    title: 'Scientific Methods, Ethics and Writing',
    shortTitle: 'Scientific Methods',
    color: 'orange',
    description:
      'Ask stronger questions. Choose sound methods. Communicate clearly.',
    assessment: 'Written exam · 2 hours · 40% / portfolio · 60%',
    topics: [
      {
        title: 'Research design',
        description: 'Questions, evidence, and methodological choices',
      },
      {
        title: 'Research methods',
        description: 'Qualitative, quantitative, and mixed methods',
      },
      {
        title: 'Ethics & critical reading',
        description: 'Consent, responsible research, and evaluation',
      },
      {
        title: 'Scientific communication',
        description: 'Writing, references, publishing, and peer review',
      },
    ],
    lesson: {
      id: 'sm-research-design',
      title: 'Start with a research question',
      eyebrow: 'Research design',
      minutes: 7,
      intro:
        'A useful research question connects a specific problem to evidence you can realistically collect.',
      paragraphs: [
        'Begin by stating what you want to understand. Specify the context, population, or system that matters. A focused question helps determine what evidence could support an answer.',
        'Your method follows from your question. Interviews can explore experiences and explanations; quantitative measurements can compare outcomes. Mixed methods can combine these perspectives when the question needs both.',
      ],
      takeaway:
        'Align your research question, evidence, and method. Check feasibility and ethics before collecting data.',
      question:
        'You want to understand how students experience feedback from an AI tutor. Which approach most directly explores their experiences?',
      options: [
        'Only count how many times they log in',
        'Interview students about their experiences',
        'Measure the server response time',
      ],
      answer: 1,
      explanation:
        'Interviews let participants describe their experiences in depth. Usage counts or response times can answer other questions, but do not directly explain how students experience the feedback.',
      recall: 'What makes a research question useful for designing a study?',
      recallAnswer:
        'It is focused, answerable with feasible evidence, and clear about the relevant context. It guides the method and data collection, while allowing ethical and practical constraints to be assessed.',
    },
  },
]
export const courseSource = (code: string) =>
  `https://www.hiof.no/english/studies/courses/iio/itk/2026/autumn/${code.toLowerCase()}.html`

const complexCourse = courses.find((c) => c.id === 'complex-systems')!
complexCourse.lessons = complexLessons
complexCourse.lesson = complexLessons[0]
complexCourse.topics = complexLessons.map((l) => ({
  title: l.title,
  description: `${l.eyebrow} · ${l.questions!.length} questions · about ${l.minutes} min`,
  lessonId: l.id,
}))
complexCourse.assessment =
  'Assessment format needs confirmation: the official page lists an oral exam (50%) and project (50%); your export describes a written December exam.'
export const lessonsFor = (course: Course) => course.lessons || [course.lesson]
export const lessonCourses = courses.flatMap((c) =>
  lessonsFor(c).map((lesson) => ({ ...c, lesson })),
)
