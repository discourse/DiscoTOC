import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";

export default class TocMini extends Component {
  @service tocProcessor;

  @action
  clickOutside() {
    this.tocProcessor.setOverlayVisible(false);
    this.removeClickOutsideListener();
  }

  @action
  addClickOutsideListener() {
    document.addEventListener("click", this.clickOutside);
  }

  @action
  toggleTOCOverlay() {
    this.tocProcessor.toggleOverlay();
    if (this.tocProcessor.isOverlayVisible) {
      this.addClickOutsideListener();
    } else {
      this.removeClickOutsideListener();
    }
  }

  @action
  removeClickOutsideListener() {
    document.removeEventListener("click", this.clickOutside);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.removeClickOutsideListener();
  }

  <template>
    {{#if this.tocProcessor.hasTOC}}
      <div class="d-toc-mini">
        <DButton
          class="btn-primary"
          @icon="stream"
          @action={{this.toggleTOCOverlay}}
        />
      </div>
    {{/if}}
  </template>
}
