import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import { click, visit } from "@ember/test-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import { test } from "qunit";

acceptance("DiscoTOC - Composer", function (needs) {
  needs.user();

  test("Inserting TOC", async function (assert) {
    await visit("/");
    await click("#create-topic");
    const toolbarPopupMenu = selectKit(".toolbar-popup-menu-options");
    await toolbarPopupMenu.expand();
    await toolbarPopupMenu.selectRowByValue("insertDtoc");

    assert.ok(
      query(".d-editor-input").value.indexOf('data-theme-toc="true"') >= 0
    );
  });
});
