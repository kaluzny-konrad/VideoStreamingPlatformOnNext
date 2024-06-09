"use client";

import { toast } from "sonner";
import { SubChapter } from "@prisma/client";
import { PlusIcon } from "lucide-react";

import { trpc } from "@/server/client";
import { CreateSubChapterRequest } from "@/lib/validators/chapter";

import { Button } from "@/components/ui/button";

type Props = {
  courseId: string;
  chapterId: string;
  pushSubChapterToChaptersState: (
    SubChapter: SubChapter,
    chapterId: string
  ) => void;
};

export default function CreateSubChapterButton({
  courseId,
  chapterId,
  pushSubChapterToChaptersState,
}: Props) {
  const { mutate: createSubChapter } =
    trpc.chapter.createSubChapter.useMutation({
      onSuccess: (res) => {
        toast.success("SubChapter added to course");
        pushSubChapterToChaptersState(res, chapterId);
      },
    });

  async function handleCreateSubChapter() {
    const data: CreateSubChapterRequest = {
      courseId: courseId,
      name: "New Sub Chapter",
      chapterId: chapterId,
    };
    createSubChapter(data);
  }

  return (
    <Button
      onClick={handleCreateSubChapter}
      size={"icon"}
      className="h-6 w-6"
      data-test="create-sub-chapter-button"
    >
      <PlusIcon className="w-4 h-4" />
    </Button>
  );
}
