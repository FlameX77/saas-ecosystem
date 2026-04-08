#!/usr/bin/env python3
"""AXON daily stats — run anytime to see lead pipeline."""

import csv, os
from collections import Counter
from datetime import datetime, timedelta

LEADS_FILE   = os.path.expanduser("~/axon-leads/leads.csv")
PITCHES_FILE = os.path.expanduser("~/axon-leads/pitches.csv")

def read_csv(path):
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

leads   = read_csv(LEADS_FILE)
pitches = read_csv(PITCHES_FILE)

dates    = Counter(r["date_found"] for r in leads)
platforms = Counter(r["platform"] for r in leads)
statuses  = Counter(r.get("status","?") for r in pitches)

today     = datetime.today().strftime("%Y-%m-%d")
yesterday = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")

print("=" * 48)
print("  AXON LEAD PIPELINE — STATS")
print("=" * 48)
print(f"\n  DAILY LEADS")
print(f"  {'Date':<14}  Leads")
print(f"  {'─'*14}  ─────")
for d in sorted(dates, reverse=True)[:10]:
    marker = " ← today" if d == today else (" ← yesterday" if d == yesterday else "")
    print(f"  {d}    {dates[d]:>5}{marker}")

print(f"\n  TOTALS")
print(f"  Total leads    : {len(leads)}")
print(f"  Total pitches  : {len(pitches)}")
print(f"  Avg/day        : {len(leads) / max(len(dates),1):.0f}")

print(f"\n  BY PLATFORM")
for p, c in platforms.most_common():
    bar = "█" * (c // 20)
    print(f"  {p:<15} {c:>5}  {bar}")

print(f"\n  PITCH STATUS")
for s, c in statuses.most_common():
    print(f"  {s:<12} {c:>5}")

print("=" * 48)
