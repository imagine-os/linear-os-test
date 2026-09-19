import { describe, expect, it } from "vitest";
import { extractSections } from "../src/linear/snapshot.js";

describe("extractSections", () => {
  it("extracts level-2 heading text in document order", () => {
    const templateDataJson = JSON.stringify({
      title: "",
      descriptionData: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Model / Effort:" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Goal" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Scope" }] },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [
              { type: "text", text: "In" },
              { type: "text", text: ":" },
            ],
          },
        ],
      },
    });
    expect(extractSections(templateDataJson)).toEqual(["Goal", "Scope", "In:"]);
  });

  it("ignores level-1 and level-3 headings", () => {
    const templateDataJson = JSON.stringify({
      descriptionData: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Title" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Goal" }] },
          { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Sub" }] },
        ],
      },
    });
    expect(extractSections(templateDataJson)).toEqual(["Goal"]);
  });

  it("returns an empty array for malformed JSON instead of throwing", () => {
    expect(extractSections("not json")).toEqual([]);
  });

  it("returns an empty array when descriptionData is absent", () => {
    expect(extractSections(JSON.stringify({ title: "" }))).toEqual([]);
  });

  it("recurses into Linear's unsupported_block_node fallback wrapper", () => {
    const templateDataJson = JSON.stringify({
      descriptionData: {
        type: "doc",
        content: [
          {
            type: "unsupported_block_node",
            attrs: {
              originalNodeData: {
                type: "doc",
                content: [
                  {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Goal" }],
                  },
                  {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Scope" }],
                  },
                ],
              },
            },
          },
        ],
      },
    });
    expect(extractSections(templateDataJson)).toEqual(["Goal", "Scope"]);
  });
});
