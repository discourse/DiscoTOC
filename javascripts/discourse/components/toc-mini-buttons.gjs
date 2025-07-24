import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";

export default class TocMiniButtons extends Component {
  @service tocProcessor;

  get expandLabel() {
    return this.args.expandAll ? "Reset expand" : "Expand all";
  }

  @action
  callCloseOverlay() {
    this.tocProcessor.setOverlayVisible(false);
  }

  @action
  callJumpToEnd() {
    this.tocProcessor.jumpToEnd(this.args.renderTimeline, this.args.postID);
  }

  @action
  toggleExpandAll() {
    this.args.expandAll = !this.args.expandAll;
  }

  <template>
    <div class="d-toc-icons">
      <DButton
        @action={{this.callJumpToEnd}}
        @icon="downward"
        aria-label="Scroll to bottom"
        class="btn btn-transparent scroll-to-bottom"
      />
      <DButton
        @action={{this.toggleExpandAll}}
        aria-label={{this.expandLabel}}
        class="d-toc__btn-expand btn-transparent btn-small"
        @icon="angles-down"
      />
      <DButton
        @action={{this.closeOverlay}}
        @icon="xmark"
        aria-label="close table of contents"
        class="btn btn-transparent d-toc-close"
      />
    </div>
  </template>
}
