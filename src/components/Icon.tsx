import type { CSSProperties, ReactElement } from 'react'

type IconProps = {
  name: string
  /** 0 = outline, 1 = filled (Material Symbols FILL axis) */
  fill?: 0 | 1
  'aria-label'?: string
  className?: string
  style?: CSSProperties
}

/**
 * Thin wrapper around Google Material Symbols font.
 */
export function Icon({ name, fill = 0, className, style, ...rest }: IconProps): ReactElement {
  return (
    <span
      className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
      aria-hidden={rest['aria-label'] ? undefined : true}
      style={{
        fontVariationSettings: `"FILL" ${fill}, "wght" 400, "GRAD" 0, "opsz" 24`,
        ...style,
      }}
      {...rest}
    >
      {name}
    </span>
  )
}

