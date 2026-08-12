# Canva flow — exact tool sequence

**Access boundary (important):** C&C master templates are owned by Coffee & Contracts, so the connector cannot open or copy them directly — `get-design-pages` and `copy-design` both return *"Not allowed to access design."* The agent must create their own editable copy first (the connector works fine on designs the agent owns).

1. **Agent makes their copy** — send them the post's Canva link and ask them to click **"Use template."** An editable copy lands in their Canva; get the link to *their* copy.
   - If it's a `canva.link/{id}` shortlink, call `resolve-shortlink` to get the design URL, then extract the design ID. Otherwise the ID is in the `canva.com/design/{id}` URL.

2. **Read the pages** — `get-design-pages` on their copy to see the light-roast and dark-roast page sets. Confirm the style choice with the agent.

3. **Keep one style** — `copy-design` with `page_numbers` set to just the chosen style's pages → a clean design containing only that style (the other is dropped). Use this new design for editing.

4. **Edit the text** — `start-editing-transaction`, then `perform-editing-operations` using `find_and_replace_text` / `replace_text` for copy and `update_fill` to swap images, then `commit-editing-transaction`. Changes are DRAFT until committed.
   - On pages where `is_responsive` is true, only `update_title`, `replace_text`, `update_fill`, `delete_element`, and `find_and_replace_text` are supported.

5. **Photos** — agent uploads their own, or use `upload-asset-from-url` for free stock; `get-assets` to pull from the agent's brand-photo Canva folder. Insert with `insert_fill` / `update_fill`, then commit.

6. **Hand off** — give the agent the edit link to their finished design plus the customized caption.
