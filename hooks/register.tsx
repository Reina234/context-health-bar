import type { Register } from 'claude-code'

const BAR_WIDTH = 16
const BUDGET = 200_000
const DEFAULT_WINDOW = 1_000_000
const OVER_BUDGET_COLOR = '#ef4444'

type BarCell = { char: string; color?: string; dim?: boolean }

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function fmtTokens(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0')
}

function mix(from: readonly number[], to: readonly number[], t: number): number[] {
  return from.map((value, i) => Math.round(value + ((to[i] ?? value) - value) * t))
}

function gradientHex(fraction: number): string {
  const green = [34, 197, 94]
  const amber = [234, 179, 8]
  const red = [239, 68, 68]
  const rgb =
    fraction < 0.5
      ? mix(green, amber, fraction / 0.5)
      : mix(amber, red, (fraction - 0.5) / 0.5)
  return `#${rgb.map(toHex).join('')}`
}

function barCells(percent: number, width: number, overrideColor?: string): BarCell[] {
  const filled = Math.round((clampPct(percent) / 100) * width)
  const cells: BarCell[] = []
  for (let i = 0; i < width; i += 1) {
    cells.push(
      i < filled
        ? { char: '▰', color: overrideColor ?? gradientHex(i / Math.max(1, width - 1)) }
        : { char: '▱', dim: true },
    )
  }
  return cells
}

function statusEmoji(tokens: number): string {
  if (tokens > 750_000) return '\u{1f480}'
  if (tokens > 500_000) return '\u{1f628}'
  if (tokens > 300_000) return '\u{1f61f}'
  const fraction = tokens / BUDGET
  if (fraction < 0.5) return '\u{1f49a}'
  if (fraction < 0.75) return '\u{1f49b}'
  return '❤️'
}

export const register: Register = on => {
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const usage = await $.session.usage().catch(() => null)
    if (usage === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const rawTokens = usage.context.tokens
    const measuring = rawTokens === undefined
    const used = rawTokens ?? 0
    const limit = usage.context.window ?? DEFAULT_WINDOW
    const percent = clampPct((used / BUDGET) * 100)
    const over = used > BUDGET

    const columns = e.viewport?.columns
    const width = columns !== undefined ? Math.max(1, columns - 5) : undefined

    return (
      <Box width={width} justifyContent="flex-end">
        <Text>{`${measuring ? '🩺' : statusEmoji(used)} `}</Text>
        {measuring
          ? Array.from({ length: BAR_WIDTH }).map((_, i) => (
              <Text key={`bar-${i}`} dimColor>
                {'▱'}
              </Text>
            ))
          : barCells(percent, BAR_WIDTH, over ? OVER_BUDGET_COLOR : undefined).map((cell, i) => (
              <Text key={`bar-${i}`} color={cell.color} dimColor={cell.dim}>
                {cell.char}
              </Text>
            ))}
        {!measuring && over && <Text>{'💥'}</Text>}
        <Text dimColor>{measuring ? '  measuring…' : `  ${fmtTokens(used)} / ${fmtTokens(limit)}`}</Text>
        <Text>{' '}</Text>
      </Box>
    )
  })
}
