import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminCategoryService, PaginatedCategories, QueryCategoryParams } from "@/src/services/adminCategoryService";

interface CategoryState {
  data: PaginatedCategories | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchCategoriesThunk = createAsyncThunk(
  "category/fetchCategories",
  async (params: QueryCategoryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await adminCategoryService.getCategories(params);
      return res;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch categories"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;
