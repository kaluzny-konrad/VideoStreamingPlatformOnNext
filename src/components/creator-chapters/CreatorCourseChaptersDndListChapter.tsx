"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Chapter, SubChapter } from "@prisma/client";
import { Edit2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { trpc } from "@/server/client";

import { Button } from "@/components/ui/button";
import { ChapterActionTypes } from "@/components/creator-chapters/CreatorCourseChapters";
import CreateSubChapterButton from "@/components/creator-chapters/CreateSubChapterButton";
import CreatorCourseChaptersDndListSubChapter from "@/components/creator-chapters/CreatorCourseChaptersDndListSubChapter";
import DeleteChapterButton from "@/components/creator-chapters/DeleteChapterButton";

type Props = {
  courseId: string;
  chapter: Chapter;
  chapterIndex: number;
  subChapters: SubChapter[];
  pushSubChapterToChaptersState: (
    subChapter: SubChapter,
    chapterId: string
  ) => void;
  deleteChapterFromChaptersState: (chapterId: string) => void;
  deleteSubChapterFromChaptersState: (subChapterId: string) => void;
  editChapterName: (chapterId: string, chapterName: string) => void;
};

export default function CreatorCourseChaptersDndListChapter({
  courseId,
  chapter,
  chapterIndex,
  subChapters,
  pushSubChapterToChaptersState,
  deleteChapterFromChaptersState,
  deleteSubChapterFromChaptersState,
  editChapterName,
}: Props) {
  const { mutate: updateChapterName } = trpc.chapter.updateChapter.useMutation({
    onSuccess: (res) => {
      editChapterName(chapter.id, res.name);
    },
  });

  async function handleEditChapterName() {
    const newChapterName = prompt("Enter new chapter name", chapter.name);
    if (newChapterName) {
      updateChapterName({
        id: chapter.id,
        name: newChapterName,
      });
    }
  }

  return (
    <Draggable key={chapter.id} draggableId={chapter.id} index={chapterIndex}>
      {(providedDraggableChapter, snapshotDraggableChapter) => (
        <div
          className="pt-4 m-2 border bg-white"
          ref={providedDraggableChapter.innerRef}
          {...providedDraggableChapter.draggableProps}
        >
          <h3
            className="mb-4 ml-2 font-bold"
            {...providedDraggableChapter.dragHandleProps}
          >
            {chapter.name}
            <Button
              onClick={handleEditChapterName}
              className="ml-2"
              variant="outline"
              size="icon"
              data-test="edit-chapter-button"
            >
              <Edit2Icon size={16} />
            </Button>
          </h3>
          <Droppable
            droppableId={chapter.id}
            type={ChapterActionTypes.MOVE_SUB_CHAPTER}
          >
            {(providedDroppableSubChapter, snapshotDroppableSubChapter) => (
              <div
                ref={providedDroppableSubChapter.innerRef}
                {...providedDroppableSubChapter.droppableProps}
                className={cn(
                  "p-2 border-t bg-white flex flex-col h-full",
                  snapshotDroppableSubChapter.isDraggingOver && "bg-yellow-50"
                )}
              >
                {subChapters.map((subChapter, subChapterIndex) => (
                  <CreatorCourseChaptersDndListSubChapter
                    subChapter={subChapter}
                    subChapterIndex={subChapterIndex}
                    key={subChapter.id}
                    deleteSubChapterFromChaptersState={
                      deleteSubChapterFromChaptersState
                    }
                    courseId={courseId}
                  />
                ))}

                {providedDroppableSubChapter.placeholder}

                <div className="flex">
                  <CreateSubChapterButton
                    courseId={courseId}
                    chapterId={chapter.id}
                    pushSubChapterToChaptersState={
                      pushSubChapterToChaptersState
                    }
                  />

                  <DeleteChapterButton
                    chapterId={chapter.id}
                    deleteChapterFromChaptersState={
                      deleteChapterFromChaptersState
                    }
                    disabled={subChapters.length > 0}
                  />
                </div>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}