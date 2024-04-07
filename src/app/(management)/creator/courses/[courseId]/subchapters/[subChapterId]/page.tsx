import EditSubChapterForm from "@/components/EditSubChapterForm";
import SubChapterVideo from "@/components/SubChapterVideo";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  params: {
    courseId: string;
    subChapterId: string;
  };
};

export default function page({ params }: Props) {
  const { courseId, subChapterId } = params;

  return (
    <div className="p-4 bg-white rounded-xl min-h-96">
      <h2 className="mb-6 text-lg font-bold text-slate-800">Edit SubChapter</h2>

      <EditSubChapterForm courseId={courseId} subChapterId={subChapterId} />

      <Link
        href={`/creator/courses/${courseId}`}
        className={buttonVariants({ variant: "ghost" })}
      >
        Back to course
      </Link>

      <SubChapterVideo subChapterId={subChapterId} courseId={courseId} />
    </div>
  );
}
