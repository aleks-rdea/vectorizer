import type { ReactNode } from 'react'

type PaneProps = {
  children?: ReactNode
  className?: string
}

export function Pane({ children, className }: PaneProps) {
  return (
    <div className={className ? `layout-pane ${className}` : 'layout-pane'}>
      {children}
    </div>
  )
}
