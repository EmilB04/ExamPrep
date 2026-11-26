/** Hover definitions for bold terms in the Complex Systems lecture reviews. Keys are lower case. */
export const complexSystemsGlossary: Record<string, string> = {
  'complex systems':
    'Systems whose parts are locally correlated and interact, often non-linearly. Small differences can grow over time, so long-term prediction of the detailed state is hard even when the rules are simple.',
  emergence:
    'System-level behaviour or properties that arise from the interactions of the parts and are not properties of the individual parts.',
  'self-organization':
    'A system spontaneously organises itself, over time, to produce non-trivial macroscopic behaviour without a central controller.',
  bifurcation:
    "When a control parameter crosses a critical threshold, the system's behaviour splits into qualitatively different stable states, for example convection rolling clockwise or counter-clockwise.",
  'phase transition':
    'A transition of macroscopic properties of a collective system that occurs when its environmental or internal conditions are varied.',
  'bénard rolls':
    'A fluid heated from below spontaneously organises into rolling convection cells instead of conducting heat chaotically.',
  magnetization:
    'Individual magnetic spins start randomly oriented but, under the right conditions, spontaneously align into ordered domains.',
  'descriptive modelling':
    'Specifying the actual state of a system at one or more points in time (a photo, statistics, pattern recognition). It describes what the system looks like.',
  'rule-based modelling':
    'Finding dynamical rules that explain observed behaviour and predict future states. It describes how the system will behave.',
  'agent-based model (abm)':
    'A simulation with many discrete agents whose behaviour is simulated explicitly. It is one of the most general frameworks for complex systems.',
  'monte carlo simulation':
    'Running many independent replications of a stochastic simulation, measuring the outcome in each, and averaging to get a statistical distribution.',
  pycx: 'A Python framework (pycxsimulator) for building and running simple simulations of complex systems with functions that set up, display and update the model.',
  automaton:
    'A theoretical machine that changes its internal state based on inputs and its previous state.',
  ca: "Cellular automaton: a grid of cells whose states are updated in discrete time by a local rule that depends on the neighbouring cells' states.",
  configuration:
    'The spatial pattern of cell states that a cellular automaton shows at time t.',
  quiescent:
    'A cell state that stays unchanged as long as all the neighbours are also quiescent.',
  'moore neighbourhood':
    'A 3 x 3 block of cells: the 8 surrounding cells plus the centre cell (9 cells).',
  moore:
    'A 3 x 3 block of cells: the 8 surrounding cells plus the centre cell (9 cells).',
  'von neumann':
    'A neighbourhood of 5 cells: the centre plus the cells above, below, left and right.',
  'rule 90':
    'An elementary cellular automaton rule (Wolfram, 1983). 90 is 01011010 in binary, and the next state of a cell is the XOR of its left and right neighbours.',
  'totalistic ca':
    'A cellular automaton whose transition depends only on the sum of the cell states in the neighbourhood.',
  'stochastic ca':
    'A cellular automaton with probabilistic state-transition rules.',
  'boundary conditions':
    'What a cell at the edge of the grid sees: no boundaries (infinite space of quiescent cells), periodic (wrap around), cut-off (no neighbours beyond the edge) or fixed (a fixed state at the edge).',
  'periodic boundaries':
    'Wrap-around edges: a cell on one edge has the cells on the opposite edge as its neighbours.',
  synchronous:
    'All cells update at the same time, each reading the old states.',
  asynchronous:
    'Updates are not simultaneous. For example, in the voter model only one opinion transfer happens per step.',
  'game of life':
    "Conway's two-state 2D cellular automaton on a Moore neighbourhood: a live cell survives with 2 or 3 live neighbours and a dead cell becomes alive with exactly 3.",
  coarsening:
    'Domains grow and merge until one state dominates, starting from a noisy grid.',
  refractory:
    'A cell or neuron state in which it ignores stimuli for a while after being active.',
  'neural ca':
    'A cellular automaton whose update rule is a small neural network that is learned or evolved. The same network is applied in every cell.',
  'alive masking':
    'In Growing Neural CA, a cell with no neighbour whose alpha value is above 0.1 is set to zero, so empty cells do not contribute.',
  'residual update':
    "The network outputs a change delta-s that is added to the cell's current state, instead of replacing it.",
  'sample pool strategy':
    'Re-using states from earlier training iterations as starting points, always including the original seed, so the pattern stays stable.',
  zygote:
    'The initial seed (a single starting cell) from which the pattern grows.',
  'attractor state': 'A state that the system settles into and stays in.',
  'point attractor':
    'An attractor consisting of a single stable state, where the system stops changing.',
  cppn: 'Compositional Pattern Producing Network: a network that maps its inputs to outputs using a mix of activation functions. In the lecture one is evolved with NEAT to act as a CA update rule.',
  neat: 'NeuroEvolution of Augmenting Topologies (Stanley and Miikkulainen, 2002). It evolves both weights and structure, uses a direct encoding, and relies on innovation numbers and speciation.',
  hyperneat:
    'An extension of NEAT (Stanley et al., 2009) with an indirect encoding: an evolved CPPN acts as a rule for building the phenotype network.',
  'direct encoding':
    'The genome describes the network one to one, gene by gene.',
  'indirect encoding':
    'The genome is a rule for building the phenotype, not a direct description of it.',
  'innovation number':
    'A historical marker that lets NEAT line up genes from different parents during crossover.',
  speciation:
    'Grouping similar networks into species so new structures are protected while they mature.',
  'sis epidemic model':
    'Susceptible-Infected-Susceptible: infected nodes can infect their susceptible neighbours and later become susceptible again.',
  sir: 'Susceptible-Infected-Recovered: recovered nodes are removed or immune.',
  susceptible: 'In epidemic models, a node that can become infected.',
  infected:
    'In epidemic models, a node that carries the disease and can infect neighbours.',
  nodes: 'The vertices of a network, the individual parts or agents.',
  edges: 'The connections between nodes in a network.',
  topology: 'The pattern of connections between nodes in a network.',
  'adjacency list':
    'For each node, the list of its neighbours (for example 3 -> {1, 2, 4}).',
  'adjacency matrix':
    'A matrix where a_ij = 1 if nodes i and j are neighbours, and 0 otherwise.',
  degree: 'The number of edges at a node, deg(i).',
  'node strength':
    "The sum of the weights of a node's edges. In an unweighted graph it equals the degree.",
  walk: 'A sequence of connected edges.',
  trail: 'A walk with no repeated edge.',
  path: 'A walk with no repeated node (and so no repeated edge).',
  subgraph: 'Part of a graph.',
  'connected component':
    'A subgraph that is connected internally but not to the rest of the graph.',
  'connected graph':
    'A graph in which a path exists between every pair of nodes.',
  multigraph: 'A graph that may contain multiple edges between the same nodes.',
  'self-loop': 'An edge from a node to itself.',
  hyperedge: 'An edge that connects any number of nodes (used in hypergraphs).',
  'bipartite (n-partite)':
    'Nodes are split into groups, and no edge connects two nodes inside the same group.',
  'dynamics on networks':
    'Node states change over time through interactions with connected nodes, while the topology stays fixed.',
  'dynamics of networks':
    'The topology changes over time, to study what creates topologies, robustness and vulnerability.',
  'adaptive networks':
    'Networks where states and topology co-evolve: each changes in response to the other.',
  density:
    'The fraction of possible edges that exist: 2m / (n(n-1)) for undirected networks and m / (n(n-1)) for directed ones.',
  diameter: 'The largest eccentricity in the network, D = max eccentricity.',
  eccentricity:
    'For a node, the distance to the farthest node: max over j of d(i, j).',
  peripheries: 'The nodes whose eccentricity equals the diameter.',
  'characteristic path length':
    'The average shortest path over all node pairs: L = sum of d(i, j) / (n(n-1)).',
  centrality: 'Measures of how important a node is.',
  'degree centrality': 'The degree of a node divided by n - 1.',
  betweenness:
    'The probability that the shortest path between two random nodes passes through node i.',
  closeness:
    'A centrality that is high for nodes with short distances to all other nodes.',
  eigenvector:
    'A centrality where a node is important if it is connected to other important nodes.',
  pagerank:
    'A variation of eigenvector centrality (Page and Brin, Google): the asymptotic probability that a random walker is standing on node i.',
  'clustering (local property)':
    "C(i) = actual links among node i's neighbours divided by the possible links. It is the probability that i's neighbours are also neighbours of each other.",
  'degree distribution': 'P(k) = the share of nodes with degree k.',
  community:
    'A set of nodes connected more densely to each other than to the rest of the network.',
  modularity: 'The extent to which a network is organised into communities.',
  'giant component':
    'A connected component whose size is of the same order as the whole network.',
  'network percolation':
    'The appearance of a giant component, which happens when the average degree is above 1.',
  'scale-free networks':
    'Networks made by preferential attachment, with a power-law degree distribution: a few hubs and many low-degree nodes.',
  'preferential attachment':
    'New nodes prefer to connect to nodes that already have many links ("the rich get richer"), as in the Barabasi-Albert model.',
  'power-law degree distribution':
    'P(k) proportional to k^(-gamma). It looks like a straight line on log-log axes.',
  'small-world networks':
    'Made by randomly rewiring edges of a regular ring-like network, which gives short paths while keeping high clustering.',
  'random edge rewiring':
    'Moving edges to random new endpoints, the step used to build small-world networks.',
  homophily:
    'The tendency to connect with similar others. In an adaptive voter-type model it splits the network into separate clusters with their own state.',
  "zachary's karate club":
    'The classic social network of friendships among 34 members of a karate club, reported by Wayne Zachary in the 1970s.',
  genotype:
    'The internal representation that evolution manipulates, for example a bitstring or a tree. It can be the phenotype itself.',
  phenotype:
    'The candidate solution itself, the thing that gets evaluated, such as a program, a set of parameters or a picture.',
  'genotype-to-phenotype mapping':
    'The process that turns the genotype into the phenotype that is evaluated.',
  fitness:
    'How well an individual solves the problem: a quality to maximise or an error to minimise.',
  'fitness landscapes':
    'The mapping from genotypes to fitness, pictured as height over genotype space. A key question is whether a small step in genotype gives a small change in fitness.',
  selection:
    'Individuals with different attributes have different survivability, so fitter ones are more likely to reproduce.',
  variation:
    'Diversity in attributes, mainly from imperfect inheritance (mutation).',
  inheritance: "Offspring have attributes similar to their parents'.",
  population: 'The group of individuals that evolves.',
  mutation: "A random change to an offspring's genes.",
  crossover:
    "Combining parts of two parents' genomes to make a child, for example by one-point or two-point cuts.",
  elitism:
    'Copying the best n individuals unchanged into the next generation so the best solution is never lost.',
  'fitness-proportional selection':
    "Selection where an individual's chance of being picked is proportional to its fitness (roulette wheel).",
  'rank-proportional selection':
    'Selection where individuals are ranked by fitness and the chance of being picked is proportional to rank.',
  'genetic algorithm (ga)':
    'An evolutionary algorithm with bitstrings or strings of numbers as genomes, using crossover and mutation.',
  'genetic programming (gp)':
    'An evolutionary algorithm where the genotype is the phenotype: a tree or list of instructions (a program), with subtree crossover and mutation.',
  'evolution strategy (es)':
    'An evolutionary algorithm that typically uses real numbers and mutation only.',
  'neuroevolution (ne)':
    'Evolving neural networks: their weights and possibly their topology.',
  bitstring: 'A sequence of 0s and 1s used as a genotype.',
  'abstract syntax tree':
    'A tree that represents the structure of a program, used as a genotype in genetic programming.',
  generation: 'One full replacement of the population.',
  exploitation:
    'Refining and reusing the good solutions already found. Too much of it gets the search stuck in a local optimum.',
  'exploration vs. exploitation':
    'The balance between searching new regions (exploration) and refining good solutions already found (exploitation).',
  'local optimum':
    'A solution better than all of its neighbours but not the best overall.',
  'variational inheritance':
    'How different children are from their parents. Too similar means slow evolution; too different is effectively random search.',
  'population diversity':
    'How varied the individuals are. Too low gives too much exploitation and a local optimum.',
  "hamilton's rule":
    'Altruism can evolve when relatedness times the benefit to the recipient is larger than the cost to the actor: r * B > C.',
  'leaky integrate-and-fire (lif)':
    'A spiking neuron model: input spikes raise the state by their weights, the state leaks over time, and when it crosses a threshold the neuron emits a spike and resets.',
  'stdp (spike-timing-dependent plasticity)':
    'A learning rule: if the pre-synaptic neuron fires before the post-synaptic one the weight increases, and if it fires after the weight decreases. The change is largest when the spikes are close in time.',
  axon: 'The part of a neuron that conducts the signal onward.',
  dendrites: 'The parts of a neuron that receive input.',
  soma: 'The cell body of a neuron, which integrates the inputs.',
  synapse: 'The junction where a signal passes from one neuron to the next.',
  minicolumns:
    'Many repeated local units in the cortex. Neural CA follows this idea: one small local rule applied everywhere.',
  loihi: "Intel's neuromorphic chip for spiking neural networks.",
  spinnaker:
    'A neuromorphic hardware platform for simulating spiking neural networks.',
  truenorth: "IBM's neuromorphic chip.",
  'switch transformer':
    'A Mixture-of-Experts model that selects different parameters per input, giving a huge parameter count at constant computational cost.',
  'sparsely activated':
    "Only a small part of the model's parameters is used for each input.",
  'micro-electrode array (mea)':
    'A dish of cultured neurons on 32, 60 or 120 electrodes that can stimulate and record.',
  'reservoir computing':
    'Using a recurrent system (here a biological neural network) as a reservoir whose activity is decoded by a trained readout.',
  'free energy principle':
    'The idea that adaptive systems act to minimise surprise, that is, the unpredictability of their environment.',
  'ai agent':
    'A system that perceives, decides and acts toward a goal, often over many steps.',
  'large language model (llm)':
    'A neural network, usually a transformer, trained to predict the next token given the preceding tokens.',
  'next token':
    'The word or word piece a language model predicts from the preceding text.',
  'auto-regressive':
    'Each generated token is appended to the input and fed back in to produce the next one.',
  'context window':
    'The text a language model can see at once. It has no memory of earlier conversations unless information is placed in the context.',
  'tool call':
    'A request from the model to run an external tool, such as search, running code or reading a file.',
  harness:
    'Everything around the model that turns it into a usable agent (also called scaffold or agent framework). It is ordinary software, not part of the weights.',
  'non-deterministic':
    'The same input can give different outputs, as when the same prompt gives different answers.',
}
