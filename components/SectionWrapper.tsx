'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionWrapperProps {
  children: ReactNode
  id?: string
  className?: string
  style?: React.CSSProperties
  delay?: number
}

export default function SectionWrapper({ children, id, className = '', style, delay = 0 }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay }}
    >
      {children}
    </motion.section>
  )
}

