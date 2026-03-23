// Hand-written types derived from schema inspection.
// Run `supabase gen types typescript` to replace this with generated types if needed.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      humor_flavors: {
        Row: HumorFlavor;
        Insert: HumorFlavorInsert;
        Update: Partial<HumorFlavorInsert>;
      };
      humor_flavor_steps: {
        Row: HumorFlavorStep;
        Insert: HumorFlavorStepInsert;
        Update: Partial<HumorFlavorStepInsert>;
      };
      humor_flavor_step_types: {
        Row: HumorFlavorStepType;
        Insert: Partial<HumorFlavorStepType>;
        Update: Partial<HumorFlavorStepType>;
      };
      llm_models: {
        Row: LlmModel;
        Insert: Partial<LlmModel>;
        Update: Partial<LlmModel>;
      };
      llm_providers: {
        Row: LlmProvider;
        Insert: Partial<LlmProvider>;
        Update: Partial<LlmProvider>;
      };
      llm_input_types: {
        Row: LlmInputType;
        Insert: Partial<LlmInputType>;
        Update: Partial<LlmInputType>;
      };
      llm_output_types: {
        Row: LlmOutputType;
        Insert: Partial<LlmOutputType>;
        Update: Partial<LlmOutputType>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

// ─── Profiles ────────────────────────────────────────────────────────────────

export type Profile = {
  id: string; // uuid, FK → auth.users
  created_datetime_utc: string;
  modified_datetime_utc: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_superadmin: boolean; // default: true ⚠️ — all new profiles are superadmin unless set false
  is_matrix_admin: boolean; // default: false
  is_in_study: boolean; // default: false
  created_by_user_id: string;
  modified_by_user_id: string;
};

// ─── Humor Flavors ───────────────────────────────────────────────────────────

export type HumorFlavor = {
  id: number; // bigint
  created_datetime_utc: string;
  modified_datetime_utc: string;
  slug: string; // required, unique
  description: string | null;
  created_by_user_id: string;
  modified_by_user_id: string;
};

export type HumorFlavorInsert = {
  slug: string;
  description?: string | null;
};

// ─── Humor Flavor Steps ──────────────────────────────────────────────────────

export type HumorFlavorStep = {
  id: number; // bigint
  created_datetime_utc: string;
  modified_datetime_utc: string;
  humor_flavor_id: number;
  order_by: number; // smallint — not DB-unique; ordering enforced in app code
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_temperature: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
  created_by_user_id: string;
  modified_by_user_id: string;
};

export type HumorFlavorStepInsert = {
  humor_flavor_id: number;
  order_by: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_temperature?: number | null;
  llm_system_prompt?: string | null;
  llm_user_prompt?: string | null;
  description?: string | null;
};

// ─── Lookup Tables ───────────────────────────────────────────────────────────

export type HumorFlavorStepType = {
  id: number; // smallint
  slug: string;
  description: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
};

export type LlmModel = {
  id: number; // smallint
  name: string;
  provider_model_id: string;
  llm_provider_id: number;
  is_temperature_supported: boolean;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
};

export type LlmProvider = {
  id: number; // smallint
  name: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
};

export type LlmInputType = {
  id: number; // smallint
  slug: string;
  description: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
};

export type LlmOutputType = {
  id: number; // smallint
  slug: string;
  description: string;
  created_datetime_utc: string;
  modified_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
};
