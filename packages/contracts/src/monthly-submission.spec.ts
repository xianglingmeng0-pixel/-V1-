import { describe, expect, it } from "vitest";
import { createSubmissionCommentSchema } from "./monthly-submission";

describe("createSubmissionCommentSchema", () => {
  it("rejects an empty comment", () => {
    const result = createSubmissionCommentSchema.safeParse({
      submission_id: 9,
      content: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a concise mentor comment without a score", () => {
    const result = createSubmissionCommentSchema.safeParse({
      submission_id: 9,
      content: "本月目标完成较好，下月继续补充对照实验。",
    });

    expect(result.success).toBe(true);
  });
});
