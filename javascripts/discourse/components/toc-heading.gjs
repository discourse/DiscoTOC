import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { headerOffset } from "discourse/lib/offset-calculator";

const SCROLL_BUFFER = 25;

export default class TocHeading extends Component {
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
    const activeClass = this.isActive
      ? " direct-active active"
      : this.isAncestorActive
      ? " active"
      : "";
    return `${baseClass}${typeClass}${activeClass}`;
  }

  @action
  handleTocLinkClick(event) {
    event.preventDefault();

    const targetId = event.target.getAttribute("href")?.split("#").pop();

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

      if (!this.args.renderTimeline) {
        // hide TOC wrapper if clicking a link scrolls us to a different post
        document.querySelector(".d-toc-wrapper").classList.remove("overlay");
      }
    }
  }

  <template>
    <li class={{this.classNames}}>
      <a href="#{{@item.id}}" {{on "click" this.handleTocLinkClick}}>
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
