import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";
import TocToggle from "../components/toc-toggle";

export default class TocLargeButtons extends Component {
  @service tocProcessor;

  <template>
    {{#if @renderTimeline}}
      <div class="d-toc-footer-icons">
        <DButton
          @action={{this.callJumpToEnd}}
          @icon="downward"
          @label="jump to end"
          @class="btn btn-transparent scroll-to-bottom"
        />
        <TocToggle />
      </div>
    {{/if}}
  </template>

  @action
  callJumpToEnd() {
    this.tocProcessor.jumpToEnd(this.args.renderTimeline, this.args.postID);
  }
}
