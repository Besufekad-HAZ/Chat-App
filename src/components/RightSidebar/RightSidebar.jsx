import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import "./RightSidebar.css";
import { useNavigate } from "react-router-dom";
import {
  setDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const RightSidebar = () => {
  const { userData, chatData, chatUser, setChatUser, setMessageId, messageId } =
    useContext(AppContext);
  // const [user, setUser] = useState(null);

  return (
    <div className="rs">
      <div className="rs-profile">
        <img src={assets.profile_aman} alt="" />
        <h3>
          Aman Versatile <img src={assets.green_dot} alt="" className="dot" />
        </h3>
        <p>Hey There, I am Aman using Ethio-Chat App</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar;
