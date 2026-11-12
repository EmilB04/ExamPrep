import { useState } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'

const positions = [
  [90, 45],
  [205, 35],
  [300, 90],
  [250, 170],
  [110, 170],
  [40, 105],
]
const pairs = positions.flatMap((_, i) =>
  positions.slice(i + 1).map((_, j) => [i, i + j + 1]),
)
export function networkDensity(nodes: number, edges: number) {
  return nodes > 1 ? (2 * edges) / (nodes * (nodes - 1)) : 0
}
export function bitFitness(bits: number[]) {
  return bits.reduce((sum, bit) => sum + bit, 0)
}

export function ComplexExploration({ kind }: { kind: string }) {
  const [edges, setEdges] = useState(['0-1', '1-2', '2-3', '3-4', '4-5', '0-5'])
  const [pair, setPair] = useState('0-2')
  const [threshold, setThreshold] = useState(0.5)
  const [centre, setCentre] = useState(0.4)
  const [bits, setBits] = useState([1, 0, 0, 1, 0, 1, 0, 0])
  const [current, setCurrent] = useState(1.4)
  const [voltage, setVoltage] = useState(0)
  const [spikes, setSpikes] = useState(0)
  const [steps, setSteps] = useState(0)
  if (kind === 'network')
    return (
      <div className="illustration violet">
        <div className="figure-top">
          <span>NETWORK STRUCTURE</span>
          <span>Simple undirected graph</span>
        </div>
        <svg
          viewBox="0 0 350 215"
          role="img"
          aria-label={`Six nodes connected by ${edges.length} edges`}
        >
          {edges.map((edge) => {
            const [a, b] = edge.split('-').map(Number)
            return (
              <line
                key={edge}
                x1={positions[a][0]}
                y1={positions[a][1]}
                x2={positions[b][0]}
                y2={positions[b][1]}
                stroke="#b4a5d1"
                strokeWidth="2"
              />
            )
          })}
          {positions.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="17" fill="#9582c4" />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                style={{ fill: 'white', fontSize: 12 }}
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
        <div className="model-stats">
          <span>
            Nodes <b>6</b>
          </span>
          <span>
            Edges <b>{edges.length}</b>
          </span>
          <span>
            Density <b>{networkDensity(6, edges.length).toFixed(3)}</b>
          </span>
        </div>
        <label htmlFor="edge-choice" className="range-label">
          Select a pair of nodes
        </label>
        <select
          id="edge-choice"
          value={pair}
          onChange={(e) => setPair(e.target.value)}
        >
          {pairs.map(([a, b]) => (
            <option key={`${a}-${b}`} value={`${a}-${b}`}>
              {a + 1} ↔ {b + 1}
            </option>
          ))}
        </select>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() =>
              setEdges((e) =>
                e.includes(pair) ? e.filter((x) => x !== pair) : [...e, pair],
              )
            }
          >
            {edges.includes(pair) ? 'Remove edge' : 'Add edge'}
            <ArrowRight size={15} />
          </button>
        </div>
        <p>
          Density = 2m / [n(n−1)]. Change edges and compare node degrees:{' '}
          {positions
            .map(
              (_, i) =>
                edges.filter((e) => e.split('-').includes(String(i))).length,
            )
            .join(', ')}
          . Different graphs can have the same density.
        </p>
      </div>
    )
  if (kind === 'evolution')
    return (
      <div className="illustration violet">
        <div className="figure-top">
          <span>VARIATION & FITNESS</span>
          <span>OneMax example</span>
        </div>
        <h3>Target: maximise the number of ones</h3>
        <div className="bitstring">
          {bits.map((bit, i) => (
            <button
              key={i}
              aria-label={`Flip bit ${i + 1}, currently ${bit}`}
              onClick={() => setBits(bits.map((b, j) => (i === j ? 1 - b : b)))}
            >
              {bit}
            </button>
          ))}
        </div>
        <div className="model-stats">
          <span>
            Fitness <b>{bitFitness(bits)} / 8</b>
          </span>
          <span>
            Search space <b>2⁸ = 256</b>
          </span>
        </div>
        <p>
          Click a bit to apply a mutation. Some mutations improve fitness and
          others reduce it. This is one candidate, not a full population-based
          evolutionary algorithm.
        </p>
      </div>
    )
  if (kind === 'agents') {
    const same = 3 / 8
    return (
      <div className="illustration violet">
        <div className="figure-top">
          <span>LOCAL AGENT DECISION</span>
          <span>Schelling-inspired example</span>
        </div>
        <div
          className="agent-neighbours"
          role="img"
          aria-label="A blue centre agent surrounded by three blue and five orange neighbours"
        >
          {[0, 1, 0, 1, 1, 0, 0, 1, 0].map((v, i) => (
            <span
              className={`${v ? 'blue-agent' : 'orange-agent'} ${i === 4 ? 'centre-agent' : ''}`}
              key={i}
            >
              {i === 4 ? 'A' : ''}
            </span>
          ))}
        </div>
        <label className="range-label" htmlFor="agent-threshold">
          Required share of same-type neighbours{' '}
          <b>{Math.round(threshold * 100)}%</b>
        </label>
        <input
          id="agent-threshold"
          type="range"
          min="0"
          max="1"
          step="0.125"
          value={threshold}
          onChange={(e) => setThreshold(+e.target.value)}
        />
        <div className="model-stats">
          <span>
            Same type <b>3 / 8 = 37.5%</b>
          </span>
          <span>
            Decision <b>{same < threshold ? 'Seek a new location' : 'Stay'}</b>
          </span>
        </div>
        <p>
          The centre agent moves when the same-type fraction is below its
          threshold. This illustrates one local decision; it does not simulate a
          whole segregation process.
        </p>
      </div>
    )
  }
  if (kind === 'neuron')
    return (
      <div className="illustration violet">
        <div className="figure-top">
          <span>LEAKY INTEGRATE-AND-FIRE</span>
          <span>Dimensionless teaching model</span>
        </div>
        <label className="range-label" htmlFor="neuron-current">
          Input current <b>{current.toFixed(1)}</b>
        </label>
        <input
          id="neuron-current"
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={current}
          onChange={(e) => setCurrent(+e.target.value)}
        />
        <div className="voltage-track">
          <span style={{ width: `${voltage * 100}%` }} />
        </div>
        <div className="model-stats">
          <span>
            Potential <b>{voltage.toFixed(2)}</b>
          </span>
          <span>
            Spikes <b>{spikes}</b>
          </span>
          <span>
            Steps <b>{steps}</b>
          </span>
        </div>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() => {
              const next = voltage + 0.2 * (current - voltage)
              if (next >= 1) {
                setSpikes((s) => s + 1)
                setVoltage(0)
              } else setVoltage(next)
              setSteps((s) => s + 1)
            }}
          >
            Advance time
            <ArrowRight size={15} />
          </button>
          <button
            className="icon-button"
            aria-label="Reset neuron"
            onClick={() => {
              setVoltage(0)
              setSpikes(0)
              setSteps(0)
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
        <p>
          Each step: v ← v + 0.2(I−v). At threshold 1, emit a spike and reset to
          0. Refractory periods and biological units are omitted in this
          simplified model.
        </p>
      </div>
    )
  const output = Math.max(0, 0.7 * centre + 0.3 * threshold - 0.2)
  return (
    <div className="illustration violet">
      <div className="figure-top">
        <span>A PARAMETERISED LOCAL UPDATE</span>
        <span>Neural CA intuition</span>
      </div>
      <label htmlFor="centre-state" className="range-label">
        Centre cell state <b>{centre.toFixed(2)}</b>
      </label>
      <input
        id="centre-state"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={centre}
        onChange={(e) => setCentre(+e.target.value)}
      />
      <label htmlFor="neighbour-state" className="range-label">
        Neighbourhood mean <b>{threshold.toFixed(2)}</b>
      </label>
      <input
        id="neighbour-state"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={threshold}
        onChange={(e) => setThreshold(+e.target.value)}
      />
      <div className="model-stats">
        <span>
          Weighted local input{' '}
          <b>{(0.7 * centre + 0.3 * threshold - 0.2).toFixed(2)}</b>
        </span>
        <span>
          ReLU output <b>{output.toFixed(2)}</b>
        </span>
      </div>
      <p>
        Output = max(0, 0.7 × centre + 0.3 × neighbours − 0.2). These fixed
        example weights illustrate a local neural computation. This is not a
        trained neural CA or the full Growing NCA architecture.
      </p>
    </div>
  )
}
