import Main from "@/components/main/main";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function HomeScreen() {
  //const client_gen = generate_client();
  //initClient(client_gen);

  return (
    <SafeAreaProvider>
      <Main></Main>
    </SafeAreaProvider>
  );
}
