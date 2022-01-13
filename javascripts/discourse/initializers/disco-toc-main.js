import domUtils from "discourse-common/utils/dom-utils";
import { headerOffset } from "discourse/lib/offset-calculator";
import { iconHTML } from "discourse-common/lib/icon-library";
import { slugify } from "discourse/lib/utilities";
import { withPluginApi } from "discourse/lib/plugin-api";

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
              return;
            }

            el.classList.add("d-toc-cooked");

            let dTocHeadingSelectors =
              ":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6";
            const headings = el.querySelectorAll(dTocHeadingSelectors);

            headings.forEach((h) => {
              const id =
                h.getAttribute("id") ||
                slugify(`toc-${h.nodeName}-${h.textContent}`);

              h.setAttribute("id", id);
              h.setAttribute("data-d-toc", id);
              h.classList.add("d-toc-post-heading");
            });

            const dToc = document.createElement("div");
            dToc.classList.add("d-toc-main");
            dToc.innerHTML = `<div class="d-toc-icons">
              <a href="" class="scroll-to-bottom" title="${I18n.t(
                themePrefix("post_bottom_tooltip")
              )}">${iconHTML("downward")}</a>
              <a href="" class="d-toc-close">${iconHTML("times")}</a></div>`;

            document.querySelector(".d-toc-wrapper").appendChild(dToc);

            const nodes = el.querySelectorAll(
              ":scope > h1, :scope > h2,:scope > h3,:scope > h4,:scope > h5,:scope > h6"
            );
            let result = document.createElement("div");
            result.setAttribute("id", "d-toc");
            buildTOC(nodes, result);
            document.querySelector(".d-toc-main").appendChild(result);
            document.addEventListener("click", this.clickTOC, false);
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

      api.onAppEvent("topic:current-post-scrolled", (args) => {
        if (args.postIndex !== 1) {
          return;
        }

        const headings = document.querySelectorAll(".d-toc-post-heading");
        let closestHeadingDistance = null;
        let closestHeading = null;

        headings.forEach(function (heading) {
          const distance = Math.abs(
            domUtils.offset(heading).top - headerOffset() - window.scrollY
          );
          if (
            closestHeadingDistance == null ||
            distance < closestHeadingDistance
          ) {
            closestHeadingDistance = distance;
            closestHeading = heading;
          } else {
            return false;
          }
        });

        if (closestHeading) {
          const listItems = document.querySelectorAll(`#d-toc li`);
          for (let i = 0; i < listItems.length; i++) {
            listItems[i].classList.remove("active");
            listItems[i].classList.remove("direct-active");
          }

          const anchor = document.querySelector(
            `#d-toc a[data-d-toc="${closestHeading.getAttribute("id")}"]`
          );

          anchor.parentElement.classList.add("direct-active");
          const liParents = parentsUntil(anchor, "#d-toc", ".d-toc-item");

          for (let i = 0; i < liParents.length; i++) {
            liParents[i].classList.add("active");
          }
        }
      });

      api.cleanupStream(() => {
        document.body.classList.remove("d-toc-timeline-visible");
        document.removeEventListener("click", this.clickTOC, false);
      });
    });
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
    let curLv = parseInt(node.tagName.substring(1));

    if (curLv == lv) {
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
    li.innerHTML = `<a data-d-toc="${node.getAttribute("id")}">${
      node.textContent
    }</a>`;

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
