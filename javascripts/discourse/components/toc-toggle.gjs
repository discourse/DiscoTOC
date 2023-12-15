import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import DButton from "discourse/components/d-button";

export default class TocToggle extends Component {
  @service tocProcessor;

  <template>
    {{#if this.tocProcessor.hasTOC}}
      <DButton
        @action={{this.tocProcessor.toggleTocVisibility}}
        @icon="list"
        @label="toggle toc"
        @class="btn btn-default "
      />
    {{/if}}
  </template>
}
