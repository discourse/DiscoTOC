import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";
import i18n from "discourse-common/helpers/i18n";

export default class TocToggle extends Component {
  @service tocProcessor;

  get shouldShow() {
    // docs and topics with 1 post don't need a toggle
    if (this.tocProcessor.isDocs || this.args.topic?.posts_count === 1) {
      return false;
    }

    return this.tocProcessor.hasTOC;
  }

  get toggleLabel() {
    return this.tocProcessor.isTocVisible
      ? "toggle_toc.show_timeline"
      : "toggle_toc.show_toc";
  }

  get toggleIcon() {
    return this.tocProcessor.isTocVisible ? "timeline" : "stream";
  }

  <template>
    {{#if this.shouldShow}}
      <DButton
        @action={{this.tocProcessor.toggleTocVisibility}}
        @icon={{this.toggleIcon}}
        @translatedLabel={{i18n (themePrefix this.toggleLabel)}}
        class="btn btn-default timeline-toggle"
      />
    {{/if}}
  </template>
}
