/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, X, Rocket, Image } from "lucide-react";
import api from "@/lib/api";

interface CourseForm {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  learningOutcomes: { value: string }[];
  requirements: { value: string }[];
}

const CATEGORIES = [
  "programming",
  "design",
  "business",
  "marketing",
  "data-science",
  "ai-ml",
  "mobile-dev",
  "devops",
  "cybersecurity",
  "other",
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseForm>({
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      category: "programming",
      level: "beginner",

      learningOutcomes: [{ value: "" }],
      requirements: [{ value: "" }],
    },
  });

  const outcomesArray = useFieldArray({ control, name: "learningOutcomes" });
  const requirementsArray = useFieldArray({ control, name: "requirements" });

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setThumbPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    setUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("thumbnail", file);
      const res = await api.post("/courses/upload-thumbnail", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThumbnail(res.data.url);
      toast.success("Thumbnail uploaded!");
    } catch {
      // If Cloudinary not set up, use a placeholder
      setThumbnail(`https://picsum.photos/seed/${Date.now()}/1280/720`);
      toast.success(
        "Thumbnail set (using placeholder — set up Cloudinary for real uploads)",
      );
    } finally {
      setUploadingThumb(false);
    }
  };

  const onSubmit = async (data: CourseForm) => {
    setSubmitting(true);
    try {
      const payload = {
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category,
        level: data.level,

        thumbnail:
          thumbnail ||
          `https://picsum.photos/seed/${data.title.slice(0, 5)}/1280/720`,
        learningOutcomes: data.learningOutcomes
          .map((o) => o.value)
          .filter(Boolean),
        requirements: data.requirements.map((r) => r.value).filter(Boolean),
        sections: [],
      };
      const res = await api.post("/courses", payload);
      toast.success("Course created! Now add lessons.");
      router.push(`/dashboard/instructor/courses/${res.data.data._id}/edit`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white/5 border border-indigo-400/20 rounded-lg text-white placeholder-indigo-300/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 text-sm";
  const labelClass = "block text-sm font-medium text-indigo-100/80 mb-1.5";

  return (
    <div className="min-h-screen bg-[#05060f] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 text-teal-400 text-sm font-medium mb-2">
          <Rocket size={14} /> New course
        </div>
        <h1 className="text-2xl font-semibold text-white mb-1">
          Launch a new course
        </h1>
        <p className="text-indigo-200/50 mb-8">
          Fill in the details below to get started
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Thumbnail Upload */}
          <div className="bg-[#0f1120]/80 backdrop-blur-xl border border-indigo-500/15 rounded-2xl p-6">
            <label className={labelClass}>Course Thumbnail</label>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              onClick={() => fileRef.current?.click()}
              className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-indigo-400/20 hover:border-teal-400/40 transition cursor-pointer bg-white/2 flex items-center justify-center"
            >
              {thumbPreview ? (
                <>
                  <img
                    src={thumbPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <p className="text-white text-sm font-medium">
                      Click to change
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Image
                    size={32}
                    className="text-indigo-400/30 mx-auto mb-3"
                  />
                  <p className="text-indigo-200/50 text-sm font-medium">
                    Click to upload thumbnail
                  </p>
                  <p className="text-indigo-300/30 text-xs mt-1">
                    JPG, PNG — 1280×720 recommended
                  </p>
                  {uploadingThumb && (
                    <p className="text-teal-400 text-xs mt-2">Uploading...</p>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
            <p className="text-xs text-indigo-300/40 mt-2">
              💡 If you don't upload one, a placeholder will be used
              automatically
            </p>
          </div>

          {/* Basic info */}
          <div className="bg-[#0f1120]/80 backdrop-blur-xl border border-indigo-500/15 rounded-2xl p-6 space-y-5">
            <div>
              <label htmlFor="field-createpagetsx-1" className={labelClass}>
                Course title
              </label>
              <input
                id="field-createpagetsx-1"
                {...register("title", {
                  required: "Title is required",
                  minLength: { value: 5, message: "Min 5 characters" },
                })}
                placeholder="Complete React Developer Course"
                className={inputClass}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1.5">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="field-createpagetsx-2" className={labelClass}>
                Short description
              </label>
              <input
                id="field-createpagetsx-2"
                {...register("shortDescription", {
                  required: "Required",
                  maxLength: 300,
                })}
                placeholder="One-line summary shown on course cards"
                className={inputClass}
              />
              {errors.shortDescription && (
                <p className="text-red-400 text-sm mt-1.5">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="field-createpagetsx-3" className={labelClass}>
                Full description
              </label>
              <textarea
                id="field-createpagetsx-3"
                {...register("description", {
                  required: "Required",
                  minLength: { value: 20, message: "Min 20 characters" },
                })}
                rows={5}
                placeholder="Describe what students will learn in detail..."
                className={inputClass}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1.5">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="field-createpagetsx-4" className={labelClass}>
                  Category
                </label>
                <select
                  id="field-createpagetsx-4"
                  {...register("category")}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0f1120]">
                      {c.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="field-createpagetsx-5" className={labelClass}>
                  Level
                </label>
                <select
                  id="field-createpagetsx-5"
                  {...register("level")}
                  className={inputClass}
                >
                  <option value="beginner" className="bg-[#0f1120]">
                    Beginner
                  </option>
                  <option value="intermediate" className="bg-[#0f1120]">
                    Intermediate
                  </option>
                  <option value="advanced" className="bg-[#0f1120]">
                    Advanced
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="bg-[#0f1120]/80 backdrop-blur-xl border border-indigo-500/15 rounded-2xl p-6">
            <label className="block text-sm font-medium text-indigo-100/80 mb-3">
              What students will learn
            </label>
            <div className="space-y-2">
              {outcomesArray.fields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    aria-label="Build full-stack apps with React"
                    {...register(`learningOutcomes.${i}.value`)}
                    placeholder="Build full-stack apps with React"
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => outcomesArray.remove(i)}
                    className="text-indigo-300/40 hover:text-pink-400 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => outcomesArray.append({ value: "" })}
              className="mt-3 flex items-center gap-1.5 text-teal-400 text-sm font-medium hover:text-teal-300 transition"
            >
              <Plus size={14} /> Add outcome
            </button>
          </div>

          {/* Requirements */}
          <div className="bg-[#0f1120]/80 backdrop-blur-xl border border-indigo-500/15 rounded-2xl p-6">
            <label className="block text-sm font-medium text-indigo-100/80 mb-3">
              Requirements
            </label>
            <div className="space-y-2">
              {requirementsArray.fields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    aria-label="Basic JavaScript knowledge"
                    {...register(`requirements.${i}.value`)}
                    placeholder="Basic JavaScript knowledge"
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => requirementsArray.remove(i)}
                    className="text-indigo-300/40 hover:text-pink-400 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => requirementsArray.append({ value: "" })}
              className="mt-3 flex items-center gap-1.5 text-teal-400 text-sm font-medium hover:text-teal-300 transition"
            >
              <Plus size={14} /> Add requirement
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingThumb}
            className="w-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
          >
            {submitting ? "Launching..." : "Create course (draft)"}
          </button>
        </form>
      </div>
    </div>
  );
}
