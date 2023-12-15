import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";

export default class TocMiniButtons extends Component {
  @service tocProcessor;

  <template>
    {{#unless @renderTimeline}}
      <div class="d-toc-icons">
        <DButton
          @action={{this.callJumpToEnd}}
          @icon="downward"
          @class="btn btn-transparent scroll-to-bottom"
        />
        <DButton
          @action={{this.tocProcessor.closeOverlay}}
          @icon="times"
          @class="btn btn-transparent d-toc-close"
        />
      </div>
    {{/unless}}
  </template>

  @action
  callJumpToEnd() {
    this.tocProcessor.jumpToEnd(this.args.renderTimeline, this.args.postID);
  }
}
