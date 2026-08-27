import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminUserService, AdminDepartment } from "@/src/services/adminUserService";

interface DepartmentState {
  departments: AdminDepartment[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};

export const fetchDepartmentsThunk = createAsyncThunk(
  "department/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const departments = await adminUserService.getDepartments();
      return departments || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch departments");
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default departmentSlice.reducer;
