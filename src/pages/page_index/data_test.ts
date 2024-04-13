import { Col } from "../../core/data_ext";
import SerializeAble, { RegClass, Serialize } from "../../core/serialize";
@RegClass("Arg1")
export class Arg1 extends SerializeAble {
  @Serialize()
  id = 0;
  @Serialize()
  key = "";
  @Serialize()
  desc = "";
};
@RegClass("Test1")
export class Test1 extends SerializeAble {
  @Serialize()
  key = ""
  @Serialize(Arg1)
  arg1: Arg1 = null;
  @Serialize(Test1)
  children: Test1[] = [];
  @Serialize()
  argCol: Col<Arg1> = {};
};