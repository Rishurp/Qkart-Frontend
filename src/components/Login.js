import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();

  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const postData = async (data) => {
    try {
      let response = await axios.post(`${config.endpoint}/auth/login`, data);

      // Check if the response contains a message
      // if (response.data && response.data.message) {
      //   console.log(response.data.message);
      // }

      return response;
    } catch (error) {
      // Handle errors here
      // console.error("Error:", error.response.data);
      return error.response.data; // You may choose to handle or rethrow the error as needed
    }
  };
  const login = async (formData) => {
    // console.log(validateInput(formData));
    if (validateInput(formData) !== "") {
      enqueueSnackbar(validateInput(formData));
    } else {
      try {
        setIsFetching(true);
        let response = await postData(formData);
        // console.log(response);
        if (response.status === 201) {
          enqueueSnackbar("logged in");
          setFormData((prevState) => ({
            ...prevState,
            username: "",
            password: "",
          }));
          setIsFetching(false);
          persistLogin(
            response.data.token,
            response.data.username,
            response.data.balance
          );
          history.push("/");
          // setTimeout(window.location.reload(), 10000)
        } else {
          let result = response.message;
          enqueueSnackbar(result);
          setIsFetching(false);
        }
      } catch (err) {
        // enqueueSnackbar(err);
        setIsFetching(false);
        return null;
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    if (data.username === "") {
      return "Username is a required field";
    } else if (data.password === "") {
      return "Password is a required field";
    } else return "";
  };

  const handleClick = () => {
    login(formData);
  };
  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    token field in localStorage can be used to store the Oauth token
   * -    username field in localStorage can be used to store the username that the user is logged in as
   * -    balance field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formData.password}
            onChange={handleInputChange}
          />
          {isFetching ? (
            <CircularProgress />
          ) : (
            <Button
              className="button"
              variant="contained"
              type="submit"
              onClick={handleClick}
            >
              LOGIN TO QKART
            </Button>
          )}
          <p className="secondary-action">
            Don't have an account?{" "}
            <Link className="link" to="/register">
              register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
