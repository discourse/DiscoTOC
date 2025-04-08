import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import { i18n } from "discourse-i18n";

export default class TocLargeButtons extends Component {
  @service tocProcessor;

  @action
  callJumpToEnd() {
    this.tocProcessor.jumpToEnd(this.args.renderTimeline, this.args.postID);
  }

  <template>
    <div class="d-toc-footer-icons">
      <DButton
        @action={{this.callJumpToEnd}}
        @icon="downward"
        @translatedLabel={{i18n (themePrefix "jump_bottom")}}
        class="btn btn-transparent scroll-to-bottom"
      />
    </div>
  </template>
}
