import Component from "@ember/component";
import { classNames, tagName } from "@ember-decorators/component";
import TocTimeline from "../../components/toc-timeline";

@tagName("div")
@classNames("topic-navigation-outlet", "d-toc-wrapper")
export default class DTocWrapper extends Component {
  <template>
    <TocTimeline
      @topic={{@outletArgs.topic}}
      @renderTimeline={{@outletArgs.renderTimeline}}
      @topicProgressExpanded={{@outletArgs.topicProgressExpanded}}
    />
  </template>
}
