import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const upload = async (file, onProgress, onUploadTask) => {
  const storage = getStorage();
  const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  if (onUploadTask) {
    onUploadTask(uploadTask); // Provide the upload task so we can cancel later
  }

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error(error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;
