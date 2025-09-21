import api from "./axios";


const uploadApi = {
  upload: async (files) => {
    const formData = new FormData();

    files.forEach((file) => {
  formData.append("image_url", file); 
});


    try {
      const response = await api.post("/v1/file/image/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "*/*",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        config: error.config,
        code: error.code,
        status: error.response ? error.response.status : null,
      });
      throw error;
    }
  },
};


export default uploadApi;
