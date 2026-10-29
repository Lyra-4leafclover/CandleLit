# Product

[← back to AGENTS.md](AGENTS.md)

## Concept

Inspired by the "studying until my candle melts" trend and the Forest app. You pick a candle and start a pomodoro, and the candle melts until the timer ends. Finished candles go on a cake, and a full cake is saved to the **Bakery** (like Forest's forest). Sessions earn **flames** (main currency), which buy candles, cakes, toppers and scenes. **Wax drips** are a second currency used to pour custom candles in the Wax Studio (25 drips per pour).

## Product rules from the owner

- **Cake hidden during focus:** the cake is never visible while the timer runs. It shows on the result screen after the session and in the Bakery.
- **Abandoned sessions:** a candle blown out early stays on the cake half-melted (like a dead tree in Forest).
- **Tasks need tags:** every to-do task must have a tag, and tasks can be linked to a pomodoro. Stats are grouped by tag, never by individual task ("u cant show tasks in stats").
- **Deleting a tag never removes its stats history.** The user chooses whether to keep or delete that tag's tasks, and the tag colour is frozen in `tagColors`.
- **Focus layout:** task, tag, ambience and "Light the candle" sit above the candle list, so a long collection doesn't need scrolling.
- **Candle order:** recently used first (`state.recent`), then newest bought (`state.acquired`), then oldest. No filters on the Focus page.
- **Deleting Wax Studio items:** saved presets and poured candles can be deleted. Poured candles don't refund drips and are soft-deleted (`deleted: true`) so old cakes still render them.
- **"Light a candle for a cause"** was removed at the owner's request.
- **No paywall yet:** premium features are built and unlocked for everyone. Sync and widgets were explicitly skipped.
- **Study Party is "Coming soon"** in v4. Rooms were in-memory, which doesn't work on serverless Vercel. Bringing it back needs a realtime service.
- **Accounts use email + password only.** No OAuth for now (the owner didn't want to set it up). Minimum password length is 8. There's no password-reset email yet.
- **Guests:** "Continue as guest" keeps progress in localStorage only. Guests are counted by the visitor counter (see [architecture.md](architecture.md#visitor-counter)).
- **No demo speed control** in the deployed site: a minute is always a real minute.
- **Connect tab** in the top bar links to the owner's GitHub, X and portfolio.

## Features (v4)

- **Focus:** durations, task + tag, ambience (real recorded audio), candle picker, melting candle with animated sparkles, distraction tracking.
- **Result + break:** rewards (flames, drips), break timer, wax sculptures from drips.
- **Bakery:** today's cake, scene picker, cake design, toppers, gallery of finished cakes, share card exported as PNG.
- **Shop:** candles, cakes, toppers and scenes grouped by collection, with "New drop" tags.
- **Wax Studio:** custom candles with body, holder, pattern, decorations and a colour wheel for Top / Bottom / Accent. Presets can be saved and deleted.
- **To-do:** tasks with mandatory tags, editable tags and tasks.
- **Stats:** week / month / year, charts by tag, heatmap, insights, goals, streak freeze, CSV export.
- **Themes:** Gothic, Emo, Halloween, Christmas, Cottagecore, Gamer, Minecraft, Chess, Soccer, Basketball, Tennis, Baseball, Volleyball and Golf, plus earlier faerie, mermaid, carved and figurine candles.
- **Dark mode**, **Watercolor / Classic art modes**, responsive layout.
