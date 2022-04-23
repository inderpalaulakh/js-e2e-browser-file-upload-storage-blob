// ./src/azure-storage-blob.ts

// <snippet_package>
// THIS IS SAMPLE CODE ONLY - NOT MEANT FOR PRODUCTION USE
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const avatarList = [
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_cat.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_fox.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_koala.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_monkey.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_mouse.png",
  "https://imagetestinderpal.blob.core.windows.net/tutorial-container/image_octopus.png",
];

const containerName = `tutorial-container`;
const sasToken = process.env.REACT_APP_STORAGESASTOKEN;
const storageAccountName = process.env.REACT_APP_STORAGERESOURCENAME;
// </snippet_package>

// <snippet_isStorageConfigured>
// Feature flag - disable storage feature to app if not configured
export const isStorageConfigured = () => {
  return !storageAccountName || !sasToken ? false : true;
};
// </snippet_isStorageConfigured>

// <snippet_getBlobsInContainer>
// return list of blobs in container to display
const getBlobsInContainer = async (containerClient: ContainerClient) => {
  var returnedBlobUrls: string[] = [];

  // get list of blobs in container
  // eslint-disable-next-line
  for await (const blob of containerClient.listBlobsFlat()) {
    // if image is public, just construct URL
    returnedBlobUrls.push(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
    );
  }

  avatarList.forEach((element) => {
    returnedBlobUrls = returnedBlobUrls.filter((x) => x !== element);
  });

  return returnedBlobUrls;
};
// </snippet_getBlobsInContainer>

// <snippet_createBlobInContainer>
const createBlobInContainer = async (
  containerClient: ContainerClient,
  file: File
) => {
  // create blobClient for container
  const blobClient = containerClient.getBlockBlobClient(file.name);

  // set mimetype as determined from browser with file upload control
  const options = { blobHTTPHeaders: { blobContentType: file.type } };

  // upload file
  await blobClient.uploadData(file, options);
};
// </snippet_createBlobInContainer>

const createBlobFromBufferInContainer = async (
  containerClient: ContainerClient,
  buffer: ArrayBuffer,
  fileName: string
) => {
  // create blobClient for container
  const blobClient = containerClient.getBlockBlobClient(fileName);

  // set mimetype as determined from browser with file upload control
  const options = { blobHTTPHeaders: { blobContentType: "image/png" } };

  // upload file
  await blobClient.uploadData(buffer, options);
};

export const saveBufferToBucket = async (
  buffer: ArrayBuffer,
  fileName: string
): Promise<string[]> => {
  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient =
    blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: "container",
  });

  // upload file
  await createBlobFromBufferInContainer(containerClient, buffer, fileName);

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};

// <snippet_uploadFileToBlob>
export const deleteFileFromContainer = async (
  fileName: string
): Promise<string[]> => {
  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient =
    blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: "container",
  });

  // upload file
  await containerClient.deleteBlob(fileName);

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};

// <snippet_uploadFileToBlob>
export const uploadFileToBlob = async (
  file: File | null
): Promise<string[]> => {
  if (!file) return [];

  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient =
    blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: "container",
  });

  // upload file
  await createBlobInContainer(containerClient, file);

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};
// </snippet_uploadFileToBlob>

export const getAllFilesFromBlob = async (): Promise<string[]> => {
  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );

  // get Container - full public read access
  const containerClient: ContainerClient =
    blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: "container",
  });

  // get list of blobs in container
  return getBlobsInContainer(containerClient);
};
