import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export interface ProductReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

type ReviewRow = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
};

const fromRow = (row: ReviewRow): ProductReview => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  rating: row.rating,
  reviewText: row.review_text,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const reviewsService = {
  async list(productId: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured()) throw new Error("Supabase is required to load product reviews.");
    const { data, error } = await getSupabase()
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as ReviewRow[]).map(fromRow);
  },

  async save(productId: string, rating: number, reviewText: string): Promise<ProductReview> {
    if (!isSupabaseConfigured()) throw new Error("Supabase is required to save product reviews.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Choose a rating from 1 to 5.");
    }
    if (reviewText.trim().length > 2000) {
      throw new Error("Reviews must be 2,000 characters or fewer.");
    }
    const supabase = getSupabase();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw new Error("You need to be logged in to write a review.");
    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        {
          user_id: authData.user.id,
          product_id: productId,
          rating,
          review_text: reviewText.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,product_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return fromRow(data as ReviewRow);
  },

  async remove(reviewId: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error("Supabase is required to delete product reviews.");
    const { error } = await getSupabase().from("reviews").delete().eq("id", reviewId);
    if (error) throw new Error(error.message);
  },
};
