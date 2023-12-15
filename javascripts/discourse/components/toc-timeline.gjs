import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { inject as service } from "@ember/service";
import and from "truth-helpers/helpers/and";
import TocContents from "../components/toc-contents";

export default class TocTimeline extends Component {
  @service tocProcessor;
  @tracked
  isTocVisible = localStorage.getItem("tocVisibility") === "true" || true;

  get autoTOC() {
    // check topic for categories or tags from settings
    const autoCategories = settings.auto_TOC_categories
      ? settings.auto_TOC_categories.split("|").map((id) => parseInt(id, 10))
      : [];

    const autoTags = settings.auto_TOC_tags
      ? settings.auto_TOC_tags.split("|")
      : [];

    if ((!autoCategories.length && !autoTags.length) || !this.args.topic) {
      return false;
    }

    const topicCategory = this.args.topic.category_id;
    const topicTags = this.args.topic.tags || [];

    const hasMatchingTags = autoTags.some((tag) => topicTags.includes(tag));
    const hasMatchingCategory = autoCategories.includes(topicCategory);

    return hasMatchingTags || hasMatchingCategory;
  }

  @action
  callCheckPostforTOC() {
    this.tocProcessor.checkPostforTOC(this.args.topic);
  }

  <template>
    <div
      {{didInsert this.callCheckPostforTOC}}
      {{didUpdate this.callCheckPostforTOC @topic.currentPost}}
      class={{if
        (and this.tocProcessor.hasTOC this.tocProcessor.isTocVisible)
        "d-toc-main"
        "hidden"
      }}
    >
      {{#if (and this.tocProcessor.hasTOC this.tocProcessor.isTocVisible)}}
        <TocContents
          @postContent={{this.tocProcessor.postContent}}
          @postID={{this.tocProcessor.postID}}
          @tocStructure={{this.tocProcessor.tocStructure}}
          @renderTimeline={{@renderTimeline}}
        />
      {{/if}}
    </div>
  </template>
}
