import domUtils from "discourse-common/utils/dom-utils";
import { headerOffset } from "discourse/lib/offset-calculator";
import { slugify } from "discourse/lib/utilities";
import { withPluginApi } from "discourse/lib/plugin-api";
import { bind } from "discourse-common/utils/decorators";

export default {
  name: "disco-toc-main",

  initialize() {
    withPluginApi("1.0.0", (api) => {
      this.tocService = api.container.lookup("service:table-of-contents-data");

      api.decorateCookedElement(this.decorate, {
        id: "disco-toc",
        onlyStream: true,
        afterAdopt: true,
      });

      api.onAppEvent("topic:current-post-changed", (args) => {
        if (!document.querySelector(".d-toc-cooked")) {
          return;
        }

        document.body.classList.toggle(
          "d-toc-timeline-visible",
          args.post.post_number === 1
        );
      });

      api.onAppEvent("docs-topic:current-post-scrolled", () => {
        this.updateTOCSidebar();
      });

      api.onAppEvent("topic:current-post-scrolled", (args) => {
        if (args.postIndex !== 1) {
          return;
        }

        this.updateTOCSidebar();
      });

      api.cleanupStream(() => {
        document.body.classList.remove("d-toc-timeline-visible");
        document.removeEventListener("click", this.clickTOC, false);
      });
    });
  },

  @bind
  decorate(el, helper) {
    const autoTocTags = settings.auto_TOC_tags.split("|");
    const autoTocCategoryIds = settings.auto_TOC_categories
      .split("|")
      .map((id) => parseInt(id, 10));

    const post = helper.getModel();
    if (post?.post_number !== 1) {
      return;
    }

    const topicCategory = post.topic.category_id;
    const topicTags = post.topic.tags;
    const hasTOCmarkup = el.querySelector(`[data-theme-toc="true"]`);
    const tocCategory = autoTocCategoryIds?.includes(topicCategory);
    const tocTag = topicTags?.some((tag) => autoTocTags?.includes(tag));

    if (!hasTOCmarkup && !tocCategory && !tocTag) {
      document.body.classList.remove("d-toc-timeline-visible");
      return;
    }

    let dTocHeadingSelectors =
      ":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5";
    const headings = el.querySelectorAll(dTocHeadingSelectors);

    if (headings.length < 1) {
      return;
    }

    headings.forEach((h, index) => {
      // suffix uses index for non-Latin languages
      const suffix = slugify(h.textContent) || index;
      const id = h.getAttribute("id") || slugify(`toc-${h.nodeName}-${suffix}`);

      h.setAttribute("id", id);
      h.setAttribute("data-d-toc", id);
      h.classList.add("d-toc-post-heading");
    });

    el.classList.add("d-toc-cooked");

    this.buildTOC(Array.from(headings));
    document.addEventListener("click", this.clickTOC, false);
  },

  updateTOCSidebar() {
    if (!document.querySelector(".d-toc-cooked")) {
      return;
    }

    const headings = document.querySelectorAll(".d-toc-post-heading");
    let closestHeadingDistance = null;
    let closestHeading = null;

    headings.forEach((heading) => {
      const distance = Math.abs(
        domUtils.offset(heading).top - headerOffset() - window.scrollY
      );

      if (closestHeadingDistance == null || distance < closestHeadingDistance) {
        closestHeadingDistance = distance;
        closestHeading = heading;
      } else {
        return false;
      }
    });

    if (closestHeading) {
      document.querySelectorAll("#d-toc li").forEach((listItem) => {
        listItem.classList.remove("active");
        listItem.classList.remove("direct-active");
      });

      const anchor = document.querySelector(
        `#d-toc a[data-d-toc="${closestHeading.getAttribute("id")}"]`
      );

      if (!anchor) {
        return;
      }

      anchor.parentElement.classList.add("direct-active");

      parentsUntil(anchor, "#d-toc", ".d-toc-item").forEach((liParent) => {
        liParent.classList.add("active");
      });
    }
  },

  clickTOC(e) {
    const classNames = ["d-toc-timeline-visible", "archetype-docs-topic"];

    if (
      !classNames.some((className) =>
        document.body.classList.contains(className)
      )
    ) {
      return;
    }

    // link to each heading
    if (
      e.target.closest(".d-toc-item") &&
      e.target.hasAttribute("data-d-toc")
    ) {
      const target = e.target.getAttribute("data-d-toc");
      const scrollTo = domUtils.offset(
        document.querySelector(`.d-toc-cooked #${target}`)
      ).top;

      window.scrollTo({
        top: scrollTo - headerOffset() - 10,
        behavior: "smooth",
      });
      document.querySelector(".d-toc-wrapper").classList.remove("overlay");

      e.preventDefault();
      return false;
    }

    if (!document.querySelector(".d-toc-wrapper.overlay")) {
      return;
    }

    // clicking outside overlay
    if (!e.target.closest(".d-toc-wrapper.overlay")) {
      document.querySelector(".d-toc-wrapper").classList.remove("overlay");
    }
  },

  buildTOC(headings) {
    const primaryH = headings[0].tagName;
    const primaryHeadings = headings.filter((n) => n.tagName === primaryH);
    let nextIndex = headings.length;
    let result = "";

    primaryHeadings.forEach((primaryHeading, index) => {
      const ul = document.createElement("ul");
      ul.classList.add("d-toc-heading");

      let li = this.buildItem(primaryHeading);
      ul.appendChild(li);

      const currentIndex = headings.indexOf(primaryHeading);
      if (primaryHeadings[index + 1]) {
        nextIndex = headings.indexOf(primaryHeadings[index + 1]);
      } else {
        nextIndex = headings.length;
      }

      headings.forEach((heading, subIndex) => {
        if (subIndex > currentIndex && subIndex < nextIndex) {
          let subUl = li.lastChild;
          if (subUl.tagName !== "UL") {
            subUl = subUl.appendChild(document.createElement("ul"));
            subUl.classList.add("d-toc-sublevel");
            li.appendChild(subUl);
          }

          let subLi = this.buildItem(heading);
          subUl.appendChild(subLi);
        }
      });

      result += ul.outerHTML;
    });

    this.tocService.html = result;
  },

  buildItem(node) {
    let clonedNode = node.cloneNode(true);

    clonedNode.querySelector("span.clicks")?.remove();
    const li = document.createElement("li");
    li.classList.add("d-toc-item");
    li.classList.add(`d-toc-${clonedNode.tagName.toLowerCase()}`);

    const id = clonedNode.getAttribute("id");
    li.innerHTML = `<a href="#" data-d-toc="${id}"></a>`;
    li.querySelector("a").innerText = clonedNode.textContent.trim();

    clonedNode.remove();
    return li;
  },
};

function parentsUntil(el, selector, filter) {
  const result = [];

  // match start from parent
  el = el.parentElement;

  while (el && !el.matches(selector)) {
    if (!filter || el.matches(filter)) {
      result.push(el);
    }

    el = el.parentElement;
  }

  return result;
}
