import { useContext } from "react";
import { UserContext } from "./UserContext";
import Register from "./RegisterAndLoginForm.jsx"

export default function Routes(){
    const {username} = useContext(UserContext);

    if(username){
        return "!logged in " + username;
    }

    return (
        <Register/>
    );
    
}