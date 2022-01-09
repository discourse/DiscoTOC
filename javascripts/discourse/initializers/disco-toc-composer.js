import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "disco-toc-composer",

  initialize() {
    withPluginApi("1.0.0", (api) => {
      const currentUser = api.getCurrentUser();
      const currentUserTL = currentUser ? currentUser.trust_level : "";
      const minimumTL = settings.minimum_trust_level_to_create_TOC;

      if (currentUserTL >= minimumTL) {
        if (!I18n.translations[I18n.currentLocale()].js.composer) {
          I18n.translations[I18n.currentLocale()].js.composer = {};
        }
        I18n.translations[I18n.currentLocale()].js.composer.contains_dtoc = " ";

        api.addToolbarPopupMenuOptionsCallback(() => {
          const composerController = api.container.lookup(
            "controller:composer"
          );
          return {
            action: "insertDtoc",
            icon: "align-left",
            label: themePrefix("insert_table_of_contents"),
            condition: composerController.get("model.canCategorize"),
          };
        });

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
      }
    });
  },
};
