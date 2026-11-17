import type { IMMessage } from "./IMMessage";
import type { IMUser } from "./IMUser";

export interface IMMessageData {
  user: IMUser;
  message: IMMessage;
}