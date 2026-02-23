import { Delete, Get, Post } from "./axiosService";

/**
 * Get all questions (Public)
 * @returns {Promise<Array>} List of questions
 */
export const fetchAllQuestions = async () => {
  const response = await Get("/questions");
  return response.data?.data ?? [];
};

/**
 * Add questions (Admin)
 * @param {Array<{ question: string, type: "Checkbox" | "Radio" | "Input" | "Textarea" | "Dropdown" }>} questions
 * @returns {Promise<Object>} API response
 */
export const addQuestions = async (questions) => {
  const response = await Post("/questions", questions);
  return response.data;
};

/**
 * Delete one question by MongoDB _id (Admin)
 * @param {string} id - MongoDB _id of the question
 * @returns {Promise<Object>} API response
 */
export const deleteQuestionById = async (id) => {
  const response = await Delete(`/questions/${id}`);
  return response.data;
};

/**
 * Get all submitted details (Admin)
 * GET /api/questions/submissions
 * @returns {Promise<Array>} List of submissions { _id, userId, answers, amount, paymentStatus, razorpayOrderId, razorpayPaymentId, createdAt, updatedAt }
 */
export const fetchAllSubmissions = async () => {
  const response = await Get("/questions/submissions");
  return response.data?.data ?? [];
};
