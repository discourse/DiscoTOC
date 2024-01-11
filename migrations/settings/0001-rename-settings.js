export default function migrate(settings) {
  if (settings.has("minimum_trust_level_to_create_TOC")) {
    settings.set(
      "minimum_trust_level_to_create",
      settings.get("minimum_trust_level_to_create_TOC")
    );

    settings.delete("minimum_trust_level_to_create_TOC");
  }

  if (settings.has("composer_toc_text")) {
    settings.set("composer_text", settings.get("composer_toc_text"));
    settings.delete("composer_toc_text");
  }

  if (settings.has("auto_TOC_categories")) {
    settings.set("auto_categories", settings.get("auto_TOC_categories"));
    settings.delete("auto_TOC_categories");
  }

  if (settings.has("auto_TOC_tags")) {
    settings.set("auto_tags", settings.get("auto_TOC_tags"));
    settings.delete("auto_TOC_tags");
  }

  if (settings.has("TOC_min_heading")) {
    settings.set("min_heading", settings.get("TOC_min_heading"));
    settings.delete("TOC_min_heading");
  }

  return settings;
}
