import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";

export default class TocMiniButtons extends Component {
  @service tocProcessor;

  @action
  callCloseOverlay() {
    this.tocProcessor.setOverlayVisible(false);
  }

  @action
  callJumpToEnd() {
    this.tocProcessor.jumpToEnd(this.args.renderTimeline, this.args.postID);
  }

  <template>
    <div class="d-toc-icons">
      <DButton
        @action={{this.callJumpToEnd}}
        @icon="downward"
        class="btn btn-transparent scroll-to-bottom"
      />
      <DButton
        @action={{this.closeOverlay}}
        @icon="times"
        class="btn btn-transparent d-toc-close"
      />
    </div>
  </template>
}
