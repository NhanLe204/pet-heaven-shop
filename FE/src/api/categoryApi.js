import api from "./axios";
const categoryApi = {
  // getCategoriesActive: async () => {
  //   const response = await api.get("/v1/categories/status/active");
  //   return {
  //     data: response.data,
  //   };
  // },
  getAll: async () => {
    const response = await api.get("/v1/categories");
    return {
      data: response.data,
    };
  },
  getParents: async () => {
    const response = await api.get("/v1/categories/parents");
    return response.data;
  },
  // getChildren: async () => {
  //   const response = await api.get(`/v1/categories/children`);
  //   return {
  //     success: response.data.success,
  //     data: response.data.result,
  //   };
  // },
  getChildren: async (parentId) => {
    const response = await api.get(`/v1/categories/children/${parentId}`);
    return response.data; // { success, result }
  },


  getById: async (id) => {
    const response = await api.get(`/v1/categories/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/v1/categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/v1/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/v1/categories/${id}/status?status=${status}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/v1/categories/${id}`);
    return response.data;
  },
};
export default categoryApi;