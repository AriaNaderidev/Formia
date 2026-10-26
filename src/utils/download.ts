/** Saves text as a file through a temporary object URL. */
export const downloadText = (
  filename: string,
  text: string,
  type = "text/plain",
) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
