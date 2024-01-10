import Component from "@glimmer/component";
import { concat } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { headerOffset } from "discourse/lib/offset-calculator";
import { slugify } from "discourse/lib/utilities";

const SCROLL_BUFFER = 25;

export default class TocHeading extends Component {
  @service tocProcessor;

  get isActive() {
    return this.args.activeHeadingId === this.args.item.id;
  }

  get isAncestorActive() {
    return this.args.activeAncestorIds?.includes(this.args.item.id);
  }

  get classNames() {
    const baseClass = "d-toc-item";
    const typeClass = this.args.item.tagName
      ? ` d-toc-${this.args.item.tagName}`
      : "";
    let activeClass = "";
    if (this.isActive) {
      activeClass = " direct-active active";
    } else if (this.isAncestorActive) {
      activeClass = " active";
    }
    return `${baseClass}${typeClass}${activeClass}`;
  }

  @action
  handleTocLinkClick(event) {
    event.preventDefault();

    const targetId = event.target.href?.split("#").pop();
    if (!targetId) {
      return;
    }

    const targetElement = document.querySelector(`a[name="${targetId}"]`);
    if (targetElement) {
      const headerOffsetValue = headerOffset();
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition =
        elementPosition - headerOffsetValue - SCROLL_BUFFER;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });

      // hide TOC overlay when navigating to link
      this.tocProcessor.setOverlayVisible(false);
    }
  }

  <template>
    <li class={{this.classNames}}>
      <a
        href="#{{@item.id}}"
        {{on "click" this.handleTocLinkClick}}
        data-d-toc={{concat "toc-" @item.tagName "-" (slugify @item.text)}}
      >
        {{@item.text}}
      </a>
      {{#if @item.subItems}}
        <ul class="d-toc-sublevel">
          {{#each @item.subItems as |subItem|}}
            <TocHeading
              @item={{subItem}}
              @activeHeadingId={{@activeHeadingId}}
              @activeAncestorIds={{@activeAncestorIds}}
            />
          {{/each}}
        </ul>
      {{/if}}
    </li>
  </template>
}
