#!/usr/bin/env python3
"""
AXON Collect Fresh — fetches RSS feeds, filters real pain posts
from last 48h, splits into batches of 20, saves as batch_N.txt
"""

import feedparser, os, re
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from email.utils import parsedate_to_datetime

LEADS_DIR = os.path.expanduser("~/axon-leads")
HOURS_BACK = 48
BATCH_SIZE = 20

FEEDS = [
    ("indiehackers", "https://www.indiehackers.com/feed.rss"),
    ("hackernews",   "https://hnrss.org/newest?q=cold+email&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=lead+generation&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=getting+customers&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=outreach&points=3"),
    ("hackernews",   "https://hnrss.org/newest?q=no+traction&points=3"),
    ("reddit",       "https://www.reddit.com/r/SaaS/search.rss?q=cold+email&sort=new&limit=50"),
    ("reddit",       "https://www.reddit.com/r/entrepreneur/search.rss?q=lead+generation&sort=new&limit=50"),
    ("reddit",       "https://www.reddit.com/r/startups/search.rss?q=outreach&sort=new&limit=50"),
    ("reddit",       "https://www.reddit.com/r/indiehackers/search.rss?q=customers&sort=new&limit=50"),
    ("reddit",       "https://www.reddit.com/r/sales/search.rss?q=cold+email&sort=new&limit=50"),
]

# Must match at least one of these — specific enough to signal real pain
MUST_HAVE = [
    "struggling", "not working", "no replies", "zero replies",
    "can't get", "can't book", "how do i", "how do you",
    "zero customers", "no traction", "no clients", "no revenue",
    "advice", "help me", "what am i doing wrong", "tried everything",
    "failing", "frustrated", "dead", "broken", "no results",
    "low reply", "open rate", "deliverability", "spam folder",
    "no sales", "no signups", "zero mrr", "gave up", "quit",
    "no one responds", "nobody replies", "getting ignored",
]

# Noise — skip posts matching these (wrong context)
NOISE_WORDS = [
    "premed", "extracurricular", "veteran", "pregnancy", "discord",
    "minecraft", "gaming", "anime", "nfl", "nba", "crypto", "nft",
    "for hire", "[for hire]", "hiring", "job posting", "we are hiring",
    "referral code", "temu", "coupon", "scholarship",
]

# Only allow relevant subreddits
ALLOWED_SUBS = {
    "SaaS", "entrepreneur", "startups", "sales", "coldemail",
    "microsaas", "buildinpublic", "SideProject", "GrowthHacking",
    "b2b_sales", "Solopreneur", "AiForSmallBusiness", "smallbusiness",
    "cofounderhunt", "indiehackers", "Entrepreneur", "freelance",
    "agency", "digitalmarketing", "emailmarketing", "ColdEmailMasters",
    "leadsgeneration", "AiAutomations", "marketing", "ecommerce",
    "Coldemailing", "NextGenEmailMarketing",
}


def parse_date(entry):
    for field in ("published", "updated"):
        raw = entry.get(field)
        if raw:
            try:
                return parsedate_to_datetime(raw).astimezone(timezone.utc)
            except Exception:
                pass
    for field in ("published_parsed", "updated_parsed"):
        t = entry.get(field)
        if t:
            try:
                return datetime(*t[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return None


def clean(text):
    text = re.sub(r"<[^>]+>", " ", text or "")
    return re.sub(r"\s+", " ", text).strip()


def get_sub(url):
    m = re.search(r"/r/([^/]+)/", url)
    return m.group(1) if m else ""


def is_good(entry, platform, cutoff):
    link    = entry.get("link", "").strip().split("?")[0].rstrip("/")
    title   = entry.get("title", "")
    summary = clean(entry.get("summary", ""))
    author  = entry.get("author", "unknown")
    author  = re.sub(r"^/?u/", "", author).strip()

    if not link:
        return None

    # Date check
    dt = parse_date(entry)
    if dt and dt < cutoff:
        return None

    full_text = (title + " " + summary).lower()

    # Noise check
    if any(n in full_text for n in NOISE_WORDS):
        return None

    # Sub check for Reddit
    sub = get_sub(link)
    if platform == "reddit" and sub and sub not in ALLOWED_SUBS:
        return None

    # Must have real pain signal
    if not any(k in full_text for k in MUST_HAVE):
        return None

    # Skip posts that are tips/guides (not questions/complaints)
    if title.lower().startswith(("how to get", "how i got", "how we got",
                                  "i built", "we built", "show hn:",
                                  "launch hn:", "[for hire]")):
        return None

    return {
        "platform": platform,
        "username": author,
        "url":      link,
        "title":    title.strip(),
        "text":     summary[:400],
        "sub":      sub or platform,
        "published": dt.strftime("%Y-%m-%d %H:%M UTC") if dt else "recent",
    }


def fetch(platform, url, cutoff):
    results = []
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            post = is_good(entry, platform, cutoff)
            if post:
                results.append(post)
    except Exception as e:
        print(f"  [!] {url[:55]}: {e}")
    return results


def main():
    cutoff = datetime.now(timezone.utc) - timedelta(hours=HOURS_BACK)

    print("=" * 58)
    print("  AXON Collect Fresh")
    print("=" * 58)
    print(f"  Window : last {HOURS_BACK}h  (since {cutoff.strftime('%Y-%m-%d %H:%M UTC')})")
    print(f"  Fetching {len(FEEDS)} feeds...\n")

    all_posts, seen = [], set()

    with ThreadPoolExecutor(max_workers=11) as ex:
        futures = {ex.submit(fetch, p, u, cutoff): (p, u) for p, u in FEEDS}
        for fut in as_completed(futures):
            posts = fut.result()
            plat, url = futures[fut]
            label = url[url.find("?q=")+3:url.find("&")] if "?q=" in url else plat
            for p in posts:
                if p["url"] not in seen:
                    seen.add(p["url"])
                    all_posts.append(p)
            print(f"  ✓ {plat:<14} {label:<28} → {len(posts)} posts")

    print(f"\n  Total fresh leads: {len(all_posts)}")

    if not all_posts:
        print("\n  Nothing fresh right now. Try again in a few hours.")
        return

    # Split into batches of 20
    batches = [all_posts[i:i+BATCH_SIZE] for i in range(0, len(all_posts), BATCH_SIZE)]

    # Clear old batch files
    for f in os.listdir(LEADS_DIR):
        if re.match(r"batch_\d+\.txt", f):
            os.remove(os.path.join(LEADS_DIR, f))

    for batch_num, batch in enumerate(batches, 1):
        path = os.path.join(LEADS_DIR, f"batch_{batch_num}.txt")
        with open(path, "w", encoding="utf-8") as f:
            f.write(f"AXON BATCH {batch_num} of {len(batches)} — {len(batch)} leads\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
            f.write("=" * 58 + "\n\n")
            for i, post in enumerate(batch, 1):
                f.write(f"--- LEAD {i} ---\n")
                f.write(f"URL: {post['url']}\n")
                f.write(f"PLATFORM: {post['platform'].capitalize()} ({post['sub']})\n")
                f.write(f"USERNAME: {post['username']}\n")
                f.write(f"PUBLISHED: {post['published']}\n")
                f.write(f"THEIR POST: {post['title']}\n")
                if post["text"] and post["text"].lower() != post["title"].lower():
                    excerpt = post["text"][:200].replace("\n", " ")
                    f.write(f"EXCERPT: {excerpt}\n")
                f.write("-" * 14 + "\n\n")
        print(f"  ✓ batch_{batch_num}.txt — {len(batch)} leads")

    print(f"\n{'=' * 58}")
    print(f"  {len(all_posts)} leads → {len(batches)} batches saved")
    print(f"  Files: ~/axon-leads/batch_1.txt … batch_{len(batches)}.txt")
    print(f"\n  Next step:")
    print(f"  Open batch_1.txt → paste contents into Claude →")
    print(f"  Get 20 personalised comments → post them → repeat.")
    print(f"{'=' * 58}")
    print("  DONE")


if __name__ == "__main__":
    main()
