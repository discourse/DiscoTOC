import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";
import { debounce } from "discourse/lib/decorators";
import { headerOffset } from "discourse/lib/offset-calculator";
import TocHeading from "../components/toc-heading";
import TocLargeButtons from "../components/toc-large-buttons";
import TocMiniButtons from "../components/toc-mini-buttons";

const POSITION_BUFFER = 150;
const SCROLL_DEBOUNCE = 50;
const RESIZE_DEBOUNCE = 200;

export default class TocContents extends Component {
  @service tocProcessor;
  @service appEvents;

  @tracked activeHeadingId = null;
  @tracked headingPositions = [];
  @tracked activeAncestorIds = [];

  willDestroy() {
    super.willDestroy(...arguments);
    window.removeEventListener("scroll", this.updateActiveHeadingOnScroll);
    window.removeEventListener("resize", this.calculateHeadingPositions);
    this.appEvents.off(
      "topic:current-post-changed",
      this.calculateHeadingPositions
    );
  }

  get mappedToc() {
    return this.mappedTocStructure(this.args.tocStructure);
  }

  @action
  setup() {
    this.listenForScroll();
    this.listenForPostChange();
    this.listenForResize();
    this.updateHeadingPositions();
    this.updateActiveHeadingOnScroll(); // manual on setup so active class is added
  }

  @action
  listenForScroll() {
    window.addEventListener("scroll", this.updateActiveHeadingOnScroll);
  }

  @action
  listenForResize() {
    //  due to text reflow positions will change after significant resize
    window.addEventListener("resize", this.calculateHeadingPositions);
  }

  @action
  listenForPostChange() {
    this.appEvents.on(
      "topic:current-post-changed",
      this.calculateHeadingPositions
    );
  }

  @debounce(RESIZE_DEBOUNCE)
  calculateHeadingPositions() {
    this.updateHeadingPositions();
  }

  @action
  updateHeadingPositions() {
    // get the heading positions, so we know when to activate the TOC item on scroll
    const postElement = document.querySelector(
      `[data-post-id="${this.args.postID}"]`
    );

    if (!postElement) {
      return;
    }

    const headings = postElement.querySelectorAll("h1, h2, h3, h4, h5");
    if (!headings.length) {
      return;
    }

    const sameIdCount = new Map();
    const mappedToc = this.mappedToc;
    this.headingPositions = Array.from(headings)
      .map((heading) => {
        const id = this.tocProcessor.getIdFromHeading(
          this.args.postID,
          heading,
          sameIdCount
        );
        return mappedToc[id]
          ? {
              id,
              position:
                heading.getBoundingClientRect().top +
                window.scrollY -
                headerOffset() -
                POSITION_BUFFER,
            }
          : null;
      })
      .compact();
  }

  @debounce(SCROLL_DEBOUNCE)
  updateActiveHeadingOnScroll() {
    const scrollPosition = window.pageYOffset - headerOffset();

    // binary search to find the active item
    let activeIndex = 0;
    let low = 0;
    let high = this.headingPositions.length - 1;
    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      let heading = this.headingPositions[mid];

      if (scrollPosition >= heading.position) {
        low = mid + 1;
        activeIndex = mid;
      } else {
        high = mid - 1;
      }
    }

    const activeHeading =
      this.mappedToc[this.headingPositions[activeIndex]?.id];

    this.activeHeadingId = activeHeading?.id;
    this.activeAncestorIds = [];
    let ancestor = activeHeading;
    while (ancestor && ancestor.parent) {
      this.activeAncestorIds.push(ancestor.parent.id);
      ancestor = ancestor.parent;
    }
  }

  mappedTocStructure(tocStructure, map = null) {
    map ??= {};
    for (const item of tocStructure) {
      map[item.id] = item;
      if (item.subItems) {
        this.mappedTocStructure(item.subItems, map);
      }
    }
    return map;
  }

  <template>
    {{#unless @renderTimeline}}
      <TocMiniButtons @renderTimeline={{@renderTimeline}} @postID={{@postID}} />
    {{/unless}}
    <div
      id="d-toc"
      {{didInsert this.setup}}
      {{didUpdate this.updateHeadingPositions @postID}}
    >

      {{#each @tocStructure as |heading|}}
        <ul class="d-toc-heading">
          <TocHeading
            @item={{heading}}
            @activeHeadingId={{this.activeHeadingId}}
            @activeAncestorIds={{this.activeAncestorIds}}
            @renderTimeline={{@renderTimeline}}
          />
        </ul>
      {{/each}}

      {{#if @renderTimeline}}
        <TocLargeButtons
          @postID={{@postID}}
          @renderTimeline={{@renderTimeline}}
        />
      {{/if}}
    </div>
  </template>
}
