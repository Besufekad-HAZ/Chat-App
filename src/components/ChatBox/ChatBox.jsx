import "./ChatBox.css";
import assets from "../../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import upload from "../../lib/upload";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {
  const {
    userData,
    messageId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);

  const [input, setInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTaskRef, setUploadTaskRef] = useState(null);

  // For context menu
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [selectedMessage, setSelectedMessage] = useState(null);

  // For edit
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // Send text message
  const sendMessage = async () => {
    try {
      if (input && messageId) {
        await updateDoc(doc(db, "messages", messageId), {
          message: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });
        await updateLastMessageReferences(input.slice(0, 30));
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
    setInput("");
  };

  // Send image
  const sendImage = async (e) => {
    try {
      setUploadProgress(0);
      const file = e.target.files[0];
      const fileUrl = await upload(
        file,
        (progress) => setUploadProgress(progress),
        (task) => setUploadTaskRef(task)
      );
      // If upload is canceled, fileUrl won't exist
      if (fileUrl && messageId) {
        await updateDoc(doc(db, "messages", messageId), {
          message: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });
        await updateLastMessageReferences("Image");
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setUploadTaskRef(null);
      setUploadProgress(0);
    }
  };

  // Cancel upload
  const cancelUpload = () => {
    if (uploadTaskRef) {
      uploadTaskRef.cancel();
      setUploadTaskRef(null);
      setUploadProgress(0);
      toast.info("Upload canceled");
    }
  };

  // Update lastMessage references
  const updateLastMessageReferences = async (textValue) => {
    const userIDs = [chatUser.rId, userData.id];
    for (const id of userIDs) {
      const userChatRef = doc(db, "chats", id);
      const userChatSnap = await getDoc(userChatRef);
      if (userChatSnap.exists()) {
        const userChatData = userChatSnap.data();
        const chatIndex = userChatData.chatData.findIndex(
          (c) => c.messageId === messageId
        );
        if (chatIndex !== -1) {
          userChatData.chatData[chatIndex].lastMessage = textValue;
          userChatData.chatData[chatIndex].updateAt = Date.now();
          if (userChatData.chatData[chatIndex].rId === userData.id) {
            userChatData.chatData[chatIndex].messageSeen = false;
          }
          await updateDoc(userChatRef, {
            chatData: userChatData.chatData,
          });
        }
      }
    }
  };

  // Delete a message
  const deleteMessage = async (msgObj) => {
    try {
      if (!messageId) return;
      // Remove specific message object from Firestore array
      await updateDoc(doc(db, "messages", messageId), {
        message: arrayRemove(msgObj),
      });
      toast.success("Message deleted");
      // Optionally update lastMessage references if the deleted one was the last message
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    } finally {
      closeContextMenu();
    }
  };

  // Start editing a text message
  const startEditMessage = (msgObj) => {
    setIsEditing(true);
    setEditText(msgObj.text || "");
    setSelectedMessage(msgObj);
    closeContextMenu();
  };

  // Submit edit changes
  const submitEdit = async () => {
    if (!editText || !messageId || !selectedMessage) {
      setIsEditing(false);
      return;
    }
    try {
      // Remove old message
      await updateDoc(doc(db, "messages", messageId), {
        message: arrayRemove(selectedMessage),
      });
      // Add updated message
      await updateDoc(doc(db, "messages", messageId), {
        message: arrayUnion({
          ...selectedMessage,
          text: editText,
        }),
      });
      await updateLastMessageReferences(editText.slice(0, 30));
      toast.success("Message updated");
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
    setIsEditing(false);
    setSelectedMessage(null);
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedMessage(null);
  };

  // Right-click handler
  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    // Only show context menu for user's own messages
    if (msg.sId !== userData.id) return;
    setSelectedMessage(msg);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  // Close the context menu
  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const convertTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return hour >= 12 ? `${hour - 12}:${minute} PM` : `${hour}:${minute} AM`;
  };

  useEffect(() => {
    if (messageId) {
      const unSub = onSnapshot(doc(db, "messages", messageId), (res) => {
        setMessages(res.data()?.message.reverse() || []);
      });
      return () => unSub();
    }
  }, [messageId, setMessages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // Click outside context menu to close
  const containerRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuVisible &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        closeContextMenu();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenuVisible]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.username}
          {Date.now() - chatUser.userData.lastSeen < 70000 ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : null}
        </p>
        <img src={assets.help_icon} className="help" alt="Help icon" />
        <img
          onClick={() => setChatVisible()}
          src={assets.arrow_icon}
          className="arrow"
          alt="Back arrow icon"
        />
      </div>

      {/* If editing, a simple input at top or bottom to modify text */}
      {isEditing && (
        <div className="edit-message-container">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Edit your message"
          />
          <button className="save-edit-btn" onClick={submitEdit}>
            Save
          </button>
          <button className="cancel-edit-btn" onClick={cancelEdit}>
            Cancel
          </button>
        </div>
      )}

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            onContextMenu={(e) => handleContextMenu(e, msg)}
          >
            {msg.image ? (
              <img className="msg-img" src={msg.image} alt="img" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}
            <div className="msg-footer">
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt=""
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Simple input for sending text */}
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Type a message"
          onKeyDown={handleKeyPress}
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/*"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>

      {/* Show image upload progress & a cancel button */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-container">
          <p>Uploading Image: {Math.round(uploadProgress)}%</p>
          <div className="progress-bar">
            <div
              className="progress-value"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <button className="cancel-upload-btn" onClick={cancelUpload}>
            Cancel
          </button>
        </div>
      )}

      {/* Custom context menu (right-click) */}
      {contextMenuVisible && selectedMessage && (
        <div
          ref={containerRef}
          className="context-menu"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          {/* If it's an image, only show Delete. If text, show both Edit & Delete */}
          {!selectedMessage.image && (
            <div
              className="context-menu-item"
              onClick={() => startEditMessage(selectedMessage)}
            >
              Edit
            </div>
          )}
          <div
            className="context-menu-item"
            onClick={() => deleteMessage(selectedMessage)}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="logo" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
