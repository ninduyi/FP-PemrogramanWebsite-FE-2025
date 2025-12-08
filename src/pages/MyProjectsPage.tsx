import { useState, useEffect } from "react";
import api from "@/api/axios";
import ScoreAPI from "@/api/score";

import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/ui/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { useNavigate } from "react-router-dom";
import thumbnailPlaceholder from "../assets/images/thumbnail-placeholder.png";
import iconPlus from "../assets/images/icon-plus.svg";
import iconSearch from "../assets/images/icon-search.svg";
import iconFolderLarge from "../assets/images/icon-folder-large.svg";
import { EyeOff, Eye, Edit, Trash2, Play, Trophy, Lightbulb } from "lucide-react";
import toast from "react-hot-toast";

type Project = {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  is_published: boolean;
  game_template: string;
};

type ProjectWithStats = Project & {
  highestScore?: number;
  hints?: string[];
};

export default function MyProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/auth/me/game");
        const projectsData = response.data.data as Project[];

        // Fetch highest scores and extract hints for each project
        const projectsWithStats = await Promise.all(
          projectsData.map(async (project) => {
            let highestScore: number | undefined;
            let hints: string[] = [];

            try {
              // Fetch highest score
              const scoreData = await ScoreAPI.getHighestScore(project.id);
if (scoreData && typeof scoreData === 'object' && 'score' in scoreData) {
  highestScore = (scoreData as any).score;  // ✅ Safe access
}
            } catch (err) {
              console.log(`No score data for ${project.id}`);
            }

            // Extract hints from game_json if it's GroupSort
            if (project.game_template === "GroupSort") {
              try {
                // game_json structure: { categories: [{ items: [{ hint?: string }] }] }
                const gameJson = (response.data.data as any[]).find(p => p.id === project.id)?.game_json;
                if (gameJson && gameJson.categories) {
                  const allHints = gameJson.categories
                    .flatMap((cat: any) => cat.items || [])
                    .map((item: any) => item.hint)
                    .filter((h: any) => h && h.trim() !== "");
                  hints = allHints as string[];
                }
              } catch (err) {
                console.log(`Could not extract hints for ${project.id}`);
              }
            }

            return {
              ...project,
              highestScore,
              hints,
            };
          })
        );

        setProjects(projectsWithStats);
      } catch (err) {
        setError("Failed to fetch projects. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: string, gameTemplate: string) => {
    try {
      const endpoint = gameTemplate === "Quiz" 
        ? `/api/game/game-type/quiz/${projectId}` 
        : `/api/game/game-type/group-sort/${projectId}`;
      await api.delete(endpoint);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted successfully!");
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Failed to delete project. Please try again.");
    }
  };

  const handleUpdateStatus = async (gameId: string, isPublish: boolean, gameTemplate: string) => {
    try {
      const form = new FormData();
      form.append("is_publish", String(isPublish));

      const endpoint = gameTemplate === "Quiz" 
        ? `/api/game/game-type/quiz/${gameId}` 
        : `/api/game/game-type/group-sort/${gameId}`;
      await api.patch(endpoint, form);

      setProjects((prev) =>
        prev.map((p) =>
          p.id === gameId ? { ...p, is_published: isPublish } : p,
        ),
      );

      toast.success(
        isPublish ? "Published successfully" : "Unpublished successfully",
      );
    } catch (err) {
      console.error("Failed to update publish status:", err);
      toast.error("Failed to update status. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Typography variant="h3">Loading...</Typography>
      </div>
    );
  if (error)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Typography variant="h3" className="text-destructive">
          {error}
        </Typography>
      </div>
    );

  const EmptyState = () => (
    <Card className="flex flex-col items-center justify-center text-center p-12 md:p-20 mt-6">
      <img
        src={iconFolderLarge}
        alt="No projects"
        className="w-20 h-20 mb-6 text-gray-400"
      />
      <Typography variant="h3" className="mb-2">
        You haven't created any games yet
      </Typography>
      <Typography variant="muted" className="max-w-sm mb-8">
        Get started by choosing a template and building your first educational
        game.
      </Typography>
      <Button
        size="lg"
        className="w-full max-w-xs"
        onClick={() => navigate("/create-projects")}
      >
        <img src={iconPlus} alt="" className="w-5 h-5 mr-2" />
        Create Your First Game
      </Button>
    </Card>
  );

  const ProjectList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-1 mt-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="relative p-4 h-fit sm:h-80 md:h-fit cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="w-full h-full flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="w-full h-full flex flex-col md:flex-row md:items-center gap-4">
              <img
                src={
                  project.thumbnail_image
                    ? `${import.meta.env.VITE_API_URL}/${project.thumbnail_image}`
                    : thumbnailPlaceholder
                }
                alt={
                  project.thumbnail_image
                    ? project.name
                    : "Placeholder Thumbnail"
                }
                className="w-full md:w-28 md:h-24 rounded-md object-cover"
              />
              <div className="flex flex-col md:gap-6 justify-between items-stretch h-full w-full">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <Typography variant="p" className="font-semibold">
                      {project.name}
                    </Typography>
                    <Typography
                      variant="p"
                      className="text-sm text-muted-foreground"
                    >
                      {project.description}
                    </Typography>
                  </div>
                  <div className="md:hidden">
                    <Badge
                      variant={project.is_published ? "default" : "destructive"}
                      className={
                        project.is_published
                          ? "capitalize bg-green-100 text-green-800"
                          : "capitalize bg-yellow-100 text-yellow-800"
                      }
                    >
                      {project.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>

                {/* Highest Score Display */}
                {project.highestScore !== undefined && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 p-2 rounded">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <Typography variant="small" className="text-yellow-800 font-semibold">
                      Highest Score: {project.highestScore}
                    </Typography>
                  </div>
                )}

                {/* Hints Display */}
                {project.hints && project.hints.length > 0 && (
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <Typography variant="small" className="text-blue-900 font-semibold">
                        Hints ({project.hints.length})
                      </Typography>
                    </div>
                    <div className="space-y-1">
                      {project.hints.slice(0, 2).map((hint, idx) => (
                        <Typography key={idx} variant="small" className="text-blue-800 text-xs line-clamp-1">
                          • {hint}
                        </Typography>
                      ))}
                      {project.hints.length > 2 && (
                        <Typography variant="small" className="text-blue-700 text-xs italic">
                          +{project.hints.length - 2} more hints
                        </Typography>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-6 md:mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      const playRoute = project.game_template === "Quiz"
                        ? `/quiz/play/${project.id}`
                        : `/group-sort/play/${project.id}`;
                      navigate(playRoute);
                    }}
                  >
                    <Play />
                    {project.is_published ? "Play" : "Test"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      const editRoute = project.game_template === "Quiz"
                        ? `/quiz/edit/${project.id}`
                        : `/group-sort/edit/${project.id}`;
                      navigate(editRoute);
                    }}
                  >
                    <Edit />
                    Edit
                  </Button>
                  {project.is_published ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => {
                        handleUpdateStatus(project.id, false, project.game_template);
                      }}
                    >
                      <EyeOff />
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => {
                        handleUpdateStatus(project.id, true, project.game_template);
                      }}
                    >
                      <Eye />
                      Publish
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <b>{project.name}</b>?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            handleDeleteProject(project.id, project.game_template);
                          }}
                        >
                          Yes, Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {/* Right side: Badge */}
            <div className="hidden md:block">
              <Badge
                variant={project.is_published ? "default" : "destructive"}
                className={
                  project.is_published
                    ? "text-sm px-3 bg-green-100 text-green-800"
                    : "text-sm px-3 bg-yellow-100 text-yellow-800"
                }
              >
                {project.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Typography variant="h2">
              My Projects ({projects.length})
            </Typography>
            <Typography variant="muted">
              Manage your educational games
            </Typography>
          </div>
          <Button onClick={() => navigate("/create-projects")}>
            <img src={iconPlus} alt="" className="w-5 h-5 mr-2" />
            New Game
          </Button>
        </div>
        <div className="mt-6 relative">
          <img
            src={iconSearch}
            alt=""
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Search your projects..." className="pl-10" />
        </div>
        {projects.length === 0 ? <EmptyState /> : <ProjectList />}
      </main>
    </div>
  );
}
