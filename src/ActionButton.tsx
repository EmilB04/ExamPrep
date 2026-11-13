import { motion, useReducedMotion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'

export function ActionButton({
  whileHover,
  whileTap,
  transition,
  ...props
}: HTMLMotionProps<'button'>) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      whileHover={
        reduce || props.disabled ? undefined : whileHover || { y: -1 }
      }
      whileTap={
        reduce || props.disabled ? undefined : whileTap || { scale: 0.97 }
      }
      transition={transition || { type: 'spring', stiffness: 440, damping: 30 }}
      {...props}
    />
  )
}
