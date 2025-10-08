import { apiInitializer } from "discourse/lib/api";
import TocMini from "../components/toc-mini";

export default apiInitializer((api) => {
  api.renderInOutlet("before-topic-progress", TocMini);
});
