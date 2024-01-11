import { apiInitializer } from "discourse/lib/api";
import TocMini from "../components/toc-mini";

export default apiInitializer("1.14.0", (api) => {
  api.renderInOutlet("before-topic-progress", TocMini);
});
