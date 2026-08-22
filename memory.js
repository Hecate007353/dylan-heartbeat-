const memoryService = require("./memory_service");

module.exports = {
  addMemory: memoryService.addMemory,
  updateMemory: memoryService.updateMemory,
  deleteMemory: memoryService.deleteMemory,
  getMemories: memoryService.getMemories,
  analyzeMemory: memoryService.analyzeMemory,
  searchMemoryByContent: memoryService.searchMemoryByContent
};
