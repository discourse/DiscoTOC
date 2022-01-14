import I18n from "I18n";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "disco-toc-composer",

  initialize() {
    withPluginApi("1.0.0", (api) => {
      const currentUser = api.getCurrentUser();
      if (!currentUser) {
        return;
      }

      const minimumTL = settings.minimum_trust_level_to_create_TOC;

      if (currentUser.trust_level >= minimumTL) {
        if (!I18n.translations[I18n.currentLocale()].js.composer) {
          I18n.translations[I18n.currentLocale()].js.composer = {};
        }
        I18n.translations[I18n.currentLocale()].js.composer.contains_dtoc = " ";

        api.modifyClass("controller:composer", {
          pluginId: "DiscoTOC",

          actions: {
            insertDtoc() {
              this.get("toolbarEvent").applySurround(
                `<div data-theme-toc="true">`,
                `</div>`,
                "contains_dtoc"
              );
            },
          },
        });

        api.addToolbarPopupMenuOptionsCallback((controller) => {
          return {
            action: "insertDtoc",
            icon: "align-left",
            label: themePrefix("insert_table_of_contents"),
            condition: controller.get("model.creatingTopic"),
          };
        });
      }
    });
  },
};
