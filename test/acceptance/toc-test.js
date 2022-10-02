import {
  acceptance,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import topicFixtures from "discourse/tests/fixtures/topic";
import { cloneJSON } from "discourse-common/lib/object";
import { COOKED_WITH_HEADINGS } from "../fixtures";

const TOC_MARKUP = '\n<div data-theme-toc="true"></div>';
const TOC_AUTO_CATEGORIES = "17|19|13";
const TOC_AUTO_TAGS = "docs|knowledge";
const TOC_TOPIC_TAGS = ["design", "docs"];
const TOC_TOPIC_CATEGORY = 19;

acceptance("DiscoTOC - main", function (needs) {
  needs.pretender((server, helper) => {
    const topicResponse = cloneJSON(topicFixtures["/t/280/1.json"]);
    topicResponse.post_stream.posts[0].cooked =
      COOKED_WITH_HEADINGS + TOC_MARKUP;

    server.get("/t/280.json", () => helper.response(topicResponse));
    server.get("/t/280/:post_number.json", () =>
      helper.response(topicResponse)
    );
  });

  test("shows TOC, hides timeline on desktop", async function (assert) {
    await visit("/t/internationalization-localization/280");

    assert.ok(exists(".d-toc-wrapper #d-toc"), "TOC element exists");

    const firstH2 = query(".topic-body h2"),
      dTocID = firstH2.getAttribute("data-d-toc"),
      matchingTocItem = `#d-toc [data-d-toc="${dTocID}"]`;
    assert.equal(
      firstH2.textContent.trim(),
      query(matchingTocItem).textContent.trim(),
      "TOC above timeline has matching items"
    );

    const blockquoteH2 = query(".topic-body blockquote h2");
    assert.ok(exists(blockquoteH2), "blockquote H2 exists");
    assert.equal(
      blockquoteH2.hasAttribute("data-d-toc"),
      false,
      "does not apply TOC to headings in blockquote"
    );

    assert.equal(
      firstH2.hasAttribute("data-d-toc"),
      true,
      "does apply TOC to regular headings"
    );

    const firstH1 = query(".topic-body h1");

    assert.equal(
      firstH1.getAttribute("id"),
      "toc-h1-0",
      "heading gets an ID even when it has no Latin characters"
    );
  });
});

acceptance("DiscoTOC - off", function (needs) {
  needs.pretender((server, helper) => {
    const topicResponse = cloneJSON(topicFixtures["/t/280/1.json"]);
    topicResponse.post_stream.posts[0].cooked = COOKED_WITH_HEADINGS;

    server.get("/t/280.json", () => helper.response(topicResponse));
    server.get("/t/280/:post_number.json", () =>
      helper.response(topicResponse)
    );
  });

  test("no TOC markup on a regular topic", async function (assert) {
    await visit("/t/internationalization-localization/280");
    assert.ok(!exists(".d-toc-wrapper #d-toc"));
  });
});

acceptance("DiscoTOC - with tags", function (needs) {
  needs.pretender((server, helper) => {
    settings.auto_TOC_tags = TOC_AUTO_TAGS;
    const topicResponse = cloneJSON(topicFixtures["/t/280/1.json"]);
    topicResponse.post_stream.posts[0].cooked = COOKED_WITH_HEADINGS;
    topicResponse.tags = TOC_TOPIC_TAGS;

    server.get("/t/280.json", () => helper.response(topicResponse));
    server.get("/t/280/:post_number.json", () =>
      helper.response(topicResponse)
    );
  });

  test("automatically adds TOC based on tags", async function (assert) {
    await visit("/t/internationalization-localization/280");
    assert.ok(exists(".d-toc-wrapper #d-toc"));
  });
});

acceptance("DiscoTOC - with categories", function (needs) {
  needs.pretender((server, helper) => {
    settings.auto_TOC_categories = TOC_AUTO_CATEGORIES;
    const topicResponse = cloneJSON(topicFixtures["/t/280/1.json"]);
    topicResponse.post_stream.posts[0].cooked = COOKED_WITH_HEADINGS;
    topicResponse.category_id = TOC_TOPIC_CATEGORY;

    server.get("/t/280.json", () => helper.response(topicResponse));
    server.get("/t/280/:post_number.json", () =>
      helper.response(topicResponse)
    );
  });

  test("automatically adds TOC based on category", async function (assert) {
    await visit("/t/internationalization-localization/280");
    assert.ok(exists(".d-toc-wrapper #d-toc"));
  });
});

acceptance("DiscoTOC - non-text headings", function (needs) {
  needs.pretender((server, helper) => {
    const topicResponse = cloneJSON(topicFixtures["/t/280/1.json"]);
    topicResponse.post_stream.posts[0].cooked = `
      <h3 id="toc-h3-span" data-d-toc="toc-h3-span" class="d-toc-post-heading">
        <a name="span-4" class="anchor" href="#span-4"></a>&lt;span style="color: red"&gt;what about this&lt;/span&gt;</h3>
      </h3>
      <p>test</p>
      ${TOC_MARKUP}
    `;

    server.get("/t/280.json", () => helper.response(topicResponse));
    server.get("/t/280/:post_number.json", () =>
      helper.response(topicResponse)
    );
  });

  test("renders the TOC items as plain text", async function (assert) {
    await visit("/t/internationalization-localization/280");

    const item = query(`#d-toc [data-d-toc="toc-h3-span"]`);
    assert.strictEqual(
      item.innerHTML.trim(),
      `&lt;span style="color: red"&gt;what about this&lt;/span&gt;`
    );
  });
});
