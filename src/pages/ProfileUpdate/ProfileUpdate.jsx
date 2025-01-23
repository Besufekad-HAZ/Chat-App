import "./ProfileUpdate.css";
import { useContext, useEffect, useState } from "react";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import upload from "../../lib/upload";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Please Upload profile picture");
      }
      const docRef = doc(db, "users", uid);
      if (image) {
        const imgUrl = await upload(image);
        console.log(imgUrl);
        setPrevImage(imgUrl);
        await updateDoc(docRef, {
          avatar: imgUrl,
          name: name,
          bio: bio,
        });
        toast.success("Profile updated successfully");
      } else {
        await updateDoc(docRef, {
          name,
          bio,
        });
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate("/chat");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  }; // update profile

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar);
        }
      } else {
        // User is signed out
        navigate("/");
      }
    });
  }, []);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept="image/*"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
              alt="Avatar image"
            />
            Upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            id="name"
            placeholder="Your name"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          ></textarea>
          <button type="submit">Save</button>
        </form>
        <img
          className="profile-pic"
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage
              ? prevImage
              : assets.logo_icon
          }
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
