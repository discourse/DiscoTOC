import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { inject as service } from "@ember/service";
import TocContents from "../components/toc-contents";
import TocToggle from "../components/toc-toggle";

export default class TocTimeline extends Component {
  @service tocProcessor;
  @tracked
  isTocVisible = localStorage.getItem("tocVisibility") === "true" || true;

  @action
  callCheckPostforTOC() {
    this.tocProcessor.checkPostforTOC(this.args.topic);
  }

  get shouldRenderToc() {
    if (!this.tocProcessor.hasTOC) {
      return false;
    }

    if (this.tocProcessor.isDocs) {
      // should always show on docs routes
      return true;
    }

    if (this.args.renderTimeline) {
      // timeline state controlled by localStorage
      return this.tocProcessor.isTocVisible;
    } else {
      // progress state controlled by overlay state
      return this.tocProcessor.isOverlayVisible;
    }
  }

  @action
  handleTimelineUpdate() {
    if (this.args.renderTimeline) {
      this.tocProcessor.setOverlayVisible(false);
    }
  }

  <template>
    <div
      {{didInsert this.callCheckPostforTOC}}
      {{didUpdate this.callCheckPostforTOC @topic.currentPost}}
      {{didUpdate this.handleTimelineUpdate @renderTimeline}}
      class="d-toc-main"
    >
      {{#if this.shouldRenderToc}}
        <TocContents
          @postContent={{this.tocProcessor.postContent}}
          @postID={{this.tocProcessor.postID}}
          @tocStructure={{this.tocProcessor.tocStructure}}
          @renderTimeline={{@renderTimeline}}
        />
        {{#if @renderTimeline}}
          <TocToggle />
        {{/if}}
      {{/if}}
    </div>
  </template>
}
