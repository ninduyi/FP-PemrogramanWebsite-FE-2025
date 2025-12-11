import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Plus, SaveIcon, Trash2, Upload, X } from "lucide-react";
import api from "@/api/axios";
import * as FileUpload from "@/components/ui/file-upload";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Item {
  text: string;
  image: File | null;
  hint: string;
}

interface Category {
  name: string;
  items: Item[];
}

function CreateGroupSort() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { name: "", items: [{ text: "", image: null, hint: "" }] },
    { name: "", items: [{ text: "", image: null, hint: "" }] },
  ]);
  const [timeLimit, setTimeLimit] = useState<number | "">(""); // Empty by default
  const [scorePerItem, setScorePerItem] = useState<number | "">(""); // Empty by default
  const [isCategoryRandomized, setIsCategoryRandomized] =
    useState<boolean>(false);
  const [isItemRandomized, setIsItemRandomized] = useState<boolean>(false);
  const [isPublishImmediately, setIsPublishImmediately] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Custom dropzone component for cyberpunk theme
  const CyberpunkDropzone = ({
    onChange,
    value,
  }: {
    onChange: (file: File | null) => void;
    value?: File | null;
  }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (files: File[]) => {
      const file = files[0] || null;
      onChange(file);
      if (file) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    };

    const handleDelete = () => {
      onChange(null);
      setPreview(null);
    };

    return (
      <div className="w-full space-y-3">
        <FileUpload.Root
          value={value ? [value] : []}
          onValueChange={handleFileChange}
          maxFiles={1}
          maxSize={5 * 1024 * 1024}
          className="w-full"
        >
          {!preview && (
            <FileUpload.Dropzone className="p-6 border-2 border-dashed border-purple-500/50 rounded-xl flex flex-col items-center text-center gap-3 bg-gray-900/30 hover:border-cyan-400/50 hover:bg-gray-900/40 transition-all duration-300">
              <Upload className="size-8 text-cyan-400" />
              <div className="text-sm font-mono text-cyan-300">
                Drag or click to upload
              </div>
              <div className="text-xs text-purple-400">
                Max 5MB — PNG, JPEG only
              </div>
              <FileUpload.Trigger asChild>
                <Button
                  size="sm"
                  className="bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-300 font-mono"
                >
                  Choose File
                </Button>
              </FileUpload.Trigger>
            </FileUpload.Dropzone>
          )}

          {preview && value && (
            <div className="flex items-center gap-3 p-3 border border-purple-500/30 rounded-lg bg-gray-900/30 backdrop-blur-sm">
              <div className="size-16 rounded-lg overflow-hidden border-2 border-cyan-400/50">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-sm truncate text-cyan-300 font-mono">
                {value.name}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </FileUpload.Root>
      </div>
    );
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      { name: "", items: [{ text: "", image: null, hint: "" }] },
    ]);
  };

  const removeCategory = (categoryIndex: number) => {
    if (categories.length <= 2) {
      toast.error("Minimum 2 categories required");
      return;
    }
    setCategories(categories.filter((_, idx) => idx !== categoryIndex));
  };

  const updateCategoryName = (categoryIndex: number, name: string) => {
    const updated = [...categories];
    updated[categoryIndex].name = name;
    setCategories(updated);
  };

  const addItem = (categoryIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex].items.push({ text: "", image: null, hint: "" });
    setCategories(updated);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...categories];
    if (updated[categoryIndex].items.length <= 1) {
      toast.error("Each category must have at least 1 item");
      return;
    }
    updated[categoryIndex].items = updated[categoryIndex].items.filter(
      (_, idx) => idx !== itemIndex,
    );
    setCategories(updated);
  };

  const updateItemText = (
    categoryIndex: number,
    itemIndex: number,
    text: string,
  ) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex].text = text;
    setCategories(updated);
  };

  const updateItemImage = (
    categoryIndex: number,
    itemIndex: number,
    file: File | null,
  ) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex].image = file;
    setCategories(updated);
  };

  const updateItemHint = (
    categoryIndex: number,
    itemIndex: number,
    hint: string,
  ) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex].hint = hint;
    setCategories(updated);
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Name is required", {
        style: {
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#00ffff",
          border: "1px solid #ff0080",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow:
            "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
        },
        iconTheme: {
          primary: "#ff0080",
          secondary: "#00ffff",
        },
      });
      return false;
    }
    if (!description.trim()) {
      toast.error("Description is required", {
        style: {
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#00ffff",
          border: "1px solid #ff0080",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow:
            "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
        },
        iconTheme: {
          primary: "#ff0080",
          secondary: "#00ffff",
        },
      });
      return false;
    }
    if (categories.length < 2) {
      toast.error("At least 2 categories are required", {
        style: {
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#00ffff",
          border: "1px solid #ff0080",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow:
            "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
        },
        iconTheme: {
          primary: "#ff0080",
          secondary: "#00ffff",
        },
      });
      return false;
    }
    if (categories.length > 10) {
      toast.error("Maximum 10 categories allowed", {
        style: {
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#00ffff",
          border: "1px solid #ff0080",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow:
            "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
        },
        iconTheme: {
          primary: "#ff0080",
          secondary: "#00ffff",
        },
      });
      return false;
    }
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      if (!category.name.trim()) {
        toast.error(`Category ${i + 1} must have a name`, {
          style: {
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "#00ffff",
            border: "1px solid #ff0080",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
          },
          iconTheme: {
            primary: "#ff0080",
            secondary: "#00ffff",
          },
        });
        return false;
      }
      if (category.items.length === 0) {
        toast.error(`Category "${category.name}" must have at least one item`, {
          style: {
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "#00ffff",
            border: "1px solid #ff0080",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
          },
          iconTheme: {
            primary: "#ff0080",
            secondary: "#00ffff",
          },
        });
        return false;
      }
      if (category.items.length > 20) {
        toast.error(`Category "${category.name}" can have maximum 20 items`, {
          style: {
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "#00ffff",
            border: "1px solid #ff0080",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
          },
          iconTheme: {
            primary: "#ff0080",
            secondary: "#00ffff",
          },
        });
        return false;
      }
      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];
        if (!item.text.trim()) {
          toast.error(
            `Item ${j + 1} in category "${category.name}" must have text`,
            {
              style: {
                background:
                  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                color: "#00ffff",
                border: "1px solid #ff0080",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow:
                  "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
              },
              iconTheme: {
                primary: "#ff0080",
                secondary: "#00ffff",
              },
            },
          );
          return false;
        }
        if (!item.hint || !item.hint.trim()) {
          toast.error(
            `Item ${j + 1} in category "${category.name}" must have a hint`,
            {
              style: {
                background:
                  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                color: "#00ffff",
                border: "1px solid #ff0080",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow:
                  "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
              },
              iconTheme: {
                primary: "#ff0080",
                secondary: "#00ffff",
              },
            },
          );
          return false;
        }
      }
    }

    // Check for duplicate category names
    const categoryNames = categories.map((cat) =>
      cat.name.trim().toLowerCase(),
    );
    const duplicateCategoryNames = categoryNames.filter(
      (name, index) => categoryNames.indexOf(name) !== index,
    );
    if (duplicateCategoryNames.length > 0) {
      toast.error(
        `Duplicate category name detected: "${duplicateCategoryNames[0]}". Category names must be unique.`,
        {
          style: {
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "#00ffff",
            border: "1px solid #ff0080",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
          },
          iconTheme: {
            primary: "#ff0080",
            secondary: "#00ffff",
          },
        },
      );
      return false;
    }

    // Check for duplicate item texts across all categories
    const allItemTexts: string[] = [];
    for (const category of categories) {
      for (const item of category.items) {
        const itemText = item.text.trim().toLowerCase();
        if (allItemTexts.includes(itemText)) {
          toast.error(
            `Duplicate item detected: "${item.text}". Item texts must be unique across all categories.`,
            {
              style: {
                background:
                  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                color: "#00ffff",
                border: "1px solid #ff0080",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow:
                  "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
              },
              iconTheme: {
                primary: "#ff0080",
                secondary: "#00ffff",
              },
            },
          );
          return false;
        }
        allItemTexts.push(itemText);
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();

      // Basic fields
      formData.append("name", name);
      formData.append("description", description);
      formData.append("time_limit", (timeLimit || 60).toString());
      formData.append("score_per_item", (scorePerItem || 1).toString());
      formData.append(
        "is_category_randomized",
        isCategoryRandomized.toString(),
      );
      formData.append("is_item_randomized", isItemRandomized.toString());
      formData.append(
        "is_publish_immediately",
        isPublishImmediately.toString(),
      );

      if (thumbnail) {
        formData.append("thumbnail_image", thumbnail);
      }

      // Build files_to_upload array and track indices
      const filesArray: File[] = [];
      const categoriesData = categories.map((cat) => ({
        category_name: cat.name,
        items: cat.items.map((item) => {
          if (item.image) {
            const imageIndex = filesArray.length;
            filesArray.push(item.image);
            return {
              item_text: item.text,
              item_image_array_index: imageIndex,
              item_hint: item.hint || null,
            };
          }
          return {
            item_text: item.text,
            item_hint: item.hint || null,
          };
        }),
      }));

      formData.append("categories", JSON.stringify(categoriesData));

      // Append all files
      filesArray.forEach((file) => {
        formData.append("files_to_upload", file);
      });

      await api
        .post("/api/game/game-type/group-sort", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          toast.success("Group Sort game created successfully!", {
            style: {
              background:
                "linear-gradient(135deg, #0a2e0a 0%, #0f3e0f 50%, #1a5e1a 100%)",
              color: "#00ff88",
              border: "1px solid #00ff88",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow:
                "0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
            },
            iconTheme: {
              primary: "#00ff88",
              secondary: "#0a2e0a",
            },
          });
          navigate("/my-projects");
        });
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create game",
        {
          style: {
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "#00ffff",
            border: "1px solid #ff0080",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 255, 255, 0.2)",
          },
          iconTheme: {
            primary: "#ff0080",
            secondary: "#00ffff",
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black overflow-x-hidden relative"
      style={{ overscrollBehavior: "none" }}
    >
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/50 shadow-lg shadow-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/create-projects")}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 font-mono tracking-wide px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Typography
              variant="h3"
              className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 font-mono tracking-wider"
            >
              CREATE GROUP SORT GAME
            </Typography>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl border border-purple-500/30 shadow-2xl shadow-purple-500/10 p-6 space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-linear-to-b from-cyan-400 to-purple-500 rounded-full"></div>
              <Typography
                variant="h4"
                className="text-cyan-400 font-mono tracking-wide"
              >
                GAME INFORMATION
              </Typography>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="grid w-full items-center gap-2">
                <Label className="flex items-center gap-1 text-cyan-400 font-mono text-sm tracking-wide">
                  Name
                  <span className="text-pink-400">*</span>
                </Label>
                <Input
                  placeholder="Enter game name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60 font-mono tracking-wide"
                  required
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label className="flex items-center gap-1 text-cyan-400 font-mono text-sm tracking-wide">
                  Description
                  <span className="text-pink-400">*</span>
                </Label>
                <Input
                  placeholder="Enter game description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60 font-mono tracking-wide"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid w-full items-center gap-2">
                <Label className="flex items-center gap-1 text-cyan-400 font-mono text-sm tracking-wide">
                  Time Limit (min: 30 sec)
                  <span className="text-pink-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="60"
                    max="600"
                    placeholder="Enter time limit..."
                    value={timeLimit}
                    onChange={(e) =>
                      setTimeLimit(
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value) || "",
                      )
                    }
                    className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 font-mono tracking-wide pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        setTimeLimit((prev) => Math.min(600, (prev || 60) + 1))
                      }
                      className="w-5 h-3 bg-linear-to-t from-cyan-500/20 to-cyan-500/40 hover:from-cyan-500/30 hover:to-cyan-500/60 border border-cyan-400/50 hover:border-cyan-300 text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center justify-center transition-all duration-200 rounded-t"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTimeLimit((prev) => Math.max(60, (prev || 60) - 1))
                      }
                      className="w-5 h-3 bg-linear-to-b from-cyan-500/20 to-cyan-500/40 hover:from-cyan-500/30 hover:to-cyan-500/60 border border-cyan-400/50 hover:border-cyan-300 border-t-0 text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center justify-center transition-all duration-200 rounded-b"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid w-full items-center gap-2">
                <Label className="flex items-center gap-1 text-cyan-400 font-mono text-sm tracking-wide">
                  Score Per Item (min: 10 point)
                  <span className="text-pink-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Enter score..."
                    value={scorePerItem}
                    onChange={(e) =>
                      setScorePerItem(
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value) || "",
                      )
                    }
                    className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 font-mono tracking-wide pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        setScorePerItem((prev) =>
                          Math.min(1000, (prev || 10) + 1),
                        )
                      }
                      className="w-5 h-3 bg-linear-to-t from-purple-500/20 to-purple-500/40 hover:from-purple-500/30 hover:to-purple-500/60 border border-purple-400/50 hover:border-purple-300 text-purple-400 hover:text-purple-300 text-[10px] flex items-center justify-center transition-all duration-200 rounded-t"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setScorePerItem((prev) => Math.max(1, (prev || 10) - 1))
                      }
                      className="w-5 h-3 bg-linear-to-b from-purple-500/20 to-purple-500/40 hover:from-purple-500/30 hover:to-purple-500/60 border border-purple-400/50 hover:border-purple-300 border-t-0 text-purple-400 hover:text-purple-300 text-[10px] flex items-center justify-center transition-all duration-200 rounded-b"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Randomization & Publish Options */}
            <div className="space-y-4 p-4 bg-gray-900/30 rounded-lg border border-purple-500/20">
              <Typography variant="h4" className="text-cyan-400 font-mono">
                OPTIONS
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="isCategoryRandomized"
                      checked={isCategoryRandomized}
                      onChange={(e) =>
                        setIsCategoryRandomized(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded bg-gray-800/60 transition-all duration-300 ${
                        isCategoryRandomized
                          ? "border-cyan-400 bg-linear-to-r from-cyan-500/30 to-purple-500/30"
                          : "border-purple-500/50 group-hover:border-cyan-400/70"
                      }`}
                    >
                      {isCategoryRandomized && (
                        <svg
                          className="w-3 h-3 text-cyan-300 absolute top-1 left-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-cyan-300 text-sm font-mono tracking-wide">
                    Randomize Categories
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="isItemRandomized"
                      checked={isItemRandomized}
                      onChange={(e) => setIsItemRandomized(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded bg-gray-800/60 transition-all duration-300 ${
                        isItemRandomized
                          ? "border-cyan-400 bg-linear-to-r from-cyan-500/30 to-purple-500/30"
                          : "border-purple-500/50 group-hover:border-cyan-400/70"
                      }`}
                    >
                      {isItemRandomized && (
                        <svg
                          className="w-3 h-3 text-cyan-300 absolute top-1 left-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-cyan-300 text-sm font-mono tracking-wide">
                    Randomize Items
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="isPublishImmediately"
                      checked={isPublishImmediately}
                      onChange={(e) =>
                        setIsPublishImmediately(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border-2 rounded bg-gray-800/60 transition-all duration-300 ${
                        isPublishImmediately
                          ? "border-cyan-400 bg-linear-to-r from-cyan-500/30 to-purple-500/30"
                          : "border-purple-500/50 group-hover:border-cyan-400/70"
                      }`}
                    >
                      {isPublishImmediately && (
                        <svg
                          className="w-3 h-3 text-cyan-300 absolute top-1 left-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-cyan-300 text-sm font-mono tracking-wide">
                    Publish Immediately
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-cyan-400 font-mono">
                THUMBNAIL IMAGE (Optional)
              </Label>
              <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-4 hover:border-cyan-400/50 transition-colors">
                <CyberpunkDropzone
                  onChange={(file) => setThumbnail(file)}
                  value={thumbnail}
                />
              </div>
              {thumbnail && (
                <div className="text-sm text-purple-300 bg-purple-900/20 px-3 py-2 rounded border-l-2 border-cyan-400">
                  <span className="text-cyan-400">Selected:</span>{" "}
                  {thumbnail.name}
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6 pt-6 border-t border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-linear-to-b from-cyan-400 to-purple-500 rounded-full"></div>
                <Typography
                  variant="h4"
                  className="text-cyan-400 font-mono tracking-wide"
                >
                  CATEGORIES & ITEMS
                </Typography>
              </div>
              <Button
                onClick={addCategory}
                size="sm"
                className="bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-300 transition-all duration-300 font-mono"
              >
                <Plus size={16} className="mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-6">
              {categories.map((category, catIdx) => (
                <div
                  key={catIdx}
                  className="border border-cyan-500/30 rounded-xl p-6 space-y-4 bg-gray-900/20 backdrop-blur-sm shadow-lg shadow-cyan-500/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-linear-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-mono text-white">
                        {catIdx + 1}
                      </div>
                      <Label className="text-cyan-400 font-mono">
                        CATEGORY {catIdx + 1}
                      </Label>
                    </div>
                    {categories.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(catIdx)}
                        className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <Input
                    placeholder="Category name (e.g., Animals, Colors, etc.)"
                    value={category.name}
                    onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                    className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60 font-mono tracking-wide"
                  />

                  <div className="space-y-4 pl-6 border-l-2 border-purple-500/30">
                    <Label className="text-sm text-purple-300 font-mono">
                      ITEMS
                    </Label>
                    {category.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex gap-3 items-start p-4 bg-gray-800/30 rounded-lg border border-purple-500/20"
                      >
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder={`Item ${itemIdx + 1} text...`}
                            value={item.text}
                            onChange={(e) =>
                              updateItemText(catIdx, itemIdx, e.target.value)
                            }
                            className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60 font-mono tracking-wide"
                          />
                          <div className="border border-dashed border-purple-400/30 rounded p-2 hover:border-cyan-400/50 transition-colors">
                            <CyberpunkDropzone
                              onChange={(file) =>
                                updateItemImage(catIdx, itemIdx, file)
                              }
                              value={item.image}
                            />
                          </div>
                          {item.image && (
                            <div className="text-xs text-purple-300 bg-purple-900/20 px-2 py-1 rounded">
                              <span className="text-cyan-400">Image:</span>{" "}
                              {item.image.name}
                            </div>
                          )}
                          <div className="relative">
                            <Input
                              placeholder="Hint (required) *"
                              value={item.hint || ""}
                              onChange={(e) =>
                                updateItemHint(catIdx, itemIdx, e.target.value)
                              }
                              className="bg-gray-900/40 border-purple-500/30 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/50 font-mono tracking-wide text-sm"
                              required
                            />
                            <span className="text-red-400 text-xs font-mono mt-1">
                              * Hint is required for all items
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(catIdx, itemIdx)}
                          className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 mt-2"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onClick={() => addItem(catIdx)}
                      className="w-full bg-linear-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-300 font-mono transition-all duration-300"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-8 border-t border-purple-500/30">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono tracking-wider py-6 text-lg shadow-lg shadow-purple-500/20"
                  disabled={loading}
                >
                  <SaveIcon size={20} className="mr-3" />
                  {loading ? "CREATING..." : "CREATE GAME"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900/95 backdrop-blur-xl border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/30 rounded-xl max-w-md mx-auto">
                <div className="absolute inset-0 bg-linear-to-br from-cyan-400/5 via-purple-500/5 to-pink-400/5 rounded-xl"></div>
                <div className="relative">
                  <AlertDialogHeader className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-linear-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                        <SaveIcon size={16} className="text-white" />
                      </div>
                      <AlertDialogTitle className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 font-mono text-xl tracking-wider">
                        CREATE GROUP SORT GAME?
                      </AlertDialogTitle>
                    </div>
                    <div className="w-full h-px bg-linear-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                    <AlertDialogDescription className="text-purple-300 font-mono text-sm leading-relaxed">
                      This will create a new Group Sort game with{" "}
                      <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/30">
                        {categories.length}
                      </span>{" "}
                      categories and{" "}
                      <span className="text-purple-400 font-bold bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/30">
                        {categories.reduce(
                          (total, cat) => total + cat.items.length,
                          0,
                        )}
                      </span>{" "}
                      total items.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-3 mt-6">
                    <AlertDialogCancel className="flex-1 bg-gray-800/60 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-white font-mono tracking-wide transition-all duration-300 shadow-lg shadow-cyan-500/10">
                      CANCEL
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      className="flex-1 bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono tracking-wide transition-all duration-300 shadow-lg shadow-purple-500/30 border border-purple-400/30"
                    >
                      <SaveIcon size={16} className="mr-2" />
                      CREATE
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupSort;
