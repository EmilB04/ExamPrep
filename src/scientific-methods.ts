import type { Lesson, Question } from './content'

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

const samplingReading = `## Descriptive statistics

Descriptive statistics organise, summarise, and present data so the main patterns are easier to see. They describe the **observed sample**. By themselves they do not establish cause and effect, and they do not automatically generalise to a whole population.

## Population and sample

- A **population** is the full group a study is interested in, such as all university students in Norway or all users of a web application.
- A **sample** is the smaller group from which data are actually collected. It should represent the population as well as possible.
- A **population parameter** is a numerical property of the whole population, such as the true average task-completion time.
- A **sample statistic** is the same kind of property calculated from the sample, such as its mean completion time.

Researchers use sample statistics to describe the collected data and, when sampling and design allow it, to estimate population parameters.

## Sampling methods

The sampling method decides whether a sample is representative and whether findings can be generalised. **Sampling bias** occurs when some parts of the population are systematically more or less likely to be included.

**Probability sampling** (everyone has a known chance of selection):

| Method | Description | Strengths and limitations |
| --- | --- | --- |
| Simple random | Every member has an equal chance of selection | Strong basis for generalisation, but needs a complete sampling frame |
| Systematic | Select every k-th member after a random start | Practical, but biased if the list has a repeating pattern |
| Stratified | Divide the population into relevant groups, then sample from each | Ensures important subgroups are represented |
| Cluster | Randomly select naturally occurring groups (sections, areas), then sample within them | Efficient for dispersed populations, but clusters may differ |

**Non-probability sampling**:

| Method | Description | Strengths and limitations |
| --- | --- | --- |
| Convenience | Recruit whoever is readily available | Fast and cheap, but high risk of unrepresentative results. Not recommended, though it can be useful for a pilot test |
| Judgemental | Researcher picks participants they consider suitable | Relies on the researcher's judgement, so it can be biased |
| Quota | Fill fixed quotas for categories | Looks representative, but selection within each quota is not random |
| Snowball | Participants recruit further participants | Reaches hidden groups, but the sample depends on social networks |
| Volunteer / self-selection | People choose to take part after an invitation | Useful for recruitment, but volunteers may differ systematically from non-volunteers |

Slide notes on the non-probability methods:

- **Judgemental** (authoritative) sampling: the researcher picks units based on their own knowledge or professional judgement.
- **Snowball** sampling: the sample grows like a rolling snowball as participants recruit others. People with many friends are more likely to be recruited. With online networks it is called virtual snowball sampling.
- **Quota** sampling: a tailored sample in proportion to some characteristic of the population. It rests on the researcher's judgement.
- **Cluster** sampling (slides): randomly select a few sections, then choose **all** members in them.
- **Systematic** sampling: select every k-th element.
- **Stratified** sampling: subdivide the population and draw a sample from each stratum.

**Practical example.** A study of a student web portal's accessibility that recruits only computer-science students through a developer Discord channel uses convenience sampling. Results may not represent users with different technical experience, disabilities, study programmes, or devices.

## Levels of measurement

The measurement level decides which descriptive statistics are meaningful and which analyses are appropriate. A method that does not fit the data type can give misleading conclusions. From weakest to strongest:

| Level | Description | Examples | Appropriate summaries |
| --- | --- | --- | --- |
| Nominal | Categories with no inherent order | Operating system, browser, study programme | Frequencies, percentages, mode |
| Ordinal | Ordered categories; gaps may not be equal | Satisfaction rating, Likert agreement, rankings | Frequencies, median, mode |
| Interval | Equal intervals, no true zero | Temperature in Celsius | Mean, median, standard deviation |
| Ratio | Equal intervals and a meaningful zero | Time, age, weight, number of errors | Mean, median, standard deviation, ratios |

- **Nominal:** labels only. "Chrome" differs from "Firefox", but neither is greater.
- **Ordinal:** order matters, distance does not. The gap from "agree" to "strongly agree" cannot be assumed equal to the gap from "neutral" to "agree".
- **Interval and ratio:** support arithmetic such as means and standard deviations. Only ratio data allow statements such as "twice as long".

Statistics each level allows (lecture slides; each level also allows everything below it):

| Level | Statistical possibilities |
| --- | --- |
| Nominal | Mode, percentages, chi-square |
| Ordinal | Adds median, percentile rank, rank correlation |
| Interval | Adds mean, standard deviation, t-test, F-test, product-moment (Pearson) correlation |
| Ratio | Adds percentage variation and all other statistical determinations |

Slide examples:

- Gender (male 1, female 2): **nominal**. The codes are labels only.
- "Better than most / about the same / not as good as most", a ranking of five leaders, and highest education achieved (High School 1 ... Doctorate 4): **ordinal**.
- Willingness to pay in price bands (the slide asks "interval or ratio?"): the answer depends on whether the bands have equal widths and a true zero; it is not obviously one or the other.
- Weight in pounds: **ratio**.
- Further examples on the slides: SSN, temperature, points on a driving test, grades, money in yen, zip codes, car size (compact, mid-size, full size), birth years, yes/no/undecided answers, and the amount of fat in a cookie. Classify each by asking: only names? ordered? equal intervals? true zero? (Identifier codes such as SSN and zip codes are numbers used as labels, so treat them as nominal.)

## Remember

- Start by identifying the population, the sampling approach, and the measurement level.
- Describe the sample before making comparisons or testing hypotheses.
- A large biased sample is not better than a smaller, representative one.
`

const centralReading = `## Central tendency

Measures of central tendency describe the typical or central value in a dataset. The right measure depends on the level of measurement, the shape of the distribution, and extreme values.

## Mean

The **mean** is the arithmetic average:

x̄ = (Σ xᵢ) / n

Use it mainly for interval or ratio data that are roughly symmetric and not dominated by outliers. It uses every value, but is sensitive to unusually high or low observations.

## Median

The **median** is the middle observation after sorting. With an even number of observations it is the average of the two middle values. It suits ordinal data and skewed numeric data such as task times or income, because extreme values affect it less than the mean.

## Mode

The **mode** is the value or category that occurs most often. It is the only measure that is always meaningful for nominal data. A dataset can have one mode, several modes, or none when every value occurs once.

## Choosing a measure

- **Mode** for nominal categories.
- **Median** for ordinal variables or skewed numeric data.
- **Mean** for reasonably symmetric interval or ratio data without influential outliers.
- Report **spread** too: pair the mean with the standard deviation, or the median with the interquartile range.

## Range and standard deviation

- **Range** is the distance between the extreme values. Company A with values between 30 and 50 has a range of 20; Company B between 10 and 70 has a range of 60, so B is more dispersed.
- **Standard deviation** measures spread from the mean. It is the square root of the variance, so it is in the same units as the original data.
- A **histogram** shows the shape of the distribution (the slides compare check-in times at Norwegian, with multiple lines, against SAS, with one single line).

Slide rules for a normal distribution: most observations fall within three standard deviations of the mean, and more than half fall within one. (The slide also says more than 90 percent are within two; the usual figure is about 95 percent. Treat the exact numbers as approximate and check the book.)

## Worked examples from the slides

- Mean of 3, 5, 8, 10, 2 is 28/5 = 5.6.
- Median of 3, 5, 8, 10, 2: sorted 2, 3, 5, 8, 10, so the median is 5.
- Median of 3, 5, 8, 6, 4, 2, 4, 4: sorted 2, 3, 4, 4, 4, 5, 6, 8, so the median is (4 + 4)/2 = 4.
- Mode of 3, 5, 8, 10, 2, 8 is 8. For 3, 5, 8, 5, 4, 2, 4, 4, 5 the modes are 4 and 5. For 1, 2, 3, 4, 5 there is no mode.
- Why median vs mean: the median is not sensitive to outliers (housing prices, athletes' salaries). The mean is the most common measure, usually applied after outliers are identified or discounted.

## Case study 1: reading SPSS output

Fifteen participants: gender (m/f coded 1/2), ranking, weight, and fitness score.

| | Gender | Ranking | Score | Weight |
| --- | --- | --- | --- | --- |
| N | 15 | 15 | 15 | 15 |
| Mean | 1.40 | 8.00 | 73.13 | 144.73 |
| Std. error | .13 | 1.15 | 4.19 | 12.02 |
| Median | 1.00 | 8.00 | 75.00 | 130.00 |
| Mode | 1 | 1 (multiple) | 55 | 108 |
| Std. deviation | .51 | 4.47 | 16.24 | 46.56 |
| Variance | .26 | 20.00 | 263.70 | 2168.07 |
| Skewness | .455 | .000 | -.065 | .625 |
| Kurtosis | -2.094 | -1.200 | -1.753 | -1.037 |
| Range | 1 | 14 | 45 | 135 |
| Min / Max | 1 / 2 | 1 / 15 | 50 / 95 | 90 / 225 |

How to read it:

- **Gender** is nominal. The mean 1.40 only says that 40% of cases are coded 2 (females), not an "average gender". Use the **mode**: 1 (male).
- **Ranking** is ordinal. The median (8) is the appropriate centre. An average rank is not meaningful because the gaps between ranks are not guaranteed equal, and for a full ranking 1..15 it is determined by n anyway.
- **Score** is interval/ratio. Mean 73.13, median 75, mode 55. Skewness is near zero (-.065), so it is roughly symmetric. Range = max − min = 95 − 50 = 45.
- **Weight**: mean 144.73 > median 130 > mode 108, and skewness .625 is positive, so it is **right-skewed**, pulled up by the 225 values. Range = 225 − 90 = 135.
- **Kurtosis** below zero (all four variables) means a flatter distribution than the normal curve. With only 15 cases, judge normality from skewness, kurtosis, and a histogram together.
- **Standard error** (of the mean) = SD / √n. Check: 16.24 / √15 ≈ 4.19. It says how precisely the sample mean estimates the population mean.
- **Variance** = SD². The SD is in the original units, so it is easier to interpret.

## Sample size

**Sample size**, written n, is the number of observations or participants in an analysis. In paired or repeated-measures data, n is the number of complete matched pairs, not the number of individual scores.

A larger sample generally gives more precise estimates because random variation matters less. But a large biased convenience sample is not automatically better than a smaller, well-designed, representative one.

Choose sample size based on:

- the research question and intended analysis,
- the expected size of an effect or difference,
- the desired statistical power,
- the acceptable uncertainty or margin of error,
- population variability,
- practical limits: recruitment access, time, cost, and ethics.

## Remember

- Match the statistic to the data: mode for nominal, median for ordinal or skewed data, mean for suitable numeric data.
- Treat sample size as a quality consideration, and assess representativeness and bias alongside it.
`

const tTestReading = `## Research fundamentals

Research is a systematic, structured investigation that aims to answer clearly defined questions and expand knowledge.

- **Variables** are the things you measure or manipulate.
- The **independent variable** is the cause or condition (for example weekly report cards).
- The **dependent variable** is the outcome (for example motivation scores).
- A **hypothesis** is a specific, testable prediction about these variables.
- **Sampling** selects a subset of the population so findings can be generalised beyond the individuals measured.

## Test statistics

A **test statistic** is used to test a finding for statistical significance. It does not describe a sample or estimate a population parameter. The t-test, chi-square statistic, and F ratio are examples. They test hypotheses about sample statistics but give no information about the sample itself.

## T-test: the basic idea

A t-test decides whether the difference between two means is likely real in the population or just random sampling variation. It computes a **t-value** and a **p-value**. If the p-value is small (commonly ≤ 0.05), the difference is called **statistically significant**.

## Types of t-test

| Type | Compares | Example |
| --- | --- | --- |
| One-sample | One sample mean to a known or hypothesised value | Mean exam score vs the pass mark |
| Independent two-sample | Means of two separate groups; each person is in one group only | Treatment vs control |
| Paired (dependent-samples) | Two measurements from the same individuals or matched pairs | Before and after scores for the same students |

**Paired t-test in one sentence:** it checks whether the average of the differences between paired measurements (for example motivation after minus before, for each student) is significantly different from zero.

## Core assumptions

- The dependent variable is numeric, on an interval or ratio scale.
- The data (or the differences, for a paired test) are approximately normally distributed.
- Observations are independent.
- For independent t-tests, the two groups have similar variances.

## Hypothesis testing steps

1. State the **null hypothesis H0** (usually "no difference in means") and the **alternative hypothesis H1** ("means differ", or "mean is higher/lower").
2. Choose a **significance level** (often 0.05).
3. Compute the **t-statistic** from the data.
4. Obtain the **p-value** from the t-distribution.
5. **Reject** or **fail to reject** H0 based on the p-value.

Note the wording: you fail to reject H0; you never "prove" it.

## What makes p small

The null hypothesis says there is no true difference between the means: the observed difference was created merely by random sampling error. Three interrelated factors lower p (textbook exercise, Topic 54):

1. **Sample size.** Larger samples are less likely to produce a difference through sampling error. This is the factor a researcher controls most easily.
2. **Size of the difference between the means.** A larger difference is less likely to be due to sampling error.
3. **Variation in the population.** Smaller standard deviations mean less potential for sampling error.

Reporting: "The difference between the means is statistically significant (t = 5.38, df = 179, p < .05)." Values of t and df mean little to typical consumers of research; the key part is p. The same logic applies to a correlation: with n = 50, r = 0.19 is not significantly different from 0, while r = .41 with n = 92 and p < .001 is.

## Directional and non-directional hypotheses

- **Directional** hypothesis: one group will score higher (or lower). Use the **one-tailed** p-value.
- **Non-directional** hypothesis: the groups will simply differ. Use the **two-tailed** p-value.
- Always check that the means point the way you hypothesised before deciding.

Decision rule: p < alpha means reject H0; p ≥ alpha means fail to reject H0.

## Levene's test (independent samples, SPSS)

Levene's test checks whether the two group variances differ. If its p < .05, use the "equal variances not assumed" row; if p ≥ .05, use "equal variances assumed".

## Worked example: new lab vs old lab

Hypothesis: students using the new lab score significantly higher. Independent variable: lab location (two levels). Dependent variable: test score (continuous, 0–100). Each group has 25 students; means 82.00 vs 78.00; SD 6.1237 each.

- Levene p = 1.00 ≥ .05, so use the equal-variances row.
- t = 2.309, df = 48, one-tailed p = .0125 (two-tailed .025).
- The hypothesis was directional, so use .0125 < .05: reject H0. The difference is unlikely to be chance.

## Worked example: NYSE vs NASDAQ dividend yields (Excel)

H0: mean(NYSE) = mean(NASDAQ). Two-sample t-test assuming equal variances at the .05 level.

- NYSE: n = 21, mean 3.271, variance 1.697. NASDAQ: n = 25, mean 2.532, variance 1.352.
- df = 21 + 25 − 2 = 44. t Stat = 2.0335, t Critical two-tail = 2.0154, two-tail p = .048.
- t Stat > t Critical, so reject H0. NYSE yields are significantly higher, though NYSE also shows more variance (more risk).

## Worked examples: dependent-sample cases

- **Report cards and motivation.** Same students measured before and after nine weeks of weekly report cards. Directional alternative: motivation is significantly higher afterwards. Independent variable: before vs after. Dependent variable: motivation score. Test: paired t-test.
- **Unexcused absences and a party reward.** Absences per student before vs after the plan. Directional alternative: significantly fewer absences afterwards.
- **Starting school at noon.** The same student body under the old and new schedule. The alternative is non-directional (a *different* number of absences), so use the two-tailed p.

## Remember

- Name the independent variable, the dependent variable, H0, H1, and the test before you analyse anything.
- In a paired design, n is the number of pairs.
`

const sampling = build('sm-sampling', [
  [
    'A researcher wants every member of the population to have an equal chance of selection. Which sampling method does this describe?',
    ['Convenience', 'Simple random', 'Snowball', 'Quota'],
    1,
    'Simple random sampling gives every member an equal chance. It needs a complete sampling frame.',
    'Think: completely random.',
  ],
  [
    'A study of a student portal recruits only people from a developer Discord channel. Which method is this, and what is the main risk?',
    [
      'Stratified sampling; too many subgroups',
      'Cluster sampling; clusters may differ',
      'Convenience sampling; the sample may not represent the population',
      'Systematic sampling; a repeating list pattern',
    ],
    2,
    'Recruiting whoever is readily available is convenience sampling. Results may not represent users with other backgrounds, abilities, or devices.',
    'Who was easy to reach?',
  ],
  [
    'The population is divided into areas, a few areas are randomly selected, and people inside them are sampled. Which method is this?',
    ['Cluster', 'Stratified', 'Systematic', 'Judgemental'],
    0,
    'Cluster sampling randomly selects naturally occurring groups first. Stratified sampling instead samples from every group.',
    'Randomly selecting sections is the clue.',
  ],
  [
    'Which of these is a probability sampling method?',
    ['Convenience', 'Judgemental', 'Quota', 'Stratified'],
    3,
    'Probability sampling: simple random, systematic, stratified, cluster. Convenience, judgemental, quota, and snowball are non-probability methods.',
    'Four probability methods; only one is listed.',
  ],
  [
    'Which level of measurement is the weakest?',
    ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    0,
    'Nominal data are only named categories with no order. Ordinal adds order, interval adds equal distances, ratio adds a true zero.',
    'Names, labels, or categories only.',
  ],
  [
    'Responses on a five-point Likert agreement scale are best classified as which level?',
    ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    1,
    'Likert categories are ordered, but the gap from "agree" to "strongly agree" is not necessarily equal to the gap from "neutral" to "agree".',
    'Is the distance between categories known to be equal?',
  ],
  [
    'Which variable is measured at the ratio level?',
    [
      'Browser used',
      'Temperature in Celsius',
      'Number of errors in a task',
      'Satisfaction ranking',
    ],
    2,
    'Number of errors has a meaningful zero and equal intervals, so "twice as many" makes sense. Celsius has no true zero, so it is interval.',
    'Look for an absolute zero.',
  ],
  [
    'Which statement about sample size is correct?',
    [
      'A large convenience sample is always better than a small random one',
      'A larger sample generally gives more precise estimates, but does not fix sampling bias',
      'Sample size is irrelevant if the mean is reported',
      'Sample size only matters for nominal data',
    ],
    1,
    'More data reduce random variation, but a biased sample stays biased however large it is.',
    'Precision and representativeness are different things.',
  ],
  [
    'A researcher selects units to sample based on their own professional knowledge. Which method is this?',
    ['Judgemental', 'Stratified', 'Simple random', 'Cluster'],
    0,
    'Judgemental (authoritative) sampling is a non-probability technique where the researcher chooses units using their own judgement.',
    'The researcher decides who is suitable.',
  ],
  [
    'People with many friends are more likely to enter the sample because participants recruit others. Which method is this?',
    [
      'Quota sampling',
      'Snowball sampling',
      'Systematic sampling',
      'Stratified sampling',
    ],
    1,
    'In snowball sampling the sample grows like a rolling snowball through participants recruiting others.',
    'Think of something growing as it rolls.',
  ],
  [
    'Education level coded High School 1, Bachelor 2, Master 3, Doctorate 4 is which level of measurement?',
    ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    1,
    'The categories have a natural order, but the codes do not guarantee equal distances between levels.',
    'Ordered, but are the gaps equal?',
  ],
  [
    'Which statistic is allowed for interval data but not for ordinal data?',
    ['Mode', 'Median', 'Mean', 'Percentages'],
    2,
    'Interval data support the mean, standard deviation, t-test, F-test, and Pearson correlation. Mode and median already work for ordinal data.',
    'It needs equal intervals.',
  ],
])

const central = build('sm-central', [
  [
    'Which measure of central tendency is always meaningful for nominal data?',
    ['Mean', 'Median', 'Mode', 'Standard deviation'],
    2,
    'The mode is the most frequent category, and needs no order or numeric distance.',
    'Most frequent category.',
  ],
  [
    'Task completion times are strongly right-skewed with a few very long times. Which summary is most appropriate?',
    ['Mean alone', 'Median', 'Mode of the categories', 'Sample size'],
    1,
    'The median is less affected by extreme values than the mean, so it better describes skewed numeric data.',
    'Which measure resists outliers?',
  ],
  [
    'The values 2, 4, 4, 6, 9 are observed. What are the mean, median, and mode?',
    [
      'Mean 5, median 4, mode 4',
      'Mean 4, median 4, mode 5',
      'Mean 5, median 6, mode 4',
      'Mean 4.5, median 4, mode 6',
    ],
    0,
    'Mean = 25/5 = 5. Sorted middle value = 4. The value 4 occurs most often.',
    'Sum is 25.',
  ],
  [
    'A dataset has the values 3, 7, 7, 9, 9. How many modes does it have?',
    ['None', 'One', 'Two', 'Five'],
    2,
    'Both 7 and 9 occur twice, so the data are bimodal.',
    'Count how often each value occurs.',
  ],
  [
    'Which pairing of central tendency and spread measure is appropriate?',
    [
      'Mean with standard deviation',
      'Median with standard deviation only for nominal data',
      'Mode with the mean',
      'Mean with the mode',
    ],
    0,
    'The mean is paired with the standard deviation; the median is paired with the interquartile range.',
    'Report spread alongside the centre.',
  ],
  [
    'A paired design has 30 students, each measured before and after an intervention (60 scores). What is n?',
    ['60', '30', '2', '15'],
    1,
    'In paired data, n is the number of complete matched pairs, not the number of individual scores.',
    'Count pairs, not scores.',
  ],
  [
    'Which factor should NOT be a main basis for choosing sample size?',
    [
      'Expected effect size',
      'Desired statistical power',
      'Population variability',
      'The colour of the survey form',
    ],
    3,
    'Sample size depends on the question, expected effect, power, acceptable uncertainty, variability, and practical constraints, not cosmetic choices.',
    'Which option is unrelated to the statistics?',
  ],
  [
    'Why must a mean be interpreted carefully for ordinal data?',
    [
      'Ordinal data cannot be ordered',
      'The mean needs equal distances between values, which ordinal scales do not guarantee',
      'Ordinal data have no mode',
      'Ordinal data always contain outliers',
    ],
    1,
    'The mean uses arithmetic on values, so it assumes equal intervals. For ordinal data the median or mode is the safer summary.',
    'What does arithmetic assume about the gaps?',
  ],
  [
    'Find the median of 3, 5, 8, 6, 4, 2, 4, 4.',
    ['4', '4.5', '5', '8'],
    0,
    'Sorted: 2, 3, 4, 4, 4, 5, 6, 8. With an even count, average the two middle values: (4 + 4)/2 = 4.',
    'Sort first, then average the middle pair.',
  ],
  [
    'Find the mode(s) of 3, 5, 8, 5, 4, 2, 4, 4, 5.',
    ['5 only', '4 only', '4 and 5', 'No mode'],
    2,
    'Both 4 and 5 occur three times, so each is a mode.',
    'Count each value.',
  ],
  [
    'In the weight variable of Case study 1 the mean is 144.7, the median 130, the mode 108, and skewness is +.625. What does this indicate?',
    [
      'Left-skewed distribution',
      'Roughly symmetric distribution',
      'Right-skewed distribution pulled up by large values',
      'Nominal data',
    ],
    2,
    'Mean > median > mode and positive skewness mean a long right tail, here created by values such as 225.',
    'The mean is dragged towards the long tail.',
  ],
  [
    'In Case study 1 the score variable runs from 50 to 95. What is its range?',
    ['95', '50', '45', '73.13'],
    2,
    'Range = maximum − minimum = 95 − 50 = 45.',
    'Subtract the extremes.',
  ],
  [
    'What is the relationship between variance and standard deviation?',
    [
      'Variance is the square root of the standard deviation',
      'Standard deviation is the square root of the variance',
      'They are unrelated',
      'Standard deviation equals the range',
    ],
    1,
    'SD = √variance, which returns the spread to the original units of the data.',
    'Which one is in the original units?',
  ],
  [
    'The score variable has SD = 16.24 and n = 15. What is its standard error of the mean, approximately?',
    ['16.24', '4.19', '1.08', '243.6'],
    1,
    'SE = SD / √n = 16.24 / √15 ≈ 4.19.',
    'Divide by the square root of n.',
  ],
  [
    'Why is it not meaningful to describe an "average ranking" in a 1–15 ranking variable?',
    [
      'Rankings are ordinal, so the gaps between ranks need not be equal',
      'Rankings are nominal',
      'Rankings have no order',
      'The mean is always the same as the mode',
    ],
    0,
    'Ranking is ordinal. The median is the appropriate centre, and arithmetic on ranks assumes equal gaps.',
    'What does the mean assume about the gaps?',
  ],
])

const tTest = build('sm-ttest', [
  [
    'What does a t-test decide?',
    [
      'Whether a sample was randomly selected',
      'Whether a difference between two means is likely real or just random sampling variation',
      'Which variable is independent',
      'The level of measurement of the data',
    ],
    1,
    'A t-test compares means and uses a t-value and p-value to judge whether the difference is likely real in the population.',
    'Two means, real or chance?',
  ],
  [
    'The same 40 students take a motivation test before and after an intervention. Which test fits?',
    [
      'One-sample t-test',
      'Independent two-sample t-test',
      'Paired t-test',
      'Chi-square test',
    ],
    2,
    'Two measurements from the same individuals call for a paired (dependent-samples) t-test.',
    'Same people measured twice.',
  ],
  [
    'Treatment and control groups contain different people. Which test compares their means?',
    [
      'Paired t-test',
      'Independent two-sample t-test',
      'One-sample t-test',
      'None; use the mode',
    ],
    1,
    'Each person is in only one group, so the groups are independent.',
    'Each person appears in one group only.',
  ],
  [
    'A paired t-test checks whether what is significantly different from zero?',
    [
      'The average of the differences between paired measurements',
      'The sum of all scores',
      'The sample size',
      'The variance of one group',
    ],
    0,
    'The paired t-test works on the per-pair differences, for example after minus before.',
    'Subtract within each pair.',
  ],
  [
    'In the study "weekly report cards affect motivation scores", which is the dependent variable?',
    [
      'Weekly report cards',
      'Motivation scores',
      'The population',
      'The p-value',
    ],
    1,
    'The dependent variable is the outcome that is measured. Report cards are the independent variable (the condition).',
    'Which one is the outcome?',
  ],
  [
    'Which is NOT a core assumption of a standard t-test?',
    [
      'Interval or ratio dependent variable',
      'Approximately normal data (or differences)',
      'Independent observations',
      'The sample is nominal data',
    ],
    3,
    'T-tests need a numeric interval/ratio dependent variable. Nominal data call for other tests.',
    'Which option contradicts the numeric requirement?',
  ],
  [
    'With a significance level of 0.05, a test gives p = 0.03. What is the correct conclusion?',
    [
      'Fail to reject H0',
      'Reject H0; the difference is statistically significant',
      'Prove H1 beyond doubt',
      'The sample is too small',
    ],
    1,
    'p ≤ 0.05 means the result is statistically significant, so you reject H0. This is not proof of H1.',
    'Compare p with the chosen level.',
  ],
  [
    'With p = 0.40 at the 0.05 level, how should you word the conclusion?',
    [
      'H0 is proven true',
      'Reject H0',
      'Fail to reject H0',
      'H1 is proven true',
    ],
    2,
    'A large p-value means insufficient evidence against H0. You fail to reject it; you do not prove it.',
    'Absence of evidence is not proof.',
  ],
  [
    'Which pair is correctly a test statistic, not a descriptive statistic?',
    [
      'Mean and median',
      'Mode and range',
      'Chi-square and F ratio',
      'n and the sample mean',
    ],
    2,
    'Test statistics such as the t-test, chi-square, and F ratio test hypotheses; they do not describe the sample.',
    'Which ones test findings for significance?',
  ],
  [
    'A t-test with t = 2.000, df = 20, p > .05. Using conventional standards, what do you conclude?',
    [
      'Reject H0',
      'Do not reject H0',
      'Accept H1 as proven',
      'The sample is biased',
    ],
    1,
    'p is above .05, so the result is not statistically significant and H0 is not rejected.',
    'Compare p with .05.',
  ],
  [
    'A t-test with t = 2.859, df = 40, p < .01. What do you conclude?',
    [
      'Do not reject H0',
      'Reject H0; the difference between the means is statistically significant',
      'The correlation is zero',
      'The two groups must have equal variances',
    ],
    1,
    'p < .01 is below .05, so reject H0 and call the difference significant.',
    'p is smaller than alpha.',
  ],
  [
    'Other things equal, a researcher with a larger sample is ___ likely to reject the null hypothesis.',
    ['less', 'more', 'equally', 'never'],
    1,
    'Larger samples reduce sampling error, so the same difference gives a lower p.',
    'More data, smaller p.',
  ],
  [
    'Of sample size, size of the difference, and population variability, which can a researcher most directly control?',
    [
      'Sample size',
      'Size of the true difference',
      'Population variability',
      'None of them',
    ],
    0,
    'The researcher usually cannot change the true difference or population variation, but can choose how many participants to include.',
    'Which one is a design decision?',
  ],
  [
    'In the SPSS lab example Levene p = 1.00. Which row of the output do you read?',
    [
      'Equal variances not assumed',
      'Equal variances assumed',
      "Neither; Levene's test is invalid",
      'The paired-samples row',
    ],
    1,
    'Levene p ≥ .05 means no significant difference in variances, so use the equal-variances-assumed row.',
    'Rule: p < .05 means not assumed.',
  ],
  [
    'The new-lab hypothesis says new-lab students score HIGHER. Which p-value do you use?',
    [
      'Two-tailed p',
      'One-tailed p',
      'Levene p',
      'Either, it makes no difference',
    ],
    1,
    'A directional hypothesis uses the one-tailed p (.0125 here). A non-directional hypothesis uses the two-tailed p.',
    'Is a direction stated?',
  ],
  [
    'In the NYSE vs NASDAQ example (n = 21 and 25, equal variances), what is df?',
    ['46', '45', '44', '20'],
    2,
    'For an independent-samples t-test with pooled variance, df = n1 + n2 − 2 = 21 + 25 − 2 = 44.',
    'Subtract 2 from the total.',
  ],
  [
    'In the NYSE vs NASDAQ example t Stat = 2.0335 and t Critical (two-tail) = 2.0154. What is the decision?',
    [
      'Fail to reject H0',
      'Reject H0',
      'Increase the sample',
      'Use a paired test',
    ],
    1,
    't Stat exceeds t Critical, so reject H0: there is evidence of a difference in mean dividend yields.',
    'Compare t Stat with t Critical.',
  ],
  [
    'The principal starts school at noon and hypothesises a different number of absences than under the old schedule. Which p-value fits?',
    ['One-tailed', 'Two-tailed', 'Levene', 'None'],
    1,
    '"Different" is non-directional, so use the two-tailed p. The design is paired because the same students are compared.',
    'Higher or lower, or just different?',
  ],
  [
    'A study with n = 92 reports r = .41, p < .001. Is r statistically significant?',
    ['Yes', 'No', 'Only if n = 50', 'Cannot be determined'],
    0,
    'p < .001 is below .05, so the correlation is significantly different from zero.',
    'Compare p with .05.',
  ],
])

const minutes = (reading: string, qs: Question[]) =>
  Math.ceil(reading.split(/\s+/).length / 180) + qs.length + 3

const common = (q: Question) => ({
  question: q.question,
  options: q.options,
  answer: q.answer,
  explanation: q.explanation,
})

export const scientificLessons: Lesson[] = [
  {
    ...common(sampling[0]),
    id: 'sm-sampling-measurement',
    title: 'Sampling and levels of measurement',
    eyebrow: 'Lecture 1 · 20.08',
    minutes: minutes(samplingReading, sampling),
    intro:
      'Know who your data come from and what kind of data they are before choosing any statistic.',
    paragraphs: [],
    takeaway:
      'Sampling decides whether you can generalise; the measurement level decides which statistics are meaningful.',
    recall:
      'Explain the difference between probability and non-probability sampling, and why measurement level matters.',
    recallAnswer:
      'Probability sampling (simple random, systematic, stratified, cluster) gives each member a known chance of selection and supports generalisation. Non-probability sampling (convenience, judgemental, quota, snowball, volunteer) risks sampling bias. The level of measurement (nominal, ordinal, interval, ratio) decides which summaries and analyses fit the data.',
    reading: samplingReading,
    questions: sampling,
    provenance:
      'Lecture 20.08.26 · Notion notes and DescriptiveStatistics-1.pptx (Salkind ch. 2, 4, 5, 7). Study notes written by Claude from these sources.',
  },
  {
    ...common(central[0]),
    id: 'sm-central-tendency',
    title: 'Central tendency and sample size',
    eyebrow: 'Lecture 1 · 20.08',
    minutes: minutes(centralReading, central),
    intro: 'Summarise a dataset with the measure that fits its type and shape.',
    paragraphs: [],
    takeaway:
      'Mode for nominal, median for ordinal or skewed data, mean for symmetric numeric data. Always report spread, and remember that n counts pairs in paired data.',
    recall:
      'How do you choose between mean, median, and mode, and what should you report alongside them?',
    recallAnswer:
      'Use the mode for nominal categories, the median for ordinal or skewed numeric data, and the mean for roughly symmetric interval or ratio data without outliers. Report spread too: standard deviation with the mean, interquartile range with the median. Sample size n is the number of observations, or matched pairs in paired data.',
    reading: centralReading,
    questions: central,
    provenance:
      'Lecture 20.08.26 · Notion notes, DescriptiveStatistics-1.pptx and Case_Study_1-1.pdf (Salkind ch. 2, 4, 5, 7). Study notes written by Claude from these sources.',
  },
  {
    ...common(tTest[0]),
    id: 'sm-t-test',
    title: 'Hypotheses and the t-test',
    eyebrow: 'Lecture 2 · 27.08',
    minutes: minutes(tTestReading, tTest),
    intro:
      'Decide whether an observed difference between means is real or just chance.',
    paragraphs: [],
    takeaway:
      'State H0 and H1 first, check the assumptions, then use the p-value to reject or fail to reject H0.',
    recall:
      'Describe the three types of t-test and the steps of hypothesis testing.',
    recallAnswer:
      'A one-sample t-test compares one mean to a known value, an independent two-sample t-test compares two separate groups, and a paired t-test compares two measurements from the same individuals. Steps: state H0 and H1, choose a significance level (often 0.05), compute the t-statistic, obtain the p-value, then reject or fail to reject H0.',
    reading: tTestReading,
    questions: tTest,
    provenance:
      'Lecture 27.08.26 · Notion notes, DependentSamplet-test-1/2.ppt, Example t-test PDFs (SPSS, Excel) and the Topic 54 exercise (Salkind ch. 2, 7, 8; Leedy ch. 2). Study notes written by Claude from these sources. Some numeric tables inside the .ppt slides could not be extracted and are omitted.',
  },
]
