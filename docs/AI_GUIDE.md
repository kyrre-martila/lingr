# Lingr — AI Guide

Read this before proposing or implementing product changes.

## Product intent
Lingr is a slow dating app built for intentional emotional pacing.

Always optimize for:
- calmness
- warmth
- low pressure
- emotional safety
- meaningful reciprocity

Never optimize for:
- compulsive engagement
- urgency loops
- addictive interaction patterns

## Chat-first direction (Run 7)
Early connection experience is now standard calm chat.

### Chat tone requirements
Chat should feel:
- calm
- low-pressure
- warm
- intentional
- familiar enough to feel natural

### Explicitly prohibited in chat
Do not add:
- online indicators
- typing indicators
- last seen
- read receipts
- per-message timestamps
- urgency mechanics
- addictive messaging patterns

## Chat structure rules
Default chat includes:
- clean message interface
- subtle Lingr palette styling
- no pressure mechanics

Composer behavior:
- include **+** button at bottom-left next to message field

On **+** press, first level options:
- Apps
- Playing now

Apps list:
- Match Cards
- Guess Me
- Snuggle

Playing now list:
- Song
- Movie
- TV Series

## Playing now philosophy
Playing now is conversational context about what a person is into **right now**.

It is:
- temporary-feeling
- lightweight
- shareable as in-chat cards

It is not:
- a permanent profile preference
- a scoring mechanic
- a compatibility ranking system

## Message type vocabulary
Use these message types in docs/contracts:
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

## Window lifecycle policy
Window is no longer part of the early chat experience.

Window is a later-stage, mutually chosen deeper mode.

Design principle:
- normal chat first
- deeper exclusivity later

## Delivery rules for contributors
For this phase, documentation-first changes only.
Do not implement backend/frontend chat features until documentation alignment is approved.
Do not redesign UI while defining this direction.
