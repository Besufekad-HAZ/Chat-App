import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messageId, setMessageId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const user = userSnap.data();

      // Set your user data
      setUserData(user);

      // If they have an avatar & name, go to chat; otherwise, profile
      if (user.avatar && user.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      // Immediately update lastSeen for online status
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      // Every minute, update lastSeen if user is still logged in
      const intervalId = setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        } else {
          clearInterval(intervalId);
        }
      }, 60000);
    } catch (err) {
      console.error(err);
    }
  };

  // Once userData is set, load or subscribe to chats
  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data()?.chatData || [];
        const tempData = [];
        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const userDetails = userSnap.data();
          tempData.push({ ...item, userData: userDetails });
        }
        // Sort by updatedAt (descending) so newest chats appear first
        setChatData(tempData.sort((a, b) => b.updateAt - a.updateAt));
      });
      return () => {
        unSub();
      };
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messageId,
    setMessageId,
    messages,
    setMessages,
    chatUser,
    setChatUser,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContextProvider;
