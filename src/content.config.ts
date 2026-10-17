/**
 * Astro Content Collections v6 — Schema definiții pentru workouts și nutrition
 * Validare Zod la build-time, type-safe access în componente
 * Loader: glob() pentru încărcarea tuturor fișierelor JSON din directoare
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const workouts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/workouts' }),
  schema: z.object({
    /** ID unic sesiune (ex: "box-fundamentals-w1-d1") */
    id: z.string(),
    /** Titlu afișat utilizatorului */
    title: z.string(),
    /** Descriere scurtă (max 200 chars) */
    description: z.string().max(200),
    /** Nivel dificultate: 1=începător, 2=intermediar, 3=avansat, 4=elite */
    level: z.number().min(1).max(4),
    /** Durată totală estimată în secunde */
    durationSeconds: z.number().positive(),
    /** Tag-uri pentru filtrare (ex: ["boxing", "cardio", "technique"]) */
    tags: z.array(z.string()).default([]),
    /** Echipament necesar (gol = bodyweight only) */
    equipment: z.array(z.string()).default([]),
    /** Accidentări contraindicate — exercițiile cu aceste tag-uri sunt excluse automat */
    contraindicatedInjuries: z.array(z.string()).default([]),
    /** Fazele antrenamentului în ordine */
    phases: z.array(z.object({
      /** Tip fază */
      type: z.enum(['warmup', 'work', 'rest', 'cooldown', 'stretch', 'breath']),
      /** Nume afișat (ex: "Runda 1 · Jab-Cross") */
      label: z.string(),
      /** Durată fază în secunde */
      durationSeconds: z.number().positive(),
      /** Instrucțiuni text (afișate pe ecran) */
      instructions: z.string().optional(),
      /** Chunk audio asociat (path relativ la /vox/) */
      audioChunk: z.string().optional(),
      /** Exerciții din această fază (pentru tracking detaliat) */
      exercises: z.array(z.object({
        name: z.string(),
        reps: z.string().optional(),
        sets: z.number().optional(),
        restBetweenSetsSeconds: z.number().optional(),
        notes: z.string().optional(),
      })).default([]),
    })).min(1),
    /** Metadata periodizare */
    periodization: z.object({
      /** Săptămâna în ciclu (1-4, unde 4 = deload) */
      cycleWeek: z.number().min(1).max(4),
      /** Ziua în săptămână (1=Luni, 7=Duminică) */
      dayOfWeek: z.number().min(1).max(7),
      /** Intensitate procentuală (50-100, deload = 40-60) */
      intensityPct: z.number().min(30).max(100),
    }),
  }),
});

const nutrition = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/nutrition' }),
  schema: z.object({
    /** ID unic plan nutrițional */
    id: z.string(),
    /** Nume plan (ex: "Masă pre-antrenament box") */
    title: z.string(),
    /** Tip masă */
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout', 'recovery']),
    /** Calorii totale */
    calories: z.number().positive(),
    /** Macronutrienți în grame */
    macros: z.object({
      protein: z.number().nonnegative(),
      carbs: z.number().nonnegative(),
      fat: z.number().nonnegative(),
    }),
    /** Ingrediente cu cantități */
    ingredients: z.array(z.object({
      name: z.string(),
      amount: z.string(),
      unit: z.string().optional(),
    })).min(1),
    /** Instrucțiuni preparare */
    preparationSteps: z.array(z.string()).default([]),
    /** Timp preparare în minute */
    prepTimeMinutes: z.number().nonnegative().optional(),
    /** Tag-uri dietetice */
    dietaryTags: z.array(z.enum(['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein'])).default([]),
    /** Suplimente recomandate DOAR Tier 1 sau Tier 2 (validat la build) */
    supplements: z.array(z.object({
      name: z.string(),
      dose: z.string(),
      timing: z.string(),
      tier: z.enum(['tier1', 'tier2']),
    })).default([]),
  }),
});

export const collections = { workouts, nutrition };