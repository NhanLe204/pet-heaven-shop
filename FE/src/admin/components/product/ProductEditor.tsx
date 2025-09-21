import React, { useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const ProductEditor = ({ value, onChange }) => {
  // custom upload adapter
  function uploadAdapter(loader) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          const data = new FormData();
          loader.file.then((file) => {
            data.append("file", file);

            fetch("http://localhost:5000/upload", { // API upload ảnh
              method: "POST",
              body: data,
            })
              .then((res) => res.json())
              .then((res) => {
                resolve({
                  default: res.url, // backend trả link ảnh
                });
              })
              .catch((err) => reject(err));
          });
        });
      },
    };
  }

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return uploadAdapter(loader);
    };
  }

  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
        extraPlugins: [uploadPlugin],
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "blockQuote",
          "|",
          "insertTable",
          "uploadImage",
          "undo",
          "redo",
        ],
      }}
      onChange={(_, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
};

export default ProductEditor;
