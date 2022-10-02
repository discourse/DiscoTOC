import Component from "@glimmer/component";
import { action } from "@ember/object";
import { headerOffset } from "discourse/lib/offset-calculator";
import { inject as service } from "@ember/service";

export default class TableOfContents extends Component {
  @service("tableOfContentsData") data;

  @action
  scrollToBottom(e) {
    e.preventDefault();
    const rect = document
      .querySelector(".d-toc-cooked")
      .getBoundingClientRect();

    window.scrollTo({
      top: rect.bottom + window.scrollY - headerOffset() - 10,
      behavior: "smooth",
    });
  }

  @action
  closeOverlay(e) {
    e.preventDefault();
    document.querySelector(".d-toc-wrapper").classList.remove("overlay");
  }
}
