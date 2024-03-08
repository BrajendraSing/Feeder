import React, { useEffect, useState } from "react";
import "./UpdateProfile.scss";
import tempUserImg from "../../assets/user.png";
import { useSelector, useDispatch } from "react-redux";
import { showToast, updateMyProfile } from "../../redux/slices/appConfigSlice";
import { TOAST_FAILURE, TOAST_SUCCESS } from "../../App";
import { axiosClient } from "../../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { KEY_ACCESS_TOKEN, removeItem } from "../../utils/localStorageManager";

function UpdateProfile() {
    const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [userImg, setUserImg] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setName(myProfile?.name || "");
        setBio(myProfile?.bio || "");
        setUserImg(myProfile?.avatar?.url);
    }, [myProfile]);

    function handleImageChange(e) {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            if (fileReader.readyState === fileReader.DONE) {
                setUserImg(fileReader.result);
            }
        };
    }

    function handleSubmit(e) {
        e.preventDefault();
        dispatch(
            updateMyProfile({
                name,
                bio,
                userImg,
            })
        );
        dispatch(showToast({
            type: TOAST_SUCCESS,
            message: "Profile Updated Successfully"
        }))
    }

    const handleDeleteProfile = () =>{
        let answer = window.confirm("Are you sure");
        if(answer === true){
            deleteProfile();
        }
    }

    const deleteProfile = async() =>{
       
        try {
            const response = await axiosClient.delete("/user", {
               data:{
                _id:myProfile._id
               }
            });
            dispatch(showToast({
                type: TOAST_SUCCESS,
                message: "Account Deleted Successful"
            }))
            removeItem(KEY_ACCESS_TOKEN);
            navigate('/');
        } catch (error) {
            dispatch(showToast({
                    type: TOAST_FAILURE,
                    message: error
                }))
        }
    }

    return (
        <div className="UpdateProfile">
            <div className="container">
                <div className="left-side">
                    <div className="input-user-img">
                        <label htmlFor="inputImg" className="labelImg">
                            <img
                                src={userImg ? userImg : tempUserImg}
                                alt=""
                                className="user-img"
                            />
                        </label>
                        <input
                            className="inputImg"
                            id="inputImg"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>
                <div className="right-side">
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Your Name" onChange={(e) => setName(e.target.value)} value={name} />
                        <input type="text" placeholder="Your Bio" onChange={(e) => setBio(e.target.value)} value={bio} />
                        <input
                            type="submit"
                            value="Submit"
                            className="btn-primary hover-link"
                            onClick={handleSubmit}
                        />
                    </form>

                    <button className="btn-secondary delete-account hover-link" onClick={handleDeleteProfile}>
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfile;
