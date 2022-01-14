import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import { click, visit } from "@ember/test-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import { test } from "qunit";

acceptance("DiscoTOC - Composer", function (needs) {
  needs.user();

  test("Can use TOC when creating a topic", async function (assert) {
    await visit("/");
    await click("#create-topic");
    const toolbarPopupMenu = selectKit(".toolbar-popup-menu-options");
    await toolbarPopupMenu.expand();
    await toolbarPopupMenu.selectRowByValue("insertDtoc");

    assert.ok(
      query(".d-editor-input").value.indexOf('data-theme-toc="true"') >= 0
    );
  });

  test("no TOC option when replying", async function (assert) {
    await visit("/t/internationalization-localization/280");
    await click(".create.reply");
    const toolbarPopupMenu = selectKit(".toolbar-popup-menu-options");
    await toolbarPopupMenu.expand();

    assert.notOk(toolbarPopupMenu.rowByValue("insertDtoc").exists());
  });
});
