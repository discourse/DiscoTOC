import Component from "@glimmer/component";
import { action } from "@ember/object";

export default class DTocMini extends Component {
  @action
  showTOCOverlay() {
    document.querySelector(".d-toc-wrapper").classList.toggle("overlay");
  }
}
