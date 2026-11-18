export type ExamQuestion = {
  id: string
  /** Topic name shown after "Explain this:" or "Explain the". */
  topic: string
  lessonId: string
  keyPoints: string[]
  example: string
}

export type EntryQuestion = ExamQuestion & { followUps: string[] }

// Broad entry questions: "Explain this ...".
export const entryQuestions: EntryQuestion[] = [
  {
    id: 'complex-system',
    topic: 'Complex system',
    lessonId: 'cs-lecture-1',
    keyPoints: [
      'Many simple components with local, correlated interactions.',
      'Sits between two simple extremes: completely correlated parts (a watch, fully predictable) and completely independent parts (dice, only statistically predictable).',
      'Emergence: macroscopic properties arise across scales from microscopic interactions.',
      'Self-organisation: order develops over time without a central controller.',
      'Non-linear: small differences can be amplified (bifurcation), so long-term prediction of the detailed state is hard.',
      'Therefore we model with simulation and rule-based models, and refine them against observation.',
    ],
    example:
      'A flock of birds: each bird reacts to nearby birds, and a coordinated pattern emerges that no bird or controller prescribes.',
    followUps: [
      'cellular-automaton',
      'network-model',
      'adaptive-network',
      'agent-based-model',
      'ai-agent',
    ],
  },
  {
    id: 'cellular-automata',
    topic: 'Cellular automata',
    lessonId: 'cs-lecture-2',
    keyPoints: [
      'A grid of cells, each with a state from a small set.',
      'Each cell updates from its own state and its nearest neighbours only (local interaction).',
      'The same rule applies to all cells, usually at each time step at once.',
      'Boundary conditions and update order must be specified.',
      'Simple local rules can give complex global patterns: emergence.',
      'Neural cellular automata replace the hand-written rule with a learned local update.',
    ],
    example:
      'Rule 90: the next state of a cell is the XOR of its left and right neighbours, which draws a nested triangle pattern.',
    followUps: ['cellular-automaton', 'neural-ca', 'agent-based-model'],
  },
  {
    id: 'evolutionary-models',
    topic: 'Evolutionary models',
    lessonId: 'cs-lecture-7',
    keyPoints: [
      'A population of candidate solutions (genomes).',
      'Fitness evaluation, then selection of better candidates.',
      'Variation through mutation and recombination (crossover), with inheritance.',
      'Repeated over generations, so the population adapts without anyone designing the solution.',
      'Balance exploration and exploitation: diversity helps avoid premature convergence.',
      'Used to train complex systems, for example neuro-evolution and evolutionary robotics.',
    ],
    example:
      'Evolving a robot controller: random controllers are scored on walking distance, the best are mutated and combined, and walking improves over generations.',
    followUps: ['evolutionary-algorithm', 'neuron-models', 'agent-based-model'],
  },
]

// Deeper questions: "Explain the ... model".
export const deeperQuestions: ExamQuestion[] = [
  {
    id: 'cellular-automaton',
    topic: 'Cellular automaton model',
    lessonId: 'cs-lecture-2',
    keyPoints: [
      'Components: cells, states, neighbourhood, update rule, boundary condition.',
      'Elementary CA: one dimension, two states, radius-one neighbourhood.',
      'Synchronous update uses a separate buffer so cells do not see half-updated neighbours.',
      'Behaviour: stable regions, travelling structures, or irregular patterns from a simple rule.',
    ],
    example: 'Rule 90 (XOR of the left and right neighbours).',
  },
  {
    id: 'neural-ca',
    topic: 'Neural cellular automaton model',
    lessonId: 'cs-lecture-3',
    keyPoints: [
      'Still local: each cell perceives only its neighbours.',
      'The update function is a small neural network that is learned, not hand-written.',
      'States are continuous with several channels.',
      'Trained with an objective, for example growing and regenerating a target pattern.',
      'Modular design, comparable to repeated minicolumns in the cortex, in contrast to monolithic networks.',
    ],
    example:
      'A neural CA grows an image from a single seed cell and repairs it after damage.',
  },
  {
    id: 'network-model',
    topic: 'Network model',
    lessonId: 'cs-lecture-4',
    keyPoints: [
      'A graph: nodes (components) and edges (interactions).',
      'Node states and network topology are separate modelling choices.',
      'Dynamics on a network: node states change on fixed topology.',
      'Dynamics of a network: the topology itself changes.',
      'Density = 2m / [n(n-1)] for an undirected network, and it says nothing about where the edges are.',
    ],
    example: 'Spread of an epidemic or an opinion across a social network.',
  },
  {
    id: 'adaptive-network',
    topic: 'Adaptive network model',
    lessonId: 'cs-lecture-5',
    keyPoints: [
      'Node states and topology change together and affect each other.',
      'Feedback between state and structure can produce self-organisation.',
      'Epidemics: for example individuals may cut or rewire links to infected contacts, which changes how the disease spreads.',
      'Opinion spreading: nodes influence neighbours, and links may rewire toward similar opinions, which can split a network into groups.',
    ],
    example:
      'Adaptive epidemic: people avoid sick contacts, which slows the spread.',
  },
  {
    id: 'agent-based-model',
    topic: 'Agent-based model',
    lessonId: 'cs-lecture-6',
    keyPoints: [
      'Individual agents with their own state and behaviour rules, acting in an environment.',
      'Agents adapt to the environment and to each other, and the environment can change too.',
      'Approach A: empirically grounded micro-level rules, predict the unknown collective behaviour.',
      'Approach B: explore hypothetical micro-level rules that could explain known collective behaviour.',
      'Collective behaviour emerges and is observed in simulation.',
      'Design tasks: data structures for agents, initial conditions, update rules, visualisation and analysis.',
    ],
    example: 'Ants foraging, traffic, or a flock of birds.',
  },
  {
    id: 'evolutionary-algorithm',
    topic: 'Evolutionary algorithm',
    lessonId: 'cs-lecture-7',
    keyPoints: [
      'Loop: initialise population, evaluate fitness, select parents, apply mutation and crossover, form the next generation.',
      'Selection exploits good candidates; mutation and crossover explore.',
      'Too much selection pressure and too little variation leads to premature convergence.',
      'Diversity keeps alternative regions of the search space alive.',
    ],
    example:
      'Evolving a bit string toward more ones, or a robot controller and body.',
  },
  {
    id: 'neuron-models',
    topic: 'Neuron models (biological, artificial, spiking)',
    lessonId: 'cs-lecture-8',
    keyPoints: [
      'Biological neuron: dendrites receive, soma integrates, axon conducts, synapse transmits. Spikes are all-or-nothing.',
      'Artificial neuron: weighted sum of inputs plus bias, then an activation function. It keeps the idea and drops most of the biology.',
      'Spiking neuron (for example leaky integrate-and-fire): membrane potential over time, threshold, reset, discrete spikes.',
      'Learning: local plasticity (STDP, fire together wire together) versus backpropagation, which is biologically implausible.',
      'Brain versus AI: very different energy use and scale.',
    ],
    example: 'A perceptron compared with a leaky integrate-and-fire neuron.',
  },
  {
    id: 'ai-agent',
    topic: 'AI agent model',
    lessonId: 'cs-lecture-9',
    keyPoints: [
      'Core: an auto-regressive language model that predicts the next token and feeds its output back as input.',
      'Agent loop: observe, decide, call a tool, observe the result, repeat.',
      'Harness: tools, skills, memory, context management, control and permissions around the model.',
      'Memory lives outside the model because weights are fixed and the context is limited.',
      'Multi-agent systems can show emergent collective behaviour; errors can compound.',
    ],
    example:
      'A coding agent that reads files, runs tests, and edits code in a loop.',
  },
]

export const questionById = (id: string) =>
  deeperQuestions.find((q) => q.id === id)
