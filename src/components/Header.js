import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React,{useState,useEffect} from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";



const Header = ({ children, hasHiddenAuthButtons }) => {

  let history=useHistory();
  let [isLoggedIn, setLoggedIn] = useState("false")
  let username=localStorage.getItem("username");

  let handleLogout = () =>{
    localStorage.clear();
    history.push("/");
  }

  useEffect(() => {
    if(username !== null)
    {
      setLoggedIn(true);
    }
    else
    {
      setLoggedIn(false);
    }
  },[username])

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        
  
        {hasHiddenAuthButtons ? ( <div>{
          
          isLoggedIn ? (
            <div><Stack direction="row" spacing={2} className="avatar">
          <Avatar alt={username} src="public/avatar.png"/>
          <h5>{username}</h5>
            <Button className="explore-button" onClick={handleLogout}
            >
            LOGOUT
            </Button>
          </Stack>
          </div>) : (<div>
            <Button
              onClick={() => (history.push("/login"))}
            >
              LOGIN
            </Button>
            <Button
              variant="contained"
              onClick={() => (history.push("/register"))}
            >
              REGISTER
            </Button>
            </div>)
           
        }  </div>)
        
         : (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => (history.push("/"))}
        >
          Back to explore
        </Button>)}
      </Box>
    );
};

export default Header;
