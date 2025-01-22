import "./LeftSidebar.css";
import assets from "../../assets/assets";
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
import { logout } from "../../config/firebase";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData, setChatUser, setMessageId, messageId } =
    useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setshowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setshowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          // Check if the user you searched already exists in your chat list
          chatData.map((chat) => {
            if (chat.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setshowSearch(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addChat = async () => {
    try {
      // First, check if this user is already in your chatData
      const userChatRef = doc(db, "chats", userData.id);
      const userChatSnapshot = await getDoc(userChatRef);
      if (userChatSnapshot.exists()) {
        const userChatsData = userChatSnapshot.data();
        const alreadyInList = userChatsData.chatData.some(
          (chat) => chat.rId === user.id
        );
        if (alreadyInList) {
          toast.error("User already exists in your chat list");
          return;
        }
      }

      // If user is not in the list, create a new messages doc and update both chats
      const messagesRef = collection(db, "messages");
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        message: [],
      });

      // Update the other user's chat
      await updateDoc(doc(db, "chats", user.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updateAt: Date.now(),
          messageSeen: true,
        }),
      });

      // Update the current user's chat
      await updateDoc(doc(db, "chats", userData.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updateAt: Date.now(),
          messageSeen: true,
        }),
      });

      // Optionally clear the search
      setUser(null);
      setshowSearch(false);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  const setChat = async (item) => {
    setMessageId(item.messageId);
    setChatUser(item);
    const userChatRef = doc(db, "chats", userData.id);
    const userChatSnapshot = await getDoc(userChatRef);
    const userChatsData = userChatSnapshot.data();
    const chatIndex = userChatsData.chatData.findIndex(
      (chat) => chat.messageId === item.messageId
    );
    userChatsData.chatData[chatIndex].messageSeen = true;
    await updateDoc(userChatRef, {
      chatData: userChatsData.chatData,
    });
  };

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="nav logo" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={() => logout()}>Log Out</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="User Avatar" />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData &&
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messageId ? "" : "border"
              }`}
            >
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
