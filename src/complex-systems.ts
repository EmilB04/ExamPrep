import imported from './content/complex-systems/lectures.json'
import type { Lesson } from './content'

const concepts = [
  {
    intro:
      'Connect interacting parts, collective behaviour, and the limits of scientific models.',
    takeaway:
      'Emergence concerns patterns across scales; self-organisation concerns the development of order over time.',
    recall:
      'Distinguish emergence from self-organisation and give an example of each.',
    recallAnswer:
      'Emergence describes macroscopic properties arising from microscopic interactions. Self-organisation describes non-trivial order arising over time without a central controller. A flock pattern illustrates emergence; local alignment developing over time illustrates self-organisation.',
    exercise: 'complex-systems',
  },
  {
    intro:
      'Build a global pattern from local state updates, one time step at a time.',
    takeaway:
      'Specify states, neighbourhoods, boundary conditions, and an update rule before interpreting a cellular automaton.',
    recall:
      'What defines an elementary cellular automaton, and how does Rule 90 update a cell?',
    recallAnswer:
      'An elementary CA has one spatial dimension, two states, and a radius-one neighbourhood. Rule 90 sets the next state to the XOR of the left and right neighbours. Update order and boundary conditions must be specified.',
    exercise: 'complex-systems',
  },
  {
    intro:
      'Follow cellular automata from hand-written rules to learned local updates.',
    takeaway:
      'Neural CA replace a fixed rule table with a learned local update, while retaining spatially local interactions.',
    recall:
      'How does a neural cellular automaton differ from a conventional cellular automaton?',
    recallAnswer:
      'Both update cell states through local interactions. A conventional CA uses an explicitly specified update rule. A neural CA learns an update function, often using continuous multi-channel states, perception of neighbouring cells, and a training objective.',
    exercise: 'neural-ca',
  },
  {
    intro:
      'Represent interactions as edges and examine what a network structure tells you.',
    takeaway:
      'A graph represents relationships. Node states and network topology are separate modelling choices.',
    recall:
      'Distinguish dynamics on a network, dynamics of a network, and an adaptive network.',
    recallAnswer:
      'Dynamics on a network change node states on fixed topology. Dynamics of a network change the topology. Adaptive networks couple node-state changes and topology changes so each can affect the other.',
    exercise: 'network',
  },
  {
    intro:
      'Relate network measures, topology, and changing states without treating them as interchangeable.',
    takeaway:
      'Density summarises how many possible edges exist; it does not uniquely determine the topology or the dynamics.',
    recall:
      'How do you calculate density for a simple undirected network, and what does it leave out?',
    recallAnswer:
      'For n nodes and m edges, density is 2m/[n(n−1)]. It measures the fraction of possible edges present, but does not specify where edges lie, community structure, shortest paths, or how states change.',
    exercise: 'network',
  },
  {
    intro:
      'Specify individuals and their interactions, then investigate the collective outcome.',
    takeaway:
      'Agent-based models make individuals explicit. Their local rules must be related to the modelling goal and validated at relevant scales.',
    recall: 'Explain approach A and approach B to agent-based modelling.',
    recallAnswer:
      'Approach A starts with empirically grounded micro-level rules and predicts unknown collective behaviour. Approach B explores hypothetical micro-level rules that could explain known collective behaviour.',
    exercise: 'agents',
  },
  {
    intro:
      'Use variation, inheritance, and selection to search a space of candidate solutions.',
    takeaway:
      'Selection exploits useful candidates; variation and diversity support exploration and help avoid premature convergence.',
    recall: 'Why is diversity important in an evolutionary algorithm?',
    recallAnswer:
      'Diversity keeps alternative regions of the search space available. Excessive selection pressure and low variation can cause premature convergence. Mutation, recombination, and appropriate selection pressure can balance exploration and exploitation.',
    exercise: 'evolution',
  },
  {
    intro:
      'Compare biological neurons with simplified artificial models and their learning mechanisms.',
    takeaway:
      'An artificial neuron is a model of selected features, not a complete biological neuron. Biological plausibility and task performance are different criteria.',
    recall:
      'Compare a weighted-sum artificial neuron with a spiking neuron model.',
    recallAnswer:
      'A conventional artificial neuron transforms a weighted sum through an activation function. A spiking model represents membrane-potential dynamics and discrete spikes over time, often including threshold, reset, and refractory behaviour.',
    exercise: 'neuron',
  },
]

export const complexLessons: Lesson[] = imported.map((lecture, index) => {
  const concept = concepts[index]
  const questions = lecture.questions.map((q) => {
    const options = Object.values(q.options)
    return {
      id: q.id,
      question: q.prompt,
      options,
      answer: Object.keys(q.options).indexOf(q.correct),
      explanation: q.explanation,
      hint: q.hint,
      context: /Exercise 15\.1/.test(q.prompt)
        ? 'Reference graph (undirected): nodes 1–6; edges 1–2, 1–4, 1–5, 2–3, 2–4, 3–4, 3–5, 3–6, 4–6. Reconstructed from the edge list in Lecture 4.'
        : /Evolution: diagram 4/.test(q.prompt)
          ? 'The export describes diagram 4 as robots exchanging genomes directly with one another. The original figure was not supplied.'
          : undefined,
    }
  })
  return {
    ...questions[0],
    id: `cs-lecture-${lecture.number}`,
    title: lecture.title,
    eyebrow: `Lecture ${lecture.number}`,
    minutes:
      Math.ceil(lecture.reading.split(/\s+/).length / 180) +
      questions.length +
      3,
    intro: concept.intro,
    paragraphs: [],
    takeaway: concept.takeaway,
    recall: concept.recall,
    recallAnswer: concept.recallAnswer,
    exercise: concept.exercise,
    reading: lecture.reading,
    questions,
    provenance: `Lecture ${lecture.number} · ${lecture.sourceFile} · Claude-authored review; ${lecture.number <= 4 ? 'slide-text source included in supplied export' : 'chat-derived; original slides unavailable'}.`,
    caution:
      lecture.number === 3
        ? 'The export corrects an alpha-masking inequality. Check against the original slides.'
        : lecture.number === 5
          ? 'The exact adaptive SIS cutting/rewiring rule is flagged for verification against Code 16.15. Lectures 5–8 are chat-derived reviews.'
          : lecture.number > 4
            ? 'Chat-derived review. Check against the original slides before treating it as definitive.'
            : undefined,
  }
})
