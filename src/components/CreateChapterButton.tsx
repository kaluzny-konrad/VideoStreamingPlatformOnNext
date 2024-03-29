"use client";

import { trpc } from "@/server/client";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { CreateChapterRequest } from "@/lib/validators/chapter";
import { Chapter } from "@prisma/client";

type Props = {
  chaptersStateId: string;
  pushChapterToChaptersState: (Chapter: Chapter) => void;
};

export default function CreateChapterButton({
  chaptersStateId,
  pushChapterToChaptersState,
}: Props) {
  const { mutate: createChapter } = trpc.chapter.createChapter.useMutation({
    onSuccess: (res) => {
      toast.success("Chapter added to course");
      pushChapterToChaptersState(res);
    },
  });

  async function handleCreateChapter() {
    const data: CreateChapterRequest = {
      chaptersStateId: chaptersStateId,
      name: "New Chapter",
    };
    console.log(data);
    createChapter(data);
  }

  return <Button className="w-full mt-4" onClick={handleCreateChapter}>Add Chapter</Button>;
}
