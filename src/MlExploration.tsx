import { ActionButton } from './ActionButton'
import { useState } from 'react'
import { RotateCcw, StepForward } from 'lucide-react'

/* ---------- pure helpers (tested in MlExploration.test.tsx) ---------- */

export const entropy = (...p: number[]) =>
  0 - p.reduce((sum, x) => (x > 0 ? sum + x * Math.log2(x) : sum), 0)

export const carTheft = [
  ['opel', 'yes', 'urban', 'street', 'high'],
  ['volvo', 'no', 'rural', 'garage', 'low'],
  ['opel', 'no', 'rural', 'street', 'high'],
  ['opel', 'yes', 'rural', 'street', 'low'],
  ['volvo', 'yes', 'urban', 'garage', 'low'],
  ['volvo', 'yes', 'urban', 'street', 'high'],
  ['opel', 'no', 'rural', 'garage', 'low'],
]
export const carAttributes = ['Model', 'Alarm', 'Area', 'Parking']

export function informationGain(attribute: number) {
  const total = carTheft.length
  const high = carTheft.filter((r) => r[4] === 'high').length
  const before = entropy(high / total, (total - high) / total)
  const values = [...new Set(carTheft.map((r) => r[attribute]))]
  const branches = values.map((value) => {
    const rows = carTheft.filter((r) => r[attribute] === value)
    const h = rows.filter((r) => r[4] === 'high').length
    return {
      value,
      high: h,
      low: rows.length - h,
      entropy: entropy(h / rows.length, (rows.length - h) / rows.length),
      weight: rows.length / total,
    }
  })
  const after = branches.reduce((sum, b) => sum + b.weight * b.entropy, 0)
  return { before, after, gain: before - after, branches }
}

export function metrics(tp: number, fn: number, fp: number, tn: number) {
  const total = tp + fn + fp + tn
  const div = (a: number, b: number) => (b > 0 ? a / b : null)
  const precision = div(tp, tp + fp)
  const recall = div(tp, tp + fn)
  return {
    accuracy: div(tp + tn, total),
    recall,
    specificity: div(tn, tn + fp),
    precision,
    f1:
      precision !== null && recall !== null && precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : null,
  }
}

export const treeOneScore = (young: boolean, male: boolean) =>
  young ? (male ? 2 : 0.1) : -1
export const treeTwoScore = (daily: boolean) => (daily ? 0.9 : -0.9)

export const sign = (z: number) => (z > 0 ? 1 : -1)
export const xorNet = (x1: number, x2: number) => {
  const h1 = sign(x1 - x2 - 1)
  const h2 = sign(x2 - x1 - 1)
  return { h1, h2, y: sign(h1 + h2 + 1) }
}

export const bowl = (x: number) => 4 * x * x - 4 * x + 3
export const descentStep = (x: number, eta: number) => x - eta * (8 * x - 4)

export const convOutputSize = (n: number, k: number, p: number, s: number) =>
  Math.floor((n + 2 * p - k) / s) + 1
export function convolve(
  input: number[][],
  filter: number[][],
  padding: number,
  stride: number,
) {
  const n = input.length
  const k = filter.length
  const size = n + 2 * padding
  const padded = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      const rr = r - padding
      const cc = c - padding
      return rr >= 0 && rr < n && cc >= 0 && cc < n ? input[rr][cc] : 0
    }),
  )
  const out = convOutputSize(n, k, padding, stride)
  return {
    padded,
    out,
    values: Array.from({ length: out }, (_, r) =>
      Array.from({ length: out }, (_, c) => {
        let sum = 0
        for (let i = 0; i < k; i++)
          for (let j = 0; j < k; j++)
            sum += padded[r * stride + i][c * stride + j] * filter[i][j]
        return sum
      }),
    ),
  }
}

export function softmax(scores: number[]) {
  const max = Math.max(...scores)
  const exps = scores.map((s) => Math.exp(s - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

function DivergeBar({ value, max = 3.5 }: { value: number; max?: number }) {
  const width = Math.min(Math.abs(value) / max, 1) * 50
  return (
    <span className="diverge" aria-hidden="true">
      <i
        style={{
          width: `${width}%`,
          left: value >= 0 ? '50%' : `${50 - width}%`,
          background: value >= 0 ? 'var(--green)' : 'var(--orange)',
        }}
      />
    </span>
  )
}

const fmt = (x: number | null, digits = 3) =>
  x === null ? '—' : x.toFixed(digits)

/* ---------- components ---------- */

function EntropyExplorer() {
  const [p, setP] = useState(0.5)
  const [attr, setAttr] = useState(3)
  const result = informationGain(attr)
  const gains = carAttributes.map((_, i) => informationGain(i).gain)
  const best = gains.indexOf(Math.max(...gains))
  const pts = Array.from({ length: 51 }, (_, i) => {
    const q = i / 50
    return `${45 + q * 320},${148 - entropy(q, 1 - q) * 128}`
  })
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>ENTROPY & INFORMATION GAIN</span>
        <span>Car theft risk, 7 cars</span>
      </div>
      <svg
        viewBox="0 0 400 180"
        role="img"
        aria-label={`Entropy of a two-class set when the share of positives is ${p.toFixed(2)}: ${entropy(p, 1 - p).toFixed(3)} bits`}
      >
        <path d="M38 18V148H375" className="axis" />
        <polyline points={pts.join(' ')} className="plot-line" />
        <line
          x1={45 + p * 320}
          x2={45 + p * 320}
          y1="18"
          y2="148"
          className="marker-line"
        />
        <circle
          cx={45 + p * 320}
          cy={148 - entropy(p, 1 - p) * 128}
          r="5"
          fill="var(--orange)"
        />
        <text x="150" y="172">
          Share of positive examples p →
        </text>
        <text x="10" y="13">
          Entropy (bits)
        </text>
      </svg>
      <label className="range-label" htmlFor="entropy-p">
        Share of positive examples <b>p = {p.toFixed(2)}</b>
      </label>
      <input
        id="entropy-p"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={p}
        onChange={(e) => setP(+e.target.value)}
      />
      <div className="model-stats">
        <span>
          Entropy <b>{entropy(p, 1 - p).toFixed(3)} bits</b>
        </span>
        <span>
          Maximum at p = 0.5 <b>1 bit</b>
        </span>
      </div>
      <label className="range-label" htmlFor="gain-attr">
        Split the car-theft data on an attribute
      </label>
      <select
        id="gain-attr"
        value={attr}
        onChange={(e) => setAttr(+e.target.value)}
      >
        {carAttributes.map((a, i) => (
          <option key={a} value={i}>
            {a} (gain {gains[i].toFixed(3)})
          </option>
        ))}
      </select>
      <table className="ml-table">
        <thead>
          <tr>
            <th>{carAttributes[attr]}</th>
            <th>high / low</th>
            <th>Entropy</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {result.branches.map((b) => (
            <tr key={b.value}>
              <td>{b.value}</td>
              <td>
                {b.high} / {b.low}
              </td>
              <td>{b.entropy.toFixed(3)}</td>
              <td>{b.high + b.low}/7</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="model-stats">
        <span>
          Before <b>{result.before.toFixed(3)}</b>
        </span>
        <span>
          After (weighted) <b>{result.after.toFixed(3)}</b>
        </span>
        <span>
          Gain <b>{result.gain.toFixed(3)}</b>
        </span>
      </div>
      <p>
        The split with the largest gain becomes the root:{' '}
        <b>{carAttributes[best]}</b> ({gains[best].toFixed(3)} bits). Gain =
        entropy before − weighted average entropy of the branches.
      </p>
    </div>
  )
}

function ConfusionExplorer() {
  const [tp, setTp] = useState(40)
  const [fn, setFn] = useState(10)
  const [fp, setFp] = useState(20)
  const [tn, setTn] = useState(130)
  const m = metrics(tp, fn, fp, tn)
  const rows: [string, number | null, string][] = [
    ['Accuracy', m.accuracy, '(TP+TN) / all'],
    ['Recall = sensitivity', m.recall, 'TP / (TP+FN)'],
    ['Specificity', m.specificity, 'TN / (TN+FP)'],
    ['Precision', m.precision, 'TP / (TP+FP)'],
    ['F1', m.f1, '2PR / (P+R)'],
  ]
  const slider = (
    label: string,
    value: number,
    set: (n: number) => void,
    id: string,
  ) => (
    <>
      <label className="range-label" htmlFor={id}>
        {label} <b>{value}</b>
      </label>
      <input
        id={id}
        type="range"
        min="0"
        max="1000"
        step="1"
        value={value}
        onChange={(e) => set(+e.target.value)}
      />
    </>
  )
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>CONFUSION MATRIX</span>
        <span>Binary classification</span>
      </div>
      <div className="confusion">
        <span />
        <b>Predicted positive</b>
        <b>Predicted negative</b>
        <b>Actually positive</b>
        <span className="cell good">TP {tp}</span>
        <span className="cell bad">FN {fn}</span>
        <b>Actually negative</b>
        <span className="cell bad">FP {fp}</span>
        <span className="cell good">TN {tn}</span>
      </div>
      <div className="button-row">
        <ActionButton
          className="secondary-button"
          onClick={() => {
            setTp(40)
            setFn(10)
            setFp(20)
            setTn(130)
          }}
        >
          <RotateCcw size={14} />
          Lecture-style example
        </ActionButton>
        <ActionButton
          className="secondary-button"
          onClick={() => {
            setTp(0)
            setFn(50)
            setFp(0)
            setTn(950)
          }}
        >
          Always predict “negative” (95% negatives)
        </ActionButton>
      </div>
      {slider('TP', tp, setTp, 'cm-tp')}
      {slider('FN', fn, setFn, 'cm-fn')}
      {slider('FP', fp, setFp, 'cm-fp')}
      {slider('TN', tn, setTn, 'cm-tn')}
      <table className="ml-table">
        <tbody>
          {rows.map(([name, value, formula]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{formula}</td>
              <td>
                <b>{fmt(value)}</b>
              </td>
              <td className="bar-cell">
                <i style={{ width: `${(value ?? 0) * 100}%` }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Try the second preset: accuracy is 0.95 yet recall is 0. Accuracy hides
        the problem when the classes are imbalanced.
      </p>
    </div>
  )
}

function BoostingExplorer() {
  const [young, setYoung] = useState(true)
  const [male, setMale] = useState(true)
  const [daily, setDaily] = useState(true)
  const a = treeOneScore(young, male)
  const b = treeTwoScore(daily)
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <ActionButton
      className="secondary-button"
      aria-pressed={value}
      onClick={() => set(!value)}
    >
      {label}: <b>{value ? 'yes' : 'no'}</b>
    </ActionButton>
  )
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>BOOSTING: SUM OF LEAF SCORES</span>
        <span>Lecture example</span>
      </div>
      <div className="button-row">
        {toggle('Age < 15', young, setYoung)}
        {toggle('Is male', male, setMale)}
        {toggle('Uses a computer daily', daily, setDaily)}
      </div>
      <table className="ml-table">
        <tbody>
          <tr>
            <td>Tree 1 (age &lt; 15? → is male?)</td>
            <td>
              <b>{a > 0 ? `+${a}` : a}</b>
            </td>
            <td className="bar-cell">
              <DivergeBar value={a} />
            </td>
          </tr>
          <tr>
            <td>Tree 2 (uses a computer daily?)</td>
            <td>
              <b>{b > 0 ? `+${b}` : b}</b>
            </td>
            <td className="bar-cell">
              <DivergeBar value={b} />
            </td>
          </tr>
          <tr>
            <td>Prediction = tree 1 + tree 2</td>
            <td>
              <b>{(a + b).toFixed(1)}</b>
            </td>
            <td className="bar-cell">
              <DivergeBar value={a + b} />
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Leaf scores are from the lecture slide (+2, +0.1, −1 in tree 1; +0.9,
        −0.9 in tree 2). The person attributes are an illustration. A random
        forest would instead average or vote over independent trees.
      </p>
    </div>
  )
}

function XorExplorer() {
  const [x1, setX1] = useState(1)
  const [x2, setX2] = useState(-1)
  const net = xorNet(x1, x2)
  const px = (v: number) => 200 + v * 80
  const py = (v: number) => 92 - v * 38
  const target = (a: number, b: number) => (a === b ? -1 : 1)
  const label = (v: number) => (v > 0 ? '+1' : '−1')
  const band: [number, number][] = [
    [-2, -1],
    [1, 2],
    [2, 2],
    [2, 1],
    [-1, -2],
    [-2, -2],
  ]
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>XOR NEEDS A HIDDEN LAYER</span>
        <span>Inputs and targets in {'{−1, +1}'}</span>
      </div>
      <svg
        viewBox="0 0 400 184"
        role="img"
        aria-label={`XOR points and the two hidden-unit boundaries. Selected input (${x1}, ${x2}) gives output ${net.y}`}
      >
        <polygon
          points={band.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}
          fill="var(--accent)"
          opacity="0.12"
        />
        <line
          x1={px(-2)}
          y1={py(-1)}
          x2={px(1)}
          y2={py(2)}
          className="marker-line"
        />
        <line
          x1={px(-1)}
          y1={py(-2)}
          x2={px(2)}
          y2={py(1)}
          className="marker-line"
        />
        <path
          d={`M${px(-2)} ${py(0)}H${px(2)}M${px(0)} ${py(-2)}V${py(2)}`}
          className="axis"
        />
        {[-1, 1].flatMap((a) =>
          [-1, 1].map((b) => (
            <g key={`${a}${b}`}>
              <circle
                cx={px(a)}
                cy={py(b)}
                r={a === x1 && b === x2 ? 11 : 8}
                fill={target(a, b) > 0 ? 'var(--green)' : 'var(--orange)'}
                stroke={a === x1 && b === x2 ? 'var(--strong)' : 'none'}
                strokeWidth="3"
              />
              <text x={px(a) + (a > 0 ? -66 : 14)} y={py(b) + 3}>
                ({label(a)}, {label(b)})
              </text>
            </g>
          )),
        )}
        <text x="44" y="16">
          x₂ ↑
        </text>
        <text x="352" y={py(0) - 6}>
          x₁ →
        </text>
      </svg>
      <div className="legend">
        <span>
          <i />
          Target +1
        </span>
        <span>
          <i />
          Target −1
        </span>
      </div>
      <div className="button-row">
        {[-1, 1].flatMap((a) =>
          [-1, 1].map((b) => (
            <ActionButton
              key={`${a}${b}`}
              className="secondary-button"
              aria-pressed={a === x1 && b === x2}
              onClick={() => {
                setX1(a)
                setX2(b)
              }}
            >
              x = ({label(a)}, {label(b)})
            </ActionButton>
          )),
        )}
      </div>
      <table className="ml-table">
        <tbody>
          <tr>
            <td>h₁ = sign(x₁ − x₂ − 1)</td>
            <td>
              <b>{label(net.h1)}</b>
            </td>
          </tr>
          <tr>
            <td>h₂ = sign(x₂ − x₁ − 1)</td>
            <td>
              <b>{label(net.h2)}</b>
            </td>
          </tr>
          <tr>
            <td>y = sign(h₁ + h₂ + 1)</td>
            <td>
              <b>{label(net.y)}</b> (target {label(target(x1, x2))})
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The dashed lines are the two hidden-unit boundaries. Inside the shaded
        band both hidden units are −1 and the output is −1. Each hidden unit
        cuts off one corner, and the output unit fires if either hidden unit is
        on. One straight line cannot do this.
      </p>
    </div>
  )
}

function GradientExplorer() {
  const [eta, setEta] = useState(0.1)
  const [start, setStart] = useState(2)
  const [path, setPath] = useState([2])
  const x = path[path.length - 1]
  const clamp = (v: number) => Math.max(0, Math.min(30, v))
  const px = (v: number) => 45 + ((v + 1) / 4) * 320
  const py = (v: number) => 148 - (clamp(v) / 30) * 128
  const curve = Array.from({ length: 81 }, (_, i) => {
    const v = -1 + (i / 80) * 4
    return `${px(v)},${py(bowl(v))}`
  })
  const diverging = eta >= 0.25
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>GRADIENT DESCENT</span>
        <span>f(x) = 4x² − 4x + 3</span>
      </div>
      <svg
        viewBox="0 0 400 180"
        role="img"
        aria-label={`Gradient descent iterate x = ${x.toFixed(3)}, f(x) = ${bowl(x).toFixed(3)}`}
      >
        <path d="M38 18V148H375" className="axis" />
        <polyline points={curve.join(' ')} className="plot-line" />
        {path
          .slice(0, 40)
          .map((v, i) =>
            v >= -1 && v <= 3 ? (
              <circle
                key={i}
                cx={px(v)}
                cy={py(bowl(v))}
                r={i === path.length - 1 ? 6 : 3.5}
                fill="var(--orange)"
              />
            ) : null,
          )}
        <text x="215" y="172">
          x →
        </text>
        <text x="10" y="13">
          f(x)
        </text>
      </svg>
      <label className="range-label" htmlFor="gd-eta">
        Learning rate η <b>{eta.toFixed(2)}</b>
      </label>
      <input
        id="gd-eta"
        type="range"
        min="0.02"
        max="0.3"
        step="0.01"
        value={eta}
        onChange={(e) => {
          setEta(+e.target.value)
          setPath([start])
        }}
      />
      <label className="range-label" htmlFor="gd-start">
        Starting point x₀ <b>{start.toFixed(1)}</b>
      </label>
      <input
        id="gd-start"
        type="range"
        min="-1"
        max="3"
        step="0.1"
        value={start}
        onChange={(e) => {
          setStart(+e.target.value)
          setPath([+e.target.value])
        }}
      />
      <div className="button-row">
        <ActionButton
          className="secondary-button"
          onClick={() => setPath([...path, descentStep(x, eta)].slice(-60))}
        >
          <StepForward size={14} />
          Take a step
        </ActionButton>
        <ActionButton
          className="secondary-button"
          onClick={() => setPath([start])}
        >
          <RotateCcw size={14} />
          Reset
        </ActionButton>
      </div>
      <div className="model-stats">
        <span>
          Step <b>{path.length - 1}</b>
        </span>
        <span>
          x <b>{Math.abs(x) > 1e6 ? x.toExponential(1) : x.toFixed(4)}</b>
        </span>
        <span>
          Slope f′(x) = 8x − 4{' '}
          <b>
            {Math.abs(8 * x - 4) > 1e6
              ? (8 * x - 4).toExponential(1)
              : (8 * x - 4).toFixed(3)}
          </b>
        </span>
      </div>
      <p>
        Update: x ← x − η · f′(x). With η = 0.1 and x₀ = 2 you get 0.8, 0.56,
        0.512, 0.5024… The steps shrink because the slope flattens near the
        minimum x = 0.5.{' '}
        {diverging
          ? 'With η ≥ 0.25 the steps overshoot more each time and the iterates diverge.'
          : 'For this function any η below 0.25 converges; larger values overshoot and diverge.'}
      </p>
    </div>
  )
}

const convInput = Array.from({ length: 5 }, (_, r) =>
  Array.from({ length: 5 }, (_, c) => r * 5 + c + 1),
)
const convFilter = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
]

function ConvolutionExplorer() {
  const [padding, setPadding] = useState(0)
  const [stride, setStride] = useState(1)
  const [pos, setPos] = useState(0)
  const conv = convolve(convInput, convFilter, padding, stride)
  const total = conv.out * conv.out
  const index = Math.min(pos, total - 1)
  const r0 = Math.floor(index / conv.out)
  const c0 = index % conv.out
  const inPatch = (r: number, c: number) =>
    r >= r0 * stride &&
    r < r0 * stride + 3 &&
    c >= c0 * stride &&
    c < c0 * stride + 3
  const terms: string[] = []
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (convFilter[i][j])
        terms.push(String(conv.padded[r0 * stride + i][c0 * stride + j]))
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>CONVOLUTION</span>
        <span>
          5×5 input · 3×3 filter · padding {padding} · stride {stride}
        </span>
      </div>
      <div className="conv-row">
        <div>
          <b>Input{padding ? ' (zero-padded)' : ''}</b>
          <div
            className="cell-grid"
            style={{
              gridTemplateColumns: `repeat(${conv.padded.length}, 1fr)`,
            }}
          >
            {conv.padded.map((row, r) =>
              row.map((v, c) => (
                <span
                  key={`${r}-${c}`}
                  className={inPatch(r, c) ? 'cell on' : 'cell'}
                >
                  {v}
                </span>
              )),
            )}
          </div>
        </div>
        <div>
          <b>Filter</b>
          <div
            className="cell-grid"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {convFilter.flat().map((v, i) => (
              <span key={i} className="cell filter">
                {v}
              </span>
            ))}
          </div>
        </div>
        <div>
          <b>
            Feature map {conv.out}×{conv.out}
          </b>
          <div
            className="cell-grid"
            style={{ gridTemplateColumns: `repeat(${conv.out}, 1fr)` }}
          >
            {conv.values.flat().map((v, i) => (
              <span
                key={i}
                className={
                  i === index ? 'cell on' : i < index ? 'cell' : 'cell dim'
                }
              >
                {i <= index ? v : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <label className="range-label" htmlFor="conv-pos">
        Filter position{' '}
        <b>
          {index + 1} of {total}
        </b>
      </label>
      <input
        id="conv-pos"
        type="range"
        min="0"
        max={total - 1}
        value={index}
        onChange={(e) => setPos(+e.target.value)}
      />
      <div className="button-row">
        <ActionButton
          className="secondary-button"
          aria-pressed={padding === 1}
          onClick={() => {
            setPadding(padding ? 0 : 1)
            setPos(0)
          }}
        >
          Padding: <b>{padding}</b>
        </ActionButton>
        <ActionButton
          className="secondary-button"
          aria-pressed={stride === 2}
          onClick={() => {
            setStride(stride === 1 ? 2 : 1)
            setPos(0)
          }}
        >
          Stride: <b>{stride}</b>
        </ActionButton>
      </div>
      <p>
        Output value = {terms.join(' + ')} = <b>{conv.values[r0][c0]}</b> (only
        the filter&apos;s ones pick up values). Output size = ⌊(n + 2p − k) / s⌋
        + 1 = ⌊({5} + {2 * padding} − 3) / {stride}⌋ + 1 = {conv.out}. The same
        9 filter weights are reused at every position.
      </p>
    </div>
  )
}

const presets: [string, number][] = [
  ['Sigmoid, max slope 0.25', 0.25],
  ['ReLU slope / w = 1', 1],
  ['RNN weight w = 0.5', 0.5],
  ['w = 0.9', 0.9],
  ['w = 1.1', 1.1],
]

function VanishingExplorer() {
  const [factor, setFactor] = useState(0.25)
  const [steps, setSteps] = useState(30)
  const lo = -32
  const hi = 8
  const px = (k: number) => 45 + (k / 100) * 320
  const py = (lg: number) =>
    148 - ((Math.max(lo, Math.min(hi, lg)) - lo) / (hi - lo)) * 128
  const logs = Array.from(
    { length: steps + 1 },
    (_, k) => k * Math.log10(factor),
  )
  const final = Math.pow(factor, steps)
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>VANISHING & EXPLODING GRADIENTS</span>
        <span>Product of per-step factors</span>
      </div>
      <svg
        viewBox="0 0 400 180"
        role="img"
        aria-label={`Gradient factor ${factor.toFixed(2)} to the power ${steps} is ${final.toExponential(1)}`}
      >
        <path d="M38 18V148H375" className="axis" />
        <line x1="38" x2="375" y1={py(0)} y2={py(0)} className="marker-line" />
        <polyline
          points={logs.map((l, k) => `${px(k)},${py(l)}`).join(' ')}
          className="plot-line"
        />
        <text x="150" y="172">
          Layers or time steps →
        </text>
        <text x="10" y="13">
          log₁₀ of the gradient (dashed = 1)
        </text>
      </svg>
      <div className="button-row">
        {presets.map(([name, value]) => (
          <ActionButton
            key={name}
            className="secondary-button"
            aria-pressed={factor === value}
            onClick={() => setFactor(value)}
          >
            {name}
          </ActionButton>
        ))}
      </div>
      <label className="range-label" htmlFor="vg-factor">
        Factor per step <b>{factor.toFixed(2)}</b>
      </label>
      <input
        id="vg-factor"
        type="range"
        min="0.1"
        max="1.3"
        step="0.01"
        value={factor}
        onChange={(e) => setFactor(+e.target.value)}
      />
      <label className="range-label" htmlFor="vg-steps">
        Layers / time steps <b>{steps}</b>
      </label>
      <input
        id="vg-steps"
        type="range"
        min="1"
        max="100"
        value={steps}
        onChange={(e) => setSteps(+e.target.value)}
      />
      <div className="model-stats">
        <span>
          Gradient factor <b>{final.toExponential(2)}</b>
        </span>
      </div>
      <p>
        Backpropagation multiplies one factor per layer (or per time step in an
        RNN). Below 1 the signal vanishes exponentially (0.5¹⁰⁰ ≈ 7.9×10⁻³¹);
        above 1 it explodes. ReLU fixes the activation part, but repeated
        multiplication by a weight matrix can still shrink or blow up the
        signal.
      </p>
    </div>
  )
}

const attentionWords = ['Det', 'er', 'en', 'kul', 'hest']
const attentionStates = [0.2, 0.9, -0.4, 0.6, 0.1]

function AttentionExplorer() {
  const [scores, setScores] = useState([0.2, 0.1, 0.3, 1.2, 2.4])
  const [hard, setHard] = useState(false)
  const soft = softmax(scores)
  const best = soft.indexOf(Math.max(...soft))
  const weights = hard ? soft.map((_, i) => (i === best ? 1 : 0)) : soft
  const context = weights.reduce((sum, w, i) => sum + w * attentionStates[i], 0)
  return (
    <div className="illustration green">
      <div className="figure-top">
        <span>ATTENTION WEIGHTS</span>
        <span>Decoder step: “Pferd”</span>
      </div>
      <table className="ml-table">
        <thead>
          <tr>
            <th>Input word</th>
            <th>Score</th>
            <th>Weight a</th>
            <th />
            <th>h</th>
          </tr>
        </thead>
        <tbody>
          {attentionWords.map((word, i) => (
            <tr key={word}>
              <td>{word}</td>
              <td>
                <input
                  aria-label={`Score for ${word}`}
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={scores[i]}
                  onChange={(e) =>
                    setScores(
                      scores.map((s, j) => (j === i ? +e.target.value : s)),
                    )
                  }
                />
              </td>
              <td>
                <b>{weights[i].toFixed(2)}</b>
              </td>
              <td className="bar-cell">
                <i style={{ width: `${weights[i] * 100}%` }} />
              </td>
              <td>{attentionStates[i].toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="button-row">
        <ActionButton
          className="secondary-button"
          aria-pressed={hard}
          onClick={() => setHard(!hard)}
        >
          Attention: <b>{hard ? 'hard (one input)' : 'soft (weighted mix)'}</b>
        </ActionButton>
      </div>
      <div className="model-stats">
        <span>
          Sum of weights <b>{weights.reduce((a, b) => a + b, 0).toFixed(2)}</b>
        </span>
        <span>
          Context c = Σ aᵢ hᵢ <b>{context.toFixed(3)}</b>
        </span>
      </div>
      <p>
        The softmax turns scores into weights that sum to 1. Soft attention
        mixes all encoder states and is differentiable; hard attention picks a
        single input and is not. The scores and the one-number states h are
        illustrative; the words come from the lecture&apos;s translation
        example.
      </p>
    </div>
  )
}

export function MlExploration({ kind }: { kind: string }) {
  if (kind === 'ml-entropy') return <EntropyExplorer />
  if (kind === 'ml-confusion') return <ConfusionExplorer />
  if (kind === 'ml-boosting') return <BoostingExplorer />
  if (kind === 'ml-xor') return <XorExplorer />
  if (kind === 'ml-gradient') return <GradientExplorer />
  if (kind === 'ml-conv') return <ConvolutionExplorer />
  if (kind === 'ml-vanishing') return <VanishingExplorer />
  if (kind === 'ml-attention') return <AttentionExplorer />
  return null
}
