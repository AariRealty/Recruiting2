# Coffee & Contracts data sources

All data is accessed through the connected Coffee & Contracts MCP tools (no raw HTTP calls needed). Use the tool names below directly.

## Linking to a post

Every Coffee & Contracts post and guide opens at `https://coffeecontracts.com/post/{slug}`. Build this link from each post's `slug` and put it on every recommended item in the dashboard.

## WHAT'S WORKING — Instagram analytics

| Purpose | Tool |
| --- | --- |
| **Account summary** — follower count, reach, interactions, and percent-change trends over the last 30 days | `get_instagram_summary` |
| **Post performance** — published posts with reach, views, likes, comments, shares, saves (sorted by reach by default; supports `sort_by` to rank by any metric; default limit 10, max 50) | `get_instagram_posts` |
| **Posting frequency** — total posts and average posts per week over the last 30 days | `get_instagram_posting_frequency` |

> Call `get_instagram_summary` first for the account-level trend snapshot. Then call `get_instagram_posts` to get the top-performing posts with their captions — this is where you read the agent's real hook voice and identify what's outperforming. The summary covers the last 30 days; when the skill refers to "last week," use the most recent posts from `get_instagram_posts` to identify the recent top and bottom performers.

## CONTENT MENU — this week's content

| Purpose | Tool |
| --- | --- |
| **Weekly content drops** — new posts grouped by week; defaults to current month; set `include_posts: true` (default) to get full post data in one call | `get_content_drops` |
| **Agent's scheduled posts** — their calendar; filter with `start_date`/`end_date` for the coming 7 days, or `month` for the whole month | `get_content_calendar` |
| **Single post with full detail** — title, caption, canvaUrl, instructions, photos, pillar, type | `get_post(slug_or_id)` |

> `get_content_drops` with `include_posts: true` (the default) returns the full drop for the current week without a second call per post — use it that way. Only call `get_post` when you need extra detail on a specific post not covered by the drop response.

## CONTENT STRATEGY — supporting context

| Purpose | Tool |
| --- | --- |
| **Trending posts** — most favorited/used recently; pass `trending: true` to `get_posts` | `get_posts(trending: true)` |
| **Trending reels** — top reels and dashboard posts for this week | `get_trending_reels` |
| **Content pillars** — full list with live post counts | `list_content_pillars` |

## THIS WEEK'S EXTRAS — the Content Vault (off-social)

Filter by content type using `get_posts(content_type: "...")` or search with `search_content(query: "...")`. List available types with `list_content_types`. The off-social types to draw from:

| Content type | Use for |
| --- | --- |
| Email Template | newsletters, drip, monthly send |
| Story Template | Instagram Stories |
| Lead Magnets | opt-ins to grow the email list |
| Marketing Campaigns | seasonal/themed multi-asset campaigns (incl. the monthly newsletter) |
| Landing Page | opt-in / listing pages |
| Buyer/Seller Client Resources, Guides & Presentations | guides, checklists, worksheets to send clients |

Link every item at `https://coffeecontracts.com/post/{slug}`.

> **Time-of-month rule:** if today is within ~5 days of the 1st (start or end of a month), prioritize the monthly newsletter (`get_posts(content_type: "Marketing Campaigns")` or `get_posts(content_type: "Email Template")`). Otherwise pick 2–4 vault items matched to the agent's focus and season.

## Customization context

| Purpose | Tool |
| --- | --- |
| **Profile** — name, market, client types, voice/market profile | `get_my_profile` |
