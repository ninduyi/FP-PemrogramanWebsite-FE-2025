import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/ui/layout/Navbar";

interface Item {
  id: string;
  text: string;
  image: string | null;
  hint?: string;
}

interface Category {
  id: string;
  name: string;
  items: Item[];
}

interface GameData {
  categories: Category[];
  timeLimit: number;
  scorePerItem: number;
}

interface EditGroupSortGame {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  game_data: GameData;
}

export default function EditGroupSort() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [game, setGame] = useState<EditGroupSortGame | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    timeLimit: 300,
    scorePerItem: 10,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.get(
          `/api/game/game-type/group-sort/${id}/play/private`,
        );
        const gameData = response.data.data;

        setGame(gameData);
        setFormData({
          name: gameData.name,
          description: gameData.description,
          timeLimit: gameData.game_data.timeLimit,
          scorePerItem: gameData.game_data.scorePerItem,
        });
        setCategories(gameData.game_data.categories);
        if (gameData.thumbnail_image) {
          setThumbnailPreview(gameData.thumbnail_image);
        }
      } catch (err) {
        console.error("Failed to load game:", err);
        toast.error("Failed to load game for editing");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "timeLimit" || name === "scorePerItem"
          ? parseInt(value)
          : value,
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryNameChange = (categoryId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat,
      ),
    );
  };

  const handleItemTextChange = (
    categoryId: string,
    itemId: string,
    newText: string,
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, text: newText } : item,
              ),
            }
          : cat,
      ),
    );
  };

  const handleItemHintChange = (
    categoryId: string,
    itemId: string,
    newHint: string,
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, hint: newHint } : item,
              ),
            }
          : cat,
      ),
    );
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.filter((item) => item.id !== itemId),
            }
          : cat,
      ),
    );
  };

  const handleAddItem = (categoryId: string) => {
    const newItem: Item = {
      id: `new-${Date.now()}`,
      text: "New Item",
      image: null,
      hint: "",
    };
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: [...cat.items, newItem],
            }
          : cat,
      ),
    );
  };

  const handleSave = async () => {
    if (!id || !game) return;

    if (!formData.name.trim()) {
      toast.error("Game name is required");
      return;
    }

    if (categories.length === 0) {
      toast.error("At least one category is required");
      return;
    }

    try {
      setSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("score_per_item", formData.scorePerItem.toString());
      formDataToSend.append("time_limit", formData.timeLimit.toString());
      formDataToSend.append("is_publish", "false");

      // Transform categories to match backend format
      const transformedCategories = categories.map((cat) => ({
        category_name: cat.name,
        items: cat.items.map((item) => ({
          item_text: item.text,
          item_image_array_index: undefined, // No image for now
        })),
      }));

      formDataToSend.append(
        "categories",
        JSON.stringify(transformedCategories),
      );

      if (thumbnail) {
        formDataToSend.append("thumbnail_image", thumbnail);
      }

      console.log("Sending update request:", {
        name: formData.name,
        description: formData.description,
        categories: transformedCategories,
      });

      const response = await api.patch(
        `/api/game/game-type/group-sort/${id}`,
        formDataToSend,
      );

      console.log("Update response:", response.data);
      toast.success("Game updated successfully!");
      navigate("/my-projects");
    } catch (err: unknown) {
      console.error("Failed to save game:", err);
      console.error(
        "Error response:",
        (err as { response?: { data?: unknown } }).response?.data,
      );
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to save game changes",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
        <Typography variant="p">Game not found</Typography>
        <Button onClick={() => navigate("/my-projects")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/my-projects")}
            size="sm"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </Button>
          <div>
            <Typography variant="h2">Edit Game</Typography>
            <Typography variant="muted">
              Modify your game settings and content
            </Typography>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
              <Typography variant="h3" className="mb-4">
                Basic Information
              </Typography>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Game Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter game name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter game description"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time Limit (seconds)
                    </label>
                    <Input
                      type="number"
                      name="timeLimit"
                      value={formData.timeLimit}
                      onChange={handleFormChange}
                      min="30"
                      max="3600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Points Per Item
                    </label>
                    <Input
                      type="number"
                      name="scorePerItem"
                      value={formData.scorePerItem}
                      onChange={handleFormChange}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <Typography variant="h3" className="mb-4">
                Thumbnail
              </Typography>
              <div className="space-y-4">
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer inline-block">
                    Change Thumbnail
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <Typography variant="h3">Categories & Items</Typography>

            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category Name
                  </label>
                  <Input
                    value={category.name}
                    onChange={(e) =>
                      handleCategoryNameChange(category.id, e.target.value)
                    }
                    placeholder="Category name"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Typography variant="p" className="font-medium">
                      Items ({category.items.length})
                    </Typography>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddItem(category.id)}
                    >
                      <Plus size={16} className="mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg items-start"
                    >
                      <div className="flex-1 space-y-2 min-w-0">
                        <Input
                          value={item.text}
                          onChange={(e) =>
                            handleItemTextChange(
                              category.id,
                              item.id,
                              e.target.value,
                            )
                          }
                          placeholder="Item text"
                          className="text-sm"
                        />
                        <Input
                          value={item.hint || ""}
                          onChange={(e) =>
                            handleItemHintChange(
                              category.id,
                              item.id,
                              e.target.value,
                            )
                          }
                          placeholder="Hint (optional)"
                          className="text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(category.id, item.id)}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/my-projects")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
