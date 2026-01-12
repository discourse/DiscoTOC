import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Service, { service } from "@ember/service";
import { slugify } from "discourse/lib/utilities";

export default class TocProcessor extends Service {
  @service router;

  @tracked hasTOC = false;
  @tracked postContent = null;
  @tracked postID = null;
  @tracked tocStructure = null;
  @tracked isTocVisible = localStorage.getItem("tocVisibility") !== "false";
  @tracked isOverlayVisible = false;
  @tracked isDocs = false;

  @action
  toggleTocVisibility() {
    this.isTocVisible = !this.isTocVisible;
    localStorage.setItem("tocVisibility", this.isTocVisible);
  }

  setOverlayVisible(visible) {
    this.isOverlayVisible = visible;
    const tocWrapper = document.querySelector(".d-toc-wrapper");
    if (tocWrapper) {
      tocWrapper.classList.toggle("overlay", visible);
    }
  }

  toggleOverlay() {
    this.setOverlayVisible(!this.isOverlayVisible);
  }

  checkPostforTOC(topic) {
    this.hasTOC = false;
    if (
      this.isValidTopic(topic) &&
      this.shouldDisplayToc(this.getCurrentPost(topic))
    ) {
      const content = this.getCurrentPost(topic).cooked;
      if (this.containsTocMarkup(content) || this.autoTOC(topic)) {
        this.processPostContent(content, this.getCurrentPost(topic).id);
      }
    }
    this.setOverlayVisible(false);
  }

  isValidTopic(topic) {
    return !!topic;
  }

  getCurrentPost(topic) {
    const docs = this.router?.currentRouteName?.includes("docs");

    if (docs) {
      this.isDocs = true;
      return topic.post_stream.posts[0];
    }

    this.isDocs = false;
    return topic.postStream?.posts?.find(
      (post) => post.post_number === topic.currentPost
    );
  }

  shouldDisplayToc(post) {
    return settings.enable_TOC_for_replies || post.post_number === 1;
  }

  containsTocMarkup(content) {
    return content.includes(`<div data-theme-toc="true">`);
  }

  processPostContent(content, postId) {
    // no headings, no parsing
    if (this.containsHeadings(content)) {
      const parsedPost = new DOMParser().parseFromString(content, "text/html");

      // Find headings that are either:
      // 1. Direct descendants of body (to avoid picking up headings in quotes)
      // 2. Inside wrap blocks (which are used for email filtering with [wrap=no-email])
      const selector = "body > :is(h1, h2, h3, h4, h5), body > :is(.wrap, .d-wrap) :is(h1, h2, h3, h4, h5)";

      const allHeadings = parsedPost.querySelectorAll(selector);

      // Convert NodeList to Array and sort by document order
      const headings = Array.from(allHeadings).sort((a, b) => {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });

      if (headings.length < settings.TOC_min_heading) {
        this.setOverlayVisible(false);
        return;
      }

      this.populateTocData(postId, content, headings);
    } else {
      this.setOverlayVisible(false);
    }
  }

  containsHeadings(content) {
    return ["<h1", "<h2", "<h3", "<h4", "<h5"].some((tag) =>
      content.includes(tag)
    );
  }

  populateTocData(postId, content, headings) {
    this.hasTOC = true;
    this.postID = postId;
    this.postContent = content;
    this.tocStructure = this.generateTocStructure(headings);
  }

  autoTOC(topic) {
    // check topic for categories or tags from settings
    const autoCategories = settings.auto_TOC_categories
      ? settings.auto_TOC_categories.split("|").map((id) => parseInt(id, 10))
      : [];

    const autoTags = settings.auto_TOC_tags
      ? settings.auto_TOC_tags.split("|")
      : [];

    if ((!autoCategories.length && !autoTags.length) || !topic) {
      return false;
    }

    const topicCategory = topic.category_id;
    const topicTags = (topic.tags || []).map((t) =>
      typeof t === "string" ? t : t.name
    );

    const hasMatchingTags = autoTags.some((tag) => topicTags.includes(tag));
    const hasMatchingCategory = autoCategories.includes(topicCategory);

    // only apply autoTOC on first post
    // the docs plugin only shows the first post, and does not have topic.currentPost defined
    return (
      (hasMatchingTags || hasMatchingCategory) &&
      (topic.currentPost === 1 || topic.currentPost === undefined)
    );
  }

  /**
   * @param {number} postId
   * @param {HTMLHeadingElement} heading
   * @param {Map<string, number>} sameIdCount
   */
  getIdFromHeading(postId, heading, sameIdCount) {
    const anchor = heading.querySelector("a.anchor");
    if (anchor) {
      return anchor.name;
    }
    const lowerTagName = heading.tagName.toLowerCase();
    const text = heading.textContent.trim();
    let slug = `${slugify(text)}`;
    if (sameIdCount.has(slug)) {
      sameIdCount.set(slug, sameIdCount.get(slug) + 1);
      slug = `${slug}-${sameIdCount.get(slug)}`;
    } else {
      sameIdCount.set(slug, 1);
    }
    const res = `p-${postId}-toc-${lowerTagName}-${slug}`;
    heading.id = res;
    return res;
  }

  generateTocStructure(headings) {
    let root = { subItems: [], level: 0 };
    let ancestors = [root];

    const sameIdCount = new Map();

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1], 10);
      const text = heading.textContent.trim();
      const lowerTagName = heading.tagName.toLowerCase();

      const id = this.getIdFromHeading(this.postID, heading, sameIdCount);

      // Remove irrelevant ancestors
      while (ancestors[ancestors.length - 1].level >= level) {
        ancestors.pop();
      }

      let headingData = {
        id,
        tagName: lowerTagName,
        text,
        subItems: [],
        level,
        parent: ancestors.length > 1 ? ancestors[ancestors.length - 1] : null,
      };

      ancestors[ancestors.length - 1].subItems.push(headingData);
      ancestors.push(headingData);
    });

    return root.subItems;
  }

  jumpToEnd(renderTimeline, postID) {
    let buffer = 150;
    const postContainer = document.querySelector(`[data-post-id="${postID}"]`);

    if (!renderTimeline) {
      this.setOverlayVisible(false);
    }

    if (postContainer) {
      // if the topic map is present, we don't want to scroll past it
      // so the post controls are still visible
      const topicMapHeight =
        postContainer.querySelector(`.topic-map`)?.offsetHeight || 0;

      if (
        postContainer.parentElement?.nextElementSibling?.querySelector(
          "div[data-theme-toc]"
        )
      ) {
        // but if the next post also has a toc, just jump to it
        buffer = 30 - topicMapHeight;
      }

      const offsetPosition =
        postContainer.getBoundingClientRect().bottom +
        window.scrollY -
        buffer -
        topicMapHeight;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }
}
