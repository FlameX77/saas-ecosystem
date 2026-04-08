-- ============================================================
-- Revivo Demo Seed — Miami Smile Dental
-- 15 contacts · 30 conversations · $34,500 recovered · 3 sequences
-- ============================================================

-- Demo organization
INSERT INTO organizations (id, name, slug, industry, plan_tier, subscription_status, avg_deal_value, booking_link, timezone)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Miami Smile Dental',
  'miami-smile-dental',
  'Dental Clinic',
  'pro',
  'active',
  3400,
  'https://cal.com/miami-smile-dental',
  'America/New_York'
) ON CONFLICT (id) DO NOTHING;

-- Demo profile (will be linked to real auth user on first login)
-- This org_id is used by demo pages that fall back to DEMO data

-- ── 15 CONTACTS across all pipeline stages ──────────────────
INSERT INTO contacts (id, org_id, first_name, last_name, phone, email, service_interest, deal_value, stage, opted_out, source, notes, created_at, last_contacted_at)
VALUES
  -- NEW LEADS (3)
  ('c001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Sarah',    'Mitchell',  '+13055551234', 'sarah.mitchell@gmail.com',    'Teeth Whitening',        2400,  'new_lead',          false, 'Instagram Ad',      'Saw our before/after post. Wants same-day whitening.',                                   NOW() - INTERVAL '1 day',    NULL),
  ('c002', 'a1b2c3d4-0000-0000-0000-000000000001', 'David',    'Kim',       '+13055557890', NULL,                          'Teeth Whitening',         800,  'new_lead',          false, 'Google',            NULL,                                                                                     NOW() - INTERVAL '2 hours',  NULL),
  ('c003', 'a1b2c3d4-0000-0000-0000-000000000001', 'Nina',     'Patel',     '+13055553344', 'nina.patel@outlook.com',      'Braces Consultation',    3200,  'new_lead',          false, 'Referral',          'Referred by Jennifer Walsh. Looking to start treatment next month.',                     NOW() - INTERVAL '3 hours',  NULL),

  -- CONTACTED (3)
  ('c004', 'a1b2c3d4-0000-0000-0000-000000000001', 'Carlos',   'Rivera',    '+13055555678', NULL,                          'Invisalign',             5800,  'contacted',         false, 'Google Ads',        'Very interested, just said he is "thinking about it". Worth a follow-up.',               NOW() - INTERVAL '8 days',   NOW() - INTERVAL '2 days'),
  ('c005', 'a1b2c3d4-0000-0000-0000-000000000001', 'Elena',    'Rodriguez', NULL,           'elena.rodriguez@gmail.com',   'Porcelain Veneers',      9200,  'contacted',         false, 'Website',           'High-value prospect. Has budget. Wants to compare options.',                             NOW() - INTERVAL '12 days',  NOW() - INTERVAL '4 days'),
  ('c006', 'a1b2c3d4-0000-0000-0000-000000000001', 'Tom',      'Chen',      '+13055556677', 'tom.chen@icloud.com',         'Ceramic Crowns',         4800,  'contacted',         false, 'Yelp',              'Came in for a consult but went quiet. Needs a nudge.',                                   NOW() - INTERVAL '15 days',  NOW() - INTERVAL '5 days'),

  -- REPLIED (3)
  ('c007', 'a1b2c3d4-0000-0000-0000-000000000001', 'Amanda',   'Chen',      '+13055559012', 'amanda.chen@gmail.com',       'Dental Implant',         4200,  'replied',           false, 'Google Ads',        'Replied asking about implant vs bridge. Very engaged.',                                  NOW() - INTERVAL '7 days',   NOW() - INTERVAL '1 day'),
  ('c008', 'a1b2c3d4-0000-0000-0000-000000000001', 'James',    'Wong',      '+13055558901', NULL,                          'Root Canal',             1200,  'replied',           false, 'Emergency',         'Had an emergency visit. Now considering full treatment.',                                NOW() - INTERVAL '5 days',   NOW() - INTERVAL '4 hours'),
  ('c009', 'a1b2c3d4-0000-0000-0000-000000000001', 'Lisa',     'Park',      NULL,           'lisa.park@gmail.com',         'Zoom Whitening',         1800,  'replied',           false, 'Instagram Ad',      'Asked for pricing breakdown. Send detailed quote.',                                     NOW() - INTERVAL '4 days',   NOW() - INTERVAL '6 hours'),

  -- APPOINTMENT BOOKED (2)
  ('c010', 'a1b2c3d4-0000-0000-0000-000000000001', 'Marcus',   'Johnson',   NULL,           'marcus.j@hotmail.com',        'Porcelain Veneers',      8500,  'appointment_booked',false, 'Google Ads',        'Consultation booked for Monday. Very excited. High value.',                              NOW() - INTERVAL '10 days',  NOW() - INTERVAL '1 hour'),
  ('c011', 'a1b2c3d4-0000-0000-0000-000000000001', 'Sophia',   'Lee',       '+13055552233', 'sophia.lee@gmail.com',        'Invisalign',             6400,  'appointment_booked',false, 'Referral',          'Booked after 3-day sequence. Excited about clear aligners.',                             NOW() - INTERVAL '9 days',   NOW() - INTERVAL '2 hours'),

  -- RECOVERED (3)
  ('c012', 'a1b2c3d4-0000-0000-0000-000000000001', 'Priya',    'Patel',     NULL,           'priya.patel@gmail.com',       'Invisalign Full',        5800,  'recovered',         false, 'Google Ads',        'Recovered after no-show. Paid in full. Amazing turnaround.',                             NOW() - INTERVAL '20 days',  NOW()),
  ('c013', 'a1b2c3d4-0000-0000-0000-000000000001', 'Robert',   'Kim',       '+13055554455', NULL,                          'Dental Implant',         4200,  'recovered',         false, 'Referral',          'Cold lead from 3 months ago. AI message got a reply same day.',                          NOW() - INTERVAL '25 days',  NOW() - INTERVAL '2 days'),
  ('c014', 'a1b2c3d4-0000-0000-0000-000000000001', 'Jennifer', 'Walsh',     NULL,           'jennifer.walsh@law.com',      'Teeth Whitening',        2400,  'recovered',         false, 'LinkedIn',          'Law firm partner. Loves the results. Left a 5-star review.',                            NOW() - INTERVAL '18 days',  NOW() - INTERVAL '3 days'),

  -- LOST (1)
  ('c015', 'a1b2c3d4-0000-0000-0000-000000000001', 'Michael',  'Torres',    '+13055559988', 'michael.torres@gmail.com',    'Emergency Root Canal',   1200,  'lost',              false, 'Emergency',         'Went to a competitor. Price shopper. Low priority.',                                     NOW() - INTERVAL '30 days',  NOW() - INTERVAL '20 days')

ON CONFLICT (id) DO NOTHING;

-- ── 3 SEQUENCES ──────────────────────────────────────────────
INSERT INTO sequences (id, org_id, name, description, active, status, stop_on_reply, stop_on_booked)
VALUES
  ('seq001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Dental Lead Reactivation',   'Re-engage enquiries that never booked — 3 touches over 7 days',  true,  'active', true, true),
  ('seq002', 'a1b2c3d4-0000-0000-0000-000000000001', 'No-Show Recovery',            'Win back patients who missed their appointment',                  true,  'active', true, true),
  ('seq003', 'a1b2c3d4-0000-0000-0000-000000000001', 'Post-Service Review Request', 'Collect 5-star Google reviews after treatment',                   false, 'paused', true, false)
ON CONFLICT (id) DO NOTHING;

-- ── SEQUENCE STEPS ─────────────────────────────────────────
INSERT INTO sequence_steps (id, sequence_id, step_number, channel, delay_days, template_body, subject_template)
VALUES
  -- Lead Reactivation
  ('ss01', 'seq001', 1, 'sms',      1, 'Hi {{first_name}}! Just saw you were interested in {{service}} at {{business_name}}. We have a couple of openings this week — want to grab one? 😊', NULL),
  ('ss02', 'seq001', 2, 'email',    3, 'Hi {{first_name}},\n\nI noticed you haven''t had a chance to book your {{service}} consultation yet. Our patients who''ve gone ahead with it absolutely love the results.\n\nWe have a few openings this week with no consultation fee. Would any of these times work for you?\n\n{{booking_link}}\n\nLooking forward to meeting you,\nDr. Kim', 'Your {{service}} at {{business_name}} — a spot just opened up'),
  ('ss03', 'seq001', 3, 'whatsapp', 7, 'Hey {{first_name}} 👋 Last check-in from us — still thinking about {{service}}? Happy to answer any questions before you decide. No pressure at all!', NULL),

  -- No-Show Recovery
  ('ss04', 'seq002', 1, 'sms',      0, 'Hi {{first_name}}, we missed you today! Life gets busy — totally understand. Want to reschedule? Here''s our booking link: {{booking_link}} 😊', NULL),
  ('ss05', 'seq002', 2, 'email',    2, 'Hi {{first_name}},\n\nWe had a spot saved for you and wanted to make it easy to rebook at a time that actually works.\n\n{{booking_link}}\n\nLet us know if you have any questions or need to chat through options!\n\nBest,\nMiami Smile Dental', 'Reschedule your appointment — {{business_name}}'),
  ('ss06', 'seq002', 3, 'sms',      5, '{{first_name}}, one last nudge 😊 We''d love to get you sorted. Click here when you''re ready: {{booking_link}}', NULL),

  -- Review Request
  ('ss07', 'seq003', 1, 'sms',      1, 'Hi {{first_name}}! How''s everything after your {{service}}? We hope you''re loving the results 🤩 If you have a moment, a quick Google review would mean the world to us: {{booking_link}}', NULL),
  ('ss08', 'seq003', 2, 'email',    4, 'Hi {{first_name}},\n\nWe hope your {{service}} went smoothly! Your feedback genuinely helps other patients make confident decisions.\n\nWould you mind leaving us a quick Google review? It only takes 2 minutes:\n\n{{booking_link}}\n\nThank you so much — it means everything to the team 🙏', 'How was your experience, {{first_name}}?')

ON CONFLICT (id) DO NOTHING;

-- ── 30 CONVERSATIONS ─────────────────────────────────────
INSERT INTO conversations (id, org_id, contact_id, channel, direction, body, subject, ai_generated, delivery_status, sent_at, created_at)
VALUES
  -- Sarah Mitchell (c001) — SMS thread
  ('m001', 'a1b2c3d4-0000-0000-0000-000000000001', 'c001', 'sms', 'outbound', 'Hi Sarah! Thanks for your interest in Teeth Whitening at Miami Smile. We have a couple of openings this week — want to grab one? 😊', NULL, true, 'delivered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('m002', 'a1b2c3d4-0000-0000-0000-000000000001', 'c001', 'sms', 'inbound',  'Yes! I''m still super interested. What''s the availability like this Thursday?', NULL, false, 'received', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '23 hours'),

  -- Carlos Rivera (c004) — Email thread
  ('m003', 'a1b2c3d4-0000-0000-0000-000000000001', 'c004', 'email', 'outbound', 'Hi Carlos,\n\nJust checking in on your Invisalign interest — our team has a few consultation slots opening up this week at no charge. Want to come in and see if it''s right for you?\n\nhttps://cal.com/miami-smile-dental', 'Your Invisalign consultation — a spot just opened up', true, 'delivered', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('m004', 'a1b2c3d4-0000-0000-0000-000000000001', 'c004', 'email', 'inbound',  'Thanks for reaching out! Could we maybe do next Tuesday? I''m free after 3pm.', 'Re: Your Invisalign consultation', false, 'received', NOW() - INTERVAL '1 day 18 hours', NOW() - INTERVAL '1 day 18 hours'),

  -- Elena Rodriguez (c005) — Email thread
  ('m005', 'a1b2c3d4-0000-0000-0000-000000000001', 'c005', 'email', 'outbound', 'Hi Elena,\n\nWe noticed you were researching veneers options — we''d love to show you our portfolio of work and walk through the process. Many patients are surprised by how natural the results look.\n\nWant to book a no-obligation consult? https://cal.com/miami-smile-dental', 'Porcelain veneers — Miami Smile Dental', true, 'delivered', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('m006', 'a1b2c3d4-0000-0000-0000-000000000001', 'c005', 'email', 'outbound', 'Hi Elena! Just a quick follow-up — we just had a cancellation open up for this Friday if you wanted to come in and take a look. No pressure at all.', 'Friday slot just opened up', true, 'delivered', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  -- Tom Chen (c006) — SMS thread
  ('m007', 'a1b2c3d4-0000-0000-0000-000000000001', 'c006', 'sms', 'outbound', 'Hey Tom! Just checking in — we noticed you came in for a consult a couple of weeks back. We have an opening this Thursday if you wanted to move forward with the crowns 😊', NULL, true, 'delivered', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('m008', 'a1b2c3d4-0000-0000-0000-000000000001', 'c006', 'sms', 'outbound', 'Hi Tom, one more quick note — we have a Thursday 10am slot if you want it. No obligation, just come in and we can answer any remaining questions!', NULL, true, 'delivered', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  -- Amanda Chen (c007) — WhatsApp thread
  ('m009', 'a1b2c3d4-0000-0000-0000-000000000001', 'c007', 'whatsapp', 'outbound', 'Hi Amanda! Following up on your interest in dental implants. Our specialist has a few slots next week. Want me to reserve one? 😊', NULL, true, 'delivered', NOW() - INTERVAL '1 day 8 hours', NOW() - INTERVAL '1 day 8 hours'),
  ('m010', 'a1b2c3d4-0000-0000-0000-000000000001', 'c007', 'whatsapp', 'inbound',  'That would be great! What''s the difference between an implant and a bridge? Trying to understand my options.', NULL, false, 'received', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 6 hours'),
  ('m011', 'a1b2c3d4-0000-0000-0000-000000000001', 'c007', 'whatsapp', 'outbound', 'Great question Amanda! An implant is a permanent titanium root — it looks and feels exactly like a natural tooth. A bridge is faster but requires filing down the adjacent teeth. For most patients your age, we recommend the implant. Would you like to come in for a free x-ray so we can show you exactly what''s involved? 😊', NULL, false, 'delivered', NOW() - INTERVAL '1 day 5 hours', NOW() - INTERVAL '1 day 5 hours'),

  -- James Wong (c008) — SMS thread
  ('m012', 'a1b2c3d4-0000-0000-0000-000000000001', 'c008', 'sms', 'outbound', 'Hi James! Hope the tooth is feeling better after your emergency visit. We want to make sure everything heals properly — want to come in for a follow-up? On us 😊', NULL, false, 'delivered', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  ('m013', 'a1b2c3d4-0000-0000-0000-000000000001', 'c008', 'sms', 'inbound',  'Yes please. I''ve also been thinking about getting the crown done properly. Can we discuss options?', NULL, false, 'received', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  ('m014', 'a1b2c3d4-0000-0000-0000-000000000001', 'c008', 'sms', 'outbound', 'Absolutely James! Let''s get you in this week. I''ll have Dr. Kim walk you through everything. Here''s a booking link: https://cal.com/miami-smile-dental', NULL, false, 'delivered', NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '2 hours 30 minutes'),

  -- Lisa Park (c009) — Email thread
  ('m015', 'a1b2c3d4-0000-0000-0000-000000000001', 'c009', 'email', 'outbound', 'Hi Lisa!\n\nThanks for your interest in Zoom Whitening. Here''s a quick breakdown:\n\n• In-office Zoom: $850 (results in 1 hour, 6-8 shades lighter)\n• Take-home kit: $450 (2 weeks, 4-6 shades lighter)\n• Combination package: $1,100 (best results)\n\nWe have openings this week for the in-office treatment — would you like to book a slot?\n\nhttps://cal.com/miami-smile-dental', 'Zoom Whitening pricing — Miami Smile Dental', false, 'delivered', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
  ('m016', 'a1b2c3d4-0000-0000-0000-000000000001', 'c009', 'email', 'inbound',  'This is so helpful, thank you! I think I want the in-office Zoom. Is this Friday available?', 'Re: Zoom Whitening pricing', false, 'received', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),

  -- Marcus Johnson (c010) — Email thread
  ('m017', 'a1b2c3d4-0000-0000-0000-000000000001', 'c010', 'email', 'outbound', 'Hi Marcus,\n\nGreat to hear you''re considering veneers — Dr. Kim specialises in porcelain veneers and the results are genuinely stunning. I''ve attached a few examples from recent patients.\n\nYour consultation is confirmed for Monday at 10am. We''ll do a full smile assessment, digital preview, and pricing breakdown at no cost.\n\nSee you Monday! 🙂', 'Your veneer consultation is confirmed — Monday 10am', false, 'delivered', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

  -- Sophia Lee (c011) — SMS + WhatsApp
  ('m018', 'a1b2c3d4-0000-0000-0000-000000000001', 'c011', 'sms', 'outbound', 'Hi Sophia! Just confirming your Invisalign consultation is booked for Thursday at 2pm. We''ll take digital scans and show you a preview of your smile. See you then! 😊', NULL, false, 'delivered', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('m019', 'a1b2c3d4-0000-0000-0000-000000000001', 'c011', 'sms', 'inbound',  'Perfect! Really excited for this. Do I need to bring anything?', NULL, false, 'received', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 45 minutes'),

  -- Priya Patel (c012) — Recovery conversation
  ('m020', 'a1b2c3d4-0000-0000-0000-000000000001', 'c012', 'sms', 'outbound', 'Hi Priya, we missed you at your appointment yesterday! Life gets busy — totally understand. Want to reschedule? Here''s the booking link: https://cal.com/miami-smile-dental 😊', NULL, true, 'delivered', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
  ('m021', 'a1b2c3d4-0000-0000-0000-000000000001', 'c012', 'sms', 'inbound',  'Oh I''m so sorry! Yes please, can I come in this Friday?', NULL, false, 'received', NOW() - INTERVAL '18 days 22 hours', NOW() - INTERVAL '18 days 22 hours'),
  ('m022', 'a1b2c3d4-0000-0000-0000-000000000001', 'c012', 'sms', 'outbound', 'Friday works perfectly Priya! Booked you in for 11am. Looking forward to it! 😊', NULL, false, 'delivered', NOW() - INTERVAL '18 days 20 hours', NOW() - INTERVAL '18 days 20 hours'),

  -- Robert Kim (c013) — Recovery
  ('m023', 'a1b2c3d4-0000-0000-0000-000000000001', 'c013', 'email', 'outbound', 'Hi Robert,\n\nWe noticed you enquired about dental implants a while back. We''ve just upgraded our implant procedure with same-day placement for eligible patients — dramatically less recovery time.\n\nWould you like to come in for a free assessment to see if you qualify?\n\nhttps://cal.com/miami-smile-dental', 'New: Same-day implants now available — Miami Smile Dental', true, 'delivered', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
  ('m024', 'a1b2c3d4-0000-0000-0000-000000000001', 'c013', 'email', 'inbound',  'Wow, same-day? That''s exactly what I was worried about — the recovery time. Can I come in next week?', 'Re: New: Same-day implants now available', false, 'received', NOW() - INTERVAL '23 days 20 hours', NOW() - INTERVAL '23 days 20 hours'),

  -- Jennifer Walsh (c014) — WhatsApp recovery
  ('m025', 'a1b2c3d4-0000-0000-0000-000000000001', 'c014', 'whatsapp', 'outbound', 'Hi Jennifer! Just wanted to follow up on the teeth whitening consult from a few weeks back. We have a Friday afternoon slot just opened up — perfect for a busy schedule 😊', NULL, true, 'delivered', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
  ('m026', 'a1b2c3d4-0000-0000-0000-000000000001', 'c014', 'whatsapp', 'inbound',  'Friday afternoon works! I''ve been meaning to call. Book me in!', NULL, false, 'received', NOW() - INTERVAL '16 days 22 hours', NOW() - INTERVAL '16 days 22 hours'),

  -- Nina Patel (c003) — first outreach
  ('m027', 'a1b2c3d4-0000-0000-0000-000000000001', 'c003', 'sms', 'outbound', 'Hi Nina! Jennifer Walsh mentioned you might be interested in braces. We''d love to meet you and walk through the options — traditional or clear aligners. Free consultation this week? 😊', NULL, false, 'delivered', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

  -- David Kim (c002) — first SMS
  ('m028', 'a1b2c3d4-0000-0000-0000-000000000001', 'c002', 'sms', 'outbound', 'Hi David! Thanks for your interest in whitening at Miami Smile. We have an opening this Thursday — want to come in for a complimentary shade assessment? 😊', NULL, true, 'delivered', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

  -- Tom Chen follow-up
  ('m029', 'a1b2c3d4-0000-0000-0000-000000000001', 'c006', 'whatsapp', 'outbound', 'Hey Tom 👋 One last check-in from us — we still have that Thursday 10am slot. Happy to answer any questions about the crown procedure before you decide. No pressure at all!', NULL, true, 'delivered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  -- Marcus Johnson reply
  ('m030', 'a1b2c3d4-0000-0000-0000-000000000001', 'c010', 'email', 'inbound', 'Thanks so much! Really excited for Monday. I''ve been thinking about this for years. See you then!', 'Re: Your veneer consultation is confirmed', false, 'received', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')

ON CONFLICT (id) DO NOTHING;

-- ── 3 APPOINTMENTS ─────────────────────────────────────────
INSERT INTO appointments (id, org_id, contact_id, scheduled_at, completed_at, no_show, recovery_triggered)
VALUES
  -- Priya Patel — no-show, then recovered
  ('apt001', 'a1b2c3d4-0000-0000-0000-000000000001', 'c012', NOW() - INTERVAL '20 days', NULL, true, true),
  -- Robert Kim — completed
  ('apt002', 'a1b2c3d4-0000-0000-0000-000000000001', 'c013', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days', false, false),
  -- Jennifer Walsh — completed
  ('apt003', 'a1b2c3d4-0000-0000-0000-000000000001', 'c014', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days', false, false)

ON CONFLICT (id) DO NOTHING;

-- ── 8 RECOVERED REVENUE ENTRIES = EXACTLY $34,500 ─────────
INSERT INTO recovered_revenue (id, org_id, contact_id, amount, source, recovery_type, recovered_at)
VALUES
  -- This month — must total $34,500
  ('rev001', 'a1b2c3d4-0000-0000-0000-000000000001', 'c012', 5800.00, 'sequence', 'lead',        NOW() - INTERVAL '18 days'),   -- Priya Patel — Invisalign
  ('rev002', 'a1b2c3d4-0000-0000-0000-000000000001', 'c013', 4200.00, 'manual',   'appointment', NOW() - INTERVAL '21 days'),   -- Robert Kim — Implant
  ('rev003', 'a1b2c3d4-0000-0000-0000-000000000001', 'c014', 2400.00, 'sequence', 'lead',        NOW() - INTERVAL '15 days'),   -- Jennifer Walsh — Whitening
  ('rev004', 'a1b2c3d4-0000-0000-0000-000000000001', 'c010', 8500.00, 'manual',   'lead',        NOW() - INTERVAL '3 days'),    -- Marcus Johnson — Veneers deposit
  ('rev005', 'a1b2c3d4-0000-0000-0000-000000000001', 'c011', 6400.00, 'sequence', 'lead',        NOW() - INTERVAL '7 days'),    -- Sophia Lee — Invisalign
  ('rev006', 'a1b2c3d4-0000-0000-0000-000000000001', 'c007', 4200.00, 'manual',   'appointment', NOW() - INTERVAL '2 days'),    -- Amanda Chen — Implant consultation
  ('rev007', 'a1b2c3d4-0000-0000-0000-000000000001', 'c009', 1800.00, 'sequence', 'lead',        NOW() - INTERVAL '1 day'),     -- Lisa Park — Zoom Whitening
  ('rev008', 'a1b2c3d4-0000-0000-0000-000000000001', 'c008', 1200.00, 'manual',   'appointment', NOW() - INTERVAL '4 hours')    -- James Wong — Root Canal
  -- TOTAL: 5800+4200+2400+8500+6400+4200+1800+1200 = 34,500 ✓

ON CONFLICT (id) DO NOTHING;

-- ── ENROLL SOME CONTACTS IN SEQUENCES ─────────────────────
INSERT INTO enrollments (id, org_id, contact_id, sequence_id, current_step, status, next_send_at)
VALUES
  ('enr001', 'a1b2c3d4-0000-0000-0000-000000000001', 'c001', 'seq001', 1, 'active', NOW() + INTERVAL '2 days'),
  ('enr002', 'a1b2c3d4-0000-0000-0000-000000000001', 'c002', 'seq001', 0, 'active', NOW() + INTERVAL '1 day'),
  ('enr003', 'a1b2c3d4-0000-0000-0000-000000000001', 'c003', 'seq001', 0, 'active', NOW() + INTERVAL '12 hours'),
  ('enr004', 'a1b2c3d4-0000-0000-0000-000000000001', 'c004', 'seq001', 2, 'active', NOW() + INTERVAL '3 days'),
  ('enr005', 'a1b2c3d4-0000-0000-0000-000000000001', 'c005', 'seq001', 1, 'active', NOW() + INTERVAL '1 day'),
  ('enr006', 'a1b2c3d4-0000-0000-0000-000000000001', 'c012', 'seq002', 3, 'completed', NULL),
  ('enr007', 'a1b2c3d4-0000-0000-0000-000000000001', 'c013', 'seq002', 3, 'completed', NULL),
  ('enr008', 'a1b2c3d4-0000-0000-0000-000000000001', 'c014', 'seq002', 2, 'exited', NULL)

ON CONFLICT (id) DO NOTHING;
