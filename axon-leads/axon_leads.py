#!/usr/bin/env python3
"""
AXON Lead Generation Script
Scrapes Reddit for cold email / outreach pain posts and writes personalised pitches.
"""

import praw
import csv
import os
import time
import re
import requests
from datetime import datetime
from bs4 import BeautifulSoup

# ─────────────────────────────────────────────
#  CONFIG — paste your Reddit API credentials
# ─────────────────────────────────────────────
REDDIT_CLIENT_ID     = "YOUR_CLIENT_ID"
REDDIT_CLIENT_SECRET = "YOUR_CLIENT_SECRET"
REDDIT_USER_AGENT    = "axon-leads-script/1.0 by YOUR_REDDIT_USERNAME"

LEADS_FILE   = os.path.expanduser("~/axon-leads/leads.csv")
PITCHES_FILE = os.path.expanduser("~/axon-leads/pitches.csv")

SUBREDDITS = ["SaaS", "entrepreneur", "startups", "sales"]

SEARCH_QUERIES = [
    "cold email not working",
    "cold email no replies",
    "outreach not working",
    "lead generation struggling",
    "can't get clients",
    "can't book meetings",
    "getting clients is hard",
    "cold outreach failing",
    "B2B leads struggling",
    "email outreach low reply rate",
    "prospecting not working",
    "outbound sales problems",
    "need more leads",
    "cold email spam folder",
    "email deliverability problems",
]

# Pain keywords — post must contain at least one to qualify
PAIN_KEYWORDS = [
    "struggling", "not working", "no replies", "zero replies", "0 replies",
    "doesn't work", "don't work", "getting ignored", "low open rate",
    "low reply rate", "can't get", "can't book", "hard to get",
    "frustrated", "failing", "no responses", "wasted", "spam folder",
    "deliverability", "nobody replies", "nothing works", "burning through",
    "dead", "broken", "no results", "hopeless", "advice needed", "help needed",
    "what am i doing wrong", "getting no traction", "tried everything",
    "nothing is working", "at my wit's end",
]

TODAY = datetime.today().strftime("%Y-%m-%d")


# ─────────────────────────────────────────────
#  CSV HELPERS
# ─────────────────────────────────────────────

LEADS_HEADER   = ["username", "subreddit", "title", "url", "text_snippet", "source", "date_found"]
PITCHES_HEADER = ["username", "subreddit", "url", "complaint_summary", "pitch", "status", "date_written"]


def load_existing_urls(filepath, url_col_index=3):
    """Return a set of URLs already in a CSV file."""
    urls = set()
    if not os.path.exists(filepath):
        return urls
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header
        for row in reader:
            if len(row) > url_col_index:
                urls.add(row[url_col_index].strip())
    return urls


def append_rows(filepath, header, rows):
    """Append rows to a CSV, creating with header if needed."""
    file_exists = os.path.exists(filepath)
    with open(filepath, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        if not file_exists:
            writer.writerow(header)
        writer.writerows(rows)


def has_pain(text):
    """Return True if the text contains at least one pain keyword."""
    lower = text.lower()
    return any(kw in lower for kw in PAIN_KEYWORDS)


# ─────────────────────────────────────────────
#  PITCH WRITER
# ─────────────────────────────────────────────

def write_pitch(username, subreddit, url, title, text_snippet):
    """
    Generate a personalised AXON pitch DM based on the lead's complaint.
    """
    # Pick out the most relevant sentence from the post text
    complaint_summary = title
    if text_snippet and len(text_snippet) > 30:
        # Take the first 2 sentences of the post body as the complaint hook
        sentences = re.split(r'(?<=[.!?])\s+', text_snippet.strip())
        complaint_summary = " ".join(sentences[:2])[:300]

    # Personalise the opener based on subreddit
    platform_ref = f"r/{subreddit}"

    pitch = (
        f"Hey u/{username} — saw your post in {platform_ref} about {title[:80].rstrip('.')}. "
        f"That pain is real — most outreach tools just automate spam at this point and reply rates "
        f"have cratered. "
        f"I'm building AXON, an AI outreach platform that finds verified leads, writes genuinely "
        f"personalised emails, and handles follow-ups automatically — typically getting 3-5x higher "
        f"reply rates than traditional tools. "
        f"We're launching in 2 weeks with only 20 founding member spots, all at 40% off forever. "
        f"Would love to get you early access. "
        f"What does your current outreach setup look like?"
    )

    return complaint_summary[:300], pitch


# ─────────────────────────────────────────────
#  REDDIT PRAW SCRAPER
# ─────────────────────────────────────────────

def scrape_via_praw():
    """Use PRAW to search each subreddit for pain posts."""
    print("\n[PRAW] Connecting to Reddit API...")
    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT,
    )

    existing_urls = load_existing_urls(LEADS_FILE)
    leads = []

    for sub_name in SUBREDDITS:
        subreddit = reddit.subreddit(sub_name)
        for query in SEARCH_QUERIES:
            print(f"  [PRAW] r/{sub_name} — searching: \"{query}\"")
            try:
                results = subreddit.search(query, sort="new", time_filter="year", limit=25)
                for post in results:
                    url = f"https://www.reddit.com{post.permalink}"
                    if url in existing_urls:
                        continue
                    full_text = (post.title + " " + (post.selftext or "")).strip()
                    if not has_pain(full_text):
                        continue
                    snippet = (post.selftext or "")[:500].replace("\n", " ")
                    lead = [
                        post.author.name if post.author else "[deleted]",
                        sub_name,
                        post.title,
                        url,
                        snippet,
                        "reddit_praw",
                        TODAY,
                    ]
                    leads.append(lead)
                    existing_urls.add(url)
                time.sleep(2.0)   # be polite to Reddit's API
            except Exception as e:
                print(f"    [PRAW] Error on r/{sub_name} / \"{query}\": {e}")

    if leads:
        append_rows(LEADS_FILE, LEADS_HEADER, leads)
        print(f"[PRAW] Saved {len(leads)} new leads.")
    else:
        print("[PRAW] No new leads found.")
    return leads


# ─────────────────────────────────────────────
#  GOOGLE SEARCH SCRAPER (no API needed)
# ─────────────────────────────────────────────

GOOGLE_QUERIES = [
    "site:reddit.com/r/SaaS cold email not working",
    "site:reddit.com/r/entrepreneur struggling with leads",
    "site:reddit.com/r/startups outreach not working",
    "site:reddit.com/r/sales cold email no replies",
    "site:reddit.com/r/SaaS lead generation problems",
    "site:reddit.com/r/entrepreneur can't get clients",
    "site:reddit.com/r/startups can't book meetings",
    "site:reddit.com/r/sales prospecting failing",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def extract_subreddit(url):
    match = re.search(r'reddit\.com/r/([^/]+)', url)
    return match.group(1) if match else "unknown"


def scrape_via_google():
    """
    Scrape Google search results for Reddit post URLs, then fetch each
    Reddit post to extract the username and post text.
    """
    print("\n[Google] Scraping Google for Reddit post URLs...")
    existing_urls = load_existing_urls(LEADS_FILE)
    reddit_urls = set()

    for query in GOOGLE_QUERIES:
        encoded = requests.utils.quote(query)
        google_url = f"https://www.google.com/search?q={encoded}&num=10"
        try:
            resp = requests.get(google_url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                # Google wraps URLs in /url?q=...
                if "/url?q=" in href:
                    actual = href.split("/url?q=")[1].split("&")[0]
                    actual = requests.utils.unquote(actual)
                else:
                    actual = href
                if "reddit.com/r/" in actual and "/comments/" in actual:
                    clean = actual.split("?")[0].rstrip("/")
                    if clean not in existing_urls:
                        reddit_urls.add(clean)
            print(f"  [Google] \"{query[:50]}\" → found {len(reddit_urls)} unique URLs so far")
            time.sleep(5)  # avoid rate limiting
        except Exception as e:
            print(f"  [Google] Error on query \"{query[:50]}\": {e}")

    print(f"\n[Google] Fetching {len(reddit_urls)} Reddit posts...")
    leads = []
    for url in reddit_urls:
        if url in existing_urls:
            continue
        try:
            json_url = url + ".json"
            resp = requests.get(
                json_url,
                headers={"User-Agent": "axon-leads-script/1.0"},
                timeout=10
            )
            if resp.status_code != 200:
                continue
            data = resp.json()
            post_data = data[0]["data"]["children"][0]["data"]
            title      = post_data.get("title", "")
            selftext   = post_data.get("selftext", "")
            author     = post_data.get("author", "[deleted]")
            subreddit  = post_data.get("subreddit", extract_subreddit(url))

            full_text = title + " " + selftext
            if not has_pain(full_text):
                continue

            snippet = selftext[:500].replace("\n", " ")
            lead = [author, subreddit, title, url, snippet, "reddit_google", TODAY]
            leads.append(lead)
            existing_urls.add(url)
            time.sleep(3.0)
        except Exception as e:
            print(f"  [Google→Reddit] Error fetching {url}: {e}")

    if leads:
        append_rows(LEADS_FILE, LEADS_HEADER, leads)
        print(f"[Google] Saved {len(leads)} new leads.")
    else:
        print("[Google] No new leads found.")
    return leads


# ─────────────────────────────────────────────
#  PITCH GENERATION
# ─────────────────────────────────────────────

def generate_pitches():
    """Read all leads and write a pitch for any not already pitched."""
    if not os.path.exists(LEADS_FILE):
        print("[Pitches] No leads.csv found, skipping.")
        return 0

    existing_pitched_urls = load_existing_urls(PITCHES_FILE, url_col_index=2)
    new_pitches = []

    with open(LEADS_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            url = row["url"].strip()
            if url in existing_pitched_urls:
                continue
            username      = row["username"]
            subreddit     = row["subreddit"]
            title         = row["title"]
            text_snippet  = row.get("text_snippet", "")

            complaint_summary, pitch = write_pitch(username, subreddit, url, title, text_snippet)
            new_pitches.append([
                username, subreddit, url, complaint_summary, pitch, "pending", TODAY
            ])

    if new_pitches:
        append_rows(PITCHES_FILE, PITCHES_HEADER, new_pitches)
        print(f"[Pitches] Wrote {len(new_pitches)} new pitches.")
    else:
        print("[Pitches] No new pitches needed.")
    return len(new_pitches)


# ─────────────────────────────────────────────
#  SUMMARY
# ─────────────────────────────────────────────

def print_summary(praw_leads, google_leads, pitch_count):
    total_new = len(praw_leads) + len(google_leads)

    # Count totals in files
    def count_rows(filepath):
        if not os.path.exists(filepath):
            return 0
        with open(filepath, newline="", encoding="utf-8") as f:
            return max(0, sum(1 for _ in f) - 1)  # subtract header

    total_leads   = count_rows(LEADS_FILE)
    total_pitches = count_rows(PITCHES_FILE)

    praw_sub_counts = {}
    for lead in praw_leads:
        sub = lead[1]
        praw_sub_counts[sub] = praw_sub_counts.get(sub, 0) + 1

    google_sub_counts = {}
    for lead in google_leads:
        sub = lead[1]
        google_sub_counts[sub] = google_sub_counts.get(sub, 0) + 1

    print("\n" + "=" * 50)
    print("       AXON LEAD PIPELINE — SUMMARY")
    print("=" * 50)
    print(f"  Run date          : {TODAY}")
    print(f"  New leads found   : {total_new}")
    print(f"    └─ via PRAW     : {len(praw_leads)}")
    for sub, count in praw_sub_counts.items():
        print(f"       └─ r/{sub}: {count}")
    print(f"    └─ via Google   : {len(google_leads)}")
    for sub, count in google_sub_counts.items():
        print(f"       └─ r/{sub}: {count}")
    print(f"  Total leads (all) : {total_leads}")
    print(f"  New pitches       : {pitch_count}")
    print(f"  Total pitches     : {total_pitches}")
    print(f"\n  Files saved to ~/axon-leads/")
    print(f"    leads.csv   → {total_leads} rows")
    print(f"    pitches.csv → {total_pitches} rows")
    print("=" * 50)


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def main():
    print("=" * 50)
    print("  AXON Lead Generation Script")
    print("=" * 50)

    # Validate credentials
    if "YOUR_CLIENT_ID" in REDDIT_CLIENT_ID:
        print("\n⚠  Reddit credentials not set.")
        print("   Edit axon_leads.py and fill in:")
        print("     REDDIT_CLIENT_ID")
        print("     REDDIT_CLIENT_SECRET")
        print("     REDDIT_USER_AGENT")
        print("\n   See setup instructions below.\n")
        praw_leads = []
        print("[PRAW] Skipping PRAW scrape (no credentials).")
    else:
        praw_leads = scrape_via_praw()

    google_leads = scrape_via_google()
    pitch_count  = generate_pitches()
    print_summary(praw_leads, google_leads, pitch_count)


if __name__ == "__main__":
    main()
