import Component from "@ember/component";
import { classNames, tagName } from "@ember-decorators/component";
import TocTimeline from "../../components/toc-timeline";

@tagName("div")
@classNames("below-docs-topic-outlet", "d-toc-wrapper")
export default class DTocWrapper extends Component {
  <template>
    <TocTimeline @topic={{@outletArgs.topic}} @renderTimeline={{true}} />
  </template>
}
