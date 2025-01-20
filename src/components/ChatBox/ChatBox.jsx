import "./ChatBox.css";
import assets from "../../assets/assets"; // Adjust the path as necessary
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext"; // Adjust the path as necessary
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "../../config/firebase";
const ChatBox = () => {
  const { userData, messageId, chatUser, messages, setMessages } =
    useContext(AppContext);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const messagesRef = collection(db, "messages");
    try {
      await updateDoc(doc(messagesRef, messageId), {
        message: arrayUnion({
          sender: userData.id,
          message: input,
          time: Date.now(),
        }),
      });
      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (messageId) {
      const unSub = onSnapshot(doc(db, "messages", messageId), (res) => {
        setMessages(res.data().message.reverse());
        console.log(res.data().message.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messageId]);

  return chatUser ? (
    <div className="chat-box">
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.username}
          <img className="dot" src={assets.green_dot} alt="" />
        </p>
        <img src={assets.help_icon} className="help" alt="" />
      </div>

      <div className="chat-msg">
        <div className="s-msg">
          <p className="msg">
            Lorem ipsum dolor sit amet consectetur adipisight ..
          </p>
          <div>
            <img src={assets.profile_img} alt="" />
            <p>2:30 PM</p>
          </div>
        </div>
        <div className="s-msg">
          <img className="msg-img" src={assets.profile_suree} alt="" />
          <div>
            <img src={assets.profile_img} alt="" />
            <p>2:30 PM</p>
          </div>
        </div>
        <div className="r-msg">
          <p className="msg">
            Lorem ipsum dolor sit amet consectetur adipisigh ..
          </p>
          <div>
            <img src={assets.profile_aman} alt="" />
            <p>2:30 PM</p>
          </div>
        </div>
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Type a message"
        />
        <input type="file" id="image" accept="image/*" hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.logo_icon} alt="logo" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
