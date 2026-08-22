function legacyToBrainMemory(memory){
  const legacyMemory = memory || {};

  return {
    content: legacyMemory.content,
    metadata: {
      category: legacyMemory.category,
      keywords: legacyMemory.keywords,
      extraction_terms: legacyMemory.extraction_terms,
      importance: legacyMemory.importance
    },
    source: {
      type: "legacy"
    },
    lifecycle: {
      status: "active"
    }
  };
}

function brainToLegacyMemory(memory){
  const brainMemory = memory || {};
  const metadata = brainMemory.metadata || {};

  return {
    content: brainMemory.content,
    keywords: metadata.keywords,
    extraction_terms: metadata.extraction_terms,
    category: metadata.category,
    importance: metadata.importance
  };
}

function normalizeMemory(memory){
  if(
    memory &&
    typeof memory === "object" &&
    memory.metadata &&
    (
      memory.source ||
      memory.lifecycle
    )
  ){
    return brainToLegacyMemory(memory);
  }

  return memory;
}

module.exports = {
  legacyToBrainMemory,
  brainToLegacyMemory,
  normalizeMemory
};
