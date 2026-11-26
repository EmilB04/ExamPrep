/** Hover definitions for bold terms in the Scientific Methods lessons. Keys are lower case. */
export const scientificMethodsGlossary: Record<string, string> = {
  variables: 'The things you measure or manipulate in a study.',
  'independent variable':
    'The cause or condition that is manipulated or compared, for example weekly report cards.',
  'dependent variable':
    'The outcome that is measured, for example motivation scores.',
  hypothesis: 'A specific, testable prediction about the variables in a study.',
  sampling:
    'Selecting a subset of the population so that findings can be generalised beyond the individuals measured.',
  population:
    'The full group a study is interested in, such as all university students in Norway.',
  sample:
    'The smaller group from which data are actually collected. It should represent the population.',
  'observed sample':
    'The data actually collected, which descriptive statistics describe.',
  'population parameter':
    'A numerical property of the whole population, such as its true mean.',
  'sample statistic':
    'The same kind of number calculated from the sample, such as the sample mean.',
  'sampling bias':
    'Some parts of the population are systematically more or less likely to be sampled, so the sample is not representative.',
  'probability sampling':
    'Everyone has a known chance of being selected. Examples: simple random, systematic, stratified and cluster sampling.',
  'non-probability sampling':
    'Selection does not give everyone a known chance. Examples: convenience, judgemental, quota, snowball and volunteer sampling.',
  stratified:
    'Dividing the population into relevant groups (strata) and sampling from each, so important subgroups are represented.',
  systematic: 'Selecting every k-th member after a random start.',
  cluster:
    'Randomly selecting naturally occurring groups, such as classes or areas, and then sampling within them (or including all of their members).',
  quota:
    'Filling fixed quotas for categories in proportion to the population. It looks representative, but selection within each quota is not random.',
  judgemental:
    'The researcher picks participants they consider suitable, so the sample rests on their judgement.',
  snowball:
    'Participants recruit further participants, so the sample grows like a rolling snowball.',
  nominal:
    'Categories with no inherent order, such as operating system. Summarise with frequencies and the mode.',
  ordinal:
    'Ordered categories where the gaps need not be equal, such as a satisfaction rating. The median is appropriate.',
  ratio:
    'Equal intervals and a meaningful zero, such as time or weight. Only ratio data allow statements such as "twice as long".',
  'interval and ratio':
    'Interval data have equal intervals but no true zero; ratio data also have a true zero. Both support means and standard deviations.',
  mean: 'The sum of the values divided by their number.',
  median: 'The middle value when the data are ordered.',
  mode: 'The most frequent value.',
  range: 'The distance between the extreme values: maximum minus minimum.',
  spread:
    'How dispersed the values are, for example the range or standard deviation.',
  'standard deviation':
    'A measure of spread from the mean. It is the square root of the variance and is in the same units as the data.',
  variance: 'The standard deviation squared.',
  'standard error':
    'The standard error of the mean is SD / square root of n. It says how precisely the sample mean estimates the population mean.',
  kurtosis:
    'How peaked or flat a distribution is compared with the normal curve. Below zero means flatter.',
  'right-skewed':
    'A distribution with a long tail towards high values, which pulls the mean above the median.',
  histogram: 'A chart showing the shape of a distribution.',
  'sample size':
    'The number of observations or participants (n). In paired data it is the number of matched pairs.',
  'test statistic':
    'A number used to test a finding for statistical significance, such as the t-value, chi-square or F ratio. It does not describe the sample.',
  'null hypothesis h0':
    'The statement that there is no true difference between the means (the observed difference is due only to random sampling error).',
  'alternative hypothesis h1':
    'The statement that the means differ, or that one mean is higher or lower.',
  'significance level':
    'The threshold for the p-value, often 0.05, below which H0 is rejected.',
  'p-value':
    'The probability of getting a difference at least as large as the one observed if the null hypothesis were true.',
  't-value':
    'The test statistic of a t-test: how large the observed difference is relative to its random variation.',
  't-statistic':
    'The test statistic of a t-test: how large the observed difference is relative to its random variation.',
  'statistically significant':
    'The p-value is small (below the chosen significance level, commonly 0.05), so the difference is unlikely to be random sampling error alone.',
  reject:
    'Conclude that the data are inconsistent with H0, because the p-value is below the significance level.',
  'fail to reject':
    'The p-value is not small enough to reject H0. This does not prove H0.',
  directional:
    'A hypothesis that one group will score higher (or lower). Use the one-tailed p-value.',
  'non-directional':
    'A hypothesis that the groups will simply differ. Use the two-tailed p-value.',
  'one-tailed': 'A p-value for a difference in one specified direction.',
  'two-tailed': 'A p-value for a difference in either direction.',
}
