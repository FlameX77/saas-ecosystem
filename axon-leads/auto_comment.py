#!/usr/bin/env python3
"""
AXON Auto Comment — opens each post URL in Chrome, scrolls to comment box,
types comment slowly like a human, then STOPS and waits for you to press
ENTER to submit (or S to skip). Saves posted results to posted.csv.

Usage:
    python3 auto_comment.py batch_1.txt
    python3 auto_comment.py comments.csv     (reads comment_text column)
"""

import csv, os, re, sys, time, random, shutil
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

LEADS_DIR   = os.path.expanduser("~/axon-leads")
POSTED_FILE = os.path.join(LEADS_DIR, "posted.csv")
DELAY_MIN   = 30   # seconds between posts
DELAY_MAX   = 60

# ─────────────────────────────────────────────────────────
#  LOAD POSTS from batch_N.txt or comments.csv
# ─────────────────────────────────────────────────────────

def load_batch_txt(path):
    """Parse collect_fresh.py batch files."""
    posts = []
    current = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if line.startswith("--- LEAD"):
                if current.get("url"):
                    posts.append(current)
                current = {}
            elif line.startswith("URL: "):
                current["url"] = line[5:].strip()
            elif line.startswith("USERNAME: "):
                current["username"] = line[10:].strip()
            elif line.startswith("THEIR POST: "):
                current["title"] = line[12:].strip()
            elif line.startswith("PLATFORM: "):
                current["platform"] = line[10:].strip()
            elif line.startswith("EXCERPT: "):
                current["excerpt"] = line[9:].strip()
    if current.get("url"):
        posts.append(current)
    return posts


def load_comments_csv(path):
    """Load from comments.csv (has comment_text column)."""
    posts = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("url") and row.get("comment_text"):
                posts.append({
                    "url":      row["url"],
                    "username": row.get("username", ""),
                    "title":    row.get("complaint", "")[:80],
                    "platform": row.get("platform", ""),
                    "comment":  row["comment_text"],
                })
    return posts


def load_posts(path):
    if path.endswith(".txt"):
        return load_batch_txt(path)
    elif path.endswith(".csv"):
        return load_comments_csv(path)
    else:
        print(f"Unknown file type: {path}")
        sys.exit(1)


# ─────────────────────────────────────────────────────────
#  ALREADY POSTED tracking
# ─────────────────────────────────────────────────────────

def load_posted():
    seen = set()
    if os.path.exists(POSTED_FILE):
        with open(POSTED_FILE, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                seen.add(row.get("url", "").strip())
    return seen


def save_posted(url, username, title, status, comment):
    exists = os.path.exists(POSTED_FILE)
    with open(POSTED_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f,
            fieldnames=["url","username","title","status","date","comment"],
            quoting=csv.QUOTE_ALL)
        if not exists:
            writer.writeheader()
        writer.writerow({
            "url":      url,
            "username": username,
            "title":    title[:80],
            "status":   status,
            "date":     datetime.now().strftime("%Y-%m-%d %H:%M"),
            "comment":  comment[:200],
        })


# ─────────────────────────────────────────────────────────
#  DETECT PLATFORM
# ─────────────────────────────────────────────────────────

def detect_platform(url):
    if "reddit.com" in url:
        return "reddit"
    if "news.ycombinator.com" in url:
        return "hackernews"
    if "indiehackers.com" in url:
        return "indiehackers"
    return "unknown"


# ─────────────────────────────────────────────────────────
#  COMMENT SELECTORS per platform
# ─────────────────────────────────────────────────────────

REDDIT_COMMENT_BOX = [
    '[data-testid="comment-submission-form-richtext"] .DraftEditor-root',
    'div[data-test-id="comment-submission-form-richtext"]',
    '.commentarea .usertext-edit textarea',
    '#newcomment textarea',
    'div[contenteditable="true"]',
]

REDDIT_SUBMIT_BTN = [
    'button[type="submit"]:has-text("Comment")',
    'button:has-text("Comment")',
    'button[type="submit"]:has-text("Save")',
    '.usertext-buttons button.save',
]

HN_COMMENT_BOX    = ['textarea[name="text"]']
HN_SUBMIT_BTN     = ['input[type="submit"][value="add comment"]']

IH_COMMENT_BOX    = ['div[contenteditable="true"].ProseMirror',
                     'div[role="textbox"]']
IH_SUBMIT_BTN     = ['button:has-text("Post comment")',
                     'button:has-text("Submit")']


def type_slowly(locator, text, wpm=40):
    """Type text at ~wpm words per minute with human variance."""
    chars_per_second = (wpm * 5) / 60   # average word = 5 chars
    for char in text:
        locator.type(char)
        base = 1.0 / chars_per_second
        # slight randomness: 70%–130% of base delay
        delay = base * random.uniform(0.7, 1.3)
        # occasional longer pause at punctuation
        if char in ".!?,\n":
            delay += random.uniform(0.1, 0.4)
        time.sleep(delay)


# ─────────────────────────────────────────────────────────
#  POST ONE COMMENT
# ─────────────────────────────────────────────────────────

def post_comment(page, url, comment, platform):
    """
    Navigate to url, find comment box, type comment, then
    ask user to confirm before submitting.
    Returns: 'posted', 'skipped', 'failed'
    """
    try:
        print(f"\n  → Navigating to {url[:70]}...")
        page.goto(url, wait_until="domcontentloaded", timeout=25_000)
        time.sleep(2)

        # ── Find comment box ──────────────────────────────────────
        box = None
        selectors = {
            "reddit":      REDDIT_COMMENT_BOX,
            "hackernews":  HN_COMMENT_BOX,
            "indiehackers": IH_COMMENT_BOX,
        }.get(platform, REDDIT_COMMENT_BOX + HN_COMMENT_BOX + IH_COMMENT_BOX)

        for sel in selectors:
            try:
                loc = page.locator(sel).first
                if loc.count() > 0:
                    loc.scroll_into_view_if_needed(timeout=5_000)
                    box = loc
                    print(f"  ✓ Found comment box ({sel[:50]})")
                    break
            except Exception:
                continue

        if not box:
            print("  ✗ Could not find comment box — check the page manually")
            return "failed"

        # ── Scroll into view + click ─────────────────────────────
        box.scroll_into_view_if_needed()
        time.sleep(0.5)
        box.click()
        time.sleep(0.5)

        # ── Type slowly ──────────────────────────────────────────
        print(f"  ✎ Typing comment ({len(comment)} chars)...")
        type_slowly(box, comment, wpm=45)
        print("  ✓ Done typing")

        # ── Show comment for review ──────────────────────────────
        print(f"\n{'─'*60}")
        print("  COMMENT READY TO POST:")
        print(f"{'─'*60}")
        print(comment[:500])
        print(f"{'─'*60}")

        # ── Ask for confirmation ─────────────────────────────────
        answer = ""
        while answer not in ("", "s", "S"):
            answer = input("\n  Press ENTER to submit  |  S + ENTER to skip  > ").strip()
            if answer.upper() == "S":
                print("  ↷ Skipped.")
                return "skipped"
            elif answer == "":
                break

        # ── Find and click submit ────────────────────────────────
        submit_selectors = {
            "reddit":       REDDIT_SUBMIT_BTN,
            "hackernews":   HN_SUBMIT_BTN,
            "indiehackers": IH_SUBMIT_BTN,
        }.get(platform, REDDIT_SUBMIT_BTN + HN_SUBMIT_BTN + IH_SUBMIT_BTN)

        submitted = False
        for sel in submit_selectors:
            try:
                btn = page.locator(sel).first
                if btn.count() > 0:
                    btn.scroll_into_view_if_needed()
                    btn.click()
                    submitted = True
                    print(f"  ✓ Clicked submit ({sel[:40]})")
                    break
            except Exception:
                continue

        if not submitted:
            print("  ✗ Could not find submit button — submit manually in browser")
            input("  Press ENTER once you've submitted manually...")
            return "posted_manual"

        time.sleep(2)
        print("  ✓ Comment submitted!")
        return "posted"

    except PWTimeout:
        print(f"  ✗ Page load timeout")
        return "failed"
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return "failed"


# ─────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────

COMMENT_TEMPLATES = {
    "deliverability": (
        "Deliverability kills more campaigns than bad copy does. Three quick fixes:\n\n"
        "1. **Warmup before sending.** Fresh domains need 4–6 weeks of warmup — skipping this tanks your sender score immediately.\n"
        "2. **Plain text > HTML.** Formatted emails with images trigger spam filters. Write like a human, not a newsletter.\n"
        "3. **Check mail-tester.com** — gives you a real score and tells you exactly what's broken.\n\n"
        "I'm building [AXON](https://axon.so) which handles warmup + sending infrastructure automatically. "
        "Launching in 2 weeks with 40% founding member discount if useful."
    ),
    "reply_rate": (
        "Reply rates have cratered — but a few things still move the needle:\n\n"
        "1. **Lead quality > volume.** 30 emails to exactly the right people beats 3000 blasted broadly.\n"
        "2. **First line = their world, not yours.** Reference something specific to them before you pitch anything.\n"
        "3. **Follow-ups matter more than email #1.** 70% of replies come from emails 2–4.\n\n"
        "Building [AXON](https://axon.so) to solve exactly this — finds verified leads and writes genuinely personalised emails. "
        "Launching in 2 weeks, founding member spots open."
    ),
    "no_traction": (
        "The traction problem is almost always distribution, not product. What works early:\n\n"
        "1. **Do 50 manual outreaches before automating anything.** You need to know what language lands first.\n"
        "2. **Go where pain is loudest.** Forums, subreddits, Slack groups where your ICP already vents about the problem.\n"
        "3. **One tight case study > ten cold emails.** Even one result gives you something real to reference.\n\n"
        "Building [AXON](https://axon.so) for exactly this — AI that finds the right leads and writes personalised outreach. "
        "Launching in 2 weeks with 40% off for founding members."
    ),
    "lead_gen": (
        "Lead gen being this hard usually means the ICP is too broad. A few things that help:\n\n"
        "1. **Niche down harder.** 'B2B founders' is noise — 'SaaS founders who just posted a hiring ad' is a real signal.\n"
        "2. **Trigger-based beats cold lists.** Job posts, funding rounds, new hires = people with active budgets.\n"
        "3. **LinkedIn view before email** adds ~15% to reply rates in most tests.\n\n"
        "I'm building [AXON](https://axon.so) which automates finding leads by trigger and writes the outreach. "
        "2 weeks to launch, founding member pricing available."
    ),
    "default": (
        "This is one of the most common walls founders hit — a few things that actually move the needle:\n\n"
        "1. **Specificity is everything.** The more your message reflects their exact situation, the higher your reply rate.\n"
        "2. **Don't scale until it works manually.** Do 20 outreaches by hand first — you'll learn what language lands.\n"
        "3. **Multi-touch works.** Email + LinkedIn view + engaging with their content = 3x better than email alone.\n\n"
        "Building [AXON](https://axon.so) to automate exactly this — finds leads, writes personalised emails, handles follow-ups. "
        "Launching in 2 weeks with founding member pricing."
    ),
}


def pick_comment(post):
    """Pick the best template based on post title/excerpt."""
    text = (post.get("title","") + " " + post.get("excerpt","")).lower()
    if any(k in text for k in ["deliverability","spam","dkim","spf","bounce","inbox"]):
        return COMMENT_TEMPLATES["deliverability"]
    if any(k in text for k in ["reply rate","no replies","zero replies","open rate"]):
        return COMMENT_TEMPLATES["reply_rate"]
    if any(k in text for k in ["no traction","no customers","no revenue","zero mrr","no sales","no signups"]):
        return COMMENT_TEMPLATES["no_traction"]
    if any(k in text for k in ["lead gen","lead generation","finding leads","building a list"]):
        return COMMENT_TEMPLATES["lead_gen"]
    if any(k in text for k in ["marketing","struggling","clients","outreach","cold email"]):
        return COMMENT_TEMPLATES["default"]
    return COMMENT_TEMPLATES["default"]


def main():
    # ── Input file ───────────────────────────────────────────────
    if len(sys.argv) < 2:
        # Default: most recent batch file
        batches = sorted(
            [f for f in os.listdir(LEADS_DIR) if re.match(r"batch_\d+\.txt", f)],
            key=lambda x: int(re.search(r"\d+", x).group())
        )
        if not batches:
            print("No batch files found. Run collect_fresh.py first.")
            sys.exit(1)
        input_file = os.path.join(LEADS_DIR, batches[0])
    else:
        input_file = sys.argv[1]
        if not os.path.isabs(input_file):
            input_file = os.path.join(LEADS_DIR, input_file)

    print("=" * 60)
    print("  AXON Auto Comment")
    print("=" * 60)
    print(f"  File: {input_file}")

    posts = load_posts(input_file)
    already_posted = load_posted()

    # Filter out already-posted URLs
    queue = [p for p in posts if p["url"] not in already_posted]

    print(f"  Total posts   : {len(posts)}")
    print(f"  Already posted: {len(posts) - len(queue)}")
    print(f"  To post now   : {len(queue)}")

    if not queue:
        print("\n  Nothing new to post. All URLs already in posted.csv.")
        return

    # Attach comments if not already present (batch .txt files won't have them)
    for p in queue:
        if "comment" not in p:
            p["comment"] = pick_comment(p)

    # Preview queue
    print("\n  Posts queued:")
    for i, p in enumerate(queue, 1):
        print(f"  {i}. {p.get('username','?'):<20} — {p.get('title','')[:50]}")

    print()
    input("  Press ENTER to open Chrome and start posting...")

    # ── Browser ──────────────────────────────────────────────────
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=False,
            args=["--start-maximized"],
        )
        context = browser.new_context(viewport=None)
        page = context.new_page()

        # ── Login prompt ─────────────────────────────────────────
        first_platform = detect_platform(queue[0]["url"])
        login_urls = {
            "reddit":       "https://www.reddit.com/login",
            "hackernews":   "https://news.ycombinator.com/login",
            "indiehackers": "https://www.indiehackers.com/sign-in",
        }
        login_url = login_urls.get(first_platform, "https://www.reddit.com/login")

        print(f"\n  Opening {first_platform} login page...")
        page.goto(login_url, wait_until="domcontentloaded")

        print()
        print("╔══════════════════════════════════════════════════════╗")
        print("║  Log in to the platform in the Chrome window.       ║")
        print("║  Come back here and press ENTER when you're done.   ║")
        print("╚══════════════════════════════════════════════════════╝")
        input("\n  Press ENTER after logging in...")

        # ── Post loop ────────────────────────────────────────────
        posted_count  = 0
        skipped_count = 0
        failed_count  = 0

        for i, post in enumerate(queue, 1):
            url      = post["url"]
            username = post.get("username", "unknown")
            title    = post.get("title", "")
            comment  = post["comment"]
            platform = detect_platform(url)

            print(f"\n{'═'*60}")
            print(f"  [{i}/{len(queue)}]  u/{username}")
            print(f"  Platform : {platform}")
            print(f"  Post     : {title[:70]}")
            print(f"{'═'*60}")

            result = post_comment(page, url, comment, platform)

            save_posted(url, username, title, result, comment)

            if result in ("posted", "posted_manual"):
                posted_count += 1
            elif result == "skipped":
                skipped_count += 1
            else:
                failed_count += 1

            if i < len(queue) and result != "skipped":
                delay = random.randint(DELAY_MIN, DELAY_MAX)
                print(f"\n  ⏱  Waiting {delay}s before next post...")
                for remaining in range(delay, 0, -5):
                    print(f"     {remaining}s...", end="\r")
                    time.sleep(min(5, remaining))
                print(" " * 20, end="\r")

        browser.close()

    # ── Summary ──────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  DONE!")
    print(f"{'='*60}")
    print(f"  Posted   : {posted_count}")
    print(f"  Skipped  : {skipped_count}")
    print(f"  Failed   : {failed_count}")
    print(f"  Log      : ~/axon-leads/posted.csv")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
