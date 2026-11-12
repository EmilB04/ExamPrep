import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { ComplexExploration } from './ComplexExploration'

export function Illustration({
  kind,
  interactive = false,
}: {
  kind: string
  interactive?: boolean
}) {
  const [value, setValue] = useState(3)
  const [generation, setGeneration] = useState(0)
  const [method, setMethod] = useState('experience')
  if (['network', 'evolution', 'agents', 'neuron', 'neural-ca'].includes(kind))
    return <ComplexExploration kind={kind} />
  if (kind === 'machine-learning')
    return (
      <div className="illustration green">
        <div className="figure-top">
          <span>MODEL COMPLEXITY</span>
          <span>
            {value < 3
              ? 'Underfitting'
              : value < 7
                ? 'Balanced fit'
                : 'Overfitting'}
          </span>
        </div>
        <svg
          viewBox="0 0 400 180"
          role="img"
          aria-label={`Training and validation error as model complexity increases. Selected complexity ${value}.`}
        >
          <path d="M38 18V148H375" className="axis" />
          <path d="M45 30 C100 80 140 135 365 140" className="plot-line" />
          <path
            d="M45 36 C130 165 210 140 365 28"
            className="plot-line secondary"
          />
          <line
            x1={45 + value * 32}
            x2={45 + value * 32}
            y1="18"
            y2="148"
            className="marker-line"
          />
          <text x="195" y="172">
            Model complexity →
          </text>
          <text x="10" y="13">
            Error
          </text>
        </svg>
        <div className="legend">
          <span>
            <i />
            Training error
          </span>
          <span>
            <i />
            Validation error
          </span>
        </div>
        {interactive && (
          <>
            <label className="range-label" htmlFor="complexity">
              Explore model complexity <b>{value}/10</b>
            </label>
            <input
              id="complexity"
              type="range"
              min="1"
              max="10"
              value={value}
              onChange={(e) => setValue(+e.target.value)}
            />
            <p>
              Watch the gap grow: greater complexity can reduce training error
              while validation error rises. This is a conceptual illustration,
              not a trained model.
            </p>
          </>
        )}
      </div>
    )
  if (kind === 'complex-systems') {
    const rows: number[][] = [
      Array.from({ length: 25 }, (_, i) => (i === 12 ? 1 : 0)),
    ]
    for (let j = 1; j < 13 + generation; j++)
      rows.push(
        rows[j - 1].map((_, i, row) => row[(i + 24) % 25] ^ row[(i + 1) % 25]),
      )
    return (
      <div className="illustration violet">
        <div className="figure-top">
          <span>LOCAL RULE → GLOBAL PATTERN</span>
          <span>Rule 90</span>
        </div>
        <div
          className="automaton"
          role="img"
          aria-label="Rule 90 cellular automaton: repeated local updates form a triangular pattern"
        >
          {rows
            .slice(-13)
            .flatMap((row, j) =>
              row.map((cell, i) => (
                <i key={`${j}-${i}`} className={cell ? 'alive' : ''} />
              )),
            )}
        </div>
        {interactive && (
          <>
            <div className="button-row">
              <button
                className="secondary-button"
                onClick={() => setGeneration((g) => g + 1)}
              >
                Next generation
              </button>
              <button
                className="icon-button"
                aria-label="Reset automaton"
                onClick={() => setGeneration(0)}
              >
                <RotateCcw size={17} />
              </button>
            </div>
            <p>
              Generation {12 + generation}. Each cell becomes the XOR of its
              left and right neighbours. The edges wrap around.
            </p>
          </>
        )}
      </div>
    )
  }
  return (
    <div className="illustration orange">
      <div className="figure-top">
        <span>DESIGNING A STUDY</span>
        <span>Question first</span>
      </div>
      <div className="research-flow">
        <span>Research question</span>
        <i>↓</i>
        <span>
          {method === 'experience' ? 'Explore experiences' : 'Compare outcomes'}
        </span>
        <i>↓</i>
        <span>
          {method === 'experience'
            ? 'Interviews + thematic analysis'
            : 'Measurements + statistical analysis'}
        </span>
      </div>
      {interactive && (
        <>
          <label htmlFor="research-method" className="range-label">
            What do you want to understand?
          </label>
          <select
            id="research-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="experience">How students experience feedback</option>
            <option value="outcome">
              Whether feedback improves test scores
            </option>
          </select>
          <p>
            These are possible starting points. The full design also depends on
            sampling, ethics, and the claims you want to make.
          </p>
        </>
      )}
    </div>
  )
}
