#!/usr/bin/env python3
"""
AXON Human Sender — posts personalised comments with human-like
typing speed, randomised delays, and batch breaks.

Usage:
    python3 human_sender.py                    # uses leads_1000.csv
    python3 human_sender.py batch_1.txt        # uses a batch file
    python3 human_sender.py leads_1000.csv     # explicit CSV
"""

import csv, os, re, sys, time, random, shutil
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

LEADS_DIR    = os.path.expanduser("~/axon-leads")
SENT_LOG     = os.path.join(LEADS_DIR, "sent_log.csv")
BATCH_SIZE   = 10
BATCH_BREAK_MIN = 8 * 60   # 8 minutes
BATCH_BREAK_MAX = 15 * 60  # 15 minutes

# ─────────────────────────────────────────────────────────────
#  COMMENT TEMPLATES  (keyed by topic)
# ─────────────────────────────────────────────────────────────

def pick_comment(title, complaint):
    text = (title + " " + complaint).lower()

    if any(k in text for k in ["deliverability","spam folder","bounce","dkim","spf","inbox","mail-tester"]):
        return (
            "Deliverability kills more campaigns than bad copy does. Three quick fixes:\n\n"
            "1. **Warmup before sending.** Fresh domains need 4–6 weeks of warmup — skipping this tanks your sender score immediately.\n"
            "2. **Plain text > HTML.** Formatted emails with images trigger spam filters. Write like a human, not a newsletter.\n"
            "3. **Check mail-tester.com** — gives you a real score and tells you exactly what's broken.\n\n"
            "I'm building AXON (axon.so) which handles warmup + sending infrastructure automatically. "
            "Launching in 2 weeks with 40% founding member discount if useful."
        )

    if any(k in text for k in ["reply rate","no replies","zero replies","open rate","response rate","not converting"]):
        return (
            "Reply rates have cratered — but a few things still move the needle:\n\n"
            "1. **Lead quality > volume.** 30 emails to exactly the right people beats 3000 blasted broadly.\n"
            "2. **First line = their world, not yours.** Reference something specific to them before you pitch anything.\n"
            "3. **Follow-ups matter more than email #1.** 70% of replies come from emails 2–4.\n\n"
            "Building AXON (axon.so) to solve exactly this — finds verified leads and writes genuinely personalised emails. "
            "Launching in 2 weeks, founding member spots open."
        )

    if any(k in text for k in ["lead gen","lead generation","finding leads","building a list","verified leads"]):
        return (
            "Lead gen being this hard usually means the ICP is too broad. A few things that help:\n\n"
            "1. **Niche down harder.** 'B2B founders' is noise — 'SaaS founders who just posted a hiring ad' is a real signal.\n"
            "2. **Trigger-based beats cold lists.** Job posts, funding rounds, new hires = people with active budgets.\n"
            "3. **LinkedIn view before email** adds ~15% to reply rates in most tests.\n\n"
            "I'm building AXON (axon.so) which automates finding leads by trigger and writes the outreach. "
            "2 weeks to launch, founding member pricing available."
        )

    if any(k in text for k in ["no traction","no customers","zero customers","no revenue","no signups","no sales","zero mrr"]):
        return (
            "The traction problem is almost always distribution, not product. What works early:\n\n"
            "1. **Do 50 manual outreaches before automating anything.** You need to know what language lands first.\n"
            "2. **Go where pain is loudest.** Forums, subreddits, Slack groups where your ICP already vents about the problem.\n"
            "3. **One tight case study > ten cold emails.** Even one result gives you something real to reference.\n\n"
            "Building AXON (axon.so) for exactly this — AI that finds the right leads and writes personalised outreach. "
            "Launching in 2 weeks with 40% off for founding members."
        )

    if any(k in text for k in ["can't get clients","getting clients","no clients","find clients","freelance"]):
        return (
            "Getting clients without a warm network is genuinely hard — what works:\n\n"
            "1. **Pitch an outcome, not a service.** 'I help SaaS companies cut churn by 20%' beats 'I do product design'.\n"
            "2. **Monitor where the pain is.** Reddit/Slack/forums where people actively ask for help are gold.\n"
            "3. **One strong referral from a happy client is worth 100 cold emails.**\n\n"
            "I'm launching AXON (axon.so) in 2 weeks — AI outreach that finds prospects and writes messages that land. "
            "Founding member discount available."
        )

    # Default
    return (
        "This is one of the most common walls founders hit — a few things that actually move the needle:\n\n"
        "1. **Specificity is everything.** The more your message reflects their exact situation, the higher your reply rate.\n"
        "2. **Don't scale until it works manually.** Do 20 outreaches by hand first — you'll learn what language lands.\n"
        "3. **Multi-touch works.** Email + LinkedIn view + engaging with their content = 3x better than email alone.\n\n"
        "Building AXON (axon.so) to automate exactly this — finds leads, writes personalised emails, handles follow-ups. "
        "Launching in 2 weeks with founding member pricing."
    )


# ─────────────────────────────────────────────────────────────
#  LOAD LEADS
# ─────────────────────────────────────────────────────────────

def load_leads_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("url"):
                rows.append(row)
    return rows


def load_batch_txt(path):
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
                current["complaint"] = line[9:].strip()
    if current.get("url"):
        posts.append(current)
    return posts


def load_sent_urls():
    seen = set()
    if os.path.exists(SENT_LOG):
        with open(SENT_LOG, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                seen.add(row.get("url","").strip())
    return seen


def append_log(url, username, title, status, delay_used, comment):
    exists = os.path.exists(SENT_LOG)
    with open(SENT_LOG, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f,
            fieldnames=["url","username","title","time_sent","delay_used","status","comment"],
            quoting=csv.QUOTE_ALL)
        if not exists:
            w.writeheader()
        w.writerow({
            "url":        url,
            "username":   username,
            "title":      (title or "")[:80],
            "time_sent":  datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "delay_used": f"{delay_used:.0f}s",
            "status":     status,
            "comment":    (comment or "")[:150],
        })


# ─────────────────────────────────────────────────────────────
#  PLATFORM DETECTION
# ─────────────────────────────────────────────────────────────

def detect_platform(url):
    if "reddit.com" in url:
        return "reddit"
    if "ycombinator.com" in url:
        return "hackernews"
    if "indiehackers.com" in url:
        return "indiehackers"
    return "reddit"


# ─────────────────────────────────────────────────────────────
#  TYPING  (human-speed, ~50-150ms per char)
# ─────────────────────────────────────────────────────────────

def type_human(locator, text):
    for char in text:
        locator.type(char)
        delay = random.uniform(0.045, 0.14)
        if char in ".!?,\n":
            delay += random.uniform(0.1, 0.45)
        elif char == " ":
            delay += random.uniform(0.0, 0.08)
        time.sleep(delay)


# ─────────────────────────────────────────────────────────────
#  COUNTDOWN TIMER  (live, inline)
# ─────────────────────────────────────────────────────────────

def countdown(seconds, label="Next post in"):
    start = time.time()
    while True:
        elapsed = time.time() - start
        remaining = max(0, seconds - elapsed)
        mins = int(remaining) // 60
        secs = int(remaining) % 60
        if mins > 0:
            display = f"{mins}m {secs:02d}s"
        else:
            display = f"{secs}s"
        print(f"  ⏱  {label} {display}...   ", end="\r", flush=True)
        if remaining <= 0:
            break
        time.sleep(0.5)
    print(" " * 50, end="\r")


# ─────────────────────────────────────────────────────────────
#  POST ONE COMMENT
# ─────────────────────────────────────────────────────────────

REDDIT_BOX = [
    '[data-testid="comment-submission-form-richtext"] .DraftEditor-root',
    'div[contenteditable="true"][role="textbox"]',
    '.commentarea .usertext-edit textarea',
    '#newcomment textarea',
    'div[contenteditable="true"]',
]
REDDIT_SUBMIT = [
    'button[type="submit"]:has-text("Comment")',
    'button:has-text("Comment")',
    'button[type="submit"]:has-text("Save")',
    '.save',
]
HN_BOX    = ['textarea[name="text"]']
HN_SUBMIT = ['input[type="submit"][value="add comment"]']
IH_BOX    = ['div[contenteditable="true"].ProseMirror', 'div[role="textbox"]']
IH_SUBMIT = ['button:has-text("Post comment")', 'button:has-text("Submit")']


def try_find(page, selectors, timeout=6000):
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            if loc.count() > 0:
                loc.scroll_into_view_if_needed(timeout=timeout)
                return loc
        except Exception:
            continue
    return None


def post_comment(page, url, comment, platform, pre_delay):
    """
    Navigate, pre-delay, type slowly, then confirm before submitting.
    Returns: 'posted', 'skipped', 'failed'
    """
    try:
        print(f"    → Loading page...")
        page.goto(url, wait_until="domcontentloaded", timeout=25_000)
        time.sleep(1.5)

        # Pre-submission human delay (randomised, shown as countdown)
        print(f"    → Human pause before typing...")
        countdown(pre_delay, "Starting in")

        # Find comment box
        box_selectors = {
            "reddit":       REDDIT_BOX,
            "hackernews":   HN_BOX,
            "indiehackers": IH_BOX,
        }.get(platform, REDDIT_BOX + HN_BOX + IH_BOX)

        box = try_find(page, box_selectors)
        if not box:
            print("    ✗ Comment box not found")
            return "failed"

        box.click()
        time.sleep(random.uniform(0.3, 0.8))

        print(f"    ✎ Typing {len(comment)} chars at human speed...")
        type_human(box, comment)
        print(f"    ✓ Done typing")

        # Show comment preview + confirm
        print(f"\n    {'─'*52}")
        preview = comment[:300].replace("\n", " | ")
        print(f"    {preview}")
        print(f"    {'─'*52}")

        answer = input("\n    ENTER = submit  |  S = skip  > ").strip().upper()
        if answer == "S":
            print("    ↷ Skipped")
            return "skipped"

        # Find submit button
        sub_selectors = {
            "reddit":       REDDIT_SUBMIT,
            "hackernews":   HN_SUBMIT,
            "indiehackers": IH_SUBMIT,
        }.get(platform, REDDIT_SUBMIT + HN_SUBMIT + IH_SUBMIT)

        btn = try_find(page, sub_selectors)
        if btn:
            btn.click()
            time.sleep(2)
            print("    ✓ Submitted!")
            return "posted"
        else:
            print("    ✗ Submit button not found — submit manually then press ENTER")
            input("    ENTER when submitted...")
            return "posted_manual"

    except PWTimeout:
        print("    ✗ Page timeout")
        return "failed"
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return "failed"


# ─────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────

def main():
    # ── Input ────────────────────────────────────────────────
    if len(sys.argv) >= 2:
        arg = sys.argv[1]
        path = arg if os.path.isabs(arg) else os.path.join(LEADS_DIR, arg)
    else:
        path = os.path.join(LEADS_DIR, "leads_1000.csv")

    if not os.path.exists(path):
        print(f"File not found: {path}")
        sys.exit(1)

    if path.endswith(".txt"):
        leads = load_batch_txt(path)
    else:
        leads = load_leads_csv(path)

    # Filter already-sent
    sent = load_sent_urls()
    queue = [r for r in leads if r.get("url","") not in sent]

    # Sort by urgency_score if available
    try:
        queue.sort(key=lambda x: int(x.get("urgency_score", 1)), reverse=True)
    except Exception:
        pass

    print("=" * 58)
    print("  AXON Human Sender")
    print("=" * 58)
    print(f"  File         : {os.path.basename(path)}")
    print(f"  Total leads  : {len(leads)}")
    print(f"  Already sent : {len(sent)}")
    print(f"  Queue        : {len(queue)}")
    print(f"  Batch size   : {BATCH_SIZE}")
    print(f"  Batch break  : {BATCH_BREAK_MIN//60}–{BATCH_BREAK_MAX//60} min")
    print("=" * 58)

    if not queue:
        print("\n  Nothing new to post. All URLs already in sent_log.csv.")
        return

    # Preview top leads
    print(f"\n  Top leads queued:")
    for i, r in enumerate(queue[:8], 1):
        score = r.get("urgency_score", "?")
        title = r.get("title", r.get("complaint",""))[:50]
        print(f"  {i:>2}. [{score}] u/{r.get('username','?'):<18} — {title}")

    input(f"\n  Press ENTER to open Chrome and start...")

    # ── Browser ─────────────────────────────────────────────
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=False, args=["--start-maximized"])
        context = browser.new_context(viewport=None)
        page    = context.new_page()

        # Login
        first_platform = detect_platform(queue[0].get("url",""))
        login_urls = {
            "reddit":       "https://www.reddit.com/login",
            "hackernews":   "https://news.ycombinator.com/login",
            "indiehackers": "https://www.indiehackers.com/sign-in",
        }
        login_url = login_urls.get(first_platform, "https://www.reddit.com/login")

        print(f"\n  Opening {first_platform} login...")
        page.goto(login_url, wait_until="domcontentloaded")

        print()
        print("  ╔══════════════════════════════════════════════════╗")
        print("  ║  Log in to the platform in the Chrome window.   ║")
        print("  ║  Press ENTER here when you're logged in.        ║")
        print("  ╚══════════════════════════════════════════════════╝")
        input("\n  ENTER when logged in > ")

        # ── Process batches ──────────────────────────────────
        batches = [queue[i:i+BATCH_SIZE] for i in range(0, len(queue), BATCH_SIZE)]
        total_posted = total_skipped = total_failed = 0

        for batch_num, batch in enumerate(batches, 1):
            print(f"\n{'═'*58}")
            print(f"  BATCH {batch_num} of {len(batches)}  ({len(batch)} posts)")
            print(f"{'═'*58}")

            # Generate 10 random pre-delays (20–115s) in shuffled order
            pre_delays = [random.uniform(20, 115) for _ in range(len(batch))]
            random.shuffle(pre_delays)

            # Generate post-submission delays (45–110s)
            post_delays = [random.uniform(45, 110) for _ in range(len(batch))]

            batch_posted = batch_skipped = batch_failed = 0

            for i, (lead, pre_d, post_d) in enumerate(
                    zip(batch, pre_delays, post_delays), 1):

                url      = lead.get("url","")
                username = lead.get("username","unknown")
                title    = lead.get("title", lead.get("complaint",""))
                complaint= lead.get("complaint", lead.get("title",""))
                platform = detect_platform(url)
                comment  = pick_comment(title, complaint)

                print(f"\n  [{batch_num}.{i}/{len(batch)}]  u/{username}")
                print(f"  Platform : {platform}  |  r/{lead.get('sub', lead.get('platform',''))}")
                print(f"  Post     : {title[:60]}")
                print(f"  Score    : {lead.get('urgency_score','?')}/10")
                print(f"  Pre-delay: {pre_d:.0f}s  |  Post-delay: {post_d:.0f}s")

                result = post_comment(page, url, comment, platform, pre_d)
                append_log(url, username, title, result, pre_d, comment)

                if result in ("posted", "posted_manual"):
                    batch_posted += 1
                    total_posted += 1
                    status_icon = "✓"
                elif result == "skipped":
                    batch_skipped += 1
                    total_skipped += 1
                    status_icon = "↷"
                else:
                    batch_failed += 1
                    total_failed += 1
                    status_icon = "✗"

                print(f"\n  {status_icon} Sent {total_posted} total — "
                      f"Skipped {total_skipped} — Failed {total_failed}")

                if i < len(batch) and result != "skipped":
                    countdown(post_d, "Next post in")

            print(f"\n  Batch {batch_num} done: "
                  f"{batch_posted} posted / {batch_skipped} skipped / {batch_failed} failed")

            if batch_num < len(batches):
                break_dur = random.uniform(BATCH_BREAK_MIN, BATCH_BREAK_MAX)
                break_mins = break_dur / 60
                print(f"\n  ━━  BATCH BREAK: {break_mins:.1f} minutes  ━━")
                print(f"  (Human pattern: taking a natural break between sessions)")
                countdown(break_dur, "Next batch in")

        browser.close()

    # ── Final summary ────────────────────────────────────────
    remaining = len(queue) - total_posted - total_skipped - total_failed
    print(f"\n{'='*58}")
    print(f"  SESSION COMPLETE")
    print(f"{'='*58}")
    print(f"  Posted   : {total_posted}")
    print(f"  Skipped  : {total_skipped}")
    print(f"  Failed   : {total_failed}")
    print(f"  Remaining: {remaining}")
    print(f"  Log      : ~/axon-leads/sent_log.csv")
    print(f"{'='*58}")


if __name__ == "__main__":
    main()
