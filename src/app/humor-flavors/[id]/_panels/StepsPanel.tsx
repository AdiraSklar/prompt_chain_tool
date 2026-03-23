import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlavorHeaderCard } from "@/components/FlavorHeaderCard";
import { StepCardEditable } from "@/components/StepCardEditable";
import { AddStepForm } from "@/components/AddStepForm";
import type { StepRow } from "@/components/StepCardEditable";
import type {
  ModelLookup,
  StepTypeLookup,
  InputTypeLookup,
  OutputTypeLookup,
} from "@/components/AddStepForm";

type Flavor = {
  id: number;
  slug: string;
  description: string | null;
  modified_datetime_utc: string;
};

type Props = { flavor: Flavor };

export async function StepsPanel({ flavor }: Props) {
  const supabase = await createSupabaseServerClient();

  const [stepTypesResult, modelsResult, inputTypesResult, outputTypesResult, stepsResult] =
    await Promise.all([
      supabase.from("humor_flavor_step_types").select("id, slug, description").order("slug"),
      supabase.from("llm_models").select("id, name, provider_model_id, llm_providers ( name )").order("name"),
      supabase.from("llm_input_types").select("id, slug, description").order("slug"),
      supabase.from("llm_output_types").select("id, slug, description").order("slug"),
      supabase
        .from("humor_flavor_steps")
        .select(`
          id, order_by, description, llm_temperature,
          llm_system_prompt, llm_user_prompt,
          humor_flavor_step_type_id, llm_model_id,
          llm_input_type_id, llm_output_type_id,
          humor_flavor_step_types ( slug, description ),
          llm_models ( name, provider_model_id, llm_providers ( name ) ),
          llm_input_types ( slug, description ),
          llm_output_types ( slug, description )
        `)
        .eq("humor_flavor_id", flavor.id)
        .order("order_by", { ascending: true })
        .order("id", { ascending: true }),
    ]);

  const steps = (stepsResult.data ?? []) as StepRow[];
  const stepTypes: StepTypeLookup[] = (stepTypesResult.data ?? []) as StepTypeLookup[];
  const models: ModelLookup[] = (modelsResult.data ?? []).map((m: {
    id: number;
    name: string;
    provider_model_id: string;
    llm_providers: { name: string } | null;
  }) => ({
    id: m.id,
    name: m.name,
    provider_model_id: m.provider_model_id,
    providerName: m.llm_providers?.name ?? null,
  }));
  const inputTypes: InputTypeLookup[] = (inputTypesResult.data ?? []) as InputTypeLookup[];
  const outputTypes: OutputTypeLookup[] = (outputTypesResult.data ?? []) as OutputTypeLookup[];

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto w-full">
      <FlavorHeaderCard flavor={flavor} />

      {/* Pipeline steps section header */}
      <div className="flex items-center gap-3 mt-10 mb-5">
        <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          Pipeline Steps
        </span>
        <span className="rounded-full bg-violet-500/15 text-violet-400 text-xs font-semibold px-2.5 py-0.5 border border-violet-500/20">
          {steps.length}
        </span>
      </div>

      {stepsResult.error && (
        <p className="text-red-400 text-sm mb-4">
          Failed to load steps: {stepsResult.error.message}
        </p>
      )}

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <StepCardEditable
            key={step.id}
            step={step}
            flavorId={flavor.id}
            isFirst={idx === 0}
            isLast={idx === steps.length - 1}
            stepTypes={stepTypes}
            models={models}
            inputTypes={inputTypes}
            outputTypes={outputTypes}
          />
        ))}

        <AddStepForm
          flavorId={flavor.id}
          stepTypes={stepTypes}
          models={models}
          inputTypes={inputTypes}
          outputTypes={outputTypes}
        />
      </div>
    </div>
  );
}
