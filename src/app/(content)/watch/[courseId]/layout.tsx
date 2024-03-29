import CourseChapters from "@/components/CourseChapters";

type Props = {
  children: React.ReactNode;
  params: {
    courseId: string;
  };
};

export default async function CourseLayout({ children, params }: Props) {
  const { courseId } = params;

  return (
    <div className="flex flex-row">
      <div className="min-w-64 mr-4">
        <div className="p-4 bg-white rounded-xl min-h-96">
          <h2 className="mb-6 text-lg font-bold text-slate-800">
            Course Content
          </h2>
          <p className="mb-2 text-xs font-light uppercase text-slate-400">
            Chapters
          </p>
          <div className="flex flex-col gap-2">
            <CourseChapters courseId={courseId} />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="p-4 bg-white rounded-xl min-h-96">{children}</div>
      </div>
    </div>
  );
}
