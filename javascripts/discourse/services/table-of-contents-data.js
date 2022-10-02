import Service from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class TableOfContentsData extends Service {
  @tracked html = "";
}
