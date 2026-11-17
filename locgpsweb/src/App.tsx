import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Main } from "./main/Main";

function App() {

  return(
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Main/>} />
      </Routes>
    </BrowserRouter>);

}



export default App;
