const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "being",
  "between",
  "could",
  "every",
  "from",
  "have",
  "into",
  "like",
  "more",
  "most",
  "only",
  "other",
  "should",
  "such",
  "than",
  "that",
  "their",
  "there",
  "these",
  "this",
  "through",
  "using",
  "very",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
]);

function titleCase(value) {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function tokenize(sentence) {
  return sentence
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 3)
    .filter((word) => !STOP_WORDS.has(word));
}

function getCapitalizedTerms(sentence) {
  return (
    sentence.match(/\b(?:[A-Z][a-zA-Z0-9]+|[A-Z]{2,})(?:\s+(?:[A-Z][a-zA-Z0-9]+|[A-Z]{2,}))*\b/g) || []
  )
    .map((term) => term.replace(/\s+/g, " ").trim())
    .filter((term) => term.length > 3)
    .slice(0, 5);
}

function addScore(scores, concept, amount) {
  const cleanConcept = concept.replace(/\s+/g, " ").trim();
  if (!cleanConcept) {
    return;
  }
  scores.set(cleanConcept, (scores.get(cleanConcept) || 0) + amount);
}

function getSentenceConcepts(sentence, scores) {
  const words = tokenize(sentence);
  const seen = new Set();
  const concepts = [];

  const addConcept = (concept, score) => {
    const cleanConcept = concept.replace(/\s+/g, " ").trim();
    const key = cleanConcept.toLowerCase();

    if (!cleanConcept || seen.has(key)) {
      return;
    }

    seen.add(key);
    concepts.push(cleanConcept);
    addScore(scores, cleanConcept, score);
  };

  getCapitalizedTerms(sentence).forEach((term) => addConcept(term, 3));

  for (let index = 0; index < words.length - 1 && concepts.length < 8; index += 1) {
    addConcept(titleCase(`${words[index]} ${words[index + 1]}`), 2);
  }

  words.slice(0, 7).forEach((word) => addConcept(titleCase(word), 1));

  return concepts;
}

function generateLocalGraph(notes) {
  const sentences = notes
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 10);

  const scores = new Map();
  const sentenceConcepts = sentences.map((sentence) => getSentenceConcepts(sentence, scores));

  const rankedConcepts = [...scores.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, 18);

  const allowedConcepts = new Set(rankedConcepts.map(([concept]) => concept));
  const nodes = rankedConcepts.map(([id, score], index) => ({
    id,
    group: index % 5,
    value: score,
  }));

  const edgeWeights = new Map();

  sentenceConcepts.forEach((concepts) => {
    const presentConcepts = concepts
      .filter((concept) => allowedConcepts.has(concept))
      .slice(0, 5);

    for (let sourceIndex = 0; sourceIndex < presentConcepts.length; sourceIndex += 1) {
      for (let targetIndex = sourceIndex + 1; targetIndex < presentConcepts.length; targetIndex += 1) {
        const source = presentConcepts[sourceIndex];
        const target = presentConcepts[targetIndex];
        const key = [source, target].sort().join("::");
        edgeWeights.set(key, (edgeWeights.get(key) || 0) + 1);
      }
    }
  });

  const links = [...edgeWeights.entries()]
    .map(([key, strength]) => {
      const [source, target] = key.split("::");
      return { source, target, strength };
    })
    .sort((first, second) => second.strength - first.strength)
    .slice(0, 28);

  const connectedNodes = new Set(links.flatMap((link) => [link.source, link.target]));
  const hub = nodes[0]?.id;

  if (hub) {
    nodes
      .filter((node) => node.id !== hub && !connectedNodes.has(node.id))
      .slice(0, 10)
      .forEach((node) => {
        links.push({ source: hub, target: node.id, strength: 1 });
      });
  }

  return {
    nodes: nodes.length ? nodes : [{ id: "Notes" }, { id: "Concepts" }],
    links: links.length ? links : [{ source: "Notes", target: "Concepts" }],
  };
}

export async function generateKnowledgeGraph(notes) {
  try {
    const response = await fetch("/api/generate-graph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Unable to generate graph right now.");
    }

    return data.graph;
  } catch {
    return generateLocalGraph(notes);
  }
}
