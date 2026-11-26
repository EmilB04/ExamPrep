// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  MlExploration,
  bowl,
  convolve,
  convOutputSize,
  descentStep,
  entropy,
  informationGain,
  metrics,
  softmax,
  treeOneScore,
  treeTwoScore,
  xorNet,
} from './MlExploration'
import { LectureReading } from './LectureReading'
import { lookupTerm } from './glossary'

afterEach(cleanup)

describe('ML helpers match the lecture numbers', () => {
  it('computes entropy and information gain for the car-theft data', () => {
    expect(entropy(0.5, 0.5)).toBe(1)
    expect(entropy(1, 0)).toBe(0)
    expect(informationGain(3).gain).toBeCloseTo(0.5216, 3)
    expect(informationGain(2).gain).toBeCloseTo(0.1281, 3)
    expect(informationGain(0).gain).toBeCloseTo(0.0202, 3)
    expect(informationGain(1).gain).toBeCloseTo(0.0202, 3)
  })
  it('computes confusion-matrix metrics', () => {
    const m = metrics(40, 10, 20, 130)
    expect(m.accuracy).toBeCloseTo(0.85)
    expect(m.recall).toBeCloseTo(0.8)
    expect(m.precision).toBeCloseTo(40 / 60)
    expect(m.specificity).toBeCloseTo(130 / 150)
    const always = metrics(0, 50, 0, 950)
    expect(always.accuracy).toBeCloseTo(0.95)
    expect(always.recall).toBe(0)
    expect(always.precision).toBeNull()
  })
  it('sums XGBoost leaf scores', () => {
    expect(treeOneScore(true, true) + treeTwoScore(true)).toBeCloseTo(2.9)
    expect(treeOneScore(false, true) + treeTwoScore(false)).toBeCloseTo(-1.9)
  })
  it('solves XOR with the hand-built network', () => {
    const target = (a: number, b: number) => (a === b ? -1 : 1)
    for (const a of [-1, 1])
      for (const b of [-1, 1]) expect(xorNet(a, b).y).toBe(target(a, b))
  })
  it('follows the gradient-descent example', () => {
    let x = 2
    const seen = []
    for (let i = 0; i < 4; i++) {
      x = descentStep(x, 0.1)
      seen.push(Number(x.toFixed(4)))
    }
    expect(seen).toEqual([0.8, 0.56, 0.512, 0.5024])
    expect(bowl(0.5)).toBe(2)
  })
  it('convolves, pads and strides', () => {
    const input = Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => r * 5 + c + 1),
    )
    const filter = [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1],
    ]
    expect(convolve(input, filter, 0, 1).out).toBe(3)
    expect(convolve(input, filter, 1, 1).out).toBe(5)
    expect(convolve(input, filter, 0, 2).out).toBe(2)
    // 1 + 3 + 7 + 11 + 13 on the 1..25 grid
    expect(convolve(input, filter, 0, 1).values[0][0]).toBe(1 + 3 + 7 + 11 + 13)
    expect(convOutputSize(28, 5, 0, 1)).toBe(24)
    expect(convOutputSize(28, 5, 0, 2)).toBe(12)
    expect(convOutputSize(28, 5, 2, 1)).toBe(28)
    expect(convOutputSize(227, 11, 0, 4)).toBe(55)
  })
  it('softmax sums to one', () => {
    const p = softmax([2, 1, 0])
    expect(p[0]).toBeCloseTo(0.665, 3)
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })
})

describe('ML illustrations render and respond', () => {
  const kinds = [
    'ml-entropy',
    'ml-confusion',
    'ml-boosting',
    'ml-xor',
    'ml-gradient',
    'ml-conv',
    'ml-vanishing',
    'ml-attention',
  ]
  it.each(kinds)('renders %s', (kind) => {
    const { container } = render(<MlExploration kind={kind} />)
    expect(container.querySelector('.illustration')).toBeTruthy()
  })
  it('shows the accuracy trap in the confusion preset', () => {
    render(<MlExploration kind="ml-confusion" />)
    fireEvent.click(screen.getByText(/Always predict/))
    expect(screen.getByText('Accuracy').closest('tr')!.textContent).toContain(
      '0.950',
    )
    expect(
      screen.getByText('Recall = sensitivity').closest('tr')!.textContent,
    ).toContain('0.000')
  })
  it('takes gradient-descent steps', () => {
    render(<MlExploration kind="ml-gradient" />)
    fireEvent.click(screen.getByText('Take a step'))
    expect(screen.getByText('0.8000')).toBeTruthy()
  })
  it('updates the XOR output for the selected input', () => {
    render(<MlExploration kind="ml-xor" />)
    fireEvent.click(screen.getByText('x = (−1, −1)'))
    expect(screen.getByText(/target −1/)).toBeTruthy()
  })
})

describe('glossaries per course', () => {
  it('defines terms from each course in that course only', () => {
    expect(lookupTerm('complex-systems', 'Preferential attachment')).toContain(
      'rich get richer',
    )
    expect(lookupTerm('complex-systems', 'Rule 90')).toContain('XOR')
    expect(lookupTerm('scientific-methods', 'p-value')).toContain(
      'null hypothesis',
    )
    expect(lookupTerm('scientific-methods', 'Stratified')).toContain('strata')
    expect(lookupTerm('machine-learning', 'Stratified')).toContain(
      'class proportions',
    )
    expect(lookupTerm('complex-systems', 'Stratified')).toBeUndefined()
    expect(lookupTerm('unknown-course', 'entropy')).toBeUndefined()
  })
})

describe('glossary hover terms', () => {
  it('defines known terms and ignores others', () => {
    expect(lookupTerm('machine-learning', 'internal node')).toContain(
      'tests one feature',
    )
    expect(lookupTerm('machine-learning', 'Hyperparameters')).toContain(
      'chosen before training',
    )
    expect(lookupTerm('machine-learning', 'Decision trees')).toContain(
      'series of questions',
    )
    expect(lookupTerm('machine-learning', 'Entropy')).toContain('uncertainty')
    expect(lookupTerm('machine-learning', 'not')).toBeUndefined()
  })
  it('renders a tooltip only for glossary readings', () => {
    const text =
      '## Trees\n\nAn **internal node** tests one feature, **zzz** no.'
    const { rerender } = render(
      <LectureReading text={text} glossary="machine-learning" />,
    )
    const tip = screen.getByRole('tooltip', { hidden: true })
    expect(tip.textContent).toContain('tests one feature')
    expect(screen.getAllByRole('tooltip', { hidden: true })).toHaveLength(1)
    rerender(<LectureReading text={text} />)
    expect(screen.queryAllByRole('tooltip', { hidden: true })).toHaveLength(0)
  })
})
