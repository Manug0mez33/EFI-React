import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";
import logo from '../assets/logoposteonegro.png'


export default function Home() {
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            navigate("/posts");
        }
    }, [user, navigate]);

    return (
        <div className="home-container">
            <img className="home-logo" src={logo} alt="" />
        </div>
    );
}
