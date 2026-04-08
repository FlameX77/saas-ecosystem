#!/usr/bin/env python3
"""
Generate helpful public Reddit/HN/IH comments for AXON leads.
Writes ~/axon-leads/comments.csv
"""

import csv, re, os, random
from collections import defaultdict

LEADS_FILE    = os.path.expanduser("~/axon-leads/leads.csv")
COMMENTS_FILE = os.path.expanduser("~/axon-leads/comments.csv")

# ─────────────────────────────────────────────
#  FILTERS
# ─────────────────────────────────────────────

RELEVANT_SUBS = {
    'SaaS','entrepreneur','startups','sales','coldemail','microsaas',
    'buildinpublic','ColdEmailMasters','SideProject','GrowthHacking',
    'b2b_sales','Solopreneur','AiForSmallBusiness','freelance',
    'smallbusiness','marketing','cofounderhunt','AiAutomations',
    'leadsgeneration','emailmarketing','outreach','NextGenEmailMarketing',
    'Coldemailing','agency','digitalmarketing','Entrepreneur',
    'freelance_forhire','GrowMyBusinessNow','agenticsales','indiehackers',
}

NOISE_SUBS = {'TEMUpact','TemuCodeExchange','Temuaffiliateprogram','learnASL',
              'LandscapeArchitecture','Assistance','openclaw'}

REAL_PAIN = [
    'struggling','not working','no replies','can\'t get','help','advice',
    'how do i','how do you','frustrated','failing','no results','tips',
    'question','what am i','tried','problem','no customers','no clients',
    'no sales','low reply','open rate','deliverability','spam','bounce',
    'cold email','outreach','lead gen','getting clients','finding leads',
    'b2b sales','lead generation','cold outreach','reply rate',
]

def get_sub(url):
    m = re.search(r'/r/([^/]+)/', url)
    return m.group(1) if m else ''

def is_relevant(row):
    sub   = get_sub(row['url'])
    text  = (row['complaint'] + ' ' + row['url']).lower()
    is_post  = '/comments/' in row['url'] or 'indiehackers.com/post' in row['url'] or 'ycombinator' in row['url']
    is_noise = sub in NOISE_SUBS or any(x in row['url'].lower() for x in ['temu','learnASL'])
    in_sub   = sub in RELEVANT_SUBS
    has_pain = any(kw in text for kw in REAL_PAIN)
    return is_post and (in_sub or has_pain) and not is_noise

# ─────────────────────────────────────────────
#  COMMENT TEMPLATES BY TOPIC
# ─────────────────────────────────────────────
# Each template is a function(username, complaint) → comment string

def comment_cold_email_reply_rate(username, complaint):
    return f"""Reply rates have cratered across the board lately — a few things that actually move the needle:

1. **Lead quality beats send volume.** 50 emails to the right ICPs beats 500 sprayed broadly. Verify intent signals first.
2. **First line = their world, not yours.** Reference something specific about their business before mentioning what you do. Generic openers get deleted in 2 seconds.
3. **Follow-up sequence matters more than the first email.** 70% of replies come from emails 2–4, not email 1.

I'm actually building [AXON](https://axon.so) — an AI outreach tool that handles lead finding, personalised copy, and follow-up sequences. Launching in 2 weeks with founding member pricing if you want early access."""

def comment_lead_gen_struggle(username, complaint):
    return f"""Lead gen being this hard is usually a top-of-funnel problem, not a messaging one. A few things worth trying:

1. **Niche the ICP harder.** "B2B SaaS founder" is too broad — "Series A SaaS companies hiring a VP Sales right now" is specific enough to write a genuinely relevant email.
2. **Trigger-based outreach beats cold lists.** Job postings, funding announcements, new hires = people with active budgets and problems to solve.
3. **LinkedIn + email combo.** A LinkedIn view before the email adds ~15% to reply rates in most tests.

Building [AXON](https://axon.so) which automates exactly this — find verified leads by trigger, write personalised outreach. Founding member spots open in 2 weeks."""

def comment_deliverability(username, complaint):
    return f"""Deliverability issues usually come down to a few fixable things:

1. **Domain age and warmup.** Sending from a fresh domain without a warmup period will tank your sender score fast. 4–6 weeks of warmup minimum before real sends.
2. **SPF, DKIM, DMARC** — all three need to be properly configured, not just set. Check with mail-tester.com for a real score.
3. **Plain text > HTML for cold email.** Heavily formatted HTML with images screams mass marketing. Plain text with minimal links gets treated like a real email.

Working on [AXON](https://axon.so) which handles sending infrastructure + warmup automatically. Founding member pricing in 2 weeks if useful."""

def comment_no_traction(username, complaint):
    return f"""The distribution problem is so common for technical builders — a few things that actually work early on:

1. **Do things that don't scale first.** Find 10 people manually, DM them, get on calls. You need to understand the exact words they use to describe their problem before any outreach scales.
2. **Post where your ICP already is.** Relevant subreddits, Slack communities, LinkedIn niches — be genuinely helpful before you pitch.
3. **Cold email to a tight list still works** when it's specific. 30 well-researched emails beats 3000 blasted ones.

I'm building [AXON](https://axon.so) specifically for this — AI outreach that finds leads and writes genuinely personalised emails. Launching in 2 weeks with 40% founding member discount."""

def comment_cant_get_clients(username, complaint):
    return f"""Getting clients without an existing network is genuinely hard — what's worked for people in similar spots:

1. **Productised outreach.** Don't pitch your service — pitch a specific outcome for a specific type of company. "I help e-commerce brands reduce cart abandonment" converts way better than "I do digital marketing."
2. **Go where the pain is loudest.** Monitor relevant subreddits and forums for people actively asking for help — they have the problem and are ready to hear solutions.
3. **One great case study beats ten cold emails.** Even one result (even pro bono) gives you something real to reference.

Building [AXON](https://axon.so) which monitors signals and automates personalised outreach — might be useful for your situation. Founding member pricing in 2 weeks."""

def comment_sales_struggle(username, complaint):
    return f"""B2B sales being brutal right now is real — buyers are more skeptical and inboxes are noisier. What's been cutting through:

1. **Lead with insight, not product.** "Companies in your space are doing X to solve Y" lands better than any feature list.
2. **Short emails win.** Under 75 words, one ask, no attachments. The goal of the first email is a reply, not a sale.
3. **Timing matters.** Reaching out within 24h of a trigger (funding, hire, job post) gets 3-4x higher response than cold outreach with no context.

I'm building [AXON](https://axon.so) — AI outreach that automates lead finding and personalised emails. Launching in 2 weeks, founding member spots open."""

def comment_hn_generic(username, complaint):
    return f"""A few things that have moved the needle for early-stage B2B outreach:

1. **Specificity compounds.** The more specific your ICP and the more your message references their actual situation, the better. Generic = deleted.
2. **Outbound doesn't scale until you've done 50–100 manual sends.** You need to know what language lands before automating anything.
3. **Multi-touch matters.** Email + LinkedIn + a reply to one of their posts = 3x higher conversion than email alone.

Relevant because I'm building [AXON](https://axon.so) — an AI tool for exactly this: finds the right leads, writes personalised emails, handles follow-ups. Launching in 2 weeks with founding member pricing."""

def comment_ih_generic(username, complaint):
    return f"""This is one of the hardest parts of indie building — the product comes easier than distribution. What's worked for others at this stage:

1. **Don't scale before it works manually.** Spend a week doing outreach by hand to 20 people. The copy and ICP clarity you get is worth more than any tool.
2. **Tap warm networks before cold.** Past colleagues, classmates, Twitter/LinkedIn followers first — they'll give you a chance that strangers won't.
3. **Cold email still works at small scale** when it's hyper-personalised — reference something specific they've written or done.

I'm launching [AXON](https://axon.so) in 2 weeks — AI that finds leads and writes personalised outreach. Founding member discount if you want early access."""

# ─────────────────────────────────────────────
#  PICK TEMPLATE BY COMPLAINT CONTENT
# ─────────────────────────────────────────────

def pick_comment(row):
    text = (row['complaint'] + ' ' + row['url']).lower()
    u    = row['username']
    c    = row['complaint']

    if any(k in text for k in ['deliverability','spam folder','inbox','bounce','dkim','spf']):
        return comment_deliverability(u, c)
    if any(k in text for k in ['reply rate','no replies','zero replies','open rate','not converting']):
        return comment_cold_email_reply_rate(u, c)
    if any(k in text for k in ['lead gen','lead generation','finding leads','building a list']):
        return comment_lead_gen_struggle(u, c)
    if any(k in text for k in ['no traction','no customers','zero signups','no revenue','zero mrr','no sales']):
        return comment_no_traction(u, c)
    if any(k in text for k in ["can't get clients","getting clients","no clients","find clients"]):
        return comment_cant_get_clients(u, c)
    if any(k in text for k in ['b2b sales','cold calling','outbound sales','sales pipeline']):
        return comment_sales_struggle(u, c)
    if row['platform'] == 'indiehackers':
        return comment_ih_generic(u, c)
    return comment_hn_generic(u, c)

# ─────────────────────────────────────────────
#  SCORE COMMENTS  (warmth signal)
# ─────────────────────────────────────────────

HIGH_INTENT = [
    'zero replies','no replies','tried everything','months','gave up',
    'quit','not working','dead end','can\'t get','wasted','nothing works',
    'no customers','no clients','zero','broken','failing','frustrated',
    'struggling','lost','no results',
]

def score(row):
    text = (row['complaint']).lower()
    return sum(1 for kw in HIGH_INTENT if kw in text)

# ─────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────

def main():
    with open(LEADS_FILE, newline='', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    relevant = [r for r in rows if is_relevant(r)]
    print(f"Total leads       : {len(rows)}")
    print(f"Relevant for comments : {len(relevant)}")

    # Group by subreddit / platform
    by_sub = defaultdict(list)
    for r in relevant:
        sub = get_sub(r['url']) or r['platform']
        by_sub[sub].append(r)

    print(f"\nSubreddits / platforms covered: {len(by_sub)}")

    # Generate comments
    results = []
    for sub, leads in by_sub.items():
        for lead in leads:
            comment = pick_comment(lead)
            # Word count check — trim if over 160 words
            words = comment.split()
            if len(words) > 160:
                comment = ' '.join(words[:160]) + '...'
            results.append({
                'url':          lead['url'],
                'subreddit':    sub,
                'username':     lead['username'],
                'platform':     lead['platform'],
                'complaint':    lead['complaint'][:120],
                'comment_text': comment,
                'score':        score(lead),
            })

    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)

    # Save CSV
    fieldnames = ['url','subreddit','username','platform','complaint','comment_text','score']
    with open(COMMENTS_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(results)

    print(f"Saved {len(results)} comments → {COMMENTS_FILE}")

    # Print top 20
    print("\n" + "="*70)
    print("  TOP 20 COMMENTS TO POST TODAY  (sorted by urgency score)")
    print("="*70)
    for i, r in enumerate(results[:20], 1):
        print(f"\n{'─'*70}")
        print(f"#{i}  r/{r['subreddit']} — u/{r['username']}  [score: {r['score']}]")
        print(f"URL: {r['url']}")
        print(f"Their complaint: {r['complaint'][:100]}")
        print(f"\nCOMMENT:\n{r['comment_text']}")
    print("\n" + "="*70)
    print(f"All {len(results)} comments saved to ~/axon-leads/comments.csv")


if __name__ == "__main__":
    main()
