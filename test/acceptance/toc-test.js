import {
  acceptance,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";

acceptance("DiscoTOC", function (needs) {
  needs.pretender((server, helper) => {
    server.get("/t/129.json", () => {
      return helper.response({
        post_stream: {
          posts: [
            {
              id: 295,
              name: null,
              username: "pmusaraj",
              avatar_template: "/user_avatar/127.0.0.1/pmusaraj/{size}/3_2.png",
              created_at: "2022-01-11T00:46:25.705Z",
              cooked:
                '<h1>\n<a name="h1-first-test-edited-1" class="anchor" href="#h1-first-test-edited-1"></a>H1 first test edited</h1>\n<h2>\n<a name="measure-h2-2" class="anchor" href="#measure-h2-2"></a>Measure h2</h2>\n<p>Jaracaca Swamp we gazed round the very evening light in some. HTML version of science far too late. Wait a snake and nearly half-past two terrible carnivorous dinosaur and distribute. Employers Liability Act you! Each of me see that the crudest pleasantry. Sonny my own special brain. Advancing in front of them and there?</p>\n<div class="md-table">\n<table>\n<thead>\n<tr>\n<th>questions</th>\n<th>vanish</th>\n<th>contention</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>nearer</td>\n<td>depressed</td>\n<td>francisca</td>\n</tr>\n<tr>\n<td>rooms</td>\n<td>kennel</td>\n<td>genesis</td>\n</tr>\n</tbody>\n</table>\n</div><h2>\n<a name="undeveloped-h2-3" class="anchor" href="#undeveloped-h2-3"></a>Undeveloped h2</h2>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.<br>\nCried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.<br>\nCried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h1>\n<a name="h1-second-section-4" class="anchor" href="#h1-second-section-4"></a>H1 second section</h1>\n<h2>\n<a name="undeveloped-2-h2-5" class="anchor" href="#undeveloped-2-h2-5"></a>Undeveloped 2 h2</h2>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through.<br>\nYou’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h3>\n<a name="subheading-3-h3-6" class="anchor" href="#subheading-3-h3-6"></a>Subheading 3 h3</h3>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h3>\n<a name="subheading-3-long-ass-wire-h3-7" class="anchor" href="#subheading-3-long-ass-wire-h3-7"></a>Subheading 3 long ass wire h3</h3>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h2>\n<a name="another-section-h2-8" class="anchor" href="#another-section-h2-8"></a>Another section h2</h2>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h3>\n<a name="subheading-again-then-h3-9" class="anchor" href="#subheading-again-then-h3-9"></a>Subheading again then h3</h3>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h4>\n<a name="su-subbheading-h4-10" class="anchor" href="#su-subbheading-h4-10"></a>Su-subbheading h4</h4>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h4>\n<a name="su-subalicions-heading-h4-11" class="anchor" href="#su-subalicions-heading-h4-11"></a>Su-subalicions heading h4</h4>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h4>\n<a name="su-subalicions-heading-h4-quite-long-to-test-a-real-life-kind-of-scenario-here-then-12" class="anchor" href="#su-subalicions-heading-h4-quite-long-to-test-a-real-life-kind-of-scenario-here-then-12"></a>Su-subalicions heading h4 quite long to test a real-life kind of scenario here then</h4>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<h4>\n<a name="su-subalicions-heading-h4-also-quite-long-to-test-a-real-life-kind-of-scenario-here-then-13" class="anchor" href="#su-subalicions-heading-h4-also-quite-long-to-test-a-real-life-kind-of-scenario-here-then-13"></a>Su-subalicions heading h4 also quite long to test a real-life kind of scenario here then</h4>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n<aside class="quote no-group" data-username="kathey.zemlak" data-post="2" data-topic="71">\n<div class="title">\n<div class="quote-controls"></div>\n<img alt="" width="20" height="20" src="//127.0.0.1:4200/user_avatar/127.0.0.1/kathey.zemlak/40/14_2.png" class="avatar"><a href="//127.0.0.1:4200/t/modernizing-the-antiquated-boxing-scoring-system/71/2">Modernizing the antiquated boxing scoring system</a>\n</div>\n<blockquote>\n<h2>Undeveloped</h2>\n<p>Cried leaning upon the tangle of the full of the same. Behind us upon the luxurious. Tarp Henry of the moment that similar upon his lecture. Devil got there came well with him fifteen dollars a whisper We slunk through. You’ll find its palm. Other ones and east of Shakespeare could his seat there by. McArdle looked round and I have thrown open and his people have seen the tangled.</p>\n</blockquote>\n</aside>\n<div data-theme-toc="true"> </div>',
              post_number: 1,
              post_type: 1,
              updated_at: "2022-01-14T03:59:56.846Z",
              reply_count: 0,
              reply_to_post_number: null,
              quote_count: 0,
              incoming_link_count: 52,
              reads: 1,
              readers_count: 0,
              score: 260.2,
              yours: true,
              topic_id: 88,
              topic_slug: "discotoc-test-with-h1s",
              display_username: null,
              primary_group_name: null,
              flair_name: null,
              flair_url: null,
              flair_bg_color: null,
              flair_color: null,
              version: 3,
              can_edit: true,
              can_delete: false,
              can_recover: false,
              can_wiki: true,
              link_counts: [
                {
                  url: "http://127.0.0.1:4200/t/modernizing-the-antiquated-boxing-scoring-system/71/2",
                  internal: true,
                  reflection: false,
                  title: "Modernizing the antiquated boxing scoring system",
                  clicks: 0,
                },
              ],
              read: true,
              user_title: null,
              bookmarked: false,
              actions_summary: [
                { id: 3, can_act: true },
                { id: 4, can_act: true },
                { id: 8, can_act: true },
                { id: 7, can_act: true },
              ],
              moderator: false,
              admin: true,
              staff: true,
              user_id: 1,
              hidden: false,
              trust_level: 2,
              deleted_at: null,
              user_deleted: false,
              edit_reason: null,
              can_view_edit_history: true,
              wiki: false,
              reviewable_id: 0,
              reviewable_score_count: 0,
              reviewable_score_pending_count: 0,
              chat_connection: null,
            },
          ],
          stream: [295],
        },
        timeline_lookup: [[1, 4]],
        tags: [],
        tags_descriptions: {},
        id: 88,
        title: "DiscoTOC test with h1s",
        fancy_title: "DiscoTOC test with h1s",
        posts_count: 1,
        created_at: "2022-01-11T00:46:25.590Z",
        views: 6,
        reply_count: 0,
        like_count: 0,
        last_posted_at: "2022-01-11T00:46:25.705Z",
        visible: true,
        closed: false,
        archived: false,
        has_summary: false,
        archetype: "regular",
        slug: "discotoc-test-with-h1s",
        category_id: 1,
        word_count: 1498,
        deleted_at: null,
        user_id: 1,
        featured_link: null,
        pinned_globally: false,
        pinned_at: null,
        pinned_until: null,
        image_url: null,
        slow_mode_seconds: 0,
        draft: null,
        draft_key: "topic_88",
        draft_sequence: 6,
        posted: true,
        unpinned: null,
        pinned: false,
        current_post_number: 1,
        highest_post_number: 1,
        last_read_post_number: 1,
        last_read_post_id: 295,
        deleted_by: null,
        has_deleted: false,
        actions_summary: [
          { id: 4, count: 0, hidden: false, can_act: true },
          { id: 8, count: 0, hidden: false, can_act: true },
          { id: 7, count: 0, hidden: false, can_act: true },
        ],
        chunk_size: 20,
        bookmarked: false,
        bookmarks: [],
        topic_timer: null,
        message_bus_last_id: 6,
        participant_count: 1,
        show_read_indicator: false,
        thumbnails: null,
        slow_mode_enabled_until: null,
        details: {
          can_edit: true,
          notification_level: 3,
          notifications_reason_id: 1,
          can_move_posts: true,
          can_delete: true,
          can_remove_allowed_users: true,
          can_invite_to: true,
          can_invite_via_email: true,
          can_create_post: true,
          can_reply_as_new_topic: true,
          can_flag_topic: true,
          can_convert_topic: true,
          can_review_topic: true,
          can_close_topic: true,
          can_archive_topic: true,
          can_split_merge_topic: true,
          can_edit_staff_notes: true,
          can_toggle_topic_visibility: true,
          can_pin_unpin_topic: true,
          can_moderate_category: true,
          can_remove_self_id: 1,
          participants: [
            {
              id: 1,
              username: "pmusaraj",
              name: null,
              avatar_template: "/user_avatar/127.0.0.1/pmusaraj/{size}/3_2.png",
              post_count: 1,
              primary_group_name: null,
              flair_name: null,
              flair_url: null,
              flair_color: null,
              flair_bg_color: null,
              admin: true,
              trust_level: 2,
              assign_icon: "user-plus",
              assign_path: null,
            },
          ],
          created_by: {
            id: 1,
            username: "pmusaraj",
            name: null,
            avatar_template: "/user_avatar/127.0.0.1/pmusaraj/{size}/3_2.png",
            assign_icon: "user-plus",
            assign_path: "/u/pmusaraj/activity/assigned",
          },
          last_poster: {
            id: 1,
            username: "pmusaraj",
            name: null,
            avatar_template: "/user_avatar/127.0.0.1/pmusaraj/{size}/3_2.png",
            assign_icon: "user-plus",
            assign_path: "/u/pmusaraj/activity/assigned",
          },
        },
      });
    });
  });

  test("shows TOC, hides timeline on desktop", async function (assert) {
    await visit("/t/testing-disco-toc/129");
    assert.ok(exists(".d-toc-wrapper #d-toc"), "TOC element exists");

    const firstH2 = query(".topic-body h2"),
      dTocID = firstH2.getAttribute("data-d-toc"),
      matchingTocItem = `#d-toc [data-d-toc="${dTocID}"]`;
    assert.equal(
      firstH2.textContent.trim(),
      query(matchingTocItem).textContent.trim(),
      "TOC above timeline has matching items"
    );

    const bquoteH2 = query(".topic-body blockquote h2");
    assert.ok(exists(bquoteH2), "blockquote H2 exists");
    assert.equal(
      bquoteH2.hasAttribute("data-d-toc"),
      false,
      "does not apply TOC to headings in blockquote"
    );

    assert.equal(
      firstH2.hasAttribute("data-d-toc"),
      true,
      "does not applies TOC to regular headings"
    );
  });

  test("no TOC markup on a regular topic", async function (assert) {
    await visit("/t/internationalization-localization/280");
    assert.ok(!exists(".d-toc-wrapper #d-toc"));
  });
});
