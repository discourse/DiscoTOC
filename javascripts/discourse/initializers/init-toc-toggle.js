import { apiInitializer } from "discourse/lib/api";
import TocToggle from "../components/toc-toggle";

export default apiInitializer((api) => {
  api.renderInOutlet("timeline-footer-controls-after", TocToggle);
});
