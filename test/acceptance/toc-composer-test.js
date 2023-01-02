import {
  acceptance,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import { click, visit } from "@ember/test-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import { test } from "qunit";

acceptance("DiscoTOC - Composer", function (needs) {
  needs.user();
  needs.settings({
    general_category_id: 1,
    default_composer_category: 1,
  });

  test("Can use TOC when creating a topic", async function (assert) {
    await visit("/");
    await click("#create-topic");
    const toolbarPopupMenu = selectKit(".toolbar-popup-menu-options");
    await toolbarPopupMenu.expand();
    await toolbarPopupMenu.selectRowByValue("insertDtoc");

    assert.ok(query(".d-editor-input").value.includes('data-theme-toc="true"'));
  });

  test("Can use TOC when editing first post", async function (assert) {
    await visit("/t/internationalization-localization/280");
    await click("#post_1 .show-more-actions");
    await click("#post_1 .edit");

    assert.ok(exists("#reply-control"));

    const toolbarPopupMenu = selectKit(".toolbar-popup-menu-options");
    await toolbarPopupMenu.expand();
    await toolbarPopupMenu.selectRowByValue("insertDtoc");

    assert.ok(query(".d-editor-input").value.includes('data-theme-toc="true"'));
  });

  test("no TOC option when replying", async function (assert) {
    await visit("/t/internationalization-localization/280");
    await click(".create.reply");
    const toolbarPopupMenu = selectKit(".toolbar-popup-menu-options");
    await toolbarPopupMenu.expand();

    assert.notOk(toolbarPopupMenu.rowByValue("insertDtoc").exists());
  });
});
