import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import bodyClass from "discourse/helpers/body-class";
import TocContents from "../components/toc-contents";
import TocToggle from "../components/toc-toggle";

export default class TocTimeline extends Component {
  @service tocProcessor;

  @tracked expandAll = false;

  @tracked
  isTocVisible = localStorage.getItem("tocVisibility") === "true" || true;

  get shouldRenderToc() {
    if (!this.tocProcessor.hasTOC) {
      return false;
    }

    // should always show on docs routes
    if (this.tocProcessor.isDocs) {
      return true;
    }

    if (this.args.renderTimeline) {
      // single post topics might not have a timeline
      // so we should ignore state
      if (this.args.topic?.posts_count === 1) {
        return true;
      }

      // timeline state controlled by localStorage
      return this.tocProcessor.isTocVisible;
    } else {
      // progress state controlled by overlay state
      return this.tocProcessor.isOverlayVisible;
    }
  }

  get isTopicProgress() {
    return (
      !this.args.renderTimeline ||
      (this.args.renderTimeline && this.args.topicProgressExpanded)
    );
  }

  get expandLabel() {
    return this.expandAll ? "Reset expand" : "Expand all";
  }

  @action
  callCheckPostforTOC() {
    this.tocProcessor.checkPostforTOC(this.args.topic);
  }

  @action
  handleTimelineUpdate() {
    if (this.args.renderTimeline) {
      this.tocProcessor.setOverlayVisible(false);
    }
  }

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
  }

  <template>
    <div
      {{didInsert this.callCheckPostforTOC}}
      {{didUpdate this.callCheckPostforTOC @topic.currentPost}}
      {{didUpdate this.handleTimelineUpdate @renderTimeline}}
      class="d-toc-main"
    >
      {{bodyClass "d-toc-installed"}}
      {{#if this.shouldRenderToc}}
        {{#unless this.isTopicProgress}}
          {{bodyClass "d-toc-active"}}
        {{/unless}}
        <TocContents
          @postContent={{this.tocProcessor.postContent}}
          @postID={{this.tocProcessor.postID}}
          @tocStructure={{this.tocProcessor.tocStructure}}
          @renderTimeline={{@renderTimeline}}
          @expandAll={{this.expandAll}}
        />

        <DButton
          @action={{this.toggleExpandAll}}
          aria-label={{this.expandLabel}}
          @class="d-toc__btn-expand btn-transparent btn-small"
          @icon="angles-down"
        />

        {{#if @renderTimeline}}
          <TocToggle @topic={{@topic}} />
        {{/if}}
      {{/if}}
    </div>
  </template>
}
