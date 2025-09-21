// components/utils/CKEditor.tsx
import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import uploadApi from "../../api/uploadApi";

interface MyEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
}

function CustomUploadAdapter(loader: any) {
  return {
    upload: async () => {
      const file = await loader.file;
      const res = await uploadApi.upload([file]);
      return { default: res.urls[0] };
    },
  };
}

function CustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) =>
    CustomUploadAdapter(loader);
}

const MyEditor: React.FC<MyEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="ckeditor-wrapper">
      <CKEditor
        editor={ClassicEditor as any}
        data={value || ""}
        config={{
          placeholder: placeholder || "Nhập nội dung ở đây...",
          extraPlugins: [CustomUploadAdapterPlugin], 
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "imageUpload", 
            "|",
            "undo",
            "redo",
          ],
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default MyEditor;
