-- ============================================================================
-- Demo seed — /surprise/demo-alex works instantly, no auth required.
-- Dashboard code: DEMOAL, password: demo1234 (safe to explore the dashboard too).
-- Safe to re-run: it clears any prior demo rows first.
-- ============================================================================

delete from contributions where surprise_id in (select id from surprises where slug = 'demo-alex');
delete from surprises where slug = 'demo-alex';

insert into surprises (
  surprise_code, creator_email, creator_password_hash, slug, invite_token,
  celebrant_name, celebrant_photo_url, birthday, age, description, theme,
  status, published_at, sections, final_reveal
) values (
  'DEMOAL',
  'demo@unwrapped.app',
  crypt('demo1234', gen_salt('bf')),
  'demo-alex',
  'demo-alex-invite',
  'Alex',
  'https://picsum.photos/seed/alex-hero/600/600',
  '1996-04-18',
  30,
  'Our resident trivia champion, plant parent, and the only person who still answers the phone.',
  'warm',
  'published',
  now(),
  jsonb_build_array(
    jsonb_build_object('type','note_wall','title','Note Wall','prompt','Pin a message they''ll want to keep forever.','enabled',true,'position',0),
    jsonb_build_object('type','gift_voucher','title','Gift / Voucher','prompt','Promise a gift or a voucher — the details can wait.','enabled',true,'position',1,'maxPerContributor',3),
    jsonb_build_object('type','memory_lane','title','Memory Lane','prompt','Share a photo or video and tell the story behind it.','enabled',true,'position',2),
    jsonb_build_object('type','scrapbook','title','Scrapbook','prompt','Add a few photos from a memory you share.','enabled',true,'position',3),
    jsonb_build_object(
      'type','quiz','title','Quiz','prompt','How well do you really know Alex?','enabled',true,'position',4,
      'askQuestionToCelebrant', true,
      'questions', jsonb_build_array(
        jsonb_build_object('text','What''s Alex''s go-to karaoke song?','options', jsonb_build_array('Total Eclipse of the Heart','Dancing Queen','Bohemian Rhapsody','Since U Been Gone'),'correctIndex',1),
        jsonb_build_object('text','How many houseplants does Alex currently own?','options', jsonb_build_array('3','7','14','21'),'correctIndex',2),
        jsonb_build_object('text','What was Alex''s first pet?','options', jsonb_build_array('A goldfish named Waffles','A hamster named Toast','A cat named Biscuit','A dog named Pancake'),'correctIndex',3)
      )
    ),
    jsonb_build_object('type','wish','title','Wish','prompt','Write down a wish for their year ahead.','enabled',true,'position',5)
  ),
  jsonb_build_object(
    'title','Happy 30th, Alex!',
    'message','Thirty candles, one very extra scrapbook, and a room full of people who adore you. Here''s to the next chapter — we''re all coming with you.',
    'image_url','https://picsum.photos/seed/alex-finale/900/600',
    'external_url', null
  )
);

do $$
declare
  v_id uuid;
begin
  select id into v_id from surprises where slug = 'demo-alex';

  -- Note Wall (4)
  insert into contributions (surprise_id, section_type, contributor_name, contributor_relationship, content, media_url, media_type, status, position) values
  (v_id,'note_wall','Priya','College roommate', jsonb_build_object('message','You once talked me through a 2am breakup while also finishing a lab report. Certified multitasker, certified best friend.'), null, '', 'approved', 0),
  (v_id,'note_wall','Marcus','Little brother', jsonb_build_object('message','You still let me win at Mario Kart. I know now. I knew then too. Love you, happy birthday big sis.'), 'https://picsum.photos/seed/note-marcus/500/500','image','approved',1),
  (v_id,'note_wall','Deb','Mom', jsonb_build_object('message','Thirty years ago today you arrived four days early and haven''t stopped surprising us since. So proud of who you''ve become.'), null, '', 'approved', 2),
  (v_id,'note_wall','Oliver','Work bestie', jsonb_build_object('message','Thank you for always knowing which Slack messages need a GIF response. A true professional.'), null, '', 'approved', 3);

  -- Gift / Voucher (2)
  insert into contributions (surprise_id, section_type, contributor_name, contributor_relationship, content, media_url, media_type, status, position) values
  (v_id,'gift_voucher','Priya','College roommate', jsonb_build_object('gift_type','Voucher','item_name','Spa day for two','description','Because you deserve a full day of doing absolutely nothing productive.'), 'https://picsum.photos/seed/gift-spa/500/400','image','approved',0),
  (v_id,'gift_voucher','The Chen Family','Neighbors', jsonb_build_object('gift_type','Gift','item_name','A very large monstera','description','To join the other 13. We measured your windowsill, there is room.'), 'https://picsum.photos/seed/gift-plant/500/400','image','approved',1);

  -- Memory Lane (3)
  insert into contributions (surprise_id, section_type, contributor_name, contributor_relationship, content, media_url, media_type, status, position) values
  (v_id,'memory_lane','Priya','College roommate', jsonb_build_object('description','The night we got lost driving back from the coast and ended up watching the sunrise from a gas station parking lot. Still the best diner coffee of my life.'), 'https://picsum.photos/seed/mem-sunrise/800/600','image','approved',0),
  (v_id,'memory_lane','Marcus','Little brother', jsonb_build_object('description','Your college graduation, right after you threw your cap and immediately lost it in a tree. It took Dad twenty minutes to get it down.'), 'https://picsum.photos/seed/mem-grad/800/600','image','approved',1),
  (v_id,'memory_lane','Deb','Mom', jsonb_build_object('description','Your 10th birthday party, the one with the homemade piñata that would not break no matter how hard anyone swung.'), 'https://picsum.photos/seed/mem-party/800/600','image','approved',2);

  -- Scrapbook (2 pages)
  insert into contributions (surprise_id, section_type, contributor_name, contributor_relationship, content, status, position) values
  (v_id,'scrapbook','Oliver','Work bestie', jsonb_build_object('description','Every questionable office potluck dish you bravely tried, 2022–2024.', 'images', jsonb_build_array('https://picsum.photos/seed/scrap-1a/500/500','https://picsum.photos/seed/scrap-1b/500/500','https://picsum.photos/seed/scrap-1c/500/500')), 'approved', 0),
  (v_id,'scrapbook','The Chen Family','Neighbors', jsonb_build_object('description','Every Halloween costume you''ve worn on our street since you moved in.', 'images', jsonb_build_array('https://picsum.photos/seed/scrap-2a/500/500','https://picsum.photos/seed/scrap-2b/500/500')), 'approved', 1);

  -- Quiz (3 scored responses, 1 with a question for the celebrant)
  insert into contributions (surprise_id, section_type, contributor_name, contributor_relationship, content, status, score, position) values
  (v_id,'quiz','Priya','College roommate', jsonb_build_object('answers', jsonb_build_array(1,2,3), 'questionForCelebrant', 'Would you ever do another cross-country road trip with me? Be honest.'), 'approved', 3, 0),
  (v_id,'quiz','Marcus','Little brother', jsonb_build_object('answers', jsonb_build_array(1,0,3), 'questionForCelebrant', null), 'approved', 2, 1),
  (v_id,'quiz','Deb','Mom', jsonb_build_object('answers', jsonb_build_array(0,2,1), 'questionForCelebrant', null), 'approved', 1, 2);

  -- Wish (4)
  insert into contributions (surprise_id, section_type, contributor_name, contributor_relationship, content, status, position) values
  (v_id,'wish','Priya','College roommate', jsonb_build_object('wish','That this year brings you a plant that actually needs a bigger pot because it''s thriving that much.'), 'approved', 0),
  (v_id,'wish','Marcus','Little brother', jsonb_build_object('wish','A karaoke night where nobody records you. Or everybody does. Your call.'), 'approved', 1),
  (v_id,'wish','Oliver','Work bestie', jsonb_build_object('wish','Fewer Monday meetings that could''ve been an email, more Fridays out the door by five.'), 'approved', 2),
  (v_id,'wish','Deb','Mom', jsonb_build_object('wish','A whole year as soft and warm as you make everyone else feel.'), 'approved', 3);

  -- One pending item so the dashboard demo isn't empty of things left to review.
  insert into contributions (surprise_id, section_type, contributor_name, contributor_relationship, content, status, position) values
  (v_id,'note_wall','Sam','Neighbor', jsonb_build_object('message','Happy birthday! Sorry in advance for the extremely loud birthday banner I am about to put on your lawn.'), 'pending', 4);
end $$;
