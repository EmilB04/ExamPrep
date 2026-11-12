import { motion } from 'motion/react'

export function ConceptPattern() {
  const rows: number[][] = [
    Array.from({ length: 31 }, (_, i) => (i === 15 ? 1 : 0)),
  ]
  for (let i = 1; i < 16; i++)
    rows.push(
      rows[i - 1].map((_, j, row) => (row[j - 1] || 0) ^ (row[j + 1] || 0)),
    )
  return (
    <div className="concept-pattern" aria-hidden="true">
      <div className="pattern-label">
        <span>LOCAL RULES</span>
        <span>RULE 90</span>
      </div>
      <motion.div
        className="pattern-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {rows.flatMap((row, i) =>
          row.map((cell, j) => (
            <i key={`${i}-${j}`} className={cell ? 'on' : ''} />
          )),
        )}
      </motion.div>
      <div className="pattern-caption">
        <span className="status-dot" />A pattern emerges.
      </div>
    </div>
  )
}
