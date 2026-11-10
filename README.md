# Context Health Bar

A game-style health bar above the Claude Code prompt that shows how full your
context window is. The bar fills as you use context, the face gets more worried,
and it bursts once you pass the budget.

```text
💚 ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱  40k / 1000k
💛 ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱  120k / 1000k
❤️ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱  180k / 1000k
❤️ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰💥 250k / 1000k
```

The filled part runs green to amber to red. Past the budget the whole bar turns red.

## Install

```text
/plugin install context-health-bar --marketplace Reina234/context-health-bar
```

Say `y` to add the marketplace, pick a scope (user = all your sessions), done.
It loads automatically in every session after that.

From a shell: `claude plugin install context-health-bar --marketplace Reina234/context-health-bar`

## How it reads

- The bar is scaled to a **200k budget**, not the model's real limit. The real
  window still shows in the numbers on the right.
- Faces: 💚 under 50% of the budget, 💛 under 75%, ❤️ above that, then 😟 past
  300k, 😨 past 500k and 💀 past 750k.
- While Claude Code is still measuring, it shows a 🩺 and an empty bar.

## Change the budget

The budget is the `BUDGET` constant in `hooks/register.tsx`.
