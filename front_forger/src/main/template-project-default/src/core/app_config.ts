import { Col } from "./data_ext";
import SerializeAble, { RegClass, Serialize } from "./serialize";

@RegClass("AppConfig")
export class AppConfig extends SerializeAble {
  @Serialize()
  path: string = "";
  @Serialize()
  scriptCol: Col<string> = {};
};