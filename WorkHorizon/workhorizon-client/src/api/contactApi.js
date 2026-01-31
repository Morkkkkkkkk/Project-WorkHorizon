import apiClient from "./apiClient";

const contactApi = {
  createContactRequest: (data) => {
    return apiClient.post("/contact", data);
  },
  getAllContactRequests: () => {
    return apiClient.get("/contact");
  },
  updateContactRequestStatus: (id, status) => {
    return apiClient.patch(`/contact/${id}/status`, { status });
  },
};

export default contactApi;
