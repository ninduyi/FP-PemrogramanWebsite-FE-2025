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
  hint?: string;
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
    { name: "", items: [{ text: "", image: null }] },
    { name: "", items: [{ text: "", image: null }] },
  ]);
  const [timeLimit, setTimeLimit] = useState<number>(60); // Default 60 seconds
  const [scorePerItem, setScorePerItem] = useState<number>(10); // Default 10 points
  const [isCategoryRandomized, setIsCategoryRandomized] = useState<boolean>(false);
  const [isItemRandomized, setIsItemRandomized] = useState<boolean>(false);
  const [isPublishImmediately, setIsPublishImmediately] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Custom dropzone component for cyberpunk theme
  const CyberpunkDropzone = ({ 
    onChange, 
    value, 
    label = "Upload File" 
  }: { 
    onChange: (file: File | null) => void;
    value?: File | null;
    label?: string;
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
              <div className="text-sm font-mono text-cyan-300">Drag or click to upload</div>
              <div className="text-xs text-purple-400">
                Max 5MB — PNG, JPEG only
              </div>
              <FileUpload.Trigger asChild>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-300 font-mono"
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
              <div className="flex-1 text-sm truncate text-cyan-300 font-mono">{value.name}</div>
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
    setCategories([...categories, { name: "", items: [{ text: "", image: null }] }]);
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
    updated[categoryIndex].items.push({ text: "", image: null });
    setCategories(updated);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const updated = [...categories];
    if (updated[categoryIndex].items.length <= 1) {
      toast.error("Each category must have at least 1 item");
      return;
    }
    updated[categoryIndex].items = updated[categoryIndex].items.filter(
      (_, idx) => idx !== itemIndex
    );
    setCategories(updated);
  };

  const updateItemText = (categoryIndex: number, itemIndex: number, text: string) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex].text = text;
    setCategories(updated);
  };

  const updateItemImage = (categoryIndex: number, itemIndex: number, file: File | null) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex].image = file;
    setCategories(updated);
  };

  const updateItemHint = (categoryIndex: number, itemIndex: number, hint: string) => {
    const updated = [...categories];
    updated[categoryIndex].items[itemIndex].hint = hint;
    setCategories(updated);
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (categories.length < 2) {
      toast.error("At least 2 categories are required");
      return false;
    }
    if (categories.length > 10) {
      toast.error("Maximum 10 categories allowed");
      return false;
    }
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      if (!category.name.trim()) {
        toast.error(`Category ${i + 1} must have a name`);
        return false;
      }
      if (category.items.length === 0) {
        toast.error(`Category "${category.name}" must have at least one item`);
        return false;
      }
      if (category.items.length > 20) {
        toast.error(`Category "${category.name}" can have maximum 20 items`);
        return false;
      }
      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];
        if (!item.text.trim()) {
          toast.error(`Item ${j + 1} in category "${category.name}" must have text`);
          return false;
        }
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
      formData.append("time_limit", timeLimit.toString());
      formData.append("score_per_item", scorePerItem.toString());
      formData.append("is_category_randomized", isCategoryRandomized.toString());
      formData.append("is_item_randomized", isItemRandomized.toString());
      formData.append("is_publish_immediately", isPublishImmediately.toString());
      
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

      await api.post("/api/game/game-type/group-sort", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(() => {
        toast.success("Group Sort game created successfully!");
        navigate("/my-projects");
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-purple-500/50 shadow-lg shadow-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/create-projects")}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Typography variant="h3" className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono tracking-wider">
              CREATE GROUP SORT GAME
            </Typography>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl border border-purple-500/30 shadow-2xl shadow-purple-500/10 p-6 space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></div>
              <Typography variant="h4" className="text-cyan-400 font-mono tracking-wide">GAME INFORMATION</Typography>
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
                  className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60"
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
                  className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid w-full items-center gap-2">
                <Label className="flex items-center gap-1 text-cyan-400 font-mono text-sm tracking-wide">
                  Time Limit (seconds)
                  <span className="text-pink-400">*</span>
                </Label>
                <Input
                  type="number"
                  min="30"
                  max="600"
                  placeholder="60"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                  className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100"
                  required
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label className="flex items-center gap-1 text-cyan-400 font-mono text-sm tracking-wide">
                  Score Per Item
                  <span className="text-pink-400">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="10"
                  value={scorePerItem}
                  onChange={(e) => setScorePerItem(parseInt(e.target.value) || 10)}
                  className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100"
                  required
                />
              </div>
            </div>

            {/* Randomization & Publish Options */}
            <div className="space-y-4 p-4 bg-gray-900/30 rounded-lg border border-purple-500/20">
              <Typography variant="h6" className="text-cyan-400 font-mono">OPTIONS</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isCategoryRandomized"
                    checked={isCategoryRandomized}
                    onChange={(e) => setIsCategoryRandomized(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 border-purple-500 rounded focus:ring-purple-500 focus:ring-2 bg-gray-700"
                  />
                  <Label htmlFor="isCategoryRandomized" className="cursor-pointer text-cyan-300 text-sm">
                    Randomize Categories
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isItemRandomized"
                    checked={isItemRandomized}
                    onChange={(e) => setIsItemRandomized(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 border-purple-500 rounded focus:ring-purple-500 focus:ring-2 bg-gray-700"
                  />
                  <Label htmlFor="isItemRandomized" className="cursor-pointer text-cyan-300 text-sm">
                    Randomize Items
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublishImmediately"
                    checked={isPublishImmediately}
                    onChange={(e) => setIsPublishImmediately(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 border-purple-500 rounded focus:ring-purple-500 focus:ring-2 bg-gray-700"
                  />
                  <Label htmlFor="isPublishImmediately" className="cursor-pointer text-cyan-300 text-sm">
                    Publish Immediately
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-cyan-400 font-mono">THUMBNAIL IMAGE (Optional)</Label>
              <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-4 hover:border-cyan-400/50 transition-colors">
                <CyberpunkDropzone
                  onChange={(file) => setThumbnail(file)}
                  value={thumbnail}
                />
              </div>
              {thumbnail && (
                <div className="text-sm text-purple-300 bg-purple-900/20 px-3 py-2 rounded border-l-2 border-cyan-400">
                  <span className="text-cyan-400">Selected:</span> {thumbnail.name}
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6 pt-6 border-t border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></div>
                <Typography variant="h4" className="text-cyan-400 font-mono tracking-wide">CATEGORIES & ITEMS</Typography>
              </div>
              <Button 
                onClick={addCategory} 
                size="sm" 
                className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-300 transition-all duration-300"
              >
                <Plus size={16} className="mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-6">
              {categories.map((category, catIdx) => (
                <div key={catIdx} className="border border-cyan-500/30 rounded-xl p-6 space-y-4 bg-gray-900/20 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-mono text-white">
                        {catIdx + 1}
                      </div>
                      <Label className="text-cyan-400 font-mono">CATEGORY {catIdx + 1}</Label>
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
                    className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60"
                  />

                  <div className="space-y-4 pl-6 border-l-2 border-purple-500/30">
                    <Label className="text-sm text-purple-300 font-mono">ITEMS</Label>
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex gap-3 items-start p-4 bg-gray-800/30 rounded-lg border border-purple-500/20">
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder={`Item ${itemIdx + 1} text...`}
                            value={item.text}
                            onChange={(e) =>
                              updateItemText(catIdx, itemIdx, e.target.value)
                            }
                            className="bg-gray-900/60 border-purple-500/50 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/60"
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
                              <span className="text-cyan-400">Image:</span> {item.image.name}
                            </div>
                          )}
                          <Input
                            placeholder="Hint (optional)"
                            value={item.hint || ""}
                            onChange={(e) =>
                              updateItemHint(catIdx, itemIdx, e.target.value)
                            }
                            className="bg-gray-900/40 border-purple-500/30 focus:border-cyan-400 text-cyan-100 placeholder-purple-400/50"
                          />
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
                      className="w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-300 font-mono transition-all duration-300"
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
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono tracking-wider py-6 text-lg shadow-lg shadow-purple-500/20" 
                  disabled={loading}
                >
                  <SaveIcon size={20} className="mr-3" />
                  {loading ? "CREATING..." : "CREATE GAME"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800/95 backdrop-blur-lg border border-purple-500/50 shadow-2xl shadow-purple-500/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-cyan-400 font-mono text-xl">CREATE GROUP SORT GAME?</AlertDialogTitle>
                  <AlertDialogDescription className="text-purple-300">
                    This will create a new Group Sort game with <span className="text-cyan-400">{categories.length}</span> categories and{" "}
                    <span className="text-cyan-400">{categories.reduce((total, cat) => total + cat.items.length, 0)}</span> total items.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleSubmit} 
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono"
                  >
                    CREATE
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupSort;
