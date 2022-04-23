// ./src/App.tsx

import React, { useState, useEffect } from "react";
import Path from "path";
import {
  getAllFilesFromBlob,
  isStorageConfigured,
  uploadFileToBlob,
  deleteFileFromContainer,
  saveBufferToBucket,
} from "./azure-storage-blob";

import ImagePicker from "react-image-picker";

import "react-image-picker/dist/index.css";

import axios from "axios";

const avatarList = [
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_cat.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_fox.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_koala.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_monkey.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_mouse.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_octopus.png",
];

const storageConfigured = isStorageConfigured();

const App = (): JSX.Element => {
  useEffect(() => {
    getAllFiles();

    showAvatar();
  }, []);

  // all blobs in container
  const [blobList, setBlobList] = useState<string[]>([]);

  const [imageList, setImageList] = useState<string[]>([]);

  const showAvatar = async () => {
    setImageList(avatarList);
  };

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState(null);

  const [remoteParticipantID, setRemoteParticipantID] = useState("");
  const [imageNameToSave, setImageNameToSave] = useState("");
  const [imagePathSelected, setImagePathSelected] = useState("");

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  const onFileChange = (event: any) => {
    // capture file into state
    setFileSelected(event.target.files[0]);
  };

  const onImageNameChange = (event: any) => {
    // capture file into state
    setImageNameToSave(event.target.value);
  };

  const onIDChange = (event: any) => {
    // capture file into state
    setRemoteParticipantID(event.target.value);
  };

  const onSaveAvatar = async (event: any) => {
    if (imagePathSelected && imageNameToSave) {
      const response = await axios.get(imagePathSelected, {
        responseType: "arraybuffer",
      });

      const blobsInContainer: string[] = await saveBufferToBucket(
        Buffer.from(response.data, "base64").buffer,
        imageNameToSave + ".png"
      );

      // prepare UI for results
      setBlobList(blobsInContainer);

      // reset state/form
      setFileSelected(null);
      setUploading(false);
      setInputKey(Math.random().toString(36));
      setImageNameToSave("");
    }
  };

  const onRemoveSpecialCharacter = (event: any) => {
    // capture file into state
    setRemoteParticipantID(remoteParticipantID.replace(/[:-]/g, ""));
  };

  const onDeleteFile = async (file: string) => {
    // *** UPLOAD TO AZURE STORAGE ***
    const blobsInContainer: string[] = await deleteFileFromContainer(file);

    // prepare UI for results
    setBlobList(blobsInContainer);

    // reset state/form
    setFileSelected(null);
    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  const getAllFiles = async () => {
    // *** UPLOAD TO AZURE STORAGE ***
    const blobsInContainer: string[] = await getAllFilesFromBlob();

    // prepare UI for results
    setBlobList(blobsInContainer);

    // reset state/form
    setFileSelected(null);
    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  const onFileUpload = async () => {
    // prepare UI
    setUploading(true);

    // *** UPLOAD TO AZURE STORAGE ***
    const blobsInContainer: string[] = await uploadFileToBlob(fileSelected);

    // prepare UI for results
    setBlobList(blobsInContainer);

    // reset state/form
    setFileSelected(null);
    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

  // display form
  const DisplayForm = () => (
    <div>
      <input
        type="file"
        accept="image/png"
        onChange={onFileChange}
        key={inputKey || ""}
      />
      <button type="submit" onClick={onFileUpload}>
        Upload!
      </button>
    </div>
  );

  // display form
  const DisplayRemovingSpecialCharacter = () => (
    <div>
      <input
        type="text"
        style={{ margin: 10, width: 800 }}
        onChange={onIDChange}
        value={remoteParticipantID}
      />
      <button type="submit" onClick={onRemoveSpecialCharacter}>
        Remove : and - from ID!
      </button>
    </div>
  );

  // display file name and image
  const DisplayImagesFromContainer = () => (
    <div>
      <h2>Container items</h2>
      <ul>
        {blobList.map((item) => {
          return (
            <li key={item}>
              <div>
                {Path.basename(item)}
                <br />
                <img src={item} alt={item} height="200" />
              </div>
              <button
                type="submit"
                onClick={() => {
                  onDeleteFile(Path.basename(item));
                }}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div>
      <h2>Convert remote participant ID to valid file name</h2>
      {DisplayRemovingSpecialCharacter()}
      <hr />
      <h2>Choose Avatar</h2>
      <ImagePicker
        images={imageList.map((image, i) => ({ src: image, value: i }))}
        onPick={(image) => {
          setImagePathSelected(image.src);
        }}
      />
      <input
        type="text"
        style={{ margin: 10, width: 800 }}
        onChange={onImageNameChange}
        value={imageNameToSave}
      />
      <button type="submit" onClick={onSaveAvatar}>
        Upload avatar with name
      </button>
      <hr />
      <h2>Select image from device</h2>
      {storageConfigured && uploading && <div>Uploading</div>}
      {storageConfigured && !uploading && DisplayForm()}
      <hr />
      {storageConfigured && blobList.length > 0 && DisplayImagesFromContainer()}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
};

export default App;
