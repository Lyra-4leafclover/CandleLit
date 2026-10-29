# History

[← back to AGENTS.md](AGENTS.md)

Every request from the build chat, oldest first, with what was done. Add a new entry at the bottom after each message.

## v1: first build and redesign

1. **Idea:** a candle that melts through the pomodoro, candles displayed on cakes, cakes bought with flames earned from sessions; asked for more ideas. → Suggested: candle length by session length, half-melted stubs for quitting early, a full cake saved to a Bakery, wax sculptures on breaks, rarity tiers, seasonal drops, study parties.
2. **"Add them all", but the cake is hidden during the timer like Forest's forest.** → First build: timer, melting SVG candles, Bakery, shop, Wax Studio, parties. Cake only shown after sessions.
3. **Candles should be creative (reference images); UI is random, not cozy.** → Pastel redesign with illustrated candles, holders and decorations. See [design.md](design.md#ui-direction).
4. **Weekly / monthly / yearly stats with graphs, and a to-do list with mandatory tags linked to pomodoros.** → Stats by tag only, to-do with required tags.
5. **Remove "Light a candle for a cause", make tags and tasks editable, better 3D cakes (keep the old version to revert).** → 3D cakes with a Classic toggle, tag `cakes-classic`.
6. **Make everything functional, especially Study Party; login screen; premium ideas; dark mode.** → Accounts with server sync, party chat/cheers/host transfer, dark mode, premium ideas list.
7. **Pick candle and cake before a party timer, many more candles (faerie, mermaid, carved), add all premium features without a paywall (no sync/widgets).** → 15 themed candles, streak freeze, goals, insights, CSV, engraving, presets, ambience pack, accents, scenes, permanent rooms, leaderboard.
8. **Window/garden/night scenes are basic; add pumpkin, seashell and tamagotchi-shaped candles; more patterns; more figurine candles like Cherub's Wish.** → Illustrated scenes, shaped candles, 14 new patterns, figurine candles.
9. **Shaped candles look like PNGs being burnt; redo mermaid and moon fairy; colour wheel for Top/Bottom/Accent; a better mushroom candle.** → 3D molded shaped candles, redrawn figurines, colour wheel, Enchanted Toadstool.
10. **Pumpkin and shells look squished; toadstool looks AI generated.** → Poured vessel candles (ceramic pumpkin, scallop shell), hand-drawn toadstool.
11. **"Pumpkin looks cursed"; is SVG the only option, can you make real art?** → Explained image generation is possible.
12. **Make another pumpkin version and multiple shells without removing anything.** → Painted watercolor pumpkin, scallop, clam, conch and abalone added alongside the SVG ones.
13. **4,000 flames for testing.** → Added to her account.
14. **Melting only shrinks; needs multiple animated melt stages. Likes the painted version; save this version.** → 6 melt stages, live wax animation; project zip sent.

## v2 → v3: painted everything, two art modes

15. **Remove the shadow of the previous stage behind the melt.** → Stage ghost removed; top-down wipe instead.
16. **Send the v2 zip; make v3 with all cakes and candles painted.** → v2 zip (`painted-v2`); v3 painted all 40 remaining candles and the cakes.
17. **Two modes (painted and SVG), everything made in both; 40 Wax Studio options in painted style; SVG flame on painted candles looks bad.** → Art modes, painted Wax Studio parts, painted flame.
18. **Mode switch in the top bar with better names; Wax Studio options don't apply; share card background ignores the chosen scene; painted wallpapers; real recorded sounds; animate all sparkles; responsive site.** → Watercolor / Classic switch, studio fixed, scene-aware card, watercolor scenes, recorded audio, animated sparkles, responsive layout.
19. **100,000 flames for testing.** → Added.
20. **Watercolor studio uses only the Top colour; Classic patterns invisible on dark colours; what does scent do; PNG download broken; delete presets and poured candles (no refund); 5,000 drips; how to make Study Party work.** → All three colours, contrast helper, working download, delete actions, drips added.
21. **Focus controls above the candle list; recent → new → old candle order; deleting a tag keeps stats with keep/delete-tasks choice; patterns too tiny; 5,000 drips.** → Done, plus versioned state sync.
22. **Revert the Wax Studio pattern change for Classic only.** → Reverted in Classic.
23. **"You reverted too much, where's ombre?"** → Clarifying question asked.
24. **Chose: add ombre, stripes, spiral, sparkle to Watercolor.** → Started.
25. **"Wait, I meant in Classic."** → Restored the original Classic patterns (`1cc4c96`).

## v4: themes, accounts, deployment

26. **"Cake in the oven" unreadable in dark mode; make v4; Study Party → "Coming soon".** → v4 created as a separate copy; label fixed; Coming soon page.
27. **Gothic, Emo, Halloween, Christmas, Cottagecore, Gamer and Minecraft candles, cakes and scenes, in both modes.** → 14 candles, 7 cakes, 7 scenes.
28. **Watercolor cakes turned into Classic ones; restore them.** → A saved cake-style setting was overriding them; Watercolor now always shows painted cakes.
29. **More candles and cakes for these themes; gamer candles make no sense in Classic; add Chess and sports themes.** → 14 more candles + 7 cakes, gamer patterns, Chess/Soccer/Basketball/Tennis/Baseball/Volleyball/Golf.
30. **New Classic themed cakes don't make sense; Watercolor is good.** → 21 Classic cakes redrawn with theme motifs.
31. **20,000 flames.** → Added to local accounts.
32. **Add flames to guest; forgot the test login.** → Guest data is browser-only; reset local test accounts to a temporary password.
33. **The login didn't work.** → She was on another version's preview; password set on all versions.
34. **Candles float above the Bakery cakes.** → Candles placed on the real top surface of the theme cakes.
35. **Still floating like random emojis; PNG download still broken, because not deployed?** → Repainted six cake tops flat, smaller grounded candles with shadows; download blocked by the preview iframe, added an "Open image" fallback.
36. **Login and signup with email and password only, no OAuth.** → Done; old username accounts still sign in.
37. **Top/Bottom/Accent unreadable in dark mode; does CSV export work; how to deploy to GitHub and Vercel?** → Fixed labels; CSV verified; explained Render/Railway vs Vercel + free database.
38. **Chose Vercel with a free hosted database.** → `server.py` supports Postgres; `api/index.py` Vercel function; migration script.
39. **Connected GitHub and created the CandleLit repo.** → Pushed v4 to `main`.
40. **Can't find the database option in Vercel.** → Steps for Storage → Neon.
41. **Site too big for the device, timer hidden; remove demo mode; push to GitHub with rollback.** → Fit-to-screen, demo speed removed, tag `pre-fit-v4`.
42. **What to do about the database; add a Connect tab with GitHub, X and portfolio.** → Use the `DATABASE` prefix (app also accepts `STORAGE_URL`); Connect tab added.
43. **"Don't adjust to my screen, make it responsive like normal websites"; Production/Preview ticks.** → Proportional `--z` scaling, capped cake sizes, tag `pre-zoom-v4`; live database confirmed reachable.
44. **"I made one check."** → Either tick works for the main site.
45. **"I made an account, check if it worked."** → No database access; gave self-check steps.
46. **How to check in Neon.** → Tables → `users` or an SQL query.
47. **Aesthetic README and a demo video for X.** → README with screenshots pushed; 1:53 MP4; login page full-height fix (`pre-authfix-v4`).
48. **Text for an X post within the free character limit.** → Three options, see [marketing.md](marketing.md#x-post-copy-free-x-280-characters-a-link-counts-as-23).
49. **Logo for Product Hunt.** → Candle app icon, 240/512/1024 PNGs + SVG; see [marketing.md](marketing.md#product-hunt-logo).
50. **Guests aren't counted; add a visitor counter, 1 per IP.** → `visitors` table with hashed IPs, `/api/visit`, guest flag, Neon query; tag `pre-visits-v4`. See [architecture.md](architecture.md#visitor-counter).
51. **Create a memory folder with AGENTS.md linking everything, updated every message.** → This folder.
