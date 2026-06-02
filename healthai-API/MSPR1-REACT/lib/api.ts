import type { ApiOptions, ApiResponse } from "@/types/api.type";
import { Exercise } from "@/types/exercises.type";
import { Food, FoodCategory } from "@/types/foods.type";
import { User } from "@/types/users.type";
import { getToken } from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://mspr1-api-test.up.railway.app/api";

const ETL_URL =
  process.env.NEXT_PUBLIC_ETL_URL ?? "http://localhost:5005";

export const runEtl = async (
  file: File,
  dataset: string,
): Promise<unknown> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("dataset", dataset);

  const res = await fetch(`${ETL_URL}/upload/${dataset}`, {
    method: "POST",
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_ETL_API_KEY ?? "",
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Erreur ETL");
  }

  return res.json();
};

export const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error("Erreur API");
  }

  return res.json();
};

export const mutateExercice = async (
  method: string,
  data: Omit<Exercise, "id" | "created_at">,
  key?: string,
): Promise<Exercise> => {
  return apiFetch("/exercises/mutate", {
    method: "POST",
    body: JSON.stringify({
      mutate: [
        {
          operation: method,
          ...(key !== undefined && { key }),
          attributes: data,
        },
      ],
    }),
  });
};

export const fetchExercices = async (
  page: number = 1,
  search: string = "",
): Promise<ApiResponse<Exercise>> => {
  const exercices = await apiFetch("/exercises/search", {
    method: "POST",
    body: JSON.stringify({
      search: {
        page,
        ...(search && { text: { value: search } }),
      },
    }),
  });

  return exercices;
};

export const updateFood = async (
  id: string,
  data: Omit<Food, "id" | "created_at" | "food_category">,
): Promise<Food> => {
  const { category_id, ...foodData } = data;
  return apiFetch("/foods/mutate", {
    method: "POST",
    body: JSON.stringify({
      mutate: [
        {
          operation: "update",
          key: id,
          attributes: foodData,
          relations: {
            ...(category_id && {
              FoodCategory: {
                operation: "attach",
                key: category_id,
              },
            }),
          },
        },
      ],
    }),
  });
};

export const createFood = async (
  data: Omit<Food, "id" | "created_at" | "food_category">,
): Promise<Food> => {
  const { category_id, ...foodData } = data;
  return apiFetch("/foods/mutate", {
    method: "POST",
    body: JSON.stringify({
      mutate: [
        {
          operation: "create",
          attributes: foodData,
          relations: {
            ...(category_id && {
              FoodCategory: {
                operation: "attach",
                key: category_id,
              },
            }),
          },
        },
      ],
    }),
  });
};

export const fetchFoods = async (
  page: number = 1,
  search: string = "",
): Promise<ApiResponse<Food>> => {
  const foods = await apiFetch("/foods/search", {
    method: "POST",
    body: JSON.stringify({
      search: {
        page,
        ...(search && { text: { value: search } }),
        includes: [{ relation: "FoodCategory" }],
      },
    }),
  });

  return foods;
};

export const fetchFoodCategories = async (
  page: number = 1,
  search: string = "",
): Promise<ApiResponse<FoodCategory>> => {
  const foods = await apiFetch("/food-categories/search", {
    method: "POST",
    body: JSON.stringify({
      search: {
        page,
        ...(search && { text: { value: search } }),
      },
    }),
  });

  return foods;
};

export const createUser = async (
  data: Omit<User, "id" | "created_at" | "updated_at"> & { password: string },
): Promise<User> => {
  return apiFetch("/users/mutate", {
    method: "POST",
    body: JSON.stringify({
      mutate: [
        {
          operation: "create",
          attributes: data,
        },
      ],
    }),
  });
};

export const fetchUsers = async (
  page: number = 1,
  search: string = "",
): Promise<ApiResponse<User>> => {
  const users = await apiFetch("/users/search", {
    method: "POST",
    body: JSON.stringify({
      search: {
        page,
        ...(search && { text: { value: search } }),
      },
    }),
  });

  return users;
};

export const updateUser = async (
  id: string,
  data: Partial<Omit<User, "id" | "created_at" | "updated_at">>,
): Promise<User> => {
  return apiFetch("/users/mutate", {
    method: "POST",
    body: JSON.stringify({
      mutate: [
        {
          operation: "update",
          key: id,
          attributes: data,
        },
      ],
    }),
  });
};

export const deleteItem = async (
  table: string,
  ids: string[],
): Promise<ApiResponse<User>> => {
  const users = await apiFetch(`/${table}`, {
    method: "DELETE",
    body: JSON.stringify({
      resources: ids,
    }),
  });

  return users;
};
