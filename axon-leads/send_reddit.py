#!/usr/bin/env python3
"""
AXON Reddit DM Sender
Opens a real Chrome browser, waits for manual login, then sends
personalised pitches to Reddit leads one by one.
"""

import csv
import os
import random
import time
import tempfile
import shutil
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

PITCHES_FILE = os.path.expanduser("~/axon-leads/pitches.csv")
DAILY_LIMIT  = 20
DELAY_MIN    = 45   # seconds between messages
DELAY_MAX    = 90

# ─────────────────────────────────────────────
#  CSV HELPERS
# ─────────────────────────────────────────────

def load_pitches():
    with open(PITCHES_FILE, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def save_pitches(rows):
    """Atomically rewrite pitches.csv."""
    tmp = PITCHES_FILE + ".tmp"
    fieldnames = ["username", "platform", "url", "complaint_summary",
                  "pitch", "status", "date_written"]
    with open(tmp, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL,
                                extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    shutil.move(tmp, PITCHES_FILE)


def mark_sent(rows, url, note=""):
    today = datetime.today().strftime("%Y-%m-%d")
    for row in rows:
        if row["url"] == url:
            row["status"] = f"sent_{today}" + (f"_{note}" if note else "")
    return rows


def mark_failed(rows, url, reason="failed"):
    for row in rows:
        if row["url"] == url:
            row["status"] = reason
    return rows


# ─────────────────────────────────────────────
#  LEAD SCORING  (higher = warmer)
# ─────────────────────────────────────────────

HIGH_INTENT = [
    "zero replies", "0 replies", "no replies", "dead end",
    "tried everything", "months", "gave up", "quit",
    "can't get", "nothing works", "i quit", "losing", "lost",
    "not working", "dead", "broken", "wasted",
]

def score_lead(row):
    text = (row.get("complaint_summary", "") + " " + row.get("pitch", "")).lower()
    return sum(1 for kw in HIGH_INTENT if kw in text)


# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def main():
    all_rows = load_pitches()

    # Filter: Reddit leads that are still pending
    reddit_pending = [
        r for r in all_rows
        if r["platform"] == "reddit" and r["status"] == "pending"
    ]

    if not reddit_pending:
        print("No pending Reddit leads found.")
        return

    # Sort by score descending — warmest first
    reddit_pending.sort(key=score_lead, reverse=True)
    queue = reddit_pending[:DAILY_LIMIT]

    print("=" * 52)
    print("  AXON Reddit DM Sender")
    print("=" * 52)
    print(f"  Pending Reddit leads : {len(reddit_pending)}")
    print(f"  Sending today        : {len(queue)}")
    print(f"  Delay between sends  : {DELAY_MIN}–{DELAY_MAX}s")
    print("=" * 52)
    print()
    print("Top leads queued (by complaint score):")
    for i, r in enumerate(queue[:5], 1):
        print(f"  {i}. u/{r['username']:<20} score={score_lead(r)}  — {r['complaint_summary'][:50]}")
    print()

    with sync_playwright() as p:
        # Launch a visible (headed) browser so you can log in manually
        browser = p.chromium.launch(
            headless=False,
            args=["--start-maximized"],
        )
        context = browser.new_context(viewport=None)
        page = context.new_page()

        # ── Step 1: Go to Reddit login ──────────────────────────
        print("Opening Reddit login page...")
        page.goto("https://www.reddit.com/login", wait_until="domcontentloaded")

        print()
        print("╔══════════════════════════════════════════════════╗")
        print("║  Please log in to Reddit in the browser window.  ║")
        print("║  The script will auto-detect when you're done.   ║")
        print("╚══════════════════════════════════════════════════╝")
        print()

        # Wait until Reddit redirects away from /login (means logged in)
        try:
            page.wait_for_url(
                lambda url: "/login" not in url and "reddit.com" in url,
                timeout=300_000   # 5 minutes to log in
            )
        except PWTimeout:
            print("Timed out waiting for login. Exiting.")
            browser.close()
            return

        print(f"Logged in! Starting sends in 3 seconds...\n")
        time.sleep(3)

        # ── Step 2: Send messages ────────────────────────────────
        sent_count  = 0
        fail_count  = 0

        for i, lead in enumerate(queue, 1):
            username = lead["username"].lstrip("u/").strip()
            pitch    = lead["pitch"].strip()
            url      = lead["url"]

            compose_url = f"https://www.reddit.com/message/compose/?to={username}"
            print(f"[{i}/{len(queue)}] Messaging u/{username}...")

            try:
                page.goto(compose_url, wait_until="domcontentloaded", timeout=20_000)
                time.sleep(1.5)

                # Check for "user not found" or error page
                if "page not found" in page.title().lower() or \
                   page.locator("text=Sorry, nobody on Reddit goes by that name").count() > 0:
                    print(f"  ✗ u/{username} — account not found, skipping")
                    all_rows = mark_failed(all_rows, url, "user_not_found")
                    save_pitches(all_rows)
                    fail_count += 1
                    continue

                # Subject line
                subject_field = page.locator('input[name="subject"], #subject, input[placeholder*="subject" i]').first
                subject_field.wait_for(timeout=8_000)
                subject_field.click()
                subject_field.fill("Quick question about your outreach")

                # Message body
                body_field = page.locator('textarea[name="message"], #message, textarea[placeholder*="message" i]').first
                body_field.wait_for(timeout=8_000)
                body_field.click()
                body_field.fill(pitch)

                time.sleep(0.8)

                # Send button
                send_btn = page.locator(
                    'button[type="submit"]:has-text("Send"), '
                    'button:has-text("Send Message"), '
                    'input[value="send"]'
                ).first
                send_btn.wait_for(timeout=8_000)
                send_btn.click()

                # Wait for confirmation (URL changes or success message)
                try:
                    page.wait_for_url(
                        lambda u: "compose" not in u or "sent" in u,
                        timeout=10_000
                    )
                except PWTimeout:
                    pass  # Some Reddit versions stay on same page after send

                time.sleep(1.5)

                # Check we're not on an error page
                if "compose" in page.url and \
                   page.locator("text=your message must be between").count() > 0:
                    print(f"  ✗ u/{username} — message too long, skipping")
                    all_rows = mark_failed(all_rows, url, "too_long")
                    save_pitches(all_rows)
                    fail_count += 1
                    continue

                all_rows = mark_sent(all_rows, url)
                save_pitches(all_rows)
                sent_count += 1
                print(f"  ✓ Sent {sent_count}/{len(queue)} — u/{username}")

                # Random delay before next message
                if i < len(queue):
                    delay = random.randint(DELAY_MIN, DELAY_MAX)
                    print(f"  ⏱  Waiting {delay}s before next message...")
                    time.sleep(delay)

            except PWTimeout:
                print(f"  ✗ u/{username} — page timeout, skipping")
                all_rows = mark_failed(all_rows, url, "timeout")
                save_pitches(all_rows)
                fail_count += 1
                time.sleep(5)

            except Exception as e:
                print(f"  ✗ u/{username} — error: {e}")
                all_rows = mark_failed(all_rows, url, "error")
                save_pitches(all_rows)
                fail_count += 1
                time.sleep(5)

        browser.close()

    # ── Summary ─────────────────────────────────────────────────
    remaining = len([r for r in all_rows
                     if r["platform"] == "reddit" and r["status"] == "pending"])
    print()
    print("=" * 52)
    print("  Done for today!")
    print("=" * 52)
    print(f"  Sent today      : {sent_count}")
    print(f"  Failed/skipped  : {fail_count}")
    print(f"  Still pending   : {remaining} Reddit leads")
    print(f"  Run again tomorrow for the next {DAILY_LIMIT}.")
    print("=" * 52)


if __name__ == "__main__":
    main()
