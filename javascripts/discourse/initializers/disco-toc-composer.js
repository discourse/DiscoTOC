import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "discourse-i18n";

export default {
  name: "disco-toc-composer",

  initialize() {
    withPluginApi("1.0.0", (api) => {
      const currentUser = api.getCurrentUser();
      if (!currentUser) {
        return;
      }

      const minimumTL = settings.minimum_trust_level_to_create_TOC;

      if (currentUser.trust_level >= minimumTL || currentUser.staff) {
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
            return (
              settings.enable_TOC_for_replies || composer.model.topicFirstPost
            );
          },
        });

        if (settings.enable_TOC_for_replies) {
          document.body.classList.add("toc-for-replies-enabled");
        }
      }
    });
  },
};
