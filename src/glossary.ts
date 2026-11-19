/**
 * Short definitions for bold terms in lecture readings. Keys are lower case.
 * A bold phrase with no entry here is rendered as ordinary bold text.
 */
const entries: Record<string, string> = {
  'activation map':
    'The output of a convolution layer after the bias is added and an activation function such as ReLU is applied to a feature map.',
  adam: 'An optimiser that gives each parameter its own adaptive step size. It combines a moving average of the gradients (momentum) with a moving average of the squared gradients.',
  attention:
    'A mechanism that lets a model weight which inputs matter for each output, instead of squeezing everything into one fixed-size vector.',
  'automatic differentiation':
    'A technique that computes exact derivatives of a program by applying the chain rule over its computational graph, so gradients need not be derived by hand.',
  'automatic programming':
    'Computers writing programs, for example sorting algorithms, signal processing code or the design of neurons, as a machine-learning method.',
  'average pooling':
    'Pooling that outputs the mean of each neighbourhood instead of the maximum.',
  'backpropagation through time':
    'Training a recurrent network by unrolling it over the time steps and backpropagating through the unrolled graph, summing the gradients over all time steps.',
  bagging:
    'Bootstrap aggregating: train many models on bootstrap samples of the data and average their predictions or take a majority vote. It reduces variance.',
  'batch normalisation':
    "A layer that normalises each unit's activations over a mini-batch (mean 0, standard deviation 1) and then rescales them with learned parameters gamma and beta.",
  'bayesian networks / bayesian learning':
    'Probabilistic models. A Bayesian network is a graph of variables and their conditional dependencies; Bayesian learning updates beliefs about a model as data arrives.',
  boosting:
    'Building models one after another, each focusing on the mistakes of the earlier ones. XGBoost is a boosting method.',
  branch:
    'One outcome of the test at a decision-tree node. It leads to another node or to a leaf.',
  'c5.0':
    "Ross Quinlan's decision tree and ruleset system for classification, the successor of ID3 and C4.5.",
  catboost:
    'A gradient boosting library that handles categorical features well.',
  'cell state':
    'The memory line of an LSTM. It is updated by addition and controlled by gates, which lets gradients flow back over long ranges.',
  centering:
    "Subtracting each feature's training mean so that the feature has mean zero.",
  classification:
    'Predicting a category (class label) for an example, such as high or low risk.',
  classifium:
    'A gradient boosting tool with automatic tuning, designed to give very little overfitting.',
  clustering:
    'Grouping similar examples without using labels ("finding twins"). It is used for example in recommender systems.',
  committee:
    'In Cubist, a set of sequential models where each one corrects the errors of the earlier ones. It is boosting-like.',
  composite:
    "A Cubist model type that combines the rule model with nearest neighbours, adjusting each neighbour's value with the rule model.",
  'context vector':
    'The weighted sum of all encoder hidden states that the decoder uses at one time step: c = sum of a(t,i) times h(i).',
  'continuous predictors':
    'Numeric attributes. A tree handles them by testing a threshold, such as "age < 15".',
  'cross-attention':
    'Attention that relates tokens from two different sources, for example decoder positions to encoder positions.',
  'cross-entropy':
    'A loss for classification, -sum of y(i) log of the predicted probability of class i. It grows when the model is confident and wrong.',
  cubist:
    'A rule-based regression system. Each rule has a linear equation that predicts a number, so the model is piecewise linear.',
  'data augmentation':
    'Creating modified copies of training examples, such as crops and mirror images, to get more training data.',
  'data leakage':
    'Information from the validation or test data influencing training, which makes performance estimates too optimistic.',
  'decision tree':
    'A model that classifies by asking a series of questions. Internal nodes test a feature, branches are outcomes, and leaves give the answer.',
  degradation:
    'The observation that very deep plain networks get worse, even on the training set, although extra layers could in principle just copy their input.',
  deskewing:
    'Reducing skew in a feature distribution. For images it can also mean straightening slanted shapes such as handwritten digits.',
  dropout:
    'A regulariser that randomly switches off neurons during training, so each step trains a different sub-network and units cannot rely on specific partners.',
  'early stopping':
    'Stopping training when the validation loss starts to rise and keeping the best model so far.',
  'echo state networks':
    'Recurrent networks with a fixed random "reservoir" where only the readout is trained. Also called reservoir computing.',
  embeddings:
    'Vectors that represent tokens so that tokens with similar meaning have similar vectors.',
  entropy:
    'A measure of uncertainty: -sum of p log2 p. It is 0 for a pure set and 1 bit for a fair coin.',
  'error valley':
    'A loss surface that is much steeper in one direction than another, so plain gradient descent zig-zags and is slow.',
  'evolutionary computation':
    'Optimisation methods inspired by evolution, such as evolution strategies and genetic algorithms.',
  'feature map':
    'The grid of values obtained by sliding one filter over the input and computing a weighted sum at each position.',
  'feature scaling':
    'Dividing each feature by its training standard deviation so that features have a comparable scale.',
  filter:
    'A small grid of learned weights (also called a kernel) that is slid over the input in a convolution.',
  'fine-tuning':
    'Continuing the training of a pre-trained model on a small, domain-specific dataset.',
  'forget gate':
    'The LSTM gate that decides what old information to erase from the cell state.',
  'fully connected layers':
    'Layers where every unit is connected to every unit in the previous layer.',
  gates:
    'Sigmoid units in LSTM and GRU cells, with 0 meaning closed and 1 meaning open, that control what information flows.',
  generalise:
    'To perform well on new, unseen data and not only on the training data.',
  'generative adversarial networks (gan)':
    'Two networks trained against each other: a generator makes examples and a discriminator tries to tell them from real data.',
  'greedy search':
    'Choosing the best-looking option at each step without looking ahead or backtracking.',
  gru: 'Gated recurrent unit: a simpler LSTM with two gates, reset and update.',
  'hard attention':
    'Attention that focuses on just one input. It is not differentiable.',
  'hidden layer':
    'A layer between the input and the output of a neural network.',
  'hierarchy of features':
    'In deep networks, early layers find simple features such as edges, and later layers combine them into parts and whole objects.',
  hyperparameter:
    'A setting chosen before training, such as the learning rate, number of trees or number of layers. It is not learned from data.',
  'information gain (ig)':
    'The reduction in entropy from splitting on an attribute: entropy before minus the weighted average entropy of the branches.',
  initialisation:
    'Choosing the starting values of the weights, which strongly affects whether deep networks train.',
  'input gate':
    'The LSTM gate that decides what new information to store in the cell state.',
  'internal node':
    'A node in a decision tree that tests one feature. Each of its branches leads to another node or to a leaf.',
  'k-fold cross-validation':
    'Split the data into k folds, train on k-1 and test on the remaining fold, repeat for every fold, and average the scores.',
  'keep probability':
    'In dropout, the probability 1 - p that a neuron is kept active.',
  l1: 'A penalty on the sum of the absolute weights. It tends to push weights to exactly zero.',
  l2: 'A penalty on the sum of the squared weights. It shrinks large weights (weight decay).',
  leaf: 'A terminal node of a decision tree. It gives the prediction, a class label or a number.',
  'learning rate':
    'The step size in gradient descent: how far each weight moves against the gradient.',
  'lenet-5':
    'An early convolutional network for digit recognition by LeCun and colleagues, with convolution, subsampling and fully connected layers.',
  lift: 'In C5.0 rules, the accuracy of a rule divided by the frequency of its class in the data. Higher is better.',
  lightgbm: 'A fast gradient boosting library.',
  'linearly separable':
    'Two classes are linearly separable if one straight line (or hyperplane) can separate them. XOR is not.',
  'local connectivity':
    'Each output unit of a convolution layer sees only a small patch of the input.',
  lora: 'Low-Rank Adaptation: fine-tune a large model by training small low-rank adapter matrices while the original weights stay frozen.',
  lstm: 'Long short-term memory: a recurrent unit with a cell state and input, forget and output gates, built to remember over long sequences.',
  'many-to-many':
    'A sequence setting with a sequence as input and a sequence as output, such as language translation.',
  'many-to-one':
    'A sequence setting with a sequence as input and a single output, such as sentiment analysis.',
  'max pooling':
    'Pooling that outputs the maximum of each neighbourhood. It gives some shift invariance and reduces size.',
  'mean centering':
    'Subtracting the training mean of each feature so that inputs do not all have the same sign.',
  'mini-batches':
    'Small subsets of the training data. The gradient is computed over one mini-batch per update.',
  'misclassification costs':
    'The idea that different errors can have different costs, for example a missed disease versus a false alarm.',
  'missing values':
    'Attributes with no recorded value for some examples. Trees need a rule for what to do with them.',
  'mnist handwritten digits':
    'A standard benchmark of handwritten digit images (0 to 9), used for the first big deep learning successes.',
  momentum:
    'Using accumulated past gradients so updates keep moving in a consistent direction and noise is smoothed out.',
  neocognitron:
    "Fukushima's 1979-1980 network for pattern recognition unaffected by shift in position, an early forerunner of CNNs.",
  'neural nets':
    'Models built from layers of simple units (neurons) with learned weights, used for classification, regression, control and more.',
  'non-convex':
    'A loss surface with many local minima or saddle regions, so gradient descent is not guaranteed to find the global minimum.',
  'non-saturating activations':
    'Activation functions whose slope does not shrink towards 0 for large inputs, such as ReLU. They help against vanishing gradients.',
  "occam's razor":
    'Prefer the simplest explanation that fits the data. For trees: prefer the smaller tree.',
  'one-hot vectors':
    'Vectors with a single 1 and zeros elsewhere, used to represent which token or class is present.',
  'one-to-many':
    'A sequence setting with a fixed-size input and a sequence as output, such as image captioning.',
  'one-to-one':
    'The ordinary setting with one input and one output, as in a feed-forward network.',
  'out-of-bag (oob) evaluation':
    'Testing each example only on the trees whose bootstrap sample did not contain it. It gives an error estimate without a separate validation set.',
  'output layer':
    'The final layer of a network, which produces the prediction.',
  overfitting:
    'Learning the training data too well, including noise, so that performance on new data is poor.',
  padding:
    'Adding a border (usually of zeros) around the input of a convolution to control the output size.',
  parameters:
    'Values learned from data during training, such as weights and biases (as opposed to hyperparameters).',
  perceptron:
    'A single neuron: a weighted sum of the inputs plus a bias, passed through an activation function.',
  'pooling layer':
    'A layer that summarises each neighbourhood of a feature map, for example by its maximum.',
  'principal component analysis (pca)':
    'A linear method that projects the data onto orthogonal directions of maximal variance, used to reduce dimension.',
  pruning:
    'Cutting back a fully grown tree by removing branches that do not improve generalisation.',
  qlora:
    'LoRA applied to a base model quantised to 4 bits, which greatly reduces the memory needed for fine-tuning.',
  'random forest':
    'Many decision trees, each built on a bootstrap sample with random feature subsets, whose votes are combined.',
  regression: 'Predicting a number, such as a price.',
  regularisation:
    'Any change to a learning algorithm meant to reduce generalisation error, such as weight decay, dropout or early stopping.',
  'relative error':
    "Cubist's average absolute error divided by the error of always predicting the mean. Below 1 beats that baseline.",
  relu: 'Rectified linear unit: max(0, z). Its slope is 1 for positive inputs and 0 for negative ones.',
  'reset gate':
    'In a GRU, the gate that controls how much of the past information is used.',
  residual:
    'The difference F(x) = H(x) - x that a ResNet block learns, so the block output is F(x) + x.',
  resnet:
    'A very deep convolutional network that uses skip connections, so each block learns a residual.',
  scaling:
    'Dividing a feature by its training standard deviation so features have a similar scale.',
  'self-attention':
    'Attention that relates tokens from the same sequence, so each token becomes a context-aware representation. All positions are computed in parallel.',
  'single-algorithm hypothesis':
    'The idea that the same brain tissue can learn to process sight, sound or touch, so one general learning mechanism may be enough.',
  'skip (shortcut) connections':
    "Connections that add a layer's input to the output of later layers, so blocks only need to learn a residual. They add no parameters.",
  'soft attention':
    'Attention that uses a weighted combination of all inputs. The weights sum to 1 and the mechanism is differentiable.',
  softmax:
    'A function that turns scores into probabilities that sum to 1: p(i) = exp(s(i)) divided by the sum of all exp(s(j)).',
  sparse:
    "Having many zeros. ReLU switches off units, which makes a layer's output sparse.",
  spiking:
    'Spiking (pulse-coupled) neural networks communicate with discrete pulses over time.',
  'steepest descent':
    'Gradient descent: move in the direction of the negative gradient, which is the steepest downhill direction.',
  'step size':
    'How far the training window moves along the sequence between consecutive training instances.',
  stratified:
    'Folds or splits that keep the same class proportions as the whole dataset.',
  stride:
    'How many positions the filter moves at each step. A stride above 1 shrinks the output.',
  't-sne':
    't-distributed stochastic neighbour embedding: a non-linear method that keeps neighbouring points close in 2D or 3D. It is mainly used to visualise clusters.',
  'tanh / sigmoid':
    'S-shaped activation functions that saturate (flatten) for large inputs. Tanh outputs -1 to 1, sigmoid 0 to 1.',
  temperature:
    'A setting that controls randomness when sampling from an LLM. Higher temperature gives more varied output.',
  'test set':
    'Held-out data used once at the end to estimate final performance. It must not be used to choose models.',
  token: 'A sub-word unit of text that a language model reads and predicts.',
  'training set': "The data used to fit the model's parameters.",
  'transfer learning':
    'Reusing a network trained on one task, such as ResNet on ImageNet, as the starting point for another task.',
  transformer:
    'A sequence model built only from attention (no recurrence), so all positions are processed in parallel.',
  underfitting:
    'A model that is too simple to capture the pattern, so it is poor on both training and test data.',
  unfolding:
    'Writing a recurrent network out over time as a feed-forward-like graph with the same weights at every step.',
  'update gate':
    'In a GRU, the gate that controls how much old information is kept versus updated.',
  'validation set':
    'Data used to compare models and tune hyperparameters, separate from the training and test sets.',
  'vanishing gradients':
    'Gradients that shrink layer after layer (or step after step) until early layers or distant time steps stop learning.',
  'weight decay':
    'A penalty on large weights added to the loss. It smooths the decision boundary and reduces overfitting.',
  'weight sharing':
    'Using the same weights at many positions, as a convolution filter does, which greatly reduces the number of parameters.',
  'window size':
    'How many consecutive values are fed to a sequence model as input for one training instance.',
  xgboost:
    'Extreme gradient boosting: trees are built sequentially and each tree fits the errors of the earlier ones. Predictions are sums of leaf scores.',
  xor: 'Exclusive or: true when exactly one of two inputs is true. It is not linearly separable.',
}

const aliases: Record<string, string> = {
  'decision trees': 'decision tree',
  'batch normalization': 'batch normalisation',
  'classification with c5.0': 'c5.0',
  'regression with cubist': 'cubist',
}

export function lookupTerm(text: string): string | undefined {
  const key = text
    .trim()
    .toLowerCase()
    .replace(/[.:?!,;]+$/, '')
  const direct = entries[key] ?? entries[aliases[key]]
  if (direct) return direct
  const singular = key.endsWith('s') ? key.slice(0, -1) : key
  return entries[singular]
}

export const glossaryTerms = Object.keys(entries)
