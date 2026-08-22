const legacyMemory = require("./memory_legacy");
const {
  legacyToBrainMemory,
  brainToLegacyMemory,
  normalizeMemory
} = require("./memory_schema_adapter");

async function createMemory(memory){
  return legacyMemory.addMemory(normalizeMemory(memory));
}

async function updateMemory(memory){
  return legacyMemory.updateMemory(normalizeMemory(memory));
}

async function deleteMemory(memory){
  return legacyMemory.deleteMemory(memory);
}

async function getMemories(limit){
  const memories = await legacyMemory.getMemories(limit);

  // Prepare legacy rows for the future Memory Brain contract without changing
  // the legacy return shape consumed by current callers.
  memories
    .map(legacyToBrainMemory)
    .map(brainToLegacyMemory);

  return memories;
}

async function searchMemory(messages){
  return legacyMemory.searchMemoryByContent(messages);
}

async function analyzeConversation(messages){
  return legacyMemory.analyzeMemory(messages);
}

async function createMemoryFragment(memory){
  return createMemory(memory);
}

async function retrieveRelevantMemory(messages){
  return searchMemory(messages);
}

async function updateMemoryFragment(memory){
  return updateMemory(memory);
}

async function deleteMemoryFragment(memory){
  return deleteMemory(memory);
}

async function consolidateMemory(){
  return {
    success: false,
    reason: "not implemented"
  };
}

async function getUserProfile(){
  return {
    profile: null,
    reason: "not implemented"
  };
}

async function evaluateMemoryLifecycle(){
  return {
    success: false,
    reason: "not implemented"
  };
}

async function runBackgroundMemoryJob(){
  return {
    success: false,
    reason: "not implemented"
  };
}

module.exports = {
  createMemory,
  updateMemory,
  deleteMemory,
  getMemories,
  searchMemory,
  analyzeConversation,
  createMemoryFragment,
  retrieveRelevantMemory,
  updateMemoryFragment,
  deleteMemoryFragment,
  consolidateMemory,
  getUserProfile,
  evaluateMemoryLifecycle,
  runBackgroundMemoryJob
};
