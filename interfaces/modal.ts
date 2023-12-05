import type { SurveySchema } from "@ukkidney/ukrdc-axios-ts";
import type { App } from "vue";

export interface ModalInterface extends App {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  visible: boolean;
}

export interface SurveyViewerModalInterface extends App {
  show: (surveyToShow: SurveySchema) => void;
  hide: () => void;
  toggle: () => void;
  visible: boolean;
}
