import domUtils from "discourse-common/utils/dom-utils";
import { headerOffset } from "discourse/lib/offset-calculator";
import { iconHTML } from "discourse-common/lib/icon-library";
import { later } from "@ember/runloop";
import { slugify } from "discourse/lib/utilities";
import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

export default {
  name: "disco-toc-main",

  initialize() {
    withPluginApi("1.0.0", (api) => {
      api.decorateCookedElement(
        (el, helper) => {
          if (helper) {
            const post = helper.getModel();
            if (post.post_number !== 1) {
              return;
            }

            if (!el.querySelector(`[data-theme-toc="true"]`)) {
              document.body.classList.remove("d-toc-timeline-visible");
              return;
            }

            let dTocHeadingSelectors =
              ":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6";
            const headings = el.querySelectorAll(dTocHeadingSelectors);

            if (headings.length < 1) {
              return;
            }

            headings.forEach((h) => {
              const id =
                h.getAttribute("id") ||
                slugify(`toc-${h.nodeName}-${h.textContent}`);

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
        if (!document.querySelector(".d-toc-cooked")) {
          return;
        }
        if (args.post.post_number === 1) {
          document.body.classList.add("d-toc-timeline-visible");
        } else {
          document.body.classList.remove("d-toc-timeline-visible");
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
        document.body.classList.remove("d-toc-timeline-visible");
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

  insertTOC(headings) {
    const dToc = document.createElement("div");
    dToc.classList.add("d-toc-main");
    dToc.innerHTML = `<div class="d-toc-icons">
              <a href="" class="scroll-to-bottom" title="${I18n.t(
                themePrefix("post_bottom_tooltip")
              )}">${iconHTML("downward")}</a>
              <a href="" class="d-toc-close">${iconHTML("times")}</a></div>`;

    const existing = document.querySelector(".d-toc-wrapper .d-toc-main");
    if (existing) {
      document.querySelector(".d-toc-wrapper").replaceChild(dToc, existing);
    } else {
      document.querySelector(".d-toc-wrapper").appendChild(dToc);
    }

    const startingLevel = parseInt(headings[0].tagName.substring(1), 10) - 1;
    let result = document.createElement("div");
    result.setAttribute("id", "d-toc");
    buildTOC(headings, result, startingLevel || 1);
    document.querySelector(".d-toc-main").appendChild(result);
    document.addEventListener("click", this.clickTOC, false);
    document.body.classList.add("d-toc-timeline-visible");
  },

  clickTOC(e) {
    if (!document.body.classList.contains("d-toc-timeline-visible")) {
      return;
    }

    // link to each heading
    if (e.target.hasAttribute("data-d-toc")) {
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
        }
      }

      // close overlay
      if (e.target.closest("a").classList.contains("d-toc-close")) {
        document.querySelector(".d-toc-wrapper").classList.remove("overlay");
      }

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
};

function buildTOC(nodesList, elm, lv = 1) {
  let nodes = Array.from(nodesList);
  node = nodes.shift();

  let node;
  if (node) {
    let li, cnt;
    let curLv = parseInt(node.tagName.substring(1), 10);

    if (curLv === lv) {
      // same level
      cnt = 0;
    } else if (curLv < lv) {
      // walk up then append
      cnt = 0;
      do {
        elm = elm.parentNode.parentNode;
        cnt--;
      } while (cnt > curLv - lv);
    } else if (curLv > lv) {
      // add children
      cnt = 0;
      do {
        li = elm.lastChild;
        if (li == null) {
          elm = elm.appendChild(document.createElement("ul"));
        } else {
          elm = li.appendChild(document.createElement("ul"));
        }
        cnt++;
      } while (cnt < curLv - lv);
    }
    if (curLv === 1 && elm.lastChild === null) {
      elm = elm.appendChild(document.createElement("ul"));
    }
    // append list item

    li = elm.appendChild(document.createElement("li"));
    li.classList.add("d-toc-item");

    let clonedNode = node.cloneNode(true);
    clonedNode.querySelector("span.clicks")?.remove();

    li.innerHTML = `<a data-d-toc="${clonedNode.getAttribute("id")}">${
      clonedNode.textContent
    }</a>`;

    clonedNode.remove();

    // recurse
    buildTOC(nodes, elm, lv + cnt);
  }
}

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
