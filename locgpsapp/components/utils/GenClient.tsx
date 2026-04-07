import { generate_uuidv4 } from "./GenUuid";
import { UserData } from "./StompJs";

export function generate_client() {
  const uuid: string = generate_uuidv4();

  const userdata: UserData = {
    iduser: uuid,
    correo: `${uuid}@gmail.com`,
  };

  return userdata;
}
