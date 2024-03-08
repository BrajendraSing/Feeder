import React, { useState } from "react";
import "./Signup.scss";
import { Link } from "react-router-dom";
import {setItem, KEY_ACCESS_TOKEN} from '../../utils/localStorageManager';
import {axiosClient} from '../../utils/axiosClient';
import { useDispatch } from "react-redux";
import { TOAST_FAILURE, TOAST_SUCCESS } from "../../App";
import { showToast } from "../../redux/slices/appConfigSlice";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const result = await axiosClient.post("/auth/signup", {
                name,
                email,
                password,
            });
            setItem(KEY_ACCESS_TOKEN, result.accessToken);
            // console.log("Signup Successful : ",result);
            dispatch(showToast({
                type: TOAST_SUCCESS,
                message: "Signup Successful"
            }))
        } catch (e) {
            // console.log("Signup Error : ", error);
            dispatch(showToast({
                type: TOAST_FAILURE,
                message: e
            }))
        }
    }
    return (
        <div className="signup-wrapper">
            <div className="signup-box">
                <h1 className="heading">Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        className="name"
                        id="name"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label htmlFor="email">Email</label>
                    <input
                        type="emial"
                        className="email"
                        id="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        className="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input type="submit" value="Submit" className="submit" />
                </form>
                <p className="login-redirect">
                    Already have an account? <Link to="/login">Login</Link>{" "}
                </p>
            </div>
        </div>
    );
}

export default Signup;
