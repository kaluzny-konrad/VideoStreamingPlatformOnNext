"use client";

import { CreateReviewRequest } from "@/lib/validators/review";
import { trpc } from "@/server/client";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { buttonVariants } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Review } from "@prisma/client";
import { EditIcon, PenIcon, PlusIcon } from "lucide-react";

type Props = {
  courseId: string;
  setUserReview: (review: Review | null) => void;
  optimisticUpdateLoading: boolean;
  setOptimisticUpdateLoading: (loading: boolean) => void;
};

export default function ReviewAddButton({
  courseId,
  setUserReview,
  optimisticUpdateLoading,
  setOptimisticUpdateLoading,
}: Props) {
  const reviewForm = useForm<CreateReviewRequest>({
    defaultValues: {
      courseId,
      rating: "5",
      title: "",
      comment: "",
    },
  });

  useEffect(() => {
    if (Object.keys(reviewForm.formState.errors).length) {
      const errors = reviewForm.formState.errors;
      for (const [key, value] of Object.entries(errors)) {
        toast.error(`Something went wrong: ${value.message}`);
        console.error(errors);
      }
    }
  }, [reviewForm.formState.errors]);

  async function onSubmit(newReviewFormData: CreateReviewRequest) {
    console.log("newReviewFormData", newReviewFormData);

    setOptimisticUpdateLoading(true);
    const optimisticReview: Review = {
      id: "optimistic",
      title: newReviewFormData.title || null,
      comment: newReviewFormData.comment || null,
      rating: parseInt(newReviewFormData.rating, 10),
      userId: "optimistic",
      courseId: newReviewFormData.courseId,
    };
    setUserReview(optimisticReview);
    createReview(newReviewFormData);
    closeDialogButtonRef.current?.click();
  }

  const { mutate: createReview, isLoading: createReviewLoading } =
    trpc.review.createReview.useMutation({
      onSuccess: (newReviewDb: Review) => {
        toast.success("Review added successfully");
        setUserReview(newReviewDb);
      },
      onError: (error) => {
        toast.error("Something went wrong");
        console.error(error);
        setUserReview(null);
      },
      onSettled: () => {
        setOptimisticUpdateLoading(false);
      },
    });

  const closeDialogButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger
        disabled={optimisticUpdateLoading}
        className={buttonVariants({ size: "sm"})}
      >
        <PenIcon className="mr-2" /> Write a review
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit review</DialogTitle>
          <DialogDescription>
            Make changes to your review here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...reviewForm}>
          <form
            id="review-add-form"
            onSubmit={reviewForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={reviewForm.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="rating">Rating</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormDescription>Rating from 1 to 5</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={reviewForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={reviewForm.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="comment">Comment</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button type="submit" disabled={createReviewLoading}>
                {(createReviewLoading && "Saving...") || "Add review"}
              </Button>
              <DialogClose asChild ref={closeDialogButtonRef}>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
