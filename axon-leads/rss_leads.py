#!/usr/bin/env python3
"""
AXON RSS Lead Scraper
Fetches Reddit + HackerNews RSS feeds, filters pain posts, writes leads + pitches.
"""

import feedparser
import csv
import os
import re
import time
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

LEADS_FILE   = os.path.expanduser("~/axon-leads/leads.csv")
PITCHES_FILE = os.path.expanduser("~/axon-leads/pitches.csv")
TODAY        = datetime.today().strftime("%Y-%m-%d")

# ─────────────────────────────────────────────
#  RSS FEEDS
# ─────────────────────────────────────────────

FEEDS = [
    # Reddit — no auth needed via RSS
    ("reddit", "https://www.reddit.com/r/SaaS/search.rss?q=cold+email&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/SaaS/search.rss?q=lead+generation&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/SaaS/search.rss?q=outreach&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/SaaS/search.rss?q=getting+clients&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/SaaS/search.rss?q=no+replies&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/entrepreneur/search.rss?q=cold+email&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/entrepreneur/search.rss?q=getting+clients&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/entrepreneur/search.rss?q=lead+generation&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/entrepreneur/search.rss?q=outreach+not+working&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/startups/search.rss?q=lead+generation&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/startups/search.rss?q=cold+email&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/startups/search.rss?q=can%27t+get+customers&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/sales/search.rss?q=cold+email+not+working&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/sales/search.rss?q=outreach+failing&sort=new&limit=100"),
    ("reddit", "https://www.reddit.com/r/sales/search.rss?q=lead+generation&sort=new&limit=100"),
    # HackerNews
    ("hackernews", "https://hnrss.org/newest?q=cold+email&points=1"),
    ("hackernews", "https://hnrss.org/newest?q=lead+generation+struggling&points=1"),
    ("hackernews", "https://hnrss.org/newest?q=outbound+sales&points=1"),
    ("hackernews", "https://hnrss.org/newest?q=getting+customers+saas&points=1"),
    ("hackernews", "https://hnrss.org/newest?q=cold+outreach&points=1"),
]

PAIN_KEYWORDS = [
    "struggling", "not working", "no replies", "zero replies", "0 replies",
    "doesn't work", "don't work", "getting ignored", "low open rate",
    "low reply rate", "can't get", "can't book", "hard to get",
    "frustrated", "failing", "no responses", "wasted", "spam folder",
    "deliverability", "nobody replies", "nothing works", "burned through",
    "dead", "broken", "no results", "hopeless", "advice", "help",
    "tips", "how do i", "how do you", "what am i doing wrong",
    "getting no traction", "tried everything", "nothing is working",
    "no traction", "no customers", "no clients", "no sales",
    "no revenue", "zero customers", "can't convert", "not converting",
    "bounce rate", "open rate", "reply rate", "outreach", "cold email",
    "lead gen", "b2b sales",
]

# ─────────────────────────────────────────────
#  CSV HELPERS
# ─────────────────────────────────────────────

LEADS_HEADER   = ["username", "platform", "url", "complaint", "source", "date_found"]
PITCHES_HEADER = ["username", "platform", "url", "complaint_summary", "pitch", "status", "date_written"]

_file_lock = threading.Lock()


def load_existing_urls(filepath, url_col=2):
    urls = set()
    if not os.path.exists(filepath):
        return urls
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if len(row) > url_col:
                urls.add(row[url_col].strip())
    return urls


def append_rows(filepath, header, rows):
    with _file_lock:
        file_exists = os.path.exists(filepath)
        with open(filepath, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            if not file_exists:
                writer.writerow(header)
            writer.writerows(rows)


# ─────────────────────────────────────────────
#  FEED FETCHER
# ─────────────────────────────────────────────

def has_pain(text):
    lower = text.lower()
    return any(kw in lower for kw in PAIN_KEYWORDS)


def clean_html(raw):
    """Strip HTML tags from RSS summaries."""
    return re.sub(r"<[^>]+>", " ", raw or "").strip()


def fetch_feed(platform, url, existing_urls):
    """Fetch one RSS feed and return qualifying entries."""
    results = []
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            link = entry.get("link", "").strip().split("?")[0].rstrip("/")
            if not link or link in existing_urls:
                continue

            title   = entry.get("title", "").strip()
            summary = clean_html(entry.get("summary", ""))
            author  = entry.get("author", entry.get("authors", [{}])[0].get("name", "unknown") if entry.get("authors") else "unknown")

            # For Reddit RSS, author is often "u/username"
            author = author.replace("/u/", "").replace("u/", "").strip()

            full_text = title + " " + summary
            if not has_pain(full_text):
                continue

            complaint = summary[:300].replace("\n", " ") if summary else title
            results.append({
                "username": author,
                "platform": platform,
                "url":      link,
                "title":    title,
                "complaint": complaint,
                "source":   "rss_" + platform,
            })
            existing_urls.add(link)
    except Exception as e:
        print(f"  [!] Feed error ({url[:60]}...): {e}")
    return results


# ─────────────────────────────────────────────
#  PITCH WRITER
# ─────────────────────────────────────────────

PITCH_TEMPLATES = [
    # 0 — cold email specific
    (
        ["cold email", "reply rate", "no replies", "zero replies", "open rate"],
        lambda u, t, c, p: (
            f"Hey {u} — saw your post about {t[:60].rstrip('.')}. "
            f"Cold email reply rates have cratered industry-wide — the problem is usually personalisation at scale. "
            f"AXON is an AI outreach tool that researches each prospect and writes emails that actually reference their situation — typically 3-5x higher reply rates. "
            f"Launching in 2 weeks with 20 founding spots at 40% off forever. "
            f"What's your current send volume?"
        )
    ),
    # 1 — lead gen / getting clients
    (
        ["lead gen", "lead generation", "getting clients", "can't get clients", "no clients"],
        lambda u, t, c, p: (
            f"Hey {u} — noticed your post about {t[:60].rstrip('.')}. "
            f"Lead gen being this hard usually means the top-of-funnel is broken — wrong list, generic message, or both. "
            f"AXON fixes both: it finds verified leads in your ICP and writes personalised outreach for each one. "
            f"Launching in 2 weeks, 40% off for 20 founding members. "
            f"What does your ICP look like?"
        )
    ),
    # 2 — no traction / no customers / SaaS struggling
    (
        ["no traction", "no customers", "no revenue", "zero customers", "not converting", "struggling"],
        lambda u, t, c, p: (
            f"Hey {u} — read your post about {t[:60].rstrip('.')}. "
            f"Distribution is the hardest part of early SaaS — most builders are great at product and terrible at outbound. "
            f"AXON handles the outbound side: verified leads, AI-personalised emails, automated follow-ups. "
            f"Launching in 2 weeks with 20 founding spots at 40% off. "
            f"Have you tried cold outreach yet or been focused on inbound?"
        )
    ),
    # 3 — spam / deliverability
    (
        ["spam", "deliverability", "spam folder", "inbox"],
        lambda u, t, c, p: (
            f"Hey {u} — saw your post about {t[:60].rstrip('.')}. "
            f"Deliverability is a silent killer for cold email — most senders don't know their emails are going straight to spam. "
            f"AXON handles domain warmup, sending infrastructure, and spam-safe copy generation so you actually land in inboxes. "
            f"Launching in 2 weeks with 20 founding spots at 40% off. "
            f"How many domains are you currently sending from?"
        )
    ),
    # 4 — generic fallback
    (
        [],
        lambda u, t, c, p: (
            f"Hey {u} — saw your post about {t[:60].rstrip('.')}. "
            f"This is a problem AXON is built to solve: AI outreach that finds the right leads and sends personalised messages that actually get replies. "
            f"Launching in 2 weeks with 40% off for 20 founding members. "
            f"What does your current customer acquisition look like?"
        )
    ),
]


def pick_pitch_template(complaint_lower):
    for keywords, template_fn in PITCH_TEMPLATES[:-1]:
        if any(kw in complaint_lower for kw in keywords):
            return template_fn
    return PITCH_TEMPLATES[-1][1]


def write_pitch(lead):
    username  = lead["username"] or "there"
    title     = lead["title"]
    complaint = lead["complaint"]
    platform  = lead["platform"]

    complaint_lower = (title + " " + complaint).lower()
    template_fn = pick_pitch_template(complaint_lower)
    pitch = template_fn(username, title, complaint, platform)

    # Keep under ~80 words
    words = pitch.split()
    if len(words) > 90:
        pitch = " ".join(words[:90]) + "..."

    return complaint[:250], pitch


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def main():
    print("=" * 55)
    print("  AXON RSS Lead Scraper")
    print("=" * 55)

    existing_lead_urls   = load_existing_urls(LEADS_FILE, url_col=2)
    existing_pitch_urls  = load_existing_urls(PITCHES_FILE, url_col=2)
    print(f"Existing leads  : {len(existing_lead_urls)}")
    print(f"Existing pitches: {len(existing_pitch_urls)}")
    print(f"\nFetching {len(FEEDS)} RSS feeds in parallel...\n")

    all_leads = []
    lock = threading.Lock()

    def fetch_and_collect(args):
        platform, url = args
        short = url[url.find("?q=")+3:url.find("&")] if "?q=" in url else url[-40:]
        print(f"  → [{platform}] {short}")
        results = fetch_feed(platform, url, existing_lead_urls)
        with lock:
            all_leads.extend(results)
        print(f"  ✓ [{platform}] {short} — {len(results)} new leads")
        return len(results)

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch_and_collect, f) for f in FEEDS]
        for future in as_completed(futures):
            pass  # progress printed inside fetch_and_collect

    # Deduplicate by URL (threads may have added duplicates)
    seen = set()
    unique_leads = []
    for lead in all_leads:
        if lead["url"] not in seen:
            seen.add(lead["url"])
            unique_leads.append(lead)

    print(f"\n{'─'*55}")
    print(f"New leads found : {len(unique_leads)}")

    if not unique_leads:
        print("No new leads found. Exiting.")
        return

    # Save leads
    lead_rows = [
        [
            lead["username"],
            lead["platform"],
            lead["url"],
            lead["complaint"],
            lead["source"],
            TODAY,
        ]
        for lead in unique_leads
    ]
    append_rows(LEADS_FILE, LEADS_HEADER, lead_rows)
    print(f"Saved to        : {LEADS_FILE}")

    # Write pitches
    print(f"\nWriting pitches for {len(unique_leads)} new leads...")
    pitch_rows = []
    for lead in unique_leads:
        if lead["url"] in existing_pitch_urls:
            continue
        complaint_summary, pitch = write_pitch(lead)
        pitch_rows.append([
            lead["username"],
            lead["platform"],
            lead["url"],
            complaint_summary,
            pitch,
            "pending",
            TODAY,
        ])

    if pitch_rows:
        append_rows(PITCHES_FILE, PITCHES_HEADER, pitch_rows)

    # Final summary
    def count_rows(fp):
        if not os.path.exists(fp):
            return 0
        with open(fp, encoding="utf-8") as f:
            return max(0, sum(1 for _ in f) - 1)

    total_leads   = count_rows(LEADS_FILE)
    total_pitches = count_rows(PITCHES_FILE)

    # Breakdown by platform
    reddit_count = sum(1 for l in unique_leads if l["platform"] == "reddit")
    hn_count     = sum(1 for l in unique_leads if l["platform"] == "hackernews")

    print(f"\n{'='*55}")
    print(f"  AXON RSS SCRAPE COMPLETE")
    print(f"{'='*55}")
    print(f"  New leads this run  : {len(unique_leads)}")
    print(f"    └─ Reddit         : {reddit_count}")
    print(f"    └─ HackerNews     : {hn_count}")
    print(f"  New pitches written : {len(pitch_rows)}")
    print(f"  Total leads (all)   : {total_leads}")
    print(f"  Total pitches (all) : {total_pitches}")
    print(f"{'='*55}")
    print(f"\n  Files:")
    print(f"    {LEADS_FILE}")
    print(f"    {PITCHES_FILE}")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    main()
