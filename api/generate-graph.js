const GRAPH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["nodes", "links"],
  properties: {
    nodes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id"],
        properties: {
          id: { type: "string" },
        },
      },
    },
    links: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["source", "target"],
        properties: {
          source: { type: "string" },
          target: { type: "string" },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You are a study-notes knowledge graph extractor.
Extract key concepts and relationships from the text.
Return ONLY JSON in this format:
{
  "nodes": [{"id": "concept"}],
  "links": [{"source": "A", "target": "B"}]
}
Rules:
- Use concise concept names.
- Deduplicate near-identical concepts.
- Keep the graph useful for revision, not exhaustive.
- Prefer 8 to 18 meaningful nodes unless the notes are very short.
- Create relationships that come from the notes: causes, depends on, includes, contrasts with, enables, or explains.
- Avoid returning a simple chain unless the notes are truly sequential.
- Avoid connecting every node to one hub unless the notes clearly describe one central topic.
- Use "links", not "edges", because the frontend graph library expects links.`;

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function extractOutputText(responseData) {
  if (typeof responseData.output_text === "string") {
    return responseData.output_text;
  }

  const contentItems = Array.isArray(responseData.output)
    ? responseData.output.flatMap((item) => item.content || [])
    : [];

  const textItem = contentItems.find(
    (item) => item.type === "output_text" || item.type === "text",
  );

  return textItem?.text || "";
}

function extractGeminiText(responseData) {
  const parts = responseData.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || "").join("");
}

function normalizeGraph(graph) {
  const seenNodes = new Set();
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];

  const cleanNodes = nodes
    .map((node) => String(node?.id || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((id) => {
      const key = id.toLowerCase();
      if (seenNodes.has(key)) {
        return false;
      }
      seenNodes.add(key);
      return true;
    })
    .slice(0, 45)
    .map((id) => ({ id }));

  const validIds = new Set(cleanNodes.map((node) => node.id));
  const seenLinks = new Set();
  const links = Array.isArray(graph?.links) ? graph.links : [];

  const cleanLinks = links
    .map((link) => ({
      source: String(link?.source || "").replace(/\s+/g, " ").trim(),
      target: String(link?.target || "").replace(/\s+/g, " ").trim(),
    }))
    .filter((link) => link.source && link.target)
    .filter((link) => validIds.has(link.source) && validIds.has(link.target))
    .filter((link) => link.source !== link.target)
    .filter((link) => {
      const key = [link.source, link.target].sort().join("::").toLowerCase();
      if (seenLinks.has(key)) {
        return false;
      }
      seenLinks.add(key);
      return true;
    })
    .slice(0, 90);

  return { nodes: cleanNodes, links: cleanLinks };
}

async function generateWithOpenAI(notes) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const body = {
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: notes },
    ],
    max_output_tokens: 1800,
    text: {
      format: {
        type: "json_schema",
        name: "knowledge_graph",
        strict: true,
        schema: GRAPH_SCHEMA,
      },
    },
  };

  if (model.startsWith("gpt-5")) {
    body.reasoning = { effort: "minimal" };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error("OpenAI graph generation failed", responseData);
    throw new Error(responseData.error?.message || "OpenAI could not generate the graph.");
  }

  return normalizeGraph(JSON.parse(extractOutputText(responseData)));
}

async function generateWithGemini(notes) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const requestedModel = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const models = [...new Set([requestedModel, "gemini-2.5-flash-lite", "gemini-2.5-flash"])];
  const errors = [];

  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${SYSTEM_PROMPT}\n\nStudy notes:\n${notes}` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 1800,
            responseMimeType: "application/json",
            responseJsonSchema: GRAPH_SCHEMA,
            temperature: 0.2,
          },
        }),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`Gemini graph generation failed for ${model}`, responseData);
      errors.push(responseData.error?.message || `Gemini model ${model} failed.`);
      continue;
    }

    return normalizeGraph(JSON.parse(extractGeminiText(responseData)));
  }

  throw new Error(errors.find(Boolean) || "Gemini could not generate the graph.");
}

async function generateHostedGraph(notes) {
  const providers =
    process.env.AI_PROVIDER === "gemini"
      ? [generateWithGemini, generateWithOpenAI]
      : [generateWithOpenAI, generateWithGemini];

  const errors = [];

  for (const provider of providers) {
    try {
      const graph = await provider(notes);
      if (graph.nodes.length) {
        return graph;
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  throw new Error(errors.find(Boolean) || "No hosted AI provider is configured.");
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(request) {
  try {
    const { notes } = await request.json();
    const cleanNotes = String(notes || "").trim();

    if (!cleanNotes) {
      return jsonResponse({ error: "Notes are required." }, 400);
    }

    if (cleanNotes.length > 15000) {
      return jsonResponse({ error: "Please keep notes under 15,000 characters." }, 400);
    }

    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return jsonResponse(
        { error: "Add OPENAI_API_KEY or GEMINI_API_KEY to your environment variables." },
        500,
      );
    }

    const graph = await generateHostedGraph(cleanNotes);

    if (!graph.nodes.length) {
      return jsonResponse({ error: "No concepts were found in those notes." }, 422);
    }

    return jsonResponse({ graph });
  } catch (error) {
    console.error("Graph API error", error);
    return jsonResponse({ error: "Could not generate a clean graph JSON response." }, 500);
  }
}
