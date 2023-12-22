import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";
import i18n from "discourse-common/helpers/i18n";

export default class TocToggle extends Component {
  @service tocProcessor;

  <template>
    {{#unless this.tocProcessor.isDocs}}
      {{#if this.tocProcessor.hasTOC}}
        <DButton
          @action={{this.tocProcessor.toggleTocVisibility}}
          @icon={{this.toggleIcon}}
          @translatedLabel={{i18n (themePrefix this.toggleLabel)}}
          @class="btn btn-default timeline-toggle"
        />
      {{/if}}
    {{/unless}}
  </template>

  get toggleLabel() {
    if (this.tocProcessor.isTocVisible) {
      return "toggle_toc.show_timeline";
    } else {
      return "toggle_toc.show_toc";
    }
  }

  get toggleIcon() {
    if (this.tocProcessor.isTocVisible) {
      return "timeline";
    } else {
      return "stream";
    }
  }
}
