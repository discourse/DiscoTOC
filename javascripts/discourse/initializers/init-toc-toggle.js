import { apiInitializer } from "discourse/lib/api";
import TocToggle from "../components/toc-toggle";

export default apiInitializer("1.14.0", (api) => {
  api.renderInOutlet("timeline-footer-controls-after", TocToggle);
});
