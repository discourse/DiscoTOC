import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

export default {
  name: "disco-toc-composer",

  initialize() {
    withPluginApi("1.0.0", (api) => {
      const currentUser = api.getCurrentUser();
      if (!currentUser) {
        return;
      }

      const allowedGroups = settings.allowed_groups
        ? settings.allowed_groups.split("|").map(Number)
        : [];

      if (allowedGroups.length > 0) {
        const userGroupIds = new Set(
          currentUser.groups.map((group) => group.id)
        );

        const isAllowed = allowedGroups.some((groupId) =>
          userGroupIds.has(groupId)
        );
        if (!isAllowed) {
          return;
        }
      }

      if (!I18n.translations[I18n.currentLocale()].js.composer) {
        I18n.translations[I18n.currentLocale()].js.composer = {};
      }
      I18n.translations[I18n.currentLocale()].js.composer.contains_dtoc = " ";

      api.addComposerToolbarPopupMenuOption({
        action: (toolbarEvent) => {
          toolbarEvent.applySurround(
            `<div data-theme-toc="true">`,
            `</div>`,
            "contains_dtoc"
          );
        },
        icon: "align-left",
        label: themePrefix("insert_table_of_contents"),
        condition: (composer) => {
          return composer.model.topicFirstPost
            ? true
            : settings.allow_on_replies;
        },
      });
    });
  },
};
