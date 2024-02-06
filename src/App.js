import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Register from "./components/Register";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks"
import ipConfig from "./ipConfig.json";

export const config = {
  endpoint: `https://${ipConfig.workspaceIp}/api/v1`, // Replace with your actual endpoint
};

function App() {
  return (
    <ThemeProvider theme={theme}>

      <div className="App">
        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/thanks" component={Thanks} />
          <Route path="/" component={Products} />
        </Switch>
      </div>

    </ThemeProvider>
  );
}

export default App;
