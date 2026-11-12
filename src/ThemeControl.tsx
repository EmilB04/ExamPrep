import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from './theme'
import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'
import { ActionButton } from './ActionButton'

export function ThemeControl() {
  const { preference, chooseTheme } = useTheme()
  const id = useId()
  const reduce = useReducedMotion()
  return (
    <div className="theme-control" role="group" aria-label="Color theme">
      {[
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
      ].map(({ value, label, icon: Icon }) => (
        <ActionButton
          key={value}
          type="button"
          aria-label={`${label} theme`}
          aria-pressed={preference === value}
          title={`${label} theme`}
          onClick={() => chooseTheme(value as 'light' | 'dark' | 'system')}
        >
          {preference === value && (
            <motion.span
              className="theme-slider"
              layoutId={reduce ? undefined : `theme-selection-${id}`}
              transition={{ type: 'spring', stiffness: 460, damping: 35 }}
            />
          )}
          <Icon size={16} />
          <span className="theme-label">{label}</span>
        </ActionButton>
      ))}
    </div>
  )
}
