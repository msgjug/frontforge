import SerializeAble, { RegClass, Serialize } from "./serialize";

@RegClass("AppConfig")
export class AppConfig extends SerializeAble {
  @Serialize()
  scriptCol: { [key: string]: string } = {};
};