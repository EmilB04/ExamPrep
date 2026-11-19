import type { Lesson, Question } from './content'
import guideQuiz from './content/machine-learning/reading-guide-quiz.json'

type Q = [
  question: string,
  options: string[],
  answer: number,
  explanation: string,
  hint: string,
]

const build = (prefix: string, items: Q[]): Question[] =>
  items.map(([question, options, answer, explanation, hint], i) => ({
    id: `${prefix}-q${i + 1}`,
    question,
    options,
    answer,
    explanation,
    hint,
  }))

const minutes = (reading: string, qs: Question[]) =>
  Math.ceil(reading.split(/\s+/).length / 180) + qs.length + 3

const make = (
  id: string,
  meta: {
    title: string
    eyebrow: string
    intro: string
    takeaway: string
    recall: string
    recallAnswer: string
    provenance: string
    caution?: string
    exercise?: string
  },
  reading: string,
  questions: Question[],
): Lesson => ({
  id,
  title: meta.title,
  eyebrow: meta.eyebrow,
  minutes: minutes(reading, questions),
  intro: meta.intro,
  paragraphs: [],
  takeaway: meta.takeaway,
  question: questions[0].question,
  options: questions[0].options,
  answer: questions[0].answer,
  explanation: questions[0].explanation,
  recall: meta.recall,
  recallAnswer: meta.recallAnswer,
  reading,
  questions,
  provenance: meta.provenance,
  caution: meta.caution,
  exercise: meta.exercise,
})

/* ------------------------------------------------------------------ */
/* 1. Decision trees, entropy, information gain                        */
/* ------------------------------------------------------------------ */

const treesReading = `## What a decision tree is

A **decision tree** classifies an example by asking a series of questions, like a flowchart. Each **internal node** tests one feature (predictor), each **branch** is an outcome of the test, and each **leaf** gives the answer (a class label). A tree can also do regression, with a number at the leaf.

Data have the general form: N instances, each with attributes (x1, x2, ..., xd) and a target value y. Attributes can be Boolean, discrete or continuous. The slides note that the same attribute may be used more than once in a tree. On a single path this only makes sense for a continuous attribute that is tested again with a different threshold.

The course example is the **car theft risk** table (7 cars, target = risk):

| ID | Model | Alarm | Area | Parking | Risk |
| --- | --- | --- | --- | --- | --- |
| D1 | opel | yes | urban | street | high |
| D2 | volvo | no | rural | garage | low |
| D3 | opel | no | rural | street | high |
| D4 | opel | yes | rural | street | low |
| D5 | volvo | yes | urban | garage | low |
| D6 | volvo | yes | urban | street | high |
| D7 | opel | no | rural | garage | low |

## Expressiveness and the hypothesis space

A tree can express any function of the input attributes. A tree with one path per training example is always consistent with the training data, but it **memorises** instead of finding structure and generalises badly. We want a **small** tree that is still consistent with the data.

With n Boolean attributes there are 2^(2^n) distinct trees (the number of truth tables with 2^n rows). For n = 6 that is 18,446,744,073,709,551,616. We cannot search all of them, so we use **greedy search**: recursively choose the "most significant" attribute as the root of each (sub)tree.

## Entropy

**Entropy** measures uncertainty in a probability distribution. For a Boolean outcome with probability p of "true":

H(p) = -p log2(p) - (1-p) log2(1-p)

- H = 0 when p = 0 or p = 1 (no uncertainty).
- H = 1 bit when p = 0.5 (maximal uncertainty, a fair coin).
- For several classes: H = -sum over classes of p_s log2(p_s).
- With p positive and n negative examples, use p/(p+n) and n/(p+n).

## Information gain

**Information gain (IG)** is the reduction in entropy from testing an attribute: the entropy before the split minus the **weighted average** entropy of the branches. Each branch is weighted by the fraction of examples that go into it. The algorithm picks the attribute with the largest IG.

Restaurant example (12 examples, 6 positive and 6 negative, so the entropy before is 1 bit): Patrons (None/Some/Full) gives two pure branches (None: 0 of 2 positive, Some: 4 of 4 positive) and one mixed branch (Full: 2 of 6 positive). Its gain is 1 - [2/12 I(0,1) + 4/12 I(1,0) + 6/12 I(2/6,4/6)] = **0.541 bits**. Type (French/Italian/Thai/Burger) leaves every branch at 1 bit, so IG = 0: 1 bit before, 1 bit on average after. Patrons is chosen as the root. (The slide prints the Patrons value as ".0541", which is a typo for 0.541.)

Branch weights come from the branch sizes: in the Patrons example "None" is entered 2/12 = 1/6 of the time, "Some" 4/12 = 1/3 and "Full" 6/12 = 1/2.

## Worked example: car theft risk

The root has 3 high and 4 low, so H = -(3/7)log2(3/7) - (4/7)log2(4/7) = **0.985 bits**.

| Attribute | Branches (high/low) | Weighted entropy | IG |
| --- | --- | --- | --- |
| Model | opel 2/2 (H=1), volvo 1/2 (H=0.918) | 4/7*1 + 3/7*0.918 = 0.965 | 0.020 |
| Alarm | yes 2/2 (H=1), no 1/2 (H=0.918) | 0.965 | 0.020 |
| Area | urban 2/1 (H=0.918), rural 1/3 (H=0.811) | 3/7*0.918 + 4/7*0.811 = 0.857 | 0.128 |
| Parking | street 3/1 (H=0.811), garage 0/3 (H=0) | 4/7*0.811 + 3/7*0 = 0.464 | **0.522** |

**Parking** has the highest gain, so it becomes the root. The garage branch is pure (all low). The street branch (D1, D3, D4, D6) is split further. Your Notion "Last lecture" notes say you must be able to **set up** calculations like these, and that you are not expected to do logs or finish the calculations.

## Issues in decision tree learning

- **Occam's razor**: prefer the simplest tree that fits, to improve generalisation.
- **Early stopping**: stop growing the tree before it fits noise.
- **Pruning**: grow the tree fully, then remove branches. Reduced-error pruning removes nodes that do not hurt accuracy on validation data. Rule post-pruning converts the tree to rules, then prunes the rules. Later splits can be useful even when an earlier one is not, which is why pruning back can beat early stopping.
- **Continuous predictors**: choose a threshold to turn the attribute into a binary test.
- **Predictors with very many values** (for example an ID) give a misleadingly high IG.
- **Missing values**, **predictors with differing costs**, and **different misclassification costs** need special handling.

## Where trees fit: the course overview

Lecture 1 demonstrated **classification with C5.0** (stock trading, hypothyroid, ovarian cancer) and **regression with Cubist** (ozone prediction, stock prices). The intro slides place trees among the machine-learning method families:

- **Decision trees**: classification and regression.
- **Neural nets**: classification, regression, automatic control and much else.
- **Clustering**: "finding twins", used in recommender systems.
- **Bayesian networks / Bayesian learning** (the slide lists Google PageRank next to it).
- **Evolutionary computation**: evolution strategies for global parameter optimisation, genetic algorithms, and **automatic programming** (computers writing programs, for example sorting, searching, compilers, or automatically synthesising neurons and LLMs).

## Application: an electronic nose

A lecture case study uses a gas chromatograph / mass spectrometer, and later an "electronic nose" with only 16 sensors, to tell the smell of healthy tissue from ovarian cancer tissue. The suggested method: (1) measure a few hundred sick and healthy samples with GC-MS, (2) extract features or markers with machine learning, (3) build sensors tuned to the extracted features, (4) use classifiers such as **C5.0** on the sensor output to screen or diagnose. The slide table compares many algorithms (Bayes network, naive Bayes, multilayer perceptron, SMO, KNN, J48, ...) with scores between about 77 and 93 in the last column of the table (the column headers are not shown on the slide). The conclusions: there is a correlation between the emitted gases and the presence of a tumour, even a primitive nose can separate sick from healthy samples, but the number of samples is too small to say which technique is most accurate.
`

const treesQs = build('ml-trees', [
  [
    'In a decision tree, what does a leaf node contain?',
    [
      'A feature test',
      'A class label (or a number for regression)',
      'The training data',
      'An information gain value',
    ],
    1,
    'Internal nodes test a feature and branches are outcomes of the test. A leaf gives the final answer: a class label for classification or a number for regression.',
    'Which node type gives the answer?',
  ],
  [
    'What is the entropy of a fair coin toss (p = 0.5)?',
    ['0 bits', '0.5 bits', '1 bit', '2 bits'],
    2,
    'H = -0.5 log2(0.5) - 0.5 log2(0.5) = 0.5 + 0.5 = 1 bit. This is the maximum for two outcomes.',
    'Maximum uncertainty for two outcomes.',
  ],
  [
    'When is the entropy of a two-class set equal to 0?',
    [
      'When both classes are equally frequent',
      'When all examples belong to one class',
      'When there are no attributes',
      'When there are exactly two examples',
    ],
    1,
    'If p = 0 or p = 1 there is no uncertainty, so entropy is zero. A pure node needs no further splitting.',
    'Think of a pure node.',
  ],
  [
    'How is information gain computed for an attribute?',
    [
      'Entropy after the split minus entropy before',
      'Entropy before the split minus the weighted average entropy of the branches',
      'The number of branches',
      'The accuracy on the validation set',
    ],
    1,
    'IG = entropy before - sum over branches of (fraction of examples in the branch) x (entropy of the branch). The attribute with the largest IG is chosen.',
    'Before minus after, with weights.',
  ],
  [
    'In the car-theft data (3 high, 4 low), which attribute has the highest information gain at the root?',
    ['Model', 'Alarm', 'Area', 'Parking'],
    3,
    'Parking splits into street (3 high, 1 low) and garage (0 high, 3 low). The weighted entropy is about 0.464, giving IG about 0.522, clearly more than Area (0.128) and Model/Alarm (0.020).',
    'One branch becomes completely pure.',
  ],
  [
    'What is the entropy at the root of the car-theft data (3 high, 4 low)?',
    ['0 bits', 'About 0.985 bits', 'Exactly 1 bit', 'About 0.43 bits'],
    1,
    'H = -(3/7)log2(3/7) - (4/7)log2(4/7), about 0.524 + 0.461 = 0.985 bits. It is slightly less than 1 because the classes are not exactly balanced.',
    'Close to, but below, 1.',
  ],
  [
    'Why is greedy search used when learning decision trees?',
    [
      'Greedy search always finds the optimal tree',
      'There are 2^(2^n) possible trees for n Boolean attributes, so exhaustive search is infeasible',
      'Trees cannot be searched any other way',
      'It removes the need for training data',
    ],
    1,
    'The hypothesis space is enormous (for n = 6 there are about 1.8 x 10^19 trees). Greedy search picks the best attribute at each step. It is fast but does not guarantee the smallest tree.',
    'Count the possible truth tables.',
  ],
  [
    'A tree with one path to a leaf for every training example is a problem because it...',
    [
      'Cannot represent the training data',
      'Memorises the data and probably does not generalise',
      'Always has too few leaves',
      'Has zero entropy on new data',
    ],
    1,
    "It is trivially consistent with the training set but captures noise instead of structure. Occam's razor says to prefer a more compact tree.",
    'Memorising versus finding structure.',
  ],
  [
    'Which describes pruning?',
    [
      'Growing a tree and then removing branches that do not improve generalisation',
      'Adding more attributes to the data',
      'Increasing the learning rate',
      'Averaging many trees',
    ],
    0,
    'Pruning (reduced-error pruning, rule post-pruning) cuts a fully grown tree back. Averaging many trees is a different technique (bagging / random forest).',
    'Cutting back after growing.',
  ],
  [
    'An attribute such as a unique customer ID would get a very high information gain. Why is it still a poor split?',
    [
      'Each value gives a pure branch with one example, so the tree memorises instead of generalising',
      'IDs are always missing',
      'Entropy is undefined for IDs',
      'IDs are continuous',
    ],
    0,
    'Predictors with very many values split the data into tiny pure subsets. The gain looks great but the split says nothing about new examples.',
    'What happens to branch size?',
  ],
])

/* ------------------------------------------------------------------ */
/* 2. Evaluation and preprocessing                                     */
/* ------------------------------------------------------------------ */

const evalReading = `## Generalisation and overfitting

**Overfitting** is when a model learns the training data too well, including noise, outliers and accidental patterns. It performs well on training data and poorly on new data.

- Training error keeps going down while validation or test error stops improving or rises.
- Typical causes: a model too complex for the data, too little or unrepresentative data, too many training epochs, and **data leakage** (the model indirectly sees validation or test information).
- **Underfitting**: the model is too simple. Bad on train and test. Overfitting: good on train, bad on test.
- Fixes: more data, a simpler model, regularisation (L1/L2 weight decay, dropout), early stopping, cross-validation, feature selection or dimensionality reduction, and a proper train/validation/test split.

## Cross-validation

Training accuracy says little about performance on new data. **k-fold cross-validation** estimates it:

1. Split the dataset into k equal folds (commonly k = 5 or 10).
2. Train on k-1 folds and test on the remaining one.
3. Repeat k times, each time leaving out a different fold.
4. Average the k scores.

Every example is used for testing exactly once. **Repeated** cross-validation repeats this with different random splits, and **stratified** folds keep the class proportions in every fold. For a final unbiased number, keep a separate **test set** that is opened only once. A common split is 60/20/20 for train/validation/test (Lecture 7). The validation set is used to tune hyperparameters; the final model is often retrained on train + validation.

## Confusion matrix and metrics

For a binary problem, with "positive" as the class of interest:

| | Predicted positive | Predicted negative |
| --- | --- | --- |
| Actually positive | TP | FN |
| Actually negative | FP | TN |

| Metric | Formula | Meaning |
| --- | --- | --- |
| Accuracy | (TP+TN) / all | Share correct. Misleading with imbalanced classes |
| Sensitivity = recall = true positive rate | TP / (TP+FN) | Share of real positives found |
| Specificity | TN / (TN+FP) | Share of real negatives correctly rejected |
| Precision | TP / (TP+FP) | Share of predicted positives that are real |
| F1 | 2PR / (P+R) | Harmonic mean of precision and recall |

Example: TP = 40, FN = 10, FP = 20, TN = 130. Accuracy = 170/200 = 0.85, recall = 40/50 = 0.80, precision = 40/60 = 0.67, specificity = 130/150 = 0.87.

With 95% negatives, a model that always predicts "negative" gets 95% accuracy and 0 recall. Check precision, recall or F1 on the positive class. Different **misclassification costs** (a missed cancer is worse than a false alarm) can be built into the model or the decision threshold.

## Preprocessing

- **Centering**: subtract each feature's training mean. Features then have no directional bias.
- **Scaling**: divide by the training standard deviation. Without it, features on large scales dominate gradients and distance calculations.
- **Deskewing**: transform a skewed feature distribution toward a more symmetric shape (for example with a log or Box-Cox transform). In image tasks such as handwritten digits, the same word can also mean straightening slanted images. The slide only lists the word, so know both meanings.
- Compute the mean and standard deviation on the **training set only** and reuse them on validation and test data (fit_transform on train, transform on test). Doing otherwise leaks information.

## Dimensionality reduction

- **Principal component analysis (PCA)**: finds orthogonal directions of maximal variance and projects the data onto the first few. Linear, and used to reduce dimension or decorrelate features.
- **t-SNE** (t-distributed stochastic neighbour embedding): a non-linear method that keeps neighbouring points close in 2D or 3D. Usually better than PCA for visualising clusters. It is for visualisation, not a general preprocessing step.
`

const evalQs = build('ml-eval', [
  [
    'Training error keeps falling but validation error starts rising. What is happening?',
    ['Underfitting', 'Overfitting', 'Data augmentation', 'Normal convergence'],
    1,
    'This divergence is the classic sign of overfitting. The model starts memorising training data. Early stopping would halt training around the validation minimum.',
    'Train good, validation bad.',
  ],
  [
    'In 5-fold cross-validation, what fraction of the data is used to train the model in each round?',
    ['20%', '50%', '80%', '100%'],
    2,
    'Each round trains on k-1 = 4 of the 5 folds (80%) and tests on the remaining fold (20%). Every example is tested exactly once.',
    'k-1 out of k.',
  ],
  [
    'Why should the test set be used only once, at the end?',
    [
      'It is too small to use more often',
      'Using it to choose models makes it part of model selection and the estimate becomes optimistic',
      'Test data cannot be reused by law',
      'It speeds up training',
    ],
    1,
    'Repeatedly choosing models or hyperparameters by test performance leaks information. Use validation data or cross-validation for tuning.',
    'What does tuning on test data do to the estimate?',
  ],
  [
    'Which is NOT a typical way to reduce overfitting?',
    [
      'Early stopping',
      'More training data',
      'Weight decay / dropout',
      'Increasing model complexity further',
    ],
    3,
    'Overfitting comes from too much capacity relative to data. Making the model more complex usually makes it worse.',
    'Which option adds capacity?',
  ],
  [
    'Confusion matrix: TP = 40, FN = 10, FP = 20, TN = 130. What is the recall (sensitivity)?',
    ['0.67', '0.80', '0.85', '0.87'],
    1,
    'Recall = TP / (TP + FN) = 40 / 50 = 0.80. Precision would be 40/60 = 0.67, accuracy 170/200 = 0.85, specificity 130/150 = 0.87.',
    'Of the real positives, how many were found?',
  ],
  [
    'Same matrix (TP = 40, FN = 10, FP = 20, TN = 130). What is the precision?',
    ['0.67', '0.80', '0.85', '0.87'],
    0,
    'Precision = TP / (TP + FP) = 40 / 60 = 0.67. It describes how many predicted positives are real.',
    'Divide by all predicted positives.',
  ],
  [
    'Which pair is correct?',
    [
      'Sensitivity = TN / (TN + FP)',
      'Specificity = TP / (TP + FN)',
      'Sensitivity = recall = TP / (TP + FN)',
      'Precision = TP / (TP + FN)',
    ],
    2,
    'Sensitivity is the same as recall. Specificity is the true negative rate TN/(TN+FP). Precision uses TP+FP in the denominator.',
    'Sensitivity has another name.',
  ],
  [
    'A dataset is 95% negative. A model always predicts negative. Which statement is true?',
    [
      'Accuracy is 95% and recall on the positive class is 0',
      'Accuracy is 0% and recall is 95%',
      'Precision and recall are both 95%',
      'The model is perfect',
    ],
    0,
    'Accuracy hides the problem under class imbalance. The model finds none of the positives, so recall is 0. Check precision, recall or F1 on the positive class.',
    'What does the model never find?',
  ],
  [
    'You compute the mean and standard deviation for scaling. On which data should you compute them?',
    [
      'The whole dataset including the test set',
      'The test set only',
      'The training set only, then reuse them on validation and test data',
      'A fresh value for every split',
    ],
    2,
    'Computing statistics from the test set leaks information. Fit the scaler on training data and apply the same transform to the rest.',
    'fit_transform versus transform.',
  ],
  [
    'Which pairing of technique and aim is right?',
    [
      'Centering: divide by the standard deviation',
      'Scaling: subtract the mean',
      'Centering: subtract the mean so features have no directional bias',
      'Deskewing: increase the number of features',
    ],
    2,
    'Centering subtracts the training mean. Scaling divides by the standard deviation. Deskewing reduces skew in a feature distribution (or, for images, straightens slanted shapes).',
    'Centering moves the mean.',
  ],
  [
    'What is the main difference between PCA and t-SNE?',
    [
      'PCA is a linear projection onto high-variance directions; t-SNE is a non-linear method for visualising neighbourhood structure',
      'PCA needs labels; t-SNE does not',
      'PCA always gives 2D output; t-SNE gives 100D',
      't-SNE is a classifier',
    ],
    0,
    'PCA finds orthogonal directions of maximal variance. t-SNE preserves local neighbourhoods and usually gives nicer cluster plots, but it is mainly for visualisation.',
    'Linear versus non-linear.',
  ],
  [
    'Why can a missed disease and a false alarm be treated differently when evaluating a classifier?',
    [
      'They never differ',
      'Misclassification costs can differ, so the decision threshold or loss may be adjusted',
      'False alarms cannot occur',
      'Only accuracy matters',
    ],
    1,
    'Different misclassification costs are a known issue in learning. You can weight errors or move the decision threshold, and you evaluate with recall or precision as appropriate.',
    'Are all errors equally bad?',
  ],
])

/* ------------------------------------------------------------------ */
/* 3. Ensembles and boosting                                           */
/* ------------------------------------------------------------------ */

const ensembleReading = `## Tree software from the course

- **C5.0**: Quinlan's decision tree and ruleset system for **classification** (successor of ID3 and C4.5). Needs a names file (attribute types), a data file and optionally a test file.
- **Cubist**: the counterpart for **regression**. Each rule has a **linear equation** in its "then" part, so the model is piecewise linear.
- **Random forest** and **XGBoost**: ensembles of trees (below).
- **Classifium**: gradient boosting with automatic tuning, designed for very little overfitting.
- Also mentioned: **LightGBM** and **CatBoost**.

## Bagging and random forests

**Bagging** (bootstrap aggregating): draw M bootstrap samples (random samples with replacement, same size as the data), train one model on each, and average the predictions or take a majority vote. If the models make somewhat independent errors, the ensemble **reduces variance**.

A **random forest** is bagging with trees, plus randomness in the features: at each split only a random subset of attributes is considered. The trees are built **independently** and their votes combined.

**Out-of-bag (OOB) evaluation**: each bootstrap sample leaves out part of the data (about 36.8%, or 1/e, of the examples). Test each example only on the trees that did not see it, for a conservative error estimate without a separate validation set.

## Boosting and XGBoost

**Boosting** builds trees **sequentially**. Each new tree tries to correct the errors of the earlier ones, for example by giving misclassified examples more weight (AdaBoost, C5.0 boosting) or by fitting the residuals or gradient of the loss (gradient boosting).

| | Random forest | XGBoost / gradient boosting |
| --- | --- | --- |
| Trees built | Independently, in parallel | One after another |
| Idea | Bagging: average many noisy trees | Boosting: each tree fixes previous mistakes |
| Main effect | Reduces variance | Reduces bias (and with care variance) |
| Overfitting | Fairly robust: adding trees does not make it overfit more | Can overfit, needs tuning |

**How XGBoost predicts.** Each tree assigns a **score** at its leaves, and the prediction for an example is the **sum of the scores** from all trees. In the lecture example, tree 1 splits on "age < 15?" and "is male?" with leaf scores +2, +0.1 and -1; tree 2 splits on "uses a computer daily?" with leaf scores +0.9 and -0.9. A boy gets 2 + 0.9 = **2.9**, and an older man gets -1 - 0.9 = **-1.9**. For regression trees (such as the temperature-prediction example) the leaves hold numbers directly.

Cubist has **committee** models, boosting-like for regression: n sequential models where each corrects the earlier ones. C5.0's -b option boosts classification trees.

## Hyperparameters

A **hyperparameter** is a setting chosen before training, as opposed to a parameter learned from data. Examples for tree ensembles: number of trees, maximum depth, number of predictors tried at each split, learning rate, regularisation strength, and boosting options such as subsampling. Tune them with validation data or repeated cross-validation, not on the test set. Explain what each setting does and how changing it affects results.

## Project 1 (for context)

Build, tune and critically evaluate predictive models on a chosen dataset (at most 5 A4 pages). The main task is to show that the models **generalise**, using repeated cross-validation or a separate test set, and to look at how performance changes with missing values or reduced training data. A systematic, statistically sound evaluation counts for more than the lowest error. Your own group notes (the Notion "2. Meeting" page) describe the UCI Online Shoppers Purchasing Intention data (12,330 rows, 15.5% positive class) and plan to handle the class imbalance with class weights (class_weight, scale_pos_weight) instead of oversampling or SMOTE, since oversampling must happen inside each cross-validation fold.
`

const ensembleQs = build('ml-ens', [
  [
    'What is the key difference between how a random forest and XGBoost build their trees?',
    [
      'A forest builds trees independently; XGBoost builds them sequentially, each correcting earlier errors',
      'A forest builds trees sequentially; XGBoost builds them independently',
      'Neither uses trees',
      'XGBoost needs no training data',
    ],
    0,
    'Random forest = bagging with independent trees and averaged votes. XGBoost = boosting, where each new tree targets the mistakes of the previous ones.',
    'Parallel versus sequential.',
  ],
  [
    'What is a bootstrap sample?',
    [
      'A subset chosen without replacement',
      'A random sample drawn with replacement, usually the same size as the data',
      'The test set',
      'A set of new synthetic features',
    ],
    1,
    'Sampling with replacement means some examples appear several times and others not at all. The omitted ones are the out-of-bag examples.',
    'Some examples repeat.',
  ],
  [
    'What does bagging mainly reduce?',
    ['Bias', 'Variance', 'The number of features', 'The training set size'],
    1,
    'Averaging many models that make partly independent errors cancels random fluctuations, which lowers variance.',
    'Averaging cancels random error.',
  ],
  [
    'What extra randomness distinguishes a random forest from plain bagged trees?',
    [
      'It uses a different loss function',
      'Each split considers only a random subset of the attributes',
      'It randomly removes labels',
      'It trains on the test set',
    ],
    1,
    'Random feature subsets decorrelate the trees, so the ensemble gains more from averaging.',
    'Look at the splits.',
  ],
  [
    'Approximately what fraction of the data is left out of a given bootstrap sample (the out-of-bag part)?',
    ['About 5%', 'About 37%', 'About 63%', 'About 90%'],
    1,
    'The chance an example is never picked in N draws with replacement is (1 - 1/N)^N, about 1/e = 36.8%. (The lecture slide says "about 30%".)',
    'Think 1/e.',
  ],
  [
    'Cubist is to C5.0 as...',
    [
      'regression is to classification',
      'classification is to regression',
      'clustering is to classification',
      'boosting is to bagging',
    ],
    0,
    'C5.0 predicts classes; Cubist predicts numbers using rules with linear equations at the leaves.',
    'What does each predict?',
  ],
  [
    'Which of these is a hyperparameter of a tree ensemble?',
    [
      'The split threshold learned at a node',
      'The number of trees',
      'The class label at a leaf',
      'The out-of-bag error',
    ],
    1,
    'Hyperparameters are chosen before training (number of trees, depth, learning rate). Thresholds and leaf labels are learned from data.',
    'Set before training.',
  ],
  [
    'In gradient boosting, what usually happens if you lower the learning rate?',
    [
      'Each tree contributes less, so you usually need more trees but may generalise better',
      'Training always becomes faster',
      'The model becomes a random forest',
      'The model stops using trees',
    ],
    0,
    "A smaller learning rate shrinks each tree's contribution. It makes boosting more cautious and typically needs more trees.",
    'Small steps need more steps.',
  ],
  [
    'Dataset: 84.5% False, 15.5% True. Why is oversampling done before cross-validation risky?',
    [
      'It makes the data smaller',
      'Duplicated minority rows can end up in both training and validation folds, leaking information',
      'It removes the target',
      'It converts classification to regression',
    ],
    1,
    'Resampling must happen inside each training fold. Class weighting avoids the issue entirely.',
    'Copies of the same row in two folds.',
  ],
  [
    'In the XGBoost lecture example, tree 1 gives a boy a leaf score of +2 and tree 2 gives him +0.9. What is the model prediction for the boy?',
    ['0.9', '2', '2.9', '1.1'],
    2,
    'Boosted tree models add the leaf scores from all trees: 2 + 0.9 = 2.9. A random forest would instead average or take a vote.',
    'Add the scores.',
  ],
  [
    'You have a continuous target (a price). Which tool from the course fits best?',
    ['C5.0', 'Cubist', 'A confusion matrix', 'PCA'],
    1,
    'Cubist is the rule-based regression system. C5.0 is for classification.',
    'Continuous target means regression.',
  ],
])

/* ------------------------------------------------------------------ */
/* 4. Perceptrons, XOR and types of networks                           */
/* ------------------------------------------------------------------ */

const perceptronReading = `## Neural networks: what the course covers

Neuron models, training methods and regularisation, then convolutional and recurrent networks, then foundation models (embeddings, associative memory and attention, transformers, state space models).

## The perceptron

A **perceptron** is a single neuron: a weighted sum of the inputs plus a bias, passed through an activation function.

y = activation(w0 * 1 + w1 * x1 + w2 * x2)

The bias weight w0 is multiplied by a constant 1. A perceptron with a step or sign activation draws a **line** (a hyperplane in higher dimensions) and classifies points by the side they fall on.

## Linear separability

Two classes are **linearly separable** if one straight line (hyperplane) separates them. A single perceptron can only solve linearly separable problems. AND and OR are separable. **XOR** is not.

## XOR by hand (typical exam problem)

Training data with inputs and targets in {-1, +1}:

| x1 | x2 | y |
| --- | --- | --- |
| -1 | -1 | -1 |
| -1 | 1 | 1 |
| 1 | -1 | 1 |
| 1 | 1 | -1 |

No line separates y = +1 from y = -1, so we need a **hidden layer**. One solution with sign activations:

- h1 = sign(x1 - x2 - 1): equals +1 only for (1, -1).
- h2 = sign(x2 - x1 - 1): equals +1 only for (-1, 1).
- y = sign(h1 + h2 + 1): +1 if either hidden unit is +1, otherwise -1.

Check (1, 1): h1 = sign(-1) = -1, h2 = -1, y = sign(-1) = -1. Correct. Check (1, -1): h1 = +1, h2 = -1, y = sign(1) = +1. Correct. Each hidden unit carves out one corner, and the output combines them. This is why hidden layers with non-linear activations add expressive power.

## Learning by gradient descent

With a loss E(w) (for example half the sum of squared errors) we update each weight by moving against the gradient:

w <- w - eta * dE/dw

eta is the **learning rate**. For one weight this walks downhill on a curve; for two weights it moves on a surface. Problems to know:

- **Analytical vs numerical optimisation**: a closed-form solution exists only for simple models. Otherwise we iterate numerically.
- **Steepest descent** can zig-zag in a narrow **error valley** (very different curvature in different directions), which makes it slow.
- **Automatic differentiation** computes the derivatives for us in modern libraries.

## Activation functions and network types

Activations seen: tanh, sigmoid, ReLU, leaky ReLU, ELU, Swish/SiLU. Network types listed in the lectures:

- Feed-forward networks, perceptrons, multilayer networks.
- Recurrent networks and **LSTM** (lectures 9 and 10).
- **Spiking** (pulse-coupled) networks.
- **Echo state networks** (reservoir computing).
- Differentiable neural computers.
- **Generative adversarial networks (GAN)**.
- **Transformers** (time series, LLMs), linear attention models, state space models, xLSTM with matrix memory.

## Why deep learning (introduction slides)

- A deep network learns a **hierarchy of features**. In the face-recognition example, layer 1 finds light and dark pixels, layer 2 edges and simple shapes, layer 3 more complex shapes and objects, and layer 4 which shapes and objects make up a face.
- **MNIST handwritten digits**, published test error without preprocessing: 12% for linear discriminants, 3.3% for 40 PCA components plus a quadratic classifier, 1.4% for an SVM with Gaussian kernels, and **0.35%** for a neural net with 5 hidden layers and elastic deformations. This was the first deep learning success.
- **Single-algorithm hypothesis**: the same brain tissue can process sight, sound or touch (the auditory cortex can learn to see, a frog can learn to use a third eye). The brain behaves like a general-purpose learning machine that can be tuned to specific tasks. Deep learning is the first time a single type of model competes with many previous state-of-the-art results (activity recognition, phoneme classification, object classification, lip reading, paraphrase detection).

You may use any software for the neural-network project: TensorFlow/Keras, PyTorch, JAX or C++ with autodiff.
`

const perceptronQs = build('ml-perc', [
  [
    'What can a single perceptron with a step activation represent?',
    [
      'Any function',
      'Only linearly separable classifications',
      'Only regression',
      'Only sequences',
    ],
    1,
    'A single neuron defines one linear boundary. XOR is the classic example it cannot solve.',
    'One line, one boundary.',
  ],
  [
    'Why can a single perceptron not learn XOR?',
    [
      'XOR has too many inputs',
      'The classes are not linearly separable',
      'XOR needs a sigmoid',
      'The data are not numeric',
    ],
    1,
    'Positive and negative XOR points lie on opposite diagonals of a square, so no single line separates them.',
    'Draw the four points.',
  ],
  [
    'In the hand-built XOR net, h1 = sign(x1 - x2 - 1). For which input pair is h1 = +1?',
    ['(-1, -1)', '(-1, 1)', '(1, -1)', '(1, 1)'],
    2,
    'x1 - x2 - 1 is positive only when x1 = 1 and x2 = -1: 1 + 1 - 1 = 1. All other pairs give -1 or -3.',
    'Plug in each pair.',
  ],
  [
    'For the same net, y = sign(h1 + h2 + 1). What is y at input (1, 1)?',
    ['-1', '+1', '0', 'Undefined'],
    0,
    'At (1, 1) both h1 and h2 equal -1, so the sum is -1 - 1 + 1 = -1 and y = -1, matching XOR.',
    'Compute h1 and h2 first.',
  ],
  [
    'Gradient descent update for one weight (learning rate eta):',
    [
      'w <- w + eta * dE/dw',
      'w <- w - eta * dE/dw',
      'w <- w * dE/dw',
      'w <- eta / w',
    ],
    1,
    'Subtract the gradient (scaled by eta) to move toward lower error.',
    'Go downhill.',
  ],
  [
    'What problem is described by the "error valley"?',
    [
      'Gradient descent zig-zags when the loss is much steeper in one direction than another, converging slowly',
      'The error is always zero',
      'The data have missing values',
      'The network has no hidden layer',
    ],
    0,
    'A narrow valley makes plain steepest descent oscillate across it. Momentum and adaptive optimisers help.',
    'Narrow and long.',
  ],
  [
    'What does automatic differentiation do?',
    [
      'Chooses the architecture',
      'Computes derivatives of a program exactly, using the chain rule on its computational graph',
      'Normalises the data',
      'Estimates the test error',
    ],
    1,
    'Libraries record the operations and apply the chain rule backward, so you do not derive gradients by hand.',
    'Chain rule, automated.',
  ],
  [
    'Which of these is a recurrent network type?',
    ['LSTM', 'GAN', 'PCA', 'Random forest'],
    0,
    'LSTM is a gated recurrent network. A GAN is a generative adversarial pair of networks. PCA and random forests are not neural networks.',
    'Memory over time.',
  ],
  [
    'On MNIST, which approach had the lowest published test error in the introduction slides?',
    [
      'Linear discriminants (12%)',
      'PCA with a quadratic classifier (3.3%)',
      'An SVM with Gaussian kernels (1.4%)',
      'A neural net with 5 hidden layers and elastic deformations (0.35%)',
    ],
    3,
    'The deep network reached 0.35%, ahead of the SVM (1.4%), PCA + quadratic classifier (3.3%) and linear discriminants (12%).',
    'The deep one wins.',
  ],
  [
    'Echo state networks are also known as...',
    [
      'Spiking networks',
      'Reservoir computing',
      'Convolutional networks',
      'Decision forests',
    ],
    1,
    'An echo state network keeps a fixed random recurrent "reservoir" and trains only the readout. The slides list the two names together.',
    'A fixed pool of recurrent units.',
  ],
])

/* ------------------------------------------------------------------ */
/* 5. Multilayer networks, backpropagation                             */
/* ------------------------------------------------------------------ */

const mlpReading = `## Terminology

A multilayer network has an **input** layer, one or more **hidden layers** and an **output layer**. Counting layers usually skips the input: the lecture example (2 inputs, 4 hidden layers of 4 units, 1 output) is a **5-layer network** (4 hidden + 1 output).

Each neuron computes y = sigma(w0 * 1 + w1 * x1 + w2 * x2): a weighted sum plus bias, then an activation. Every neuron has its own weights, so the parameter count grows quickly.

## Counting parameters

For the 2-4-4-4-4-1 network:

- Input to hidden 1: 2 x 4 = 8
- Hidden 1 to 2, 2 to 3, 3 to 4: 4 x 4 = 16 each, so 48
- Hidden 4 to output: 4 x 1 = 4
- Biases: 4 + 4 + 4 + 4 + 1 = 17
- Total: 8 + 48 + 4 + 17 = **77 parameters**

Rule: weights between two layers = (units in) x (units out); one bias per non-input unit.

## Activation functions

Hidden layers need **non-linear** activations. Without them, stacked layers collapse into one linear map. Example with identity activations: h1 = x1 + 2 x2 and h2 = -x1 + x2, then y = 2 h1 - h2 = 3 x1 + 3 x2, which one layer with weights (3, 3) reproduces.

There is no single best activation. Lecture guidance: ReLU for maximum simplicity, speed and sparsity; SiLU/Swish for an ordinary deep MLP; GELU for transformers where you want a simple activation; SwiGLU for transformer feed-forward blocks. Sigmoid and tanh saturate; ReLU = max(0, z) does not for positive z.

## The forward pass

One pass is one matrix-vector product per layer: a(l) = ReLU(W(l) a(l-1) + b(l)). With x = (1, 2), hidden layer 1 rows (0.5, -0.2), (-0.3, 0.8), (0.4, 0.1), (-0.6, -0.1) and biases (0.1, 0, -0.5, 0.2), unit 1 is z = 0.5 * 1 - 0.2 * 2 + 0.1 = 0.2, and ReLU leaves 0.2. Unit 4 is negative and ReLU clips it to 0, which makes the layer **sparse**. In the example, ReLU switched off 5 of the 16 hidden units and the network output was about 0.23 (a sigmoid would give about 0.56).

## Loss and gradient descent

Squared error for one example: E = 1/2 (y - f(x))^2. With target 1 and prediction 0.225, E = 1/2 (0.775)^2 = 0.3003.

Gradient descent repeats: predict, measure the loss, compute the gradient for each weight, update.

Worked example: f(x) = 4x^2 - 4x + 3, f'(x) = 8x - 4, learning rate 0.1, x0 = 2.

- f'(2) = 12, so x1 = 2 - 0.1 * 12 = 0.8
- f'(0.8) = 2.4, so x2 = 0.56
- f'(0.56) = 0.48, so x3 = 0.512
- x4 = 0.512 - 0.1 * 0.096 = 0.5024

Steps shrink as the slope flattens near the minimum x = 0.5. The gradient can be estimated numerically as (f(x+h) - f(x)) / h, for example (11.1204 - 11) / 0.01 = 12.04. The loss of a network is **non-convex**, so descent can end in a local minimum.

## Backpropagation

Backpropagation applies the **chain rule backward** from the loss. The gradient for a weight is a product of local derivatives along the path from the loss to that weight, and the local derivatives are reused across weights.

Output weight example (w = 0.9 on activation a = 0.12, prediction 0.225, target 1):

- dL/dy = y - t = 0.225 - 1 = -0.775
- dL/dw = -0.775 x 0.12 = -0.093
- Update with rate 0.1: w = 0.9 - 0.1 x (-0.093) = 0.9093

Hidden weight: dL/da = -0.775 x 0.9 = -0.6975; ReLU' = 1 (unit is on); times the incoming activation 0.36 gives dL/dW = -0.2511. A unit switched off by ReLU has local derivative 0, so its incoming weights get **zero gradient** for this input.

## Computational graphs

Programs are directed graphs: nodes are variables or operations, edges carry values. **Automatic differentiation** applies the chain rule over the graph using local derivatives, which can be computed in parallel and reused. Deep learning is more than many layers: graphs can have weight sharing and complex structure.

## Take-home

Non-linearity prevents collapse; the forward pass produces a prediction; loss and gradient descent update parameters; backpropagation gives every parameter's gradient via the chain rule.
`

const mlpQs = build('ml-mlp', [
  [
    'How many parameters (weights + biases) does a network with 4 inputs, one hidden layer of 3 units and 2 outputs have?',
    ['18', '23', '26', '30'],
    1,
    'Weights: 4 x 3 + 3 x 2 = 12 + 6 = 18. Biases: 3 + 2 = 5. Total 23.',
    'Add biases for hidden and output units.',
  ],
  [
    'For the 2-4-4-4-4-1 network, how many parameters are there in total?',
    ['60', '68', '77', '85'],
    2,
    '8 + 16 + 16 + 16 + 4 = 60 weights and 4 + 4 + 4 + 4 + 1 = 17 biases, so 77.',
    '60 weights plus biases.',
  ],
  [
    'Why must hidden layers use non-linear activations?',
    [
      'Linear layers are slower',
      'Stacked linear layers collapse into a single linear map',
      'Non-linear functions are always differentiable',
      'It removes the need for training',
    ],
    1,
    'A composition of linear maps is a linear map, so depth would add no expressive power.',
    'What is a product of matrices?',
  ],
  [
    'A hidden unit has pre-activation z = -0.4 and uses ReLU. What are its output and its local derivative?',
    [
      'Output 0, derivative 0',
      'Output 0, derivative 1',
      'Output -0.4, derivative 1',
      'Output 0.4, derivative 0',
    ],
    0,
    'ReLU(z) = 0 for z < 0, and its slope there is 0. The unit contributes nothing and its incoming weights get zero gradient for this example.',
    'Negative input is clipped.',
  ],
  [
    'Gradient descent on f(x) = 4x^2 - 4x + 3 with learning rate 0.1 starting at x0 = 2. What is x1?',
    ['0.8', '1.2', '0.56', '2.8'],
    0,
    "f'(x) = 8x - 4, so f'(2) = 12 and x1 = 2 - 0.1 x 12 = 0.8.",
    'Compute the slope at 2 first.',
  ],
  [
    'Why do the gradient descent steps get smaller as x approaches the minimum?',
    [
      'The learning rate is decreased automatically',
      'The slope flattens, so the gradient is smaller',
      'The loss is convex',
      'The weights are reset',
    ],
    1,
    'The step is eta x gradient. Near the minimum the gradient approaches 0, so steps shrink.',
    'What multiplies eta?',
  ],
  [
    'With squared-error loss L = 1/2 (y_hat - t)^2, what is dL/dy_hat?',
    ['y_hat + t', 'y_hat - t', 't - y_hat squared', '1/2'],
    1,
    'Differentiating 1/2 (y_hat - t)^2 gives (y_hat - t). With y_hat = 0.225 and t = 1 this is -0.775.',
    'The 1/2 cancels the power 2.',
  ],
  [
    'Output weight w = 0.9, input activation a = 0.12, dL/dy_hat = -0.775. What is dL/dw?',
    ['-0.093', '-0.775', '0.093', '-0.6975'],
    0,
    'dL/dw = dL/dy_hat x dy_hat/dw = -0.775 x 0.12 = -0.093. The weight then increases when updated, moving the prediction toward the target.',
    'Multiply the two local derivatives.',
  ],
  [
    'What mathematical rule is the basis of backpropagation?',
    [
      "Bayes' rule",
      'The chain rule',
      'The central limit theorem',
      "Occam's razor",
    ],
    1,
    'The gradient for a weight is the product of local derivatives along the path from the loss to the weight.',
    'Derivatives of compositions.',
  ],
  [
    'What is the benefit of computational graphs in deep learning libraries?',
    [
      'They make models always linear',
      'They allow automatic differentiation that reuses local derivatives efficiently',
      'They remove the need for data',
      'They guarantee the global minimum',
    ],
    1,
    'Representing a model as a graph of primitive operations lets the library apply the chain rule automatically and in parallel.',
    'Local derivatives get reused.',
  ],
  [
    'Which is true about the loss landscape of a neural network?',
    [
      'It is convex, so gradient descent always finds the global minimum',
      'It is non-convex, so descent may reach a local minimum or a saddle region',
      'It has no gradient',
      'It is the same for every dataset',
    ],
    1,
    'Neural network losses are non-convex. Initialisation, momentum and the optimiser influence where training ends up.',
    'Convex or not?',
  ],
])

/* ------------------------------------------------------------------ */
/* 6. CNNs                                                             */
/* ------------------------------------------------------------------ */

const cnnReading = `## Goal: translation invariance

We want a network that fires for a pattern **wherever it appears** in the input. Early work: Fukushima's **Neocognitron** (1979/1980). The CNN solution is to slide one small **filter** (kernel) over the input and compute a multiply-and-sum at each position. Strictly this is cross-correlation, but it is called convolution.

## The convolution

Filter [[1,0,1],[0,1,0],[1,0,1]] on the first 3x3 patch (1,2,3 / 9,10,11 / 17,18,19) of the example input (8 columns, first three rows numbered 1 to 24):

1*1 + 0*2 + 1*3 + 0*9 + 1*10 + 0*11 + 1*17 + 0*18 + 1*19 = **50**

Sliding the filter over every position gives a **feature map**. The filter values are **learned** during training. After adding a bias, the feature map is passed through an activation (ReLU) to give an **activation map**. A layer has several filters, each with its own bias, producing several maps. The number of channels in a filter must match the input channels (for example 3 for RGB).

## Why CNNs need fewer weights

All positions share the same filter (**weight sharing**, parameter tying), and each output sees only a small neighbourhood (**local connectivity**). Example: a 2x2 filter has 4 weights, where a fully connected layer from a 3x3 input to 4 outputs would need 36. A conv layer with 16 filters of 3x3 on a 3-channel input has (3 x 3 x 3 + 1) x 16 = **448 parameters**.

**Channels example**: a 6x6x3 input convolved with two 3x3x3 filters (each filter has as many channels as the input) gives a 4x4x1 output per filter, so a 4x4x2 output for two filters.

## Pooling

A feature map is still location dependent. A **pooling layer** summarises each neighbourhood, for example by the maximum (**max pooling**) or the average (**average pooling**). It gives a little shift invariance and reduces size.

Worked example (2x2 window, stride 2) on the 4x4 input [3 2 0 0 / 0 7 1 3 / 5 2 3 0 / 0 9 2 3]: max pooling gives [7 3 / 9 3]; average pooling gives [3 1 / 4 2].

Typical classifier: [convolution + pooling] repeated, then fully connected layers, then output. Famous early example: **LeNet-5** (LeCun et al.): input 32x32, C1 six feature maps of 28x28, S2 (subsampling) six maps of 14x14, C3 sixteen maps of 10x10, S4 sixteen maps of 5x5, C5 120 units, F6 84 units, output 10 classes. C1 is 28x28 because a 5x5 filter on a 32x32 input gives 32 - 5 + 1 = 28.

## Padding and stride

- Without padding, information at the borders is lost and the output shrinks.
- **Padding** adds a border (usually zeros) to control the output size.
- **Stride** s > 1 moves the filter more than one step, shrinking the output and the computation.
- Output size per dimension: floor((n + 2p - k) / s) + 1, with input n, padding p, kernel k.

Examples: n = 28, k = 5, p = 0, s = 1 gives 24. With s = 2: floor(23/2) + 1 = 12. With p = 2, s = 1: 28 (same size).

Computational cost: multiplications = (kernel area) x (output positions) x (channels), so large images and big kernels get expensive quickly.

## Training a CNN

The same as a fully connected net, with these notes: only inputs that contribute to an output receive gradient. In max pooling, the gradient flows only to the input that held the maximum; the others get 0.

## Training practicalities

- **Parameters** (learned): weights and biases. **Hyperparameters**: number of layers and units, activation function, learning rate, batch size and so on. Choose hyperparameters with a **validation set**, not by looking at the test set. A common split is 60/20/20; the final model is trained on training + validation.
- **Mean centering**: subtract the training mean of each feature, so inputs do not all share one sign, which slows learning.
- **Feature scaling**: divide by the training standard deviation so gradients have similar scale. Example: x = [2, 2, 6, 6] has mean 4 and standard deviation 2; scaling alone gives [1, 1, 3, 3] (std 1 but not centered); centering first gives [-1, -1, 1, 1].
- **Initialisation**: for example weights with standard deviation 1/sqrt(m), m = number of inputs.
- **Learning rate**: can differ by layer or by epoch (large at first, smaller later). **Momentum** uses the gradient as acceleration. **Mini-batches** accumulate gradients over several examples.

## Capacity, early stopping and weight decay

- **Underfitting**: model too simple. **Overfitting**: too complex. For shallow nets, adding or removing parameters moves you between them.
- **Early stopping**: stop when validation loss starts to rise and keep the best model.
- **Weight decay** (parameter norm penalty): add a penalty on the weights to the loss to discourage large weights and smooth the decision boundary. **L2**: cost = sum (y - prediction)^2 + lambda * sum w^2. **L1**: cost = sum (y - prediction)^2 + lambda * sum |w|. lambda is a tunable hyperparameter that sets how much the penalty counts.

## Why depth

Shallow nets rely on hand-crafted features. LeCun and Bengio argue hand-crafting does not scale to each new task. Shallow architectures can represent any function, but deep ones represent many functions far more efficiently. Around 2012-2014, depth drove ImageNet accuracy: AlexNet (2012, 8 layers) to VGG (2014, 19 layers). AlexNet: 5 conv layers, 3 pooling layers, 3 fully connected layers, 1000 output classes, about 60 million parameters.
`

const cnnQs = build('ml-cnn', [
  [
    'What is the main goal of using convolution with a shared filter?',
    [
      'To make the model recurrent',
      'To detect a pattern wherever it appears (translation invariance) with few parameters',
      'To remove the need for activation functions',
      'To increase the number of weights',
    ],
    1,
    'The same filter is applied at every position, so the pattern is detected anywhere, and weights are shared.',
    'Same filter everywhere.',
  ],
  [
    'Filter [[1,0,1],[0,1,0],[1,0,1]] is applied to the patch [[1,2,3],[9,10,11],[17,18,19]]. What is the output?',
    ['45', '50', '55', '90'],
    1,
    '1 + 3 + 10 + 17 + 19 = 50 (the ones in the filter pick 1, 3, 10, 17 and 19).',
    'Only add where the filter has a 1.',
  ],
  [
    'A conv layer has 16 filters of size 3x3 on a 3-channel input, with one bias per filter. How many parameters?',
    ['144', '432', '448', '1,296'],
    2,
    'Each filter has 3 x 3 x 3 = 27 weights + 1 bias = 28. 28 x 16 = 448.',
    'Do not forget the channels and biases.',
  ],
  [
    'Input 28x28, kernel 5x5, no padding, stride 1. What is the output size?',
    ['23x23', '24x24', '25x25', '28x28'],
    1,
    '(28 - 5)/1 + 1 = 24.',
    'n - k + 1.',
  ],
  [
    'Input 28x28, kernel 5x5, padding 2, stride 1. What is the output size?',
    ['24x24', '26x26', '28x28', '32x32'],
    2,
    '(28 + 4 - 5)/1 + 1 = 28. Padding 2 with a 5x5 kernel preserves the size.',
    'Padding adds 2p.',
  ],
  [
    'What does a max pooling layer do?',
    [
      'Learns new filters',
      'Keeps the maximum of each neighbourhood, adding some shift invariance and reducing size',
      'Normalises the batch',
      'Adds noise to the weights',
    ],
    1,
    'Pooling summarises each region. It has no learned weights, and in backpropagation only the maximum position receives gradient.',
    'Summarise a neighbourhood.',
  ],
  [
    'During backpropagation through a max pooling layer, which inputs receive gradient?',
    [
      'All of them equally',
      'Only the one that was the maximum',
      'None',
      'Only the smallest',
    ],
    1,
    'Only inputs that influenced the output get gradient. The non-maximum inputs have zero gradient.',
    'Who contributed to the output?',
  ],
  [
    'Which are hyperparameters?',
    [
      'Learned weights and biases',
      'Learning rate, batch size, number of layers',
      'The gradients',
      'The feature map values',
    ],
    1,
    'Hyperparameters are set before training and tuned using validation data. Weights and biases are parameters learned from data.',
    'Set by you, not learned.',
  ],
  [
    'x = [2, 2, 6, 6]. After centering and then dividing by the standard deviation, what do you get?',
    ['[1, 1, 3, 3]', '[-1, -1, 1, 1]', '[0, 0, 4, 4]', '[-2, -2, 2, 2]'],
    1,
    'Mean 4, standard deviation 2. Centering gives [-2, -2, 2, 2]; dividing by 2 gives [-1, -1, 1, 1]. Scaling alone gives [1, 1, 3, 3] and does not centre.',
    'Subtract the mean first.',
  ],
  [
    'Why is mean-centering of inputs helpful?',
    [
      'It increases the number of features',
      'Inputs with the same sign make gradient updates push weights in one direction, slowing learning',
      'It removes overfitting',
      'It makes ReLU linear',
    ],
    1,
    'Zero-centred inputs have no directional bias, which allows more efficient weight updates.',
    'Think about the sign of the inputs.',
  ],
  [
    'What does early stopping do?',
    [
      'Stops training when validation loss starts to increase, keeping the best model',
      'Stops training when training loss is zero',
      'Stops when the learning rate is 0.1',
      'Starts training from a smaller dataset',
    ],
    0,
    'Early stopping uses validation loss to detect overfitting and halt training near its minimum.',
    'Which curve do you watch?',
  ],
  [
    'LeNet-5 takes a 32x32 input and its first convolution C1 produces six 28x28 feature maps. What filter size does that imply (stride 1, no padding)?',
    ['3x3', '5x5', '7x7', '9x9'],
    1,
    'Output = 32 - k + 1 = 28 gives k = 5.',
    'Solve 32 - k + 1 = 28.',
  ],
  [
    'Max pooling with a 2x2 window and stride 2 is applied to [3 2 / 0 7] (the top-left window of a 4x4 input). What is the output for that window?',
    ['3', '7', '12', '3 (the average)'],
    1,
    'Max pooling keeps the largest value, 7. Average pooling would give (3+2+0+7)/4 = 3.',
    'Keep the largest value.',
  ],
  [
    'What does weight decay (L2 penalty) do?',
    [
      'Adds a penalty on large weights to the loss, smoothing the decision boundary',
      'Deletes random neurons',
      'Increases the learning rate',
      'Normalises the batch',
    ],
    0,
    'The loss becomes the data loss + lambda x ||w||^2, which makes large weights costly. lambda is a hyperparameter.',
    'Penalty on weight size.',
  ],
])

/* ------------------------------------------------------------------ */
/* 7. Training deep CNNs                                               */
/* ------------------------------------------------------------------ */

const deepReading = `## AlexNet and the problems of depth

AlexNet (ImageNet, 1000 classes, over a million images; the slide says 1.5 million) reached a top-5 error 9.6 percentage points lower than the previous best (the slide's chart shows 26.0% falling to 16.4%). The images are hard: illumination, pose, clutter, occlusion, intra-class variation and viewpoint. Three issues had to be solved:

1. **Vanishing gradients** prevent early layers from learning. Fix: **non-saturating activations** (ReLU).
2. **Overfitting**. Fix: **regularisation**, which is any change to a learning algorithm meant to reduce generalisation error. AlexNet used **data augmentation** (random crops and mirror images give about 2048x more data, plus PCA-based colour changes) and **dropout**.
3. **Slow training**. Fix: better hardware (GPUs).

Training setup: weights from a zero-mean Gaussian with std 0.01, batch size 128, weight decay 0.0005, momentum, and a learning rate divided by 10 three times when validation error stopped improving.

The ImageNet error chart in the lecture shows how depth drove accuracy: 8 layers (AlexNet), 19 layers (VGG) and 152 layers (ResNet), the last one passing human performance. In the CNN-layers example, layer 1 learns small edge filters, layer 2 parts of faces, and layer 3 whole faces: deeper layers represent functions much more efficiently.

AlexNet input and first layer: a 227x227x3 image is convolved with 96 filters of 11x11 at stride 4, giving 55x55 maps, since (227 - 11)/4 + 1 = 55.

## Dropout

Bagging trains several models on different data subsets, but it is too expensive for neural networks. **Dropout** approximates it: during training, each neuron is dropped (set to 0) with probability p in each forward pass, so a different sub-network is trained each time. At test time all neurons are used, and activations are scaled so the expected input to the next layer matches training. With this (non-inverted) scheme, the outgoing weights are multiplied by the **keep probability** (1 - p), because the next layer expects a smaller activation signal during training than it would see with every neuron on. Idea: a neuron cannot rely on specific partners, so each unit must be useful on its own (no co-adaptation).

**Where?** Mainly in **fully connected layers**. In AlexNet the five conv layers hold only 0.0, 0.3, 0.9, 0.7 and 0.4 million parameters, whereas FC6 holds 37.8 million, FC7 16.8 million and FC8 4.1 million, so the three fully connected layers hold about 59 of roughly 61 million parameters. (The slide labels these figures "%", but they sum to 61, so they are millions: for example FC6 has 9216 x 4096 = 37.7 million weights.) Convolutional layers are already regularised by parameter tying.

## VGG

VGG replaces large filters with **several small 3x3 filters**. Three stacked 3x3 filters cover a 7x7 receptive field with 3 x 9 = 27 weights per channel pair, compared with 49 for one 7x7. Benefits: fewer parameters and more non-linearities (more discriminative). VGG has 19 layers.

## Weight initialisation (He et al., 2015)

The 2015 paper "Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification" introduced He initialisation; the batch normalisation paper is Ioffe and Szegedy, "Accelerating Deep Network Training by Reducing Internal Covariate Shift".


Weights must be set so the signal neither explodes nor vanishes with depth.

- **tanh / sigmoid** (the lecture's rule, often called LeCun or Xavier-style initialisation; Glorot's original formula averages fan-in and fan-out): weights ~ N(0, 1/m) with m = fan-in (number of inputs to the neuron). For fan-in 4, std = sqrt(1/4) = 0.5.
- **ReLU** (He initialisation): weights ~ N(0, 2/m). ReLU zeroes half of the signal and halves the variance, so the factor 2 compensates. For fan-in 4, std = sqrt(2/4) = 0.71.
- Without this, activations and gradients shrink layer after layer and vanish at around 30 layers.

## Batch normalisation

Input normalisation only fixes the first layer; later layers rescale the signal, so scale differences compound. **Batch normalisation** normalises activations **inside** the network. For each unit, over a mini-batch: compute mean mu and standard deviation sigma, normalise (x - mu)/sigma, then rescale with two **learned** parameters (gamma, beta), which allows the layer to recover the original activations if that is best. At inference use mu and sigma estimated over the training data (running averages).

Formulas from the slides, for a mini-batch of M samples and unit i with activations A_i:

- mu_i = (1/M) sum A_i
- sigma_i = sqrt( (1/M) sum (A_i - mu_i)^2 )
- A_hat_i = (A_i - mu_i) / sigma_i
- BN_i = gamma * A_hat_i + beta (gamma and beta are learned)
- moving averages for inference: mu_mov = alpha * mu_mov + (1 - alpha) * mu_i, and the same for sigma

Result: faster and more stable training.

## Adam

Plain gradient descent has one learning rate for everything. **Adam** gives each parameter an adaptive rate and, according to the slide, combines two approaches from AdaGrad and RMSProp:

- m_t = beta1 * m_(t-1) + (1 - beta1) * g_t: a moving average of the gradient (**momentum**), which gives a less noisy direction.
- v_t = beta2 * v_(t-1) + (1 - beta2) * g_t^2: a moving average of the **squared** gradient, which decreases steps on steep slopes and increases them on flat ones.
- Update: w <- w - alpha * m_hat_t / (sqrt(v_hat_t) + epsilon), where the hats are bias-corrected values. beta1 and beta2 control the decay rates, alpha is the step-size upper bound, and epsilon avoids division by zero.

## Degradation and ResNet

With these tricks, 30-40 layers train. Beyond that **degradation** appears: deeper plain networks perform **worse** even on the **training set**, so it is not overfitting. Theoretically extra layers could be identity mappings, but gradient descent does not find that.

**ResNet** (152 layers, beating human-level ImageNet performance) adds **skip (shortcut) connections**: the block output is F(x) + x. The layers learn the **residual** F(x) = H(x) - x. It is easier to push weights toward 0 (identity) than to learn an identity mapping. A skip connection adds no parameters.

Training: batch size 256, He initialisation, learning rate adjusted manually starting from 0.1 (the slide adds that Adam was used later), batch normalisation before each activation, weight decay 0.0001, **no dropout**. ResNet is still a strong baseline and is widely used for **transfer learning**.
`

const deepQs = build('ml-deep', [
  [
    'What is a regularisation method (as defined in the lecture)?',
    [
      'Any change to a learning algorithm intended to reduce generalisation error',
      'Any method that speeds up training',
      'A way to collect more data',
      'A type of activation function',
    ],
    0,
    'Data augmentation, dropout, weight decay and early stopping are examples.',
    'It targets generalisation error.',
  ],
  [
    'How did AlexNet address vanishing gradients?',
    [
      'By using non-saturating activations (ReLU)',
      'By removing all hidden layers',
      'By using only 3 layers',
      'By resizing images',
    ],
    0,
    'Sigmoid and tanh saturate with small gradients. ReLU has slope 1 for positive inputs.',
    'Which activation does not saturate?',
  ],
  [
    'How does dropout relate to bagging?',
    [
      'It approximates training an ensemble of sub-networks that share weights',
      'It averages the weights of ten separate networks',
      'It is unrelated',
      'It replaces the loss function',
    ],
    0,
    'Each forward pass samples a sub-network. At test time the whole network approximates the ensemble prediction.',
    'Different sub-models each pass.',
  ],
  [
    'Why is dropout mainly applied to fully connected layers in AlexNet?',
    [
      'Conv layers contain few parameters (each about 1 million or fewer, out of roughly 61 million) and are already regularised by weight sharing',
      'Dropout cannot be computed on images',
      'FC layers have no weights',
      'Conv layers are never trained',
    ],
    0,
    'FC6 alone has about 37.8 million parameters, roughly 60% of the model, while each conv layer has about 1 million or fewer. (The slide labels these numbers "%", but they are millions of parameters.)',
    'Where are the parameters?',
  ],
  [
    'Which of these is data augmentation?',
    [
      'Random crops and mirror images',
      'Weight decay',
      'Batch normalisation',
      'Reducing the learning rate',
    ],
    0,
    'Augmentation creates modified copies of training images (AlexNet got about 2048x more data from crops and flips).',
    'Think of images.',
  ],
  [
    'Replacing one 7x7 filter by three 3x3 filters (per channel pair) changes the weight count from...',
    ['49 to 27', '27 to 49', '49 to 81', '9 to 49'],
    0,
    'One 7x7 filter has 49 weights; three 3x3 filters have 3 x 9 = 27. They cover the same 7x7 receptive field and add extra non-linearities.',
    '7 x 7 versus 3 x 3 x 3.',
  ],
  [
    "AlexNet's first layer applies 96 filters of 11x11 with stride 4 to a 227x227 image. What is the spatial size of each output map?",
    ['54x54', '55x55', '56x56', '57x57'],
    1,
    '(227 - 11)/4 + 1 = 55.',
    'Use (n - k)/s + 1.',
  ],
  [
    'Which initialisation is recommended for ReLU networks?',
    [
      'All zeros',
      'Variance 1/m (the tanh/sigmoid rule)',
      'He: variance 2/m (m = fan-in)',
      'Constant 1',
    ],
    2,
    'ReLU zeroes half the signal, so He initialisation doubles the variance to preserve it. Variance 1/m is the rule for tanh/sigmoid.',
    'Factor 2 for ReLU.',
  ],
  [
    'A tanh neuron has fan-in m = 4. What standard deviation does the 1/m-variance rule for tanh give?',
    ['0.25', '0.5', '0.71', '2'],
    1,
    'Variance 1/m = 0.25, so std = sqrt(0.25) = 0.5. (He for ReLU would give sqrt(2/4) = 0.71.)',
    'Take the square root of 1/4.',
  ],
  [
    'What does batch normalisation do?',
    [
      'Normalises layer activations with mini-batch statistics, then rescales with learned parameters',
      'Normalises only the input data',
      'Randomly drops neurons',
      'Increases the batch size',
    ],
    0,
    'It standardises activations inside the network and learns gamma and beta so the layer can recover the original activations.',
    'Inside the network, per mini-batch.',
  ],
  [
    'Adam combines which two ideas?',
    [
      'Momentum (moving average of gradients) and a moving average of squared gradients (adaptive step size)',
      'Dropout and batch normalisation',
      'Bagging and boosting',
      'Padding and stride',
    ],
    0,
    'The m term gives a smoother direction, the v term scales the step per parameter (smaller on steep slopes, larger on flat ones).',
    'Direction and step size.',
  ],
  [
    'What is the "degradation" problem?',
    [
      'Very deep plain networks get worse training and test performance than shallower ones, which is not simply overfitting',
      'Overfitting from too many epochs',
      'Loss of precision in floating point numbers',
      'Reduced image resolution',
    ],
    0,
    'Even training error got worse for deeper plain networks, although extra layers could in principle be identity mappings.',
    'Worse even on training data.',
  ],
  [
    'In a ResNet block, the output is...',
    ['F(x)', 'F(x) + x', 'F(x) x x', 'F(x) - x'],
    1,
    'The skip connection adds the input to the block output, so the layers learn the residual F(x) = H(x) - x. An identity mapping needs only F = 0.',
    'The shortcut adds the input.',
  ],
  [
    'Which statement about ResNet training is correct?',
    [
      'Skip connections add many extra parameters',
      'It used batch normalisation and no dropout',
      'It used dropout in every layer',
      'It cannot be used for transfer learning',
    ],
    1,
    'Skip connections add no learned parameters. ResNet used batch normalisation, He initialisation and weight decay without dropout, and is widely used for transfer learning.',
    'Which regulariser was left out?',
  ],
])

/* ------------------------------------------------------------------ */
/* 8. RNNs, LSTM, attention                                            */
/* ------------------------------------------------------------------ */

const rnnReading = `## Why we need recurrence

Feed-forward and CNN models have a **fixed input size** and every forward pass is independent. Many tasks need memory of earlier input and arbitrary lengths: speech, weather forecasting, language, software analysis, sales forecasting, chatbots. Example: given 0,1,1,1,0, is the number of 0s even or odd? You must remember the state so far.

Sequence problem types: **one-to-many** (fixed input, sequence output, for example image captioning), **many-to-one** (sequence in, fixed output, for example sentiment analysis) and **many-to-many** (for example language translation).

## The recurrent network

A recurrent network receives the input and also the **previous hidden state**, through time-delayed connections:

s_t = f(U x_t + W s_(t-1)),  o_t = V s_t

s_t is the new state, s_(t-1) the old state, x_t the input at time t. U, W and V are the weights, **shared across all time steps**. tanh is a common activation.

**Unfolding**: writing the recurrence out over time gives a directed acyclic graph that looks like a feed-forward network where each "layer" is a time step with shared weights. The unfolded depth can follow the input length, so any input size is possible. The **memory** is the flow of information from earlier states, and the weights decide how long information is kept.

The slides draw these settings as **one-to-one**, **one-to-many**, **many-to-one** and two many-to-many forms (input and output of equal length, or input read first and output produced afterwards, as in translation). RNN layers can be **stacked**: deeper RNNs have several hidden layers per time step, which helps more complex tasks.

## Example: parity

Encode 1 as -1 and 0 as +1. State update s_t = tanh(u * x_t * s_(t-1)) with u = 3 and s_0 = +1. Whenever the input is -1 (a 1 in the data), the state flips sign (tanh of about -3 times the state), otherwise it stays. The sign of the state therefore tracks whether the number of 1s so far is even or odd.

## Predicting the next character

Represent tokens as **one-hot vectors** (vocabulary {h, e, l, o}: h = [1,0,0,0], e = [0,1,0,0], ...). The output is a probability for each token, which needs **softmax** instead of independent sigmoids:

p_i = exp(s_i) / sum_j exp(s_j)

The p_i are positive and sum to 1. Example: scores (2, 1, 0) give exp = 7.39, 2.72, 1 (sum 11.1), so p = (0.665, 0.245, 0.090). Generation feeds the previous prediction back as the next input. To decide when to stop: use an end-of-response token, a fixed length, or predict the length.

## Training

Choose a **window size** and **step size**; pad shorter sequences with zeros. From a series of N values, instance 1 takes values 1..L as input and predicts value L+1, instance 2 takes values 2..L+1 and predicts L+2, and so on, up to the last instance that takes N-L..N-1 and predicts N. For many-to-many, add up the loss at each time step. Loss for multi-class output: **cross-entropy**, L = -sum_i y_i log(y_hat_i), where y is the true (one-hot) distribution and y_hat the softmax output. With true class 1 and p = 0.665, L = -ln(0.665) = 0.41. The loss grows when the network is confident and wrong.

Training is backpropagation through the unfolded network (**backpropagation through time**), summing the gradients over all time steps. But training vanilla RNNs often fails.

## Vanishing gradients in RNNs

The error derivative is a long product of local derivatives; with sigmoid/tanh these are almost always below 1, so the signal **decays exponentially** and events far in the past are forgotten. ReLU has derivative 1, but this does **not** remove the problem: for h_t = ReLU(W h_(t-1) + W_x x_t + b) with all units active, dh_T/dh_t = W^(T-t), and repeatedly multiplying the weight matrix shrinks (or explodes) the signal. With w = 0.5 over 100 steps: 0.5^100 is about 7.9 x 10^-31.

## LSTM and GRU

The **LSTM** adds a **cell state** and three sigmoid **gates** (0 = closed, 1 = open):

- **Input gate**: what new information to store
- **Forget gate**: what old information to erase
- **Output gate**: what memory to share with the next step

The cell state is updated by **addition**, so gradients can flow back through time without the repeated shrinking of a vanilla RNN. (The slide says "without vanishing"; forget gates below 1 can still shrink the signal.)

The **GRU** is simpler, with two gates: a **reset gate** (how much past information is used) and an **update gate** (how much old information is kept versus updated).

| Choose GRU when | Choose LSTM when |
| --- | --- |
| Small dataset | Very long-term dependencies |
| Speed and efficiency matter | Remembering over long periods is critical |
| Short to medium sequences | Enough data and compute |
| You want a strong baseline with fewer parameters | Experiments show LSTM wins |

## Attention

In an encoder-decoder (machine translation), compressing a whole sentence into **one fixed-length vector** is a bottleneck. **Attention** passes all encoder hidden states to the decoder, which decides which inputs matter at each step.

- **Hard attention** focuses on a single input. It is not differentiable, and the target relies on one input.
- **Soft attention** uses a **weighted combination** of all inputs. The weights come from an attention module and sum to 1. The **context vector** is c_t = sum_i a_(t,i) h_i. The decoder uses it together with its previous output and hidden state.

Attention helps especially for long sequences: in the RNNsearch results (Bahdanau, Cho and Bengio), the model trained on sentences up to 50 words (RNNsearch-50) keeps a BLEU translation score of about 27 out to 60 words, while the plain encoder-decoder models (RNNenc) fall off steeply with sentence length. The attention model trained on up to 30 words also degrades beyond about 30 words, so the training length matters. The alignment matrices are **interpretable**: for English-French, attention lies mostly on the diagonal (linear alignment is common), and an output word is often informed by more than one input word. It is used in image captioning ("Show, Attend and Tell": a 14x14 convolutional feature map and an LSTM that attends to image regions, with soft attention as blurred maps and hard attention as a single spot) and in speech recognition ("Listen, Attend and Spell": a listener encoder over 40-dimensional log-mel features every 10 ms and a two-layer LSTM speller with an attention module, trained on about 2000 hours of speech with SGD and learning-rate decay (the slide says "learning weight decay"), batch size 32, noise augmentation that gave 20 times more data, beam search with width 32, about 2 weeks of training).

## Self-attention and transformers

Attention for RNNs uses recurrent hidden states, which are computed **sequentially** (slow, cannot be parallelised). **Self-attention** computes attention weights directly from the inputs, so every input is updated into a **context-aware representation in parallel**. The **transformer** uses only self-attention to represent sequences. A large attention score means another token strongly informs the new representation of this token.

- **Self-attention**: relates tokens from the **same** source.
- **Cross-attention**: relates tokens from **different** sources (for example decoder to encoder).

In the usual formulation, queries, keys and values are learned projections of the input. The scores are Q K^T / sqrt(d_k), a softmax turns them into weights, and the output is softmax(Q K^T / sqrt(d_k)) V.
`

const rnnQs = build('ml-rnn', [
  [
    'Why can a standard feed-forward network not handle arbitrary-length sequences well?',
    [
      'It has a fixed input size and each forward pass is independent',
      'It cannot use activations',
      'It has no weights',
      'It can only do regression',
    ],
    0,
    'A fixed input layer cannot take variable lengths, and there is no state carried between passes.',
    'Fixed size, no memory.',
  ],
  [
    'Image captioning is an example of which sequence setting?',
    ['One-to-many', 'Many-to-one', 'Many-to-many', 'One-to-one'],
    0,
    'One image (fixed-size input) produces a sequence of words. Sentiment analysis is many-to-one; translation is many-to-many.',
    'One input, a sequence out.',
  ],
  [
    'In an RNN, which weights are shared across time steps?',
    [
      'None, each step has its own',
      'U, W and V are the same for every time step',
      'Only the output weights',
      'Only the bias',
    ],
    1,
    'Unfolding shows the same weights reused at every step, so the model handles any length with a fixed number of parameters.',
    'Unfolded layers are copies.',
  ],
  [
    'What does "unfolding" an RNN mean?',
    [
      'Removing the recurrence permanently',
      'Writing the recurrence out over time as a feed-forward-like graph with shared weights',
      'Adding more hidden layers',
      'Reducing the vocabulary',
    ],
    1,
    'The unfolded graph is a DAG you can backpropagate through (backpropagation through time).',
    'One copy per time step.',
  ],
  [
    'Why is softmax used instead of independent sigmoids for next-character prediction?',
    [
      'It produces one probability distribution over classes that sums to 1',
      'It is faster than sigmoid',
      'It does not need training',
      'It outputs integers',
    ],
    0,
    'Independent sigmoids give separate yes/no probabilities. Next-token prediction needs mutually exclusive classes.',
    'Probabilities sum to 1.',
  ],
  [
    'Scores (2, 1, 0) pass through softmax. What is the largest probability, approximately?',
    ['0.33', '0.50', '0.67', '0.90'],
    2,
    'exp(2) = 7.39, exp(1) = 2.72, exp(0) = 1, sum 11.1. 7.39 / 11.1 is about 0.665.',
    'e^2 over the sum.',
  ],
  [
    'Cross-entropy loss for one prediction where the true class has predicted probability 0.665 is approximately...',
    ['0.41', '0.665', '1.5', '0'],
    0,
    'L = -ln(0.665), about 0.41. It rises sharply as the probability assigned to the true class approaches 0.',
    'Negative log of the probability.',
  ],
  [
    'Why do vanilla RNNs have trouble learning long-range dependencies?',
    [
      'Gradients are multiplied through many time steps and tend to vanish (or explode)',
      'They have too few weights',
      'They cannot use tanh',
      'They need labels at every step',
    ],
    0,
    'A long product of derivatives and weight matrices shrinks exponentially, so distant events have almost no effect on the update.',
    'Long products of numbers below 1.',
  ],
  [
    'A vanilla RNN has w = 0.5. About how large is the gradient factor over 100 steps?',
    ['0.5', '0.05', 'About 8 x 10^-31', 'About 50'],
    2,
    '0.5^100 is about 7.9 x 10^-31, practically zero.',
    'Raise 0.5 to the 100th power.',
  ],
  [
    'Does ReLU solve vanishing gradients in a vanilla RNN?',
    [
      'Yes, completely, since its slope is 1',
      'It removes the activation part of the shrinking but not the repeated multiplication by the weight matrix',
      'No, ReLU makes the vanishing worse',
      'ReLU cannot be used in RNNs',
    ],
    1,
    'dh_T/dh_t becomes W^(T-t) when all ReLUs are active, so the weights can still shrink or blow up the signal.',
    'What is multiplied again and again?',
  ],
  [
    'What are the three gates of an LSTM?',
    [
      'Input, forget and output',
      'Reset, update and cell',
      'Key, query and value',
      'Encoder, decoder and attention',
    ],
    0,
    'Input = what to store, forget = what to erase, output = what to share. The GRU has reset and update gates.',
    'Store, erase, share.',
  ],
  [
    'Why does the LSTM cell state help against vanishing gradients?',
    [
      'It is updated additively, so gradients can flow back through time without repeated shrinking',
      'It removes the sigmoid',
      'It uses a larger learning rate',
      'It deletes old data',
    ],
    0,
    'Addition lets the gradient pass through the cell state, and the gates learn when to keep or erase information.',
    'Addition instead of repeated multiplication.',
  ],
  [
    'When would you prefer a GRU over an LSTM?',
    [
      'Small dataset, need speed, short to medium sequences',
      'Very long-term dependencies are crucial',
      'You have unlimited compute and data',
      'The data are images',
    ],
    0,
    'The GRU has two gates and fewer parameters, so it is a strong, cheaper baseline.',
    'Fewer parameters.',
  ],
  [
    'What problem does attention solve in an encoder-decoder translation model?',
    [
      'The bottleneck of compressing the whole input into one fixed-length vector',
      'The lack of an activation function',
      'Overfitting on images',
      'Slow GPUs',
    ],
    0,
    'The decoder can look at all encoder states and weight them at each step.',
    'One vector for a whole sentence.',
  ],
  [
    'In the RNNsearch translation results, what did attention change as sentences got longer?',
    [
      'The attention model kept a high BLEU score while the plain encoder-decoder deteriorated',
      'Both models improved',
      'Attention made short sentences worse and long ones better',
      'Nothing; the curves were identical',
    ],
    0,
    'The BLEU curve of RNNsearch-50 stays near its maximum out to 60 words while the plain encoder-decoder (RNNenc) falls steeply, which shows the fixed-length vector bottleneck.',
    'Long sentences hurt the bottleneck.',
  ],
  [
    'A time series has N values. With window size L, which target does the first training instance (values 1..L) predict?',
    ['Value 1', 'Value L', 'Value L+1', 'Value N'],
    2,
    'Each instance takes L consecutive values as input and predicts the next one; the window then slides by the step size.',
    'Predict the next value.',
  ],
  [
    'What is the difference between hard and soft attention?',
    [
      'Hard attention picks one input and is not differentiable; soft attention uses a differentiable weighted combination of all inputs',
      'Hard attention uses more weights',
      'Soft attention can only be used in images',
      'They are the same',
    ],
    0,
    'Soft attention can be trained with backpropagation because the weights are continuous and sum to 1.',
    'One input versus a weighted mix.',
  ],
  [
    'The context vector in soft attention is...',
    [
      'The softmax of the output',
      'A weighted sum of all encoder hidden states: c_t = sum_i a(t,i) h_i',
      'The previous hidden state',
      'The loss',
    ],
    1,
    'The attention weights a(t,i) sum to 1 and say how much input i matters at output step t.',
    'Weights times hidden states.',
  ],
  [
    'Why replace recurrence by self-attention in transformers?',
    [
      'RNN states must be computed sequentially, while self-attention can process all positions in parallel',
      'Self-attention has no weights',
      'It removes the need for training data',
      'It only works on images',
    ],
    0,
    'Parallelism makes training on long sequences much faster and gives direct links between any two tokens.',
    'Sequential versus parallel.',
  ],
  [
    'Cross-attention differs from self-attention in that it...',
    [
      'Relates tokens from different sources (for example decoder to encoder)',
      'Uses no softmax',
      'Only works with one token',
      'Is the same as pooling',
    ],
    0,
    'Self-attention relates tokens in the same sequence; cross-attention connects two sequences.',
    'Same source or different source?',
  ],
])

/* ------------------------------------------------------------------ */
/* 9. Reading guide: tools, C5.0/Cubist and LLMs                       */
/* ------------------------------------------------------------------ */

const guideReading = `## About this lesson

This lesson comes from the **Machine Learning Reading Guide** and 20-question quiz in your Notion page. It covers the tool and reading-list topics around the lectures. Treat it as reading-guide material, not as examined lecture content, unless your supervisor says otherwise.

## C5.0 output and options

C5.0 uses a names file (attribute types and the target), a data file and an optional test file. In a tree, a leaf **(n/m)** means n training cases reach the leaf and m of them are misclassified. Non-integer counts appear because cases with unknown values are split fractionally. A ruleset (-r) shows each rule with its coverage, **lift** (rule accuracy divided by the base class frequency) and confidence (Laplace ratio (n - m + 1) / (n + 2)). Options: -b boosting, -s group discrete values into subsets (your quiz recommends it when attributes have more than 4 or 5 values), -w winnowing (drop irrelevant attributes), -S for a sampled train/test split. (Your Notion guide lists -C for cross-validation, but in C5.0 cross-validation is -X folds and -C sets the pruning confidence level. Cubist uses -X for cross-validation and -C for committees.)

## Cubist output and options

Cubist rules have a linear equation in the "then" part. Evaluation: average absolute error, **relative error** (average absolute error divided by the error of always predicting the mean, so below 1 beats that baseline) and the correlation coefficient. Model types: rule-based, **composite** (-i: rule model combined with nearest neighbours, adjusting each neighbour by T(y) + M(x) - M(y)) and **committee** (-C n sequential models). Other options: -m minimum cases per rule, -r maximum rules, -e extrapolation limit.

## Classifium

A classification tool designed for very little overfitting, which is useful as a benchmark against the tree results. It reads a CSV file and a names file with column types.

## scikit-learn and caret

- scikit-learn: fit_transform on the training set learns the scaler's parameters and applies them; transform on the test set reuses them. Pipelines and GridSearchCV tune models.
- R's caret: createDataPartition splits data, trainControl(method = "repeatedcv", repeats = 3) sets repeated k-fold cross-validation, and metric = "ROC" in train() tunes by area under the ROC curve (needs classProbs = TRUE and summaryFunction = twoClassSummary in trainControl()). In R's formula syntax y ~ x1 + x2, the tilde means "modelled as a function of".

## Deep learning and concept reminders

Bias-variance trade-off: simple models have high bias (underfit), complex models have high variance (overfit). Batch normalisation stabilises the distribution of layer inputs. Dropout randomly deactivates neurons during training. An LSTM adds gates and a cell state.

## Large language models

- LLMs are **transformers** that predict the next **token** (a sub-word unit). They output probabilities for all tokens and sample from them.
- **Temperature** controls randomness: low temperature favours the most likely tokens; high temperature gives more varied output.
- **Embeddings** map tokens to vectors; similar meanings give similar vectors.
- **Attention**: each token has a query, key and value (learned projections). The scores are Q K^T / sqrt(d_k); a softmax turns them into weights, and the output is softmax(Q K^T / sqrt(d_k)) V.
- Training: pre-training on next-token prediction, then RLHF (human feedback) to steer towards helpful behaviour.
- **Fine-tuning** continues training a pre-trained model on a small domain-specific set. **LoRA** adds small trainable low-rank adapter matrices (about 0.1-1% of the parameters) and freezes the base model. **QLoRA** applies LoRA to a 4-bit quantised model, which sharply reduces memory so a 7B model can be tuned on a consumer GPU.
`

const rotate = (opts: string[], answer: number, by: number) => {
  const n = opts.length
  const out = opts.map((_, i) => opts[(i + n - by) % n])
  return { options: out, answer: (answer + by) % n }
}

type GuideItem = {
  cat: string
  question: string
  options: string[]
  answer: number
  explanation: string
}

const guideQs: Question[] = (guideQuiz as GuideItem[]).map((q, i) => {
  // The source quiz almost always puts the right answer in slot B; vary it.
  const r = rotate(q.options, q.answer, i % 4)
  return {
    id: `ml-guide-q${i + 1}`,
    question: q.question,
    options: r.options,
    answer: r.answer,
    explanation:
      i === 10
        ? q.explanation +
          ' Note: the lecture motivates batch normalisation by keeping activations normalised inside the network so the loss landscape stays easy to optimise. The "internal covariate shift" explanation from the original paper is disputed in later work.'
        : q.explanation,
    hint: q.cat,
  }
})

/* ------------------------------------------------------------------ */

export const mlLessons: Lesson[] = [
  make(
    'ml-trees-entropy',
    {
      exercise: 'ml-entropy',
      title: 'Decision trees, entropy and information gain',
      eyebrow: 'Lectures 1-2 · trees',
      intro:
        'Learn how a tree is grown greedily from entropy and information gain, and how to set the calculation up by hand.',
      takeaway:
        'Pick the attribute with the largest information gain: entropy before minus the weighted entropy of the branches. Keep trees small to generalise.',
      recall:
        'Explain how a decision tree picks its root attribute and why a very large tree is a problem.',
      recallAnswer:
        "For each attribute, compute the entropy before the split minus the weighted average entropy of the branches (the information gain), and choose the largest. A tree that fits every training example memorises noise and generalises badly, so use early stopping or pruning (Occam's razor).",
      provenance:
        'Lectures 1-2 · DecisionTrees.ppt, lecture2.odp, lecture3.odp and Notion notes. Study notes and worked numbers written by Claude from these sources. All Lecture 1-5 and intro slides were checked as images after converting them to PDF.',
    },
    treesReading,
    treesQs,
  ),
  make(
    'ml-evaluation-preprocessing',
    {
      exercise: 'ml-confusion',
      title: 'Overfitting, cross-validation and metrics',
      eyebrow: 'Lectures 2-3 · evaluation',
      intro:
        'Estimate how a model performs on new data, read a confusion matrix and prepare features correctly.',
      takeaway:
        'Tune on validation data or cross-validation, report the test set once, and look past accuracy when classes are imbalanced.',
      recall:
        'Describe k-fold cross-validation and what a confusion matrix lets you compute.',
      recallAnswer:
        'Split the data into k folds, train on k-1, test on the remaining fold, repeat for every fold and average the scores. A confusion matrix gives TP, FP, FN and TN, from which you compute accuracy, precision, recall (sensitivity), specificity and F1.',
      provenance:
        'Lectures 2-3 · lecture2.odp, lecture3.odp, Notion notes and the reading guide. Study notes written by Claude.',
      caution:
        'The lecture slide says "sensitivity and specificity, also called precision and recall". Strictly, sensitivity = recall, but specificity (true negative rate) is not the same as precision. These notes use the standard definitions.',
    },
    evalReading,
    evalQs,
  ),
  make(
    'ml-ensembles',
    {
      exercise: 'ml-boosting',
      title: 'Random forests, boosting and XGBoost',
      eyebrow: 'Lectures 2-4 · ensembles',
      intro:
        'Understand why many trees beat one, and how bagging differs from boosting.',
      takeaway:
        'Random forest: independent trees, votes averaged (bagging, lower variance). XGBoost: trees built sequentially to fix earlier errors (boosting).',
      recall: 'Compare random forests and XGBoost.',
      recallAnswer:
        'A random forest trains many trees independently on bootstrap samples with random feature subsets and averages their votes, which reduces variance. XGBoost builds trees one after another, each correcting the errors of the previous ones (boosting), which can reach higher accuracy but needs tuning to avoid overfitting.',
      provenance:
        'Lectures 2-4 · lecture2-4.odp, DecisionTrees.ppt, Notion notes (Lecture 2 and 3) and the Notion Project 1 and "2. Meeting" pages. Statements about the 60/20/20 split come from Lecture 7; the general overfitting advice and centering and scaling definitions are standard background rather than slide text. Lecture 3 and 4 slides have little text; the XGBoost and random-forest diagrams were read as images and the rest was written by Claude.',
      caution:
        'The slide says roughly 30% of data is out-of-bag; the exact limit is 1/e, about 36.8%. The Notion Random Forest, XGBoost and hyperparameter headings in Lecture 3 were empty, so those sections come from the slides and general knowledge.',
    },
    ensembleReading,
    ensembleQs,
  ),
  make(
    'ml-perceptron-xor',
    {
      exercise: 'ml-xor',
      title: 'Perceptrons, XOR and network types',
      eyebrow: 'Lectures 3-5 · neural nets',
      intro:
        'See why one neuron is not enough for XOR, build the hidden-layer solution by hand and survey the network zoo.',
      takeaway:
        'A perceptron draws one line. Hidden layers with non-linear activations solve non-separable problems such as XOR.',
      recall: 'Why can a perceptron not learn XOR and how do you fix it?',
      recallAnswer:
        'XOR is not linearly separable, and a perceptron can only draw a single line. Add a hidden layer with a non-linear activation: for example one hidden unit detects (1, -1), another detects (-1, 1), and the output unit fires if either hidden unit is on.',
      provenance:
        'Lectures 3-5 · lecture3.odp, lecture4.odp, lecture5.odp, mlintro2025.odp, dl_intro.odp. The hand-built XOR weights were derived by Claude; the slides give only the data and the task. All slides were checked as images.',
    },
    perceptronReading,
    perceptronQs,
  ),
  make(
    'ml-mlp-backprop',
    {
      exercise: 'ml-gradient',
      title: 'Multilayer networks and backpropagation',
      eyebrow: 'Lecture 6 · forward and backward',
      intro:
        'Count parameters, run a forward pass, then trace gradients back through the network with the chain rule.',
      takeaway:
        "Forward pass gives the prediction and loss; backpropagation multiplies local derivatives (chain rule) to get every weight's gradient; gradient descent updates the weights.",
      recall: 'Walk through one training step of a multilayer network.',
      recallAnswer:
        'Forward pass: compute each layer a = activation(W a_prev + b) to get the prediction. Loss: compare with the target, for example squared error. Backward pass: apply the chain rule from the loss to each weight, reusing local derivatives. Update: w <- w - eta x gradient. Repeat.',
      provenance:
        'Lecture 6 · Marius Geitle, 2026-10-01, Lecture 6 - Multilayer neural networks.pdf. Notes written by Claude. Every slide was checked as an image; the forward-pass and backpropagation numbers match.',
    },
    mlpReading,
    mlpQs,
  ),
  make(
    'ml-cnn',
    {
      exercise: 'ml-conv',
      title: 'Convolutional networks and training basics',
      eyebrow: 'Lecture 7 · CNN',
      intro:
        'Slide a shared filter over an image, count parameters and output sizes, and learn how to train a network sensibly.',
      takeaway:
        'Convolution shares one small filter across positions: translation invariance with few parameters. Use validation data, centre and scale inputs, and regularise.',
      recall:
        'Explain how a convolutional layer works and why it uses fewer parameters than a fully connected layer.',
      recallAnswer:
        'A small filter slides over the input and computes a weighted sum at each position, producing a feature map that goes through bias and activation. The same filter weights are reused everywhere and each output sees only a local patch, so there are far fewer parameters than a fully connected layer.',
      provenance:
        'Lecture 7 · Marius Geitle, 2026-10-15, Lecture 7 - CNN.pdf and Notion notes. Worked numbers computed by Claude. Slides 1-7 (title and motivation) were not viewed as images; the rest were.',
      caution:
        'The slide computing the cost of a 3x3 kernel on a 1920x1080 RGB image multiplies by 1920 x 720 and gets 37,324,800. For 1080 rows the count is (3*3)*(1920*1080)*3 = 55,987,200. Use the formula, not the slide number.',
    },
    cnnReading,
    cnnQs,
  ),
  make(
    'ml-deep-cnn',
    {
      exercise: 'ml-vanishing',
      title: 'Going deep: AlexNet, VGG, batch norm, ResNet',
      eyebrow: 'Lecture 8 · depth',
      intro:
        'Follow the 2012-2015 breakthroughs that made very deep networks trainable.',
      takeaway:
        'ReLU, dropout and augmentation made AlexNet work; initialisation, batch norm and Adam made 30+ layers trainable; skip connections made 100+ layers possible.',
      recall:
        'Why did plain very deep networks degrade and how does ResNet fix it?',
      recallAnswer:
        'Beyond about 30-40 layers, plain networks got worse even on training data, although extra layers could in principle be identities. ResNet adds skip connections so a block computes F(x) + x and only has to learn the residual F, which is easy to push to zero.',
      provenance:
        'Lecture 8 · Marius Geitle, 2026-10-22, Lecture 8 - CNN and depth.pdf. Notes written by Claude. All slides except the first few (a repeat of Lecture 7) were checked as images.',
      caution:
        'The dropout slide says to multiply outgoing weights by the "probability of dropping"; the usual statement is the keep probability (1 - p). Check which convention your exam uses.',
    },
    deepReading,
    deepQs,
  ),
  make(
    'ml-rnn-attention',
    {
      exercise: 'ml-attention',
      title: 'Recurrent networks, LSTM, attention and transformers',
      eyebrow: 'Lectures 9-10 · sequences',
      intro:
        'Give networks memory, see why plain RNNs fail, and follow the path to attention and transformers.',
      takeaway:
        'RNNs reuse weights over time but suffer vanishing gradients. Gates (LSTM/GRU) fix memory; attention removes the bottleneck; self-attention enables parallel transformers.',
      recall: 'Why do vanilla RNNs forget and how do LSTM and attention help?',
      recallAnswer:
        'Backpropagation through time multiplies many derivatives and weight matrices, so gradients shrink exponentially and distant events are forgotten. An LSTM adds a cell state updated additively and controlled by input, forget and output gates. Attention lets the decoder weight all encoder states instead of one fixed vector, and self-attention does this in parallel without recurrence.',
      provenance:
        'Lectures 9-10 · Marius Geitle, 2026-10-29 and 2026-11-05, Lecture 9 and Lecture 10 PDFs. Notes written by Claude. Every slide of both lectures was checked as an image.',
      caution:
        'The transformer formula softmax(QK^T / sqrt(d_k))V is standard background; it is not derived on the slides, which end at the idea of self-attention.',
    },
    rnnReading,
    rnnQs,
  ),
  make(
    'ml-reading-guide',
    {
      title: 'Reading guide: C5.0, Cubist, tools and LLMs',
      eyebrow: 'Reading guide · 20-question quiz',
      intro:
        'Revise the tool-specific and LLM topics from your reading list with your own Notion quiz.',
      takeaway:
        'Know C5.0 (classification) versus Cubist (regression), the (n/m) leaf notation, relative error, caret/scikit-learn workflow basics, temperature, LoRA and QLoRA.',
      recall:
        'What distinguishes C5.0 from Cubist, and what do LoRA and QLoRA do?',
      recallAnswer:
        'C5.0 builds trees and rulesets that classify; Cubist builds rule-based models with linear equations at the leaves to predict numbers. LoRA fine-tunes an LLM by training small low-rank adapter matrices while the base model is frozen; QLoRA does this on a 4-bit quantised base model to save memory.',
      provenance:
        'ml_reading_guide.md and ml_quiz.html from your Notion page. The 20 questions are yours, with the correct option order shuffled for practice; the guide itself was compiled from web sources.',
      caution:
        "This is reading-guide material from your Notion export, not lecture content. The lectures say the exam covers Roland's lectures and Marius' Canvas presentations.",
    },
    guideReading,
    guideQs,
  ),
]

export const mlExamNotice =
  'Exam (from the last lecture): on paper, 3 hours, no aids. Expect to draw neural networks, set up entropy calculations and decision trees, determine neural network weights, and explain structures. Not expected: working out logarithms or finishing calculations. Previous exams will be shared by Marius.'
