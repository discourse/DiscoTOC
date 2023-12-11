import { later } from "@ember/runloop";
import { headerOffset } from "discourse/lib/offset-calculator";
import { withPluginApi } from "discourse/lib/plugin-api";
import { slugify } from "discourse/lib/utilities";
import { iconHTML } from "discourse-common/lib/icon-library";
import domUtils from "discourse-common/utils/dom-utils";
import I18n from "I18n";

let TOChidden = localStorage.getItem("discourse_toc-hidden") === "true";

export default {
  name: "disco-toc-main",

  initialize() {
    withPluginApi("1.0.0", (api) => {
      const autoTocCategoryIds = settings.auto_TOC_categories
        .split("|")
        .map((id) => parseInt(id, 10));

      const autoTocTags = settings.auto_TOC_tags.split("|");

      api.decorateCookedElement(
        (el, helper) => {
          if (helper) {
            const post = helper.getModel();
            if (post?.post_number !== 1) {
              return;
            }

            const topicCategory = helper.getModel().topic.category_id;
            const topicTags = helper.getModel().topic.tags;

            const hasTOCmarkup = el?.querySelector(`[data-theme-toc="true"]`);
            const tocCategory = autoTocCategoryIds?.includes(topicCategory);
            const tocTag = topicTags?.some((tag) => autoTocTags?.includes(tag));

            if (!hasTOCmarkup && !tocCategory && !tocTag) {
              document.body.classList.remove("d-toc-timeline-visible");
              return;
            }

            let dTocHeadingSelectors =
              ":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5";
            const headings = el.querySelectorAll(dTocHeadingSelectors);

            if (headings.length < settings.TOC_min_heading) {
              return;
            }

            headings.forEach((h, index) => {
              // suffix uses index for non-Latin languages
              const suffix = slugify(h.textContent) || index;
              const id =
                h.getAttribute("id") || slugify(`toc-${h.nodeName}-${suffix}`);

              h.setAttribute("id", id);
              h.setAttribute("data-d-toc", id);
              h.classList.add("d-toc-post-heading");
            });

            el.classList.add("d-toc-cooked");

            if (document.querySelector(".d-toc-wrapper")) {
              this.insertTOC(headings);
            } else {
              // try again if decoration happens while outlet is not rendered
              // this is due to core resetting `canRender` for topic-navigation
              // when transitioning between topics
              later(() => {
                if (document.querySelector(".d-toc-wrapper")) {
                  this.insertTOC(headings);
                }
              }, 300);
            }
          }
        },
        {
          id: "disco-toc",
          onlyStream: true,
          afterAdopt: true,
        }
      );

      api.onAppEvent("topic:current-post-changed", (args) => {
        const hasCookedTOC = document.querySelector(".d-toc-cooked");

        // manages the timeline area width via CSS
        if (hasCookedTOC) {
          document.body.classList.add("d-toc-available");
        }

        // manages timeline visibility
        if (hasCookedTOC && args.post.post_number === 1) {
          if (!TOChidden) {
            handleButtonAndBody("show");
          } else {
            handleButtonAndBody("hide");
          }

          // don't show the toggle if there's only 1 post
          if (hasCookedTOC && args.post.topic.posts_count !== 1) {
            document.body.classList.add("d-toc-timeline-toggleable");
          }
        } else {
          handleButtonAndBody("hide");
        }

        if (args.post.topic.posts_count === 1) {
          document.body.classList.remove("d-toc-timeline-toggleable");
        }
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
        document.body.classList.remove("d-toc-available");
        document.removeEventListener("click", this.clickTOC, false);
      });
    });
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

  createMainDiv() {
    const dToc = document.createElement("div");
    dToc.classList.add("d-toc-main");
    dToc.innerHTML = `<div class="d-toc-icons"><a href="#" class="d-toc-close">${iconHTML(
      "times"
    )}</a></div>`;
    return dToc;
  },

  createScrollLink() {
    const scrollLink = document.createElement("a");
    scrollLink.href = "#";
    scrollLink.className = "scroll-to-bottom";
    scrollLink.title = I18n.t(themePrefix("post_bottom_tooltip"));
    scrollLink.innerHTML = `${iconHTML("downward")} ${I18n.t(
      themePrefix("jump_bottom")
    )}`;
    return scrollLink;
  },

  createToggleButton() {
    const toggleButton = document.createElement("button");
    toggleButton.className =
      "d-toc-timeline-toggle btn btn-default btn-icon-text";
    toggleButton.innerHTML =
      iconHTML("timeline") + I18n.t(themePrefix("topic_timeline"));

    return toggleButton;
  },

  insertTOC(headings) {
    const dToc = this.createMainDiv();
    const scrollLink = this.createScrollLink();
    this.toggleButton = this.createToggleButton();

    const existing = document.querySelector(".d-toc-wrapper .d-toc-main");
    const wrapper = document.querySelector(".d-toc-wrapper");

    if (existing) {
      wrapper.replaceChild(dToc, existing);
    } else {
      wrapper.appendChild(dToc);
      wrapper.appendChild(this.toggleButton);
    }

    const result = this.buildTOC(Array.from(headings));
    dToc.appendChild(result);
    dToc.appendChild(scrollLink);
    document.addEventListener("click", this.clickTOC, false);
  },

  clickTOC(e) {
    const classNames = ["d-toc-timeline-visible", "archetype-docs-topic"];

    // toggle timeline visibility
    if (e.target.closest(".d-toc-timeline-toggle")) {
      handleButtonAndBody("toggle");
      e.preventDefault();
      return false;
    }

    // link to each heading
    if (
      e.target.closest(".d-toc-item") &&
      e.target.hasAttribute("data-d-toc")
    ) {
      const target = `#${e.target.getAttribute("data-d-toc")}`;
      const scrollTo = domUtils.offset(
        document.querySelector(`.d-toc-cooked ${target}`)
      ).top;
      window.scrollTo({
        top: scrollTo - headerOffset() - 10,
        behavior: "smooth",
      });
      document.querySelector(".d-toc-wrapper").classList.remove("overlay");
      e.preventDefault();
      return false;
    }

    if (e.target.closest("a")) {
      // link to first post bottom
      if (e.target.closest("a").classList.contains("scroll-to-bottom")) {
        const rect = document
          .querySelector(".d-toc-cooked")
          .getBoundingClientRect();

        if (rect) {
          window.scrollTo({
            top: rect.bottom + window.scrollY - headerOffset() - 10,
            behavior: "smooth",
          });
          document.querySelector(".d-toc-wrapper").classList.remove("overlay");
          e.preventDefault();
          return false;
        }
      }

      // close overlay
      if (e.target.closest("a").classList.contains("d-toc-close")) {
        document.querySelector(".d-toc-wrapper").classList.remove("overlay");
        e.preventDefault();
        return false;
      }
    }

    if (!document.querySelector(".d-toc-wrapper.overlay")) {
      return;
    }

    // clicking outside overlay
    if (!e.target.closest(".d-toc-wrapper.overlay")) {
      document.querySelector(".d-toc-wrapper").classList.remove("overlay");
    }

    if (
      !classNames.some((className) =>
        document.body.classList.contains(className)
      )
    ) {
      return;
    }
  },

  buildTOC(headings) {
    const result = document.createElement("div");
    result.setAttribute("id", "d-toc");

    const primaryH = headings[0].tagName;
    const primaryHeadings = headings.filter((n) => n.tagName === primaryH);
    let nextIndex = headings.length;

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

      result.appendChild(ul);
    });

    return result;
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
  const matchesSelector =
    el.matches ||
    el.webkitMatchesSelector ||
    el.mozMatchesSelector ||
    el.msMatchesSelector;

  // match start from parent
  el = el.parentElement;
  while (el && !matchesSelector.call(el, selector)) {
    if (!filter) {
      result.push(el);
    } else {
      if (matchesSelector.call(el, filter)) {
        result.push(el);
      }
    }
    el = el.parentElement;
  }
  return result;
}

function handleButtonAndBody(action) {
  const body = document.body;
  const button = document.querySelector("button.d-toc-timeline-toggle");

  switch (action) {
    case "toggle":
      body.classList.toggle("d-toc-timeline-visible");
      TOChidden = !TOChidden;
      localStorage.setItem("discourse_toc-hidden", TOChidden.toString());

      break;

    case "hide":
      body.classList.remove(
        "d-toc-timeline-visible",
        "d-toc-timeline-toggleable"
      );
      break;

    case "show":
      body.classList.add("d-toc-timeline-visible", "d-toc-timeline-toggleable");
      break;
  }

  if (button) {
    const translationKey = body.classList.contains("d-toc-timeline-visible")
      ? "topic_timeline"
      : "table_of_contents";

    const icon = body.classList.contains("d-toc-timeline-visible")
      ? "timeline"
      : "stream";

    button.innerHTML = `${iconHTML(icon)}${I18n.t(
      themePrefix(translationKey)
    )} `;
  }
}
