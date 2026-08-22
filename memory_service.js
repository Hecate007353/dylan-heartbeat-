const memoryAdapter = require("./memory_adapter");

async function addMemory(memory){
  return memoryAdapter.createMemory(memory);
}

async function updateMemory(memory){
  return memoryAdapter.updateMemory(memory);
}

async function deleteMemory(memory){
  return memoryAdapter.deleteMemory(memory);
}

async function getMemories(limit){
  return memoryAdapter.getMemories(limit);
}

async function analyzeMemory(messages){
  return memoryAdapter.analyzeConversation(messages);
}

async function searchMemoryByContent(messages){
  return memoryAdapter.searchMemory(messages);
}

module.exports = {
  addMemory,
  updateMemory,
  deleteMemory,
  getMemories,
  analyzeMemory,
  searchMemoryByContent
};
