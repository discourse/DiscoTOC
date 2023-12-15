import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";

export default class TocMini extends Component {
  @service tocProcessor;
  clickOutside = null;

  get hasTOC() {
    return this.tocProcessor.hasTOC;
  }

  @action
  toggleTOCOverlay() {
    const tocWrapper = document.querySelector(".d-toc-wrapper");
    tocWrapper.classList.toggle("overlay");
    tocWrapper.classList.contains("overlay")
      ? this.addClickOutsideListener()
      : this.removeClickOutsideListener();
  }

  @action
  addClickOutsideListener() {
    this.clickOutside = (event) => {
      const tocWrapper = document.querySelector(".d-toc-wrapper");
      if (!tocWrapper.contains(event.target)) {
        tocWrapper.classList.remove("overlay");
        this.removeClickOutsideListener();
      }
    };
    document.addEventListener("click", this.clickOutside);
  }

  removeClickOutsideListener() {
    document.removeEventListener("click", this.clickOutside);
  }

  willDestroy() {
    super.willDestroy();
    this.removeClickOutsideListener();
  }

  <template>
    {{#if this.hasTOC}}
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
