export const chatbotKeys = {
  semesters: () => ["chatbot", "semesters"],
  subjects: (semester) => ["chatbot", "subjects", semester],
  history: (sessionId) => ["chatbot", "history", sessionId],
  indexStatus: (materialId) => ["chatbot", "index-status", materialId],
};
