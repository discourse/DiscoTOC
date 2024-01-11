import { module, test } from "qunit";
import migrate from "../../../../migrations/settings/0001-rename-settings";

module("Unit | Migrations | Settings | 0001-rename-settings", function () {
  test("migrate", function (assert) {
    const settings = new Map(
      Object.entries({
        minimum_trust_level_to_create_TOC: 0,
        composer_toc_text: "some text",
        auto_TOC_categories: "1|2",
        auto_TOC_tags: "tag1|tag2",
        TOC_min_heading: 3,
      })
    );

    const result = migrate(settings);

    assert.deepEqual(
      Array.from(result),
      Array.from(
        new Map(
          Object.entries({
            minimum_trust_level_to_create: 0,
            composer_text: "some text",
            auto_categories: "1|2",
            auto_tags: "tag1|tag2",
            min_heading: 3,
          })
        )
      )
    );
  });
});
