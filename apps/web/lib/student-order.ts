const gradeOrder = [
  "大一",
  "大二",
  "大三",
  "大四",
  "研一",
  "研二",
  "研三",
  "博一",
  "博二",
  "博三",
  "博四",
] as const;

const collator = new Intl.Collator("zh-CN");

export function compareStudents(
  left: {
    student_name: string;
    student_grade: string;
    mentor_name: string;
  },
  right: {
    student_name: string;
    student_grade: string;
    mentor_name: string;
  },
  groupByMentor: boolean,
): number {
  if (groupByMentor) {
    const mentorOrder = collator.compare(left.mentor_name, right.mentor_name);
    if (mentorOrder !== 0) return mentorOrder;
  }

  const leftGrade = gradeOrder.indexOf(
    left.student_grade as (typeof gradeOrder)[number],
  );
  const rightGrade = gradeOrder.indexOf(
    right.student_grade as (typeof gradeOrder)[number],
  );
  const gradeDifference =
    (leftGrade === -1 ? Number.MAX_SAFE_INTEGER : leftGrade) -
    (rightGrade === -1 ? Number.MAX_SAFE_INTEGER : rightGrade);
  if (gradeDifference !== 0) return gradeDifference;
  return collator.compare(left.student_name, right.student_name);
}
