import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";
import i18n from "discourse-common/helpers/i18n";

export default class TocLargeButtons extends Component {
  @service tocProcessor;

  <template>
    {{#if @renderTimeline}}
      <div class="d-toc-footer-icons">
        <DButton
          @action={{this.callJumpToEnd}}
          @icon="downward"
          @translatedLabel={{i18n (themePrefix "jump_bottom")}}
          @class="btn btn-transparent scroll-to-bottom"
        />
      </div>
    {{/if}}
  </template>

  @action
  callJumpToEnd() {
    this.tocProcessor.jumpToEnd(this.args.renderTimeline, this.args.postID);
  }
}
