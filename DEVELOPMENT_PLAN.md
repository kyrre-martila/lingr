# Lingr — Development Plan (Run 7 Reset)

## Run 7 scope
Documentation-first alignment for Lingr chat.

This run **does not** implement backend or frontend features.
This run **does not** redesign UI.

## New chat direction
Lingr chat is now the default first-stage connection space.

Chat should feel:
- calm
- low-pressure
- warm
- intentional
- familiar enough to feel natural

Chat must avoid:
- online indicators
- typing indicators
- last seen
- read receipts
- per-message timestamps
- urgency mechanics
- addictive messaging patterns

## Structural decisions
1. **Normal chat first**: a clean message interface with subtle Lingr styling.
2. **Window later**: Window is no longer the early chat experience.
3. **Deeper later**: Window becomes a later-stage, more exclusive mutual concept.

## Input model
Message composer includes a **+** button at bottom-left.

Pressing **+** opens first-level choices:
- Apps
- Playing now

Apps includes:
- Match Cards
- Guess Me
- Snuggle

Playing now includes:
- Song
- Movie
- TV Series

## Playing now philosophy
Playing now is a lightweight, in-the-moment share for what someone is into right now.

It is:
- not a permanent profile preference
- a natural conversation spark
- represented as lightweight cards inside chat

## Message type contract (documentation baseline)
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

## Deferred implementation concerns
- Real-time transport decisions for message delivery status beyond basic send/receive
- Attachment pipeline details beyond defined card types
- Moderation and safety policy integration for app-in-chat surfaces
- Window gating mechanics and migration from current assumptions
- Notification strategy that keeps low-pressure principles intact
