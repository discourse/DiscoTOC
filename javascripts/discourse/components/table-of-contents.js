import Component from "@glimmer/component";
import { action } from "@ember/object";

export default class TableOfContents extends Component {
  @action
  closeOverlay(e) {
    e.preventDefault();
    document.querySelector(".d-toc-wrapper").classList.remove("overlay");
  }
}
