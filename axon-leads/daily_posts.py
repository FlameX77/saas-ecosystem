#!/usr/bin/env python3
"""
AXON Daily Posts — finds fresh pain posts from the last 48h,
writes helpful comments, opens each URL for you to paste & post.
"""

import feedparser, csv, os, re, time, webbrowser
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from email.utils import parsedate_to_datetime

POSTS_FILE = os.path.expanduser("~/axon-leads/todays_posts.csv")
HOURS_BACK = 48
OPEN_DELAY = 15   # seconds between browser opens

FEEDS = [
    ("indiehackers", "https://www.indiehackers.com/feed.rss"),
    ("hackernews",   "https://hnrss.org/newest?q=cold+email&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=lead+generation&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=getting+customers&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=outreach&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=no+traction&points=3"),
    ("reddit",       "https://www.reddit.com/r/SaaS/search.rss?q=cold+email&sort=new&limit=25"),
    ("reddit",       "https://www.reddit.com/r/entrepreneur/search.rss?q=lead+generation&sort=new&limit=25"),
    ("reddit",       "https://www.reddit.com/r/startups/search.rss?q=outreach&sort=new&limit=25"),
    ("reddit",       "https://www.reddit.com/r/indiehackers/search.rss?q=customers&sort=new&limit=25"),
]

PAIN_KEYWORDS = [
    "struggling", "help", "advice", "not working", "failing",
    "no replies", "can't get", "how do i", "how do you",
    "zero customers", "no traction", "dead", "frustrated",
    "no clients", "no sales", "no revenue", "outreach",
    "cold email", "lead gen", "getting clients", "can't book",
    "what am i doing wrong", "tried everything", "no responses",
    "spam folder", "deliverability", "low reply", "open rate",
]

# ─────────────────────────────────────────────
#  PARSE DATE from RSS entry
# ─────────────────────────────────────────────

def parse_date(entry):
    for field in ("published", "updated", "created"):
        raw = entry.get(field)
        if raw:
            try:
                dt = parsedate_to_datetime(raw)
                return dt.astimezone(timezone.utc)
            except Exception:
                pass
    # feedparser also gives parsed tuples
    for field in ("published_parsed", "updated_parsed"):
        t = entry.get(field)
        if t:
            try:
                return datetime(*t[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return None


def clean_html(text):
    return re.sub(r"<[^>]+>", " ", text or "").strip()


def get_sub(url):
    m = re.search(r"/r/([^/]+)/", url)
    return "r/" + m.group(1) if m else ""


# ─────────────────────────────────────────────
#  FETCH + FILTER
# ─────────────────────────────────────────────

def fetch_feed(platform, url, cutoff, seen_urls):
    results = []
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            link = entry.get("link", "").strip().split("?")[0].rstrip("/")
            if not link or link in seen_urls:
                continue

            dt = parse_date(entry)
            if dt and dt < cutoff:
                continue          # too old

            title   = entry.get("title", "").strip()
            summary = clean_html(entry.get("summary", ""))
            author  = entry.get("author", "")
            author  = re.sub(r"^/u/|^u/", "", author).strip() or "unknown"

            text = (title + " " + summary).lower()
            if not any(kw in text for kw in PAIN_KEYWORDS):
                continue

            seen_urls.add(link)
            results.append({
                "platform": platform,
                "username": author,
                "url":      link,
                "title":    title,
                "complaint": summary[:300].replace("\n", " "),
                "published": dt.strftime("%Y-%m-%d %H:%M UTC") if dt else "unknown",
                "subreddit": get_sub(link),
            })
    except Exception as e:
        print(f"  [!] {url[:55]}: {e}")
    return results


# ─────────────────────────────────────────────
#  COMMENT GENERATOR
# ─────────────────────────────────────────────

def generate_comment(post):
    text = (post["title"] + " " + post["complaint"]).lower()

    if any(k in text for k in ["deliverability", "spam folder", "bounce", "dkim", "spf", "inbox"]):
        return (
            "Deliverability kills more campaigns than bad copy does. Three quick fixes:\n\n"
            "1. **Warmup before sending.** Fresh domains need 4–6 weeks of warmup — skipping this tanks your sender score immediately.\n"
            "2. **Plain text > HTML.** Formatted emails with images trigger spam filters. Write like a human, not a newsletter.\n"
            "3. **Check mail-tester.com** — gives you a real score and tells you exactly what's broken.\n\n"
            "I'm building [AXON](https://axon.so) which handles warmup + sending infrastructure automatically. "
            "Launching in 2 weeks with 40% founding member discount if useful."
        )

    if any(k in text for k in ["reply rate", "no replies", "zero replies", "open rate", "not converting", "response rate"]):
        return (
            "Reply rates have cratered — but a few things still move the needle:\n\n"
            "1. **Lead quality > volume.** 30 emails to exactly the right people beats 3000 blasted broadly.\n"
            "2. **First line = their world, not yours.** Reference something specific to them before you pitch anything.\n"
            "3. **Follow-ups matter more than email #1.** 70% of replies come from emails 2–4.\n\n"
            "Building [AXON](https://axon.so) to solve exactly this — finds verified leads and writes genuinely personalised emails. "
            "Launching in 2 weeks, founding member spots open."
        )

    if any(k in text for k in ["lead gen", "lead generation", "finding leads", "building a list", "verified leads"]):
        return (
            "Lead gen being this hard usually means the ICP is too broad. A few things that help:\n\n"
            "1. **Niche down harder.** 'B2B founders' is noise — 'SaaS founders who just posted a hiring ad' is a real signal.\n"
            "2. **Trigger-based beats cold lists.** Job posts, funding rounds, new hires = people with active budgets.\n"
            "3. **LinkedIn view before email** adds ~15% to reply rates in most tests.\n\n"
            "I'm building [AXON](https://axon.so) which automates finding leads by trigger and writes the outreach. "
            "2 weeks to launch, founding member pricing available."
        )

    if any(k in text for k in ["no traction", "no customers", "zero customers", "no revenue", "no signups", "no sales", "zero mrr"]):
        return (
            "The traction problem is almost always distribution, not product. What works early:\n\n"
            "1. **Do 50 manual outreaches before automating anything.** You need to know what language lands first.\n"
            "2. **Go where pain is loudest.** Forums, subreddits, Slack groups where your ICP already vents about the problem.\n"
            "3. **One tight case study > ten cold emails.** Even one result gives you something real to reference.\n\n"
            "Building [AXON](https://axon.so) for exactly this — AI that finds the right leads and writes personalised outreach. "
            "Launching in 2 weeks with 40% off for founding members."
        )

    if any(k in text for k in ["can't get clients", "getting clients", "no clients", "find clients", "freelance"]):
        return (
            "Getting clients without a warm network is genuinely hard — what works:\n\n"
            "1. **Pitch an outcome, not a service.** 'I help SaaS companies cut churn by 20%' beats 'I do product design'.\n"
            "2. **Monitor where the pain is.** Reddit/Slack/forums where people actively ask for help are gold — they're already aware of the problem.\n"
            "3. **One strong referral from a happy client is worth 100 cold emails.**\n\n"
            "I'm launching [AXON](https://axon.so) in 2 weeks — AI outreach that finds prospects and writes messages that land. "
            "Founding member discount available."
        )

    # Generic fallback
    return (
        "This is one of the most common walls founders hit — a few things that actually move the needle:\n\n"
        "1. **Specificity is everything.** The more your message reflects their exact situation, the higher your reply rate.\n"
        "2. **Don't scale until it works manually.** Do 20 outreaches by hand first — you'll learn what language lands.\n"
        "3. **Multi-touch works.** Email + LinkedIn view + engaging with their content = 3x better than email alone.\n\n"
        "Building [AXON](https://axon.so) to automate exactly this — finds leads, writes personalised emails, handles follow-ups. "
        "Launching in 2 weeks with founding member pricing."
    )


# ─────────────────────────────────────────────
#  LOAD ALREADY-SEEN URLS
# ─────────────────────────────────────────────

def load_seen():
    seen = set()
    if os.path.exists(POSTS_FILE):
        with open(POSTS_FILE, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                seen.add(row.get("url", "").strip())
    return seen


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def main():
    cutoff   = datetime.now(timezone.utc) - timedelta(hours=HOURS_BACK)
    seen_urls = load_seen()
    already   = len(seen_urls)

    print("=" * 60)
    print("  AXON Daily Posts — Fresh pain posts from last 48h")
    print("=" * 60)
    print(f"  Cutoff : {cutoff.strftime('%Y-%m-%d %H:%M UTC')}  ({HOURS_BACK}h window)")
    print(f"  Already logged: {already} URLs")
    print(f"  Fetching {len(FEEDS)} feeds in parallel...\n")

    all_posts = []
    with ThreadPoolExecutor(max_workers=10) as ex:
        futures = {ex.submit(fetch_feed, p, u, cutoff, seen_urls): (p, u) for p, u in FEEDS}
        for fut in as_completed(futures):
            posts = fut.result()
            plat, url = futures[fut]
            label = url[url.find("?q=")+3:url.find("&")] if "?q=" in url else plat
            print(f"  ✓ {plat:<14} {label:<30} → {len(posts)} new posts")
            all_posts.extend(posts)

    # Deduplicate
    seen2, unique = set(), []
    for p in all_posts:
        if p["url"] not in seen2:
            seen2.add(p["url"])
            unique.append(p)

    print(f"\n  Fresh posts found: {len(unique)}")

    if not unique:
        print("\n  Nothing new in the last 48h. Try again later or expand the feeds.")
        return

    # Generate comments
    for post in unique:
        post["comment"] = generate_comment(post)

    # Save to CSV
    fieldnames = ["platform","subreddit","username","url","title","complaint","comment","published"]
    file_exists = os.path.exists(POSTS_FILE)
    with open(POSTS_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL, extrasaction="ignore")
        if not file_exists:
            writer.writeheader()
        writer.writerows(unique)

    print(f"  Saved → {POSTS_FILE}\n")
    print("=" * 60)
    print(f"  OPENING {len(unique)} POSTS — copy comment, switch to browser, paste")
    print("=" * 60)

    for i, post in enumerate(unique, 1):
        sub   = post["subreddit"] or post["platform"]
        print(f"\n{'─'*60}")
        print(f"  [{i}/{len(unique)}]  {sub}  —  u/{post['username']}")
        print(f"  Published : {post['published']}")
        print(f"  URL       : {post['url']}")
        print(f"  Their post: {post['title'][:80]}")
        print(f"\n  COMMENT TO POST:\n")
        print(post["comment"])
        print(f"\n  Opening browser in 3s... (then {OPEN_DELAY}s before next)")
        time.sleep(3)
        webbrowser.open(post["url"])

        if i < len(unique):
            for remaining in range(OPEN_DELAY, 0, -5):
                print(f"  ⏱  Next post in {remaining}s...", end="\r")
                time.sleep(5)
            print(" " * 30, end="\r")

    print(f"\n{'='*60}")
    print(f"  Done! {len(unique)} posts opened.")
    print(f"  All saved to ~/axon-leads/todays_posts.csv")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
