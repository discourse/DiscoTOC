import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";
import { inject as service } from "@ember/service";
import bodyClass from "discourse/helpers/body-class";
import { headerOffset } from "discourse/lib/offset-calculator";
import { slugify } from "discourse/lib/utilities";
import discourseDebounce from "discourse-common/lib/debounce";
import TocHeading from "../components/toc-heading";
import TocLargeButtons from "../components/toc-large-buttons";
import TocMiniButtons from "../components/toc-mini-buttons";

const POSITION_BUFFER = 100;
const SCROLL_DEBOUNCE = 50;
const RESIZE_DEBOUNCE = 200;

export default class TocContents extends Component {
  @service tocProcessor;
  @tracked activeHeadingId = null;
  @tracked headingPositions = [];
  @tracked activeAncestorIds = [];
  @tracked flattenedToc = [];

  @action
  setup() {
    this.listenForScroll();
    this.listenForResize();
    this.calculateHeadingPositions();
    this.updateActiveHeadingOnScroll(); // manually setup
    this.flattenedToc = this.flattenTocStructure(this.args.tocStructure);
  }

  @action
  teardown() {
    this.stopListening();
  }

  @action
  calculateHeadingPositions() {
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

    this.headingPositions = Array.from(headings).map((heading) => {
      const id = this.getIdFromHeading(heading);

      return {
        id,
        position:
          heading.getBoundingClientRect().top +
          window.scrollY -
          headerOffset() -
          POSITION_BUFFER,
      };
    });
  }

  getIdFromHeading(heading) {
    // reuse content from autolinked headings
    const tagName = heading.tagName.toLowerCase();
    const text = heading.textContent.trim();
    const anchor = heading.querySelector("a.anchor");
    return anchor ? anchor.name : `toc-${tagName}-${slugify(text)}`;
  }

  flattenTocStructure(tocStructure) {
    // the post content is flat, but we want to keep the TOC relationships from tocStructure
    return tocStructure.reduce((flatArray, item) => {
      return [
        ...flatArray,
        item,
        ...(item.subItems ? this.flattenTocStructure(item.subItems) : []),
      ];
    }, []);
  }

  @action
  listenForScroll() {
    window.addEventListener("scroll", () => {
      discourseDebounce(
        this,
        this.updateActiveHeadingOnScroll,
        SCROLL_DEBOUNCE
      );
    });
  }

  @action
  listenForResize() {
    //  due to text reflow positions will change after significant resize
    window.addEventListener("resize", () => {
      discourseDebounce(this, this.calculateHeadingPositions, RESIZE_DEBOUNCE);
    });
  }

  @action
  stopListening() {
    window.removeEventListener("scroll", this.updateActiveHeadingOnScroll);
    window.removeEventListener("resize", this.calculateHeadingPositions);
  }

  @action
  updateActiveHeadingOnScroll() {
    const scrollPosition = window.pageYOffset - headerOffset();
    this.activeHeadingId = null;
    this.activeAncestorIds = [];

    // binary search to find the active item
    let activeIndex = -1;
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

    // once found, populate ancestors
    if (activeIndex !== -1) {
      const activeHeading = this.flattenedToc.find(
        (h) => h.id === this.headingPositions[activeIndex].id
      );

      if (activeHeading) {
        this.activeHeadingId = activeHeading.id;
        for (
          let ancestor = activeHeading;
          ancestor && ancestor.parent;
          ancestor = ancestor.parent
        ) {
          this.activeAncestorIds.push(ancestor.parent.id);
        }
      }
    }
  }

  get shouldShow() {
    if (this.args.renderTimeline) {
      return this.tocProcessor.isTocVisible;
    } else {
      // visibility is managed with CSS for the progress bar
      return true;
    }
  }

  <template>
    {{#if this.shouldShow}}
      {{bodyClass "d-toc-active"}}
      <TocMiniButtons @renderTimeline={{@renderTimeline}} @postID={{@postID}} />
      <div id="d-toc" {{didInsert this.setup}} {{willDestroy this.teardown}}>
        {{#each this.args.tocStructure as |heading|}}
          <ul class="d-toc-heading">
            <TocHeading
              @item={{heading}}
              @activeHeadingId={{this.activeHeadingId}}
              @activeAncestorIds={{this.activeAncestorIds}}
              @renderTimeline={{@renderTimeline}}
            />
          </ul>
        {{/each}}
        <TocLargeButtons
          @toggleTocVisibility={{@toggleTocVisibility}}
          @postID={{@postID}}
           @renderTimeline={{@renderTimeline}} 
        />
      </div>
    {{/if}}
  </template>
}
