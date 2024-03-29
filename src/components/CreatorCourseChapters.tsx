"use client";

import { trpc } from "@/server/client";
import React, { useEffect } from "react";
import {
  DragDropContext,
  DragStart,
  DragUpdate,
  DropResult,
  Droppable,
  ResponderProvided,
} from "@hello-pangea/dnd";
import { Chapter, ChaptersState, SubChapter } from "@prisma/client";
import { ChaptersFullState } from "@/types/chapter";
import CreatorCourseChaptersDndListChapter from "./CreatorCourseChaptersDndListChapter";
import CreateChapterButton from "./CreateChapterButton";
import {
  MoveSubChapterRequest,
  UpdateSubChapterIdsOrderRequest,
  UpdateSubChapterRequest,
} from "@/lib/validators/chapter";

type Props = {
  courseId: string;
};

export enum ChapterActionTypes {
  MOVE_CHAPTER = "MOVE_CHAPTER",
  MOVE_SUB_CHAPTER = "MOVE_SUB_CHAPTER",
}

export default function CreatorCourseChapters({ courseId }: Props) {
  const {
    data: chaptersInitialState,
    isLoading: chaptersLoading,
    error: chaptersError,
  } = trpc.chapter.getChaptersState.useQuery({ courseId });

  const [chaptersState, setChaptersState] = React.useState<
    ChaptersFullState | undefined
  >(undefined);

  useEffect(() => {
    console.log(chaptersInitialState);
    if (chaptersInitialState) {
      setChaptersState(chaptersInitialState);
    }
  }, [chaptersInitialState]);

  const { mutate: updateChapterIdsOrder } =
    trpc.chapter.updateChapterIdsOrder.useMutation({
      onSuccess: (res) => {
        console.log(res);
      },
    });

  const { mutate: updateSubChapterIdsOrder } =
    trpc.chapter.updateSubChapterIdsOrder.useMutation({
      onSuccess: (res) => {
        console.log(res);
      },
    });

  const { mutate: moveSubChapter } = trpc.chapter.moveSubChapter.useMutation({
    onSuccess: (res) => {
      console.log(res);
    },
  });

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const { destination, source, draggableId, type } = result;

    if (!chaptersState) {
      return;
    }

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === ChapterActionTypes.MOVE_CHAPTER) {
      const newChapterIdsOrder = Array.from(chaptersState.ChapterIdsOrder);
      newChapterIdsOrder.splice(source.index, 1);
      newChapterIdsOrder.splice(destination.index, 0, draggableId);

      const newChaptersState: ChaptersFullState = {
        ...chaptersState,
        ChapterIdsOrder: newChapterIdsOrder,
      };

      setChaptersState(newChaptersState);
      updateChapterIdsOrder({
        chaptersStateId: chaptersState.id,
        chaptersIdsOrder: newChapterIdsOrder,
      });
      return;
    } else if (type === ChapterActionTypes.MOVE_SUB_CHAPTER) {
      const startChapter = chaptersState.Chapters.find(
        (chapter) => chapter.id === source.droppableId
      );

      const finishChapter = chaptersState.Chapters.find(
        (chapter) => chapter.id === destination.droppableId
      );

      if (!startChapter || !finishChapter) {
        return;
      }

      const newSubChapterIdsOrder = Array.from(startChapter.SubChapterIdsOrder);
      newSubChapterIdsOrder.splice(source.index, 1);

      if (startChapter === finishChapter) {
        newSubChapterIdsOrder.splice(destination.index, 0, draggableId);

        const newChapter: Chapter = {
          ...startChapter,
          SubChapterIdsOrder: newSubChapterIdsOrder,
        };

        const newChapters = chaptersState.Chapters.map((chapter) => {
          if (chapter.id === startChapter.id) {
            return newChapter;
          }

          return chapter;
        });

        const newState: ChaptersFullState = {
          ...chaptersState,
          Chapters: newChapters,
        };

        console.log(newState);

        setChaptersState(newState);
        const updateData: UpdateSubChapterIdsOrderRequest = {
          chapterId: startChapter.id,
          subChaptersIdsOrder: newSubChapterIdsOrder,
        };
        updateSubChapterIdsOrder(updateData);
      } else {
        const newStartChapter: Chapter = {
          ...startChapter,
          SubChapterIdsOrder: newSubChapterIdsOrder,
        };

        const finishSubChapterIds = Array.from(
          finishChapter.SubChapterIdsOrder
        );
        finishSubChapterIds.splice(destination.index, 0, draggableId);

        const newFinishChapter: Chapter = {
          ...finishChapter,
          SubChapterIdsOrder: finishSubChapterIds,
        };

        const newChapters = chaptersState.Chapters.map((chapter) => {
          if (chapter.id === startChapter.id) {
            return newStartChapter;
          } else if (chapter.id === finishChapter.id) {
            return newFinishChapter;
          }

          return chapter;
        });

        const newState: ChaptersFullState = {
          ...chaptersState,
          Chapters: newChapters,
        };

        setChaptersState(newState);
        const moveData: MoveSubChapterRequest = {
          moveSubChapterId: draggableId,
          removeChapterId: startChapter.id,
          addChapterId: finishChapter.id,
          addChapterIdsOrder: finishSubChapterIds,
        };
        moveSubChapter(moveData);
      }
    }
  };

  if (chaptersLoading) {
    return <div>Loading...</div>;
  }

  if (chaptersError) {
    return <div>{chaptersError.message}</div>;
  }

  const pushChapterToChaptersState = (chapter: Chapter) => {
    if (!chaptersState) {
      console.error("No chapters state");
      return;
    }

    const newChaptersState: ChaptersFullState = {
      ...chaptersState,
      ChapterIdsOrder: [...chaptersState.ChapterIdsOrder, chapter.id],
      Chapters: [...chaptersState.Chapters, chapter],
    };

    console.log(newChaptersState);
    setChaptersState(newChaptersState);
  };

  const deleteChapterFromChaptersState = (chapterId: string) => {
    if (!chaptersState) {
      console.error("No chapters state");
      return;
    }

    const newChaptersState: ChaptersFullState = {
      ...chaptersState,
      ChapterIdsOrder: chaptersState.ChapterIdsOrder.filter(
        (id) => id !== chapterId
      ),
      Chapters: chaptersState.Chapters.filter(
        (chapter) => chapter.id !== chapterId
      ),
    };

    console.log(newChaptersState);

    setChaptersState(newChaptersState);
  };

  const pushSubChapterToChaptersState = (
    subChapter: SubChapter,
    chapterId: string
  ) => {
    if (!chaptersState) {
      console.error("No chapters state");
      return;
    }

    const newChaptersState: ChaptersFullState = {
      ...chaptersState,
      SubChapters: [...chaptersState.SubChapters, subChapter],
      Chapters: chaptersState.Chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            SubChapterIdsOrder: [...chapter.SubChapterIdsOrder, subChapter.id],
          };
        }

        return chapter;
      }),
    };

    setChaptersState(newChaptersState);
  };

  const deleteSubChapterFromChaptersState = (subChapterId: string) => {
    if (!chaptersState) {
      console.error("No chapters state");
      return;
    }

    const newChaptersState: ChaptersFullState = {
      ...chaptersState,
      SubChapters: chaptersState.SubChapters.filter(
        (subChapter) => subChapter.id !== subChapterId
      ),
      Chapters: chaptersState.Chapters.map((chapter) => {
        return {
          ...chapter,
          SubChapterIdsOrder: chapter.SubChapterIdsOrder.filter(
            (id) => id !== subChapterId
          ),
        };
      }),
    };

    setChaptersState(newChaptersState);
  };

  const editChapterName = (chapterId: string, chapterName: string) => {
    if (!chaptersState) {
      console.error("No chapters state");
      return;
    }

    const newChaptersState: ChaptersFullState = {
      ...chaptersState,
      Chapters: chaptersState.Chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            name: chapterName,
          };
        }

        return chapter;
      }),
    };

    setChaptersState(newChaptersState);
  };

  return (
    <>
      {chaptersState && (
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="all-chapters"
              type={ChapterActionTypes.MOVE_CHAPTER}
            >
              {(providedDroppableChapter) => (
                <div
                  className="flex flex-col w-full"
                  ref={providedDroppableChapter.innerRef}
                  {...providedDroppableChapter.droppableProps}
                >
                  {chaptersState.ChapterIdsOrder.map(
                    (chapterId, chapterIndex) => {
                      const chapter = chaptersState.Chapters.find(
                        (chapter) => chapter.id === chapterId
                      );
                      if (!chapter) {
                        return null;
                      }

                      const subChapters = chapter.SubChapterIdsOrder.map(
                        (subChapterId) =>
                          chaptersState.SubChapters.find(
                            (subChapter) => subChapter.id === subChapterId
                          )
                      ).filter(Boolean) as Chapter[];

                      return (
                        <CreatorCourseChaptersDndListChapter
                          key={chapter.id}
                          courseId={courseId}
                          chapter={chapter}
                          chapterIndex={chapterIndex}
                          subChapters={subChapters}
                          chaptersStateId={chaptersState.id}
                          pushSubChapterToChaptersState={
                            pushSubChapterToChaptersState
                          }
                          deleteChapterFromChaptersState={
                            deleteChapterFromChaptersState
                          }
                          deleteSubChapterFromChaptersState={
                            deleteSubChapterFromChaptersState
                          }
                          editChapterName={editChapterName}
                        />
                      );
                    }
                  )}
                  {providedDroppableChapter.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <CreateChapterButton
            chaptersStateId={chaptersState.id}
            pushChapterToChaptersState={pushChapterToChaptersState}
          />
        </>
      )}
    </>
  );
}
