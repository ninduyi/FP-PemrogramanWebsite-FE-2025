import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Pause, Play, Timer, Lock, Lightbulb } from "lucide-react";
import thumbnailPlaceholder from "../../assets/images/thumbnail-placeholder.png";
import * as Tone from "tone";
import ScoreAPI from "@/api/score";

interface Item {
  id: string;
  text: string;
  image: string | null;
  correctCategoryId: string;
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

interface GroupSortGame {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  is_published: boolean;
  game_data: GameData;
  creator_name?: string;
}

// Cyberpunk Loading Screen Component with Rotating Box
function IntroScreen({ onStart }: { onStart: () => void }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing System...");
  const [chars, setChars] = useState("");

  useEffect(() => {
    const messages = [
      "Initializing System...",
      "Loading Neural Grid...",
      "Accessing Host Databanks...",
      "Decrypting Protocol...",
      "Syncing Matrix...",
    ];

    let msgIndex = 0;
    let prog = 0;

    const interval = setInterval(() => {
      prog += 20;
      setProgress(prog);

      if (msgIndex < messages.length - 1) {
        msgIndex++;
        setMessage(messages[msgIndex]);
      }

      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(onStart, 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onStart]);

  // Glitch text effect
  useEffect(() => {
    const glitchChars = "!<>-_\\/[]{}—=+*^?#________";
    const targetText = message;
    let iteration = 0;

    const glitchInterval = setInterval(() => {
      setChars(
        targetText
          .split("")
          .map((_, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join(""),
      );

      if (iteration >= targetText.length) {
        clearInterval(glitchInterval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(glitchInterval);
  }, [message]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
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
      <div className="absolute inset-0 opacity-30">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Rotating 3D Box with Glow */}
        <div className="relative w-48 h-48 mx-auto perspective-1000">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-lg blur-2xl bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50 animate-pulse" />

          {/* Rotating box container */}
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              animation: "rotate3d 3s linear infinite",
            }}
          >
            {/* Main rotating box */}
            <div
              className="absolute inset-4 border-4 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.8)]"
              style={{
                transform: "rotateX(25deg) rotateY(45deg)",
                transformStyle: "preserve-3d",
                animation: "boxRotate 4s linear infinite",
              }}
            >
              {/* Inner box */}
              <div
                className="absolute inset-2 border-2 border-purple-500"
                style={{
                  animation: "innerRotate 3s linear infinite reverse",
                }}
              />

              {/* Center logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600 font-mono"
                  style={{
                    textShadow: "0 0 20px rgba(6,182,212,0.8)",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                >
                  GS
                </span>
              </div>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-400" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-400" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-pink-400" />
          </div>
        </div>

        {/* Glitch text */}
        <div className="space-y-4">
          <Typography
            variant="h2"
            className="text-purple-400 font-mono text-2xl tracking-widest"
          >
            &gt; {chars}
          </Typography>

          {/* Progress bar with scan effect */}
          <div className="w-96 max-w-full mx-auto space-y-2">
            <div className="h-2 bg-gray-900 border border-cyan-500/50 relative overflow-hidden rounded-sm">
              <div
                className="h-full bg-linear-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shine effect */}
                <div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent"
                  style={{
                    animation: "shine 1s ease-in-out infinite",
                  }}
                />
              </div>
              {/* Scan line */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)",
                  animation: "scan 2s linear infinite",
                }}
              />
            </div>
            <Typography
              variant="p"
              className="text-cyan-400 font-mono text-sm tracking-wider"
            >
              [{progress}%] LOADING...
            </Typography>
          </div>
        </div>

        {/* Terminal lines */}
        <div className="space-y-1 text-left max-w-md mx-auto font-mono text-xs">
          <Typography variant="p" className="text-green-500 opacity-70">
            &gt; Establishing secure connection...{" "}
            <span className="text-cyan-400">[OK]</span>
          </Typography>
          <Typography variant="p" className="text-green-500 opacity-70">
            &gt; Bypassing firewall protocols...{" "}
            <span className="text-cyan-400">[OK]</span>
          </Typography>
          <Typography variant="p" className="text-green-500 opacity-70">
            &gt; Decrypting game data...{" "}
            <span className="text-yellow-400">[PROCESSING]</span>
          </Typography>
          <Typography
            variant="p"
            className="text-cyan-500 flex items-center gap-2"
          >
            &gt;{" "}
            <span className="animate-pulse bg-cyan-400 w-2 h-4 inline-block" />
          </Typography>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes rotate3d {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }
        @keyframes boxRotate {
          0% { transform: rotateX(25deg) rotateY(0deg); }
          100% { transform: rotateX(25deg) rotateY(360deg); }
        }
        @keyframes innerRotate {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(-360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

// Level Selection Screen
function LevelSelection({
  onSelectLevel,
}: {
  onSelectLevel: (gameId: string) => void;
}) {
  const [games, setGames] = useState<GroupSortGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/game?gameTypeSlug=group-sort");
        setGames(response.data.data);
      } catch (err) {
        console.error("Failed to fetch games:", err);
        toast.error("Failed to load games");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Typography
            variant="h1"
            className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600 font-mono text-4xl tracking-wider"
          >
            PILIH LEVEL
          </Typography>
          <Typography variant="p" className="text-blue-300">
            Pilih tantangan yang sesuai dengan kemampuanmu. Setiap level
            menawarkan pengalaman unik dengan item dan kategori yang berbeda.
          </Typography>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 border-4 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
              <Lock size={48} className="text-gray-600" />
            </div>
            <Typography variant="h3" className="text-gray-500 mb-2">
              Belum Ada Game
            </Typography>
            <Typography variant="p" className="text-gray-600">
              Belum ada Group Sort game yang tersedia saat ini.
            </Typography>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="relative rounded-lg overflow-hidden border-2 border-cyan-500 hover:border-purple-500 cursor-pointer hover:scale-105 transition-all bg-gray-900/50 backdrop-blur-sm"
                onClick={() => onSelectLevel(game.id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      game.thumbnail_image
                        ? game.thumbnail_image
                        : thumbnailPlaceholder
                    }
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent" />
                </div>

                <div className="p-6 space-y-3">
                  <Typography
                    variant="h3"
                    className="text-cyan-300 font-mono text-lg tracking-wide"
                  >
                    {game.name}
                  </Typography>
                  <Typography
                    variant="p"
                    className="text-gray-400 text-sm line-clamp-2"
                  >
                    {game.description}
                  </Typography>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-purple-400 font-mono">
                      BY: {game.creator_name || "Unknown"}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500">
                      PLAY
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupSort() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GroupSortGame | null>(null);
  const [showIntro, setShowIntro] = useState(true); // Always show intro first
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    id || null,
  );

  // Game state
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [placedItems, setPlacedItems] = useState<{
    [categoryId: string]: Item[];
  }>({});
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showTimeUpPopup, setShowTimeUpPopup] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Result state
  const [result, setResult] = useState<{
    correctItems: number;
    totalItems: number;
    accuracy: number;
    timeTaken: number;
    score: number;
  } | null>(null);

  const [highestScore, setHighestScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    {
      user_id: string;
      username: string;
      highest_score: number;
      total_plays: number;
    }[]
  >([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const backgroundMusicRef = useRef<{
    synth: Tone.PolySynth;
    pattern: Tone.Pattern<string>;
  } | null>(null);

  // Retro 90s game sounds - Mario style
  // Victory sound (Mario win)
  const playVictorySound = async () => {
    try {
      await Tone.start();
      const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05 },
      }).toDestination();

      const now = Tone.now();
      synth.triggerAttackRelease("E4", "16n", now);
      synth.triggerAttackRelease("G4", "16n", now + 0.1);
      synth.triggerAttackRelease("E5", "16n", now + 0.2);
      synth.triggerAttackRelease("C5", "8n", now + 0.35);
      synth.triggerAttackRelease("D5", "8n", now + 0.5);
      synth.triggerAttackRelease("E5", "4n", now + 0.65);

      setTimeout(() => synth.dispose(), 1500);
    } catch {
      console.log("Audio not available");
    }
  };

  // Game over sound (Mario lose)
  const playGameOverSound = async () => {
    try {
      await Tone.start();
      const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
      }).toDestination();

      const now = Tone.now();
      synth.triggerAttackRelease("E3", "8n", now);
      synth.triggerAttackRelease("D3", "8n", now + 0.15);
      synth.triggerAttackRelease("C3", "2n", now + 0.3);

      setTimeout(() => synth.dispose(), 1500);
    } catch {
      console.log("Audio not available");
    }
  };

  // Button click sound (retro beep)
  const playButtonSound = async () => {
    try {
      await Tone.start();
      const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.03 },
      }).toDestination();
      synth.triggerAttackRelease("A4", "16n");
      setTimeout(() => synth.dispose(), 150);
    } catch {
      console.log("Audio not available");
    }
  };

  // Drag/drop sound (retro item placement)
  const playDropSound = async () => {
    try {
      await Tone.start();
      const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05 },
      }).toDestination();

      const now = Tone.now();
      synth.triggerAttackRelease("C4", "16n", now);
      synth.triggerAttackRelease("G4", "16n", now + 0.08);

      setTimeout(() => synth.dispose(), 250);
    } catch {
      console.log("Audio not available");
    }
  };

  // Play result sound based on accuracy
  const playResultSound = async (accuracy: number) => {
    if (accuracy >= 50) {
      await playVictorySound();
    } else {
      await playGameOverSound();
    }
  };

  // Start retro 90s background music during gameplay - Mario inspired energetic theme
  const startBackgroundMusic = async () => {
    try {
      await Tone.start();
      if (backgroundMusicRef.current) {
        stopBackgroundMusic();
      }

      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.08 },
      }).toDestination();

      synth.volume.value = -20;

      // Mario-inspired energetic melody - more exciting!
      // This creates an upbeat, arcade-like background theme
      const melody = [
        "D4",
        "E4",
        "F#4",
        "G4",
        "A4",
        "G4",
        "F#4",
        "E4",
        "D4",
        "D4",
        "E4",
        "F#4",
        "G4",
        "A4",
        "B4",
        "C5",
        "B4",
        "A4",
        "G4",
        "F#4",
        "E4",
        "D4",
        "E4",
        "F#4",
      ];

      const pattern = new Tone.Pattern(
        (time: number, note: string) => {
          synth.triggerAttackRelease(note, "8n", time);
        },
        melody,
        "up",
      );

      pattern.start(0);
      Tone.Transport.bpm.value = 140; // Higher tempo untuk lebih energik
      Tone.Transport.start();

      backgroundMusicRef.current = { synth, pattern };
    } catch {
      console.log("Could not start background music");
    }
  };

  // Stop background music
  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      Tone.Transport.stop();
      if (backgroundMusicRef.current.pattern) {
        backgroundMusicRef.current.pattern.stop();
      }
      if (backgroundMusicRef.current.synth) {
        backgroundMusicRef.current.synth.dispose();
      }
      backgroundMusicRef.current = null;
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      const gameId = selectedGameId || id;
      if (!gameId) return;

      try {
        setLoading(true);
        let gameData;

        // Try public endpoint first
        try {
          const response = await api.get(
            `/api/game/game-type/group-sort/${gameId}/play/public`,
          );
          gameData = response.data.data;
        } catch (publicError: unknown) {
          // If public fails (404 - unpublished), try private endpoint for testing
          if (
            (publicError as { response?: { status?: number } }).response
              ?.status === 404
          ) {
            try {
              const privateResponse = await api.get(
                `/api/game/game-type/group-sort/${gameId}/play/private`,
              );
              gameData = privateResponse.data.data;
              toast.success("Playing private game (testing mode)");
            } catch {
              throw publicError; // Throw original error if both fail
            }
          } else {
            throw publicError;
          }
        }

        setGame(gameData);

        // Flatten all items from all categories
        const items: Item[] = [];
        const allHints: string[] = [];
        gameData.game_data.categories.forEach((cat: Category) => {
          cat.items.forEach(
            (item: {
              id: string;
              text: string;
              image: string | null;
              correctCategoryId: string;
              hint?: string;
            }) => {
              items.push({
                ...item,
                correctCategoryId: cat.id,
              });
              // Collect hints
              if (item.hint && item.hint.trim()) {
                allHints.push(item.hint);
              }
            },
          );
        });

        // Shuffle items
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        setAllItems(shuffled);
        setHints(allHints);
        setTimeLeft(gameData.game_data.timeLimit);

        // Initialize empty placement
        const emptyPlacement: { [key: string]: Item[] } = {};
        gameData.game_data.categories.forEach((cat: Category) => {
          emptyPlacement[cat.id] = [];
        });
        setPlacedItems(emptyPlacement);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load game");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [selectedGameId, id]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !isPaused && !gameFinished && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowTimeUpPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameStarted, isPaused, gameFinished]);

  // Start/stop background music based on game state
  useEffect(() => {
    if (
      gameStarted &&
      !isPaused &&
      !gameFinished &&
      !showIntro &&
      !showLevelSelection
    ) {
      startBackgroundMusic();
    } else {
      if (isPaused || gameFinished) {
        Tone.Transport.pause();
      }
    }

    return () => {
      stopBackgroundMusic();
    };
  }, [gameStarted, isPaused, gameFinished, showIntro, showLevelSelection]);

  // Resume background music when unpausing
  useEffect(() => {
    if (
      gameStarted &&
      !isPaused &&
      !gameFinished &&
      backgroundMusicRef.current
    ) {
      Tone.Transport.start();
    }
  }, [isPaused]);

  // Play result sound when game finishes
  useEffect(() => {
    if (gameFinished && result) {
      stopBackgroundMusic();
      playResultSound(result.accuracy);
    }
  }, [gameFinished, result]);

  // Fetch initial highest score when game is loaded
  useEffect(() => {
    const fetchInitialScores = async () => {
      if (game && !gameStarted && !gameFinished) {
        try {
          setLoadingScores(true);

          // Fetch highest score before game starts
          const highestScoreData = await ScoreAPI.getHighestScore(game.id);
          console.log("Initial highest score:", highestScoreData);

          if (
            highestScoreData &&
            typeof highestScoreData === "object" &&
            "score" in highestScoreData
          ) {
            const scoreValue = (highestScoreData as { score: number }).score;
            if (typeof scoreValue === "number") {
              setHighestScore(scoreValue);
              console.log("Initial highest score set to:", scoreValue);
            }
          } else {
            // No previous scores found
            setHighestScore(null);
            console.log("No previous highest score found");
          }

          // Fetch initial leaderboard
          const leaderboardData = await ScoreAPI.getLeaderboard(game.id, 5);
          if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
            setLeaderboard(leaderboardData);
          }
        } catch (err: unknown) {
          console.error("Failed to fetch initial scores:", err);
          setHighestScore(null);
        } finally {
          setLoadingScores(false);
        }
      }
    };

    fetchInitialScores();
  }, [game]);

  const startGame = async () => {
    await playButtonSound();
    setShowIntro(false);
    // If coming from URL with id, skip level selection and start game directly
    if (id) {
      setShowLevelSelection(false);
      setGameStarted(true);
    } else {
      setShowLevelSelection(true);
    }
  };

  const startLevel = async (gameId: string) => {
    await playButtonSound();
    setSelectedGameId(gameId);
    setShowLevelSelection(false);
    setGameStarted(true);
  };

  const handleDragStart = (item: Item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (categoryId: string) => {
    if (!draggedItem) return;

    await playDropSound();

    // Remove from allItems if it's from there
    setAllItems((prev) => prev.filter((item) => item.id !== draggedItem.id));

    // Remove from any other category
    const updatedPlacement = { ...placedItems };
    Object.keys(updatedPlacement).forEach((catId) => {
      updatedPlacement[catId] = updatedPlacement[catId].filter(
        (item) => item.id !== draggedItem.id,
      );
    });

    // Add to new category
    updatedPlacement[categoryId] = [
      ...updatedPlacement[categoryId],
      draggedItem,
    ];
    setPlacedItems(updatedPlacement);
    setDraggedItem(null);
  };

  const handleDropToPool = async () => {
    if (!draggedItem) return;

    await playDropSound();

    // Remove from all categories
    const updatedPlacement = { ...placedItems };
    Object.keys(updatedPlacement).forEach((catId) => {
      updatedPlacement[catId] = updatedPlacement[catId].filter(
        (item) => item.id !== draggedItem.id,
      );
    });
    setPlacedItems(updatedPlacement);

    // Add back to pool
    setAllItems((prev) => [...prev, draggedItem]);
    setDraggedItem(null);
  };

  const handleSubmit = async () => {
    if (gameFinished) return;

    setGameFinished(true);
    setIsPaused(true);

    const timeTaken = game!.game_data.timeLimit - timeLeft;

    // Calculate total items from all categories
    let totalItemsCount = 0;
    if (game?.game_data?.categories) {
      game.game_data.categories.forEach((cat) => {
        if (cat.items && Array.isArray(cat.items)) {
          totalItemsCount += cat.items.length;
        }
      });
    }

    console.log("Total items calculated:", totalItemsCount);
    console.log("Categories:", game?.game_data?.categories);

    let scoreToSubmit = 0; // TAMBAH: Variable untuk simpan score

    try {
      // Build answers array for check-answer endpoint
      const answers: { item_id: string; category_id: string }[] = [];
      Object.keys(placedItems).forEach((categoryId) => {
        placedItems[categoryId].forEach((item) => {
          answers.push({
            item_id: item.id,
            category_id: categoryId,
          });
        });
      });

      console.log("Submitting answers:", answers);

      // Submit answers to backend for validation
      const checkAnswerResponse = await api.post<{
        data: {
          correct_count: number;
          total_count: number;
          score: number;
          percentage: number;
        };
      }>(`/api/game/game-type/group-sort/${game!.id}/check-answer`, {
        answers,
      });

      console.log("Backend response:", checkAnswerResponse.data);

      const { correct_count, total_count, score, percentage } =
        checkAnswerResponse.data.data;

      scoreToSubmit = score; // TAMBAH: Simpan score di variable

      setResult({
        correctItems: correct_count,
        totalItems: total_count,
        accuracy: percentage,
        timeTaken,
        score,
      });

      toast.success(`Score: ${score} points (${percentage}% correct)`);
    } catch (err: unknown) {
      console.error("Failed to check answers:", err);
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to submit answers",
      );

      // Fallback to client-side calculation if backend fails
      let correct = 0;
      let placedCount = 0;
      Object.keys(placedItems).forEach((categoryId) => {
        placedItems[categoryId].forEach((item) => {
          placedCount++;
          if (item.correctCategoryId === categoryId) {
            correct++;
          }
        });
      });

      console.log(
        "Fallback - Correct:",
        correct,
        "Total:",
        totalItemsCount,
        "Placed:",
        placedCount,
      );

      const accuracy =
        totalItemsCount > 0 ? Math.round((correct / totalItemsCount) * 100) : 0;
      const fallbackScore = correct * (game?.game_data?.scorePerItem || 10);

      scoreToSubmit = fallbackScore; // TAMBAH: Simpan fallback score

      setResult({
        correctItems: correct,
        totalItems: totalItemsCount,
        accuracy,
        timeTaken,
        score: fallbackScore,
      });
    }

    // Update play count
    try {
      await api.post("/api/game/play-count", {
        game_id: id,
      });
    } catch (err) {
      console.error("Failed to update play count:", err);
    }

    // Fetch highest score and leaderboard
    try {
      setLoadingScores(true);

      // GANTI: Gunakan scoreToSubmit bukan result?.score
      console.log("Final score to submit:", scoreToSubmit);

      // Submit score ke database (use game.id from fetched data to ensure DB ID matches)
      const submitScoreResponse = await ScoreAPI.submitScore({
        game_id: game!.id,
        score: scoreToSubmit,
      });
      console.log("Score submitted successfully:", submitScoreResponse);

      // Fetch highest score SETELAH submit
      const highestScoreData = await ScoreAPI.getHighestScore(game!.id);
      console.log("Highest score response:", highestScoreData);

      if (
        highestScoreData &&
        typeof highestScoreData === "object" &&
        "score" in highestScoreData
      ) {
        const scoreValue = (highestScoreData as { score: number }).score;
        if (typeof scoreValue === "number") {
          setHighestScore(scoreValue);
          console.log("Highest score set to:", scoreValue);
        }
      }

      // Fetch leaderboard
      const leaderboardData = await ScoreAPI.getLeaderboard(game!.id, 5);
      console.log("Leaderboard data:", leaderboardData);

      if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
        setLeaderboard(leaderboardData);
        console.log("Leaderboard set with", leaderboardData.length, "entries");
      }
    } catch (err: unknown) {
      console.error("Failed to fetch scores:", err);
      if (err instanceof Error) {
        console.error("Error message:", err.message);
      }
    } finally {
      setLoadingScores(false);
    }
  };

  // Bagian akhir GroupSort function - COPY PASTE SELURUHNYA untuk mengganti bagian terakhir
  // Mulai dari setelah handleSubmit function sampai akhir file

  const handleTimeUpClose = async () => {
    await playButtonSound();
    setShowTimeUpPopup(false);
    await handleSubmit();
  };

  const handleExit = async () => {
    try {
      await api.post("/api/game/play-count", {
        game_id: id,
      });
    } catch (err) {
      console.error("Failed to update play count:", err);
    }
    navigate("/");
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
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (showIntro) {
    return <IntroScreen onStart={startGame} />;
  }

  if (showLevelSelection) {
    return <LevelSelection onSelectLevel={startLevel} />;
  }

  // Di GroupSort.tsx, ganti SELURUH bagian result screen dengan code ini
  // Mulai dari: if (gameFinished && result) { sampai akhir return

  if (gameFinished && result) {
    const { correctItems, totalItems, accuracy } = result;

    const message = "MISI SELESAI";
    const subMessage = "Analisis Neural Grid Selesai";
    let rating = "LUAR BIASA!";
    let ratingColor = "text-cyan-400";

    if (accuracy === 100) {
      rating = "SEMPURNA! ";
      ratingColor = "text-cyan-400";
    } else if (accuracy >= 80) {
      rating = "LUAR BIASA! ";
      ratingColor = "text-green-400";
    } else if (accuracy >= 50) {
      rating = "CUKUP BAIK ";
      ratingColor = "text-yellow-400";
    } else {
      rating = "PERLU LATIHAN ";
      ratingColor = "text-orange-400";
    }

    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
        {/* Cyberpunk Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-purple-950 via-black to-cyan-950" />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              animation: "gridFlow 15s linear infinite",
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(180deg, transparent 50%, rgba(0, 255, 255, 0.1) 50%)",
              backgroundSize: "100% 4px",
              animation: "scanlineMove 8s linear infinite",
            }}
          />
        </div>

        <div className="max-w-4xl w-full bg-linear-to-br from-purple-900/40 via-black/60 to-cyan-900/40 backdrop-blur-xl border-3 border-cyan-500/70 rounded-2xl p-8 space-y-6 relative z-10 shadow-2xl shadow-cyan-500/50">
          <div className="text-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
              <Typography
                variant="h1"
                className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500 font-mono text-5xl font-bold tracking-widest relative"
              >
                {message}
              </Typography>
            </div>
            <Typography
              variant="p"
              className="text-cyan-300 font-mono text-sm tracking-wider"
            >
              ▶ {subMessage}
            </Typography>
            <div className="h-1 w-32 bg-linear-to-r from-cyan-500 to-purple-500 mx-auto rounded-full opacity-80" />
          </div>

          {/* Statistik Performa */}
          <div className="bg-linear-to-br from-gray-900/60 to-black/40 border-2 border-cyan-500/50 rounded-xl p-6 shadow-lg shadow-cyan-500/20">
            <Typography
              variant="h3"
              className="text-center text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500 mb-4 font-bold tracking-wider"
            >
              ◆ STATISTIK PERFORMA ◆
            </Typography>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Benar */}
              <div className="bg-linear-to-br from-green-500/20 to-green-600/10 border-2 border-green-400 rounded-lg p-4 flex items-center gap-4 shadow-lg shadow-green-500/30">
                <div className="bg-linear-to-br from-green-400 to-green-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <div className="text-white text-3xl font-bold">✓</div>
                </div>
                <div className="flex-1">
                  <Typography
                    variant="h2"
                    className="text-green-300 text-3xl font-bold"
                  >
                    {correctItems}
                  </Typography>
                  <Typography
                    variant="small"
                    className="text-green-400 block font-mono font-bold"
                  >
                    BENAR
                  </Typography>
                </div>
              </div>

              {/* Salah */}
              <div className="bg-linear-to-br from-red-500/20 to-red-600/10 border-2 border-red-400 rounded-lg p-4 flex items-center gap-4 shadow-lg shadow-red-500/30">
                <div className="bg-linear-to-br from-red-400 to-red-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-red-500/50">
                  <div className="text-white text-3xl font-bold">✗</div>
                </div>
                <div className="flex-1">
                  <Typography
                    variant="h2"
                    className="text-red-300 text-3xl font-bold"
                  >
                    {totalItems > 0 ? totalItems - correctItems : 0}
                  </Typography>
                  <Typography
                    variant="small"
                    className="text-red-400 block font-mono font-bold"
                  >
                    SALAH
                  </Typography>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <Typography
                  variant="small"
                  className="text-cyan-400 font-mono font-bold"
                >
                  AKURASI
                </Typography>
                <Typography
                  variant="small"
                  className="text-cyan-300 font-mono font-bold text-lg"
                >
                  {accuracy}%
                </Typography>
              </div>
              <div className="h-4 bg-black/50 border border-cyan-500/50 rounded-full overflow-hidden shadow-lg shadow-cyan-500/20">
                <div
                  className="h-full bg-linear-to-r from-cyan-400 to-cyan-600 transition-all duration-700 shadow-lg shadow-cyan-500/50"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>

            {/* Performa Score */}
            <div className="bg-linear-to-r from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-400 rounded-lg p-5 flex items-center justify-between shadow-lg shadow-yellow-500/30">
              <div className="flex items-center gap-4">
                <div className="text-yellow-400 text-4xl drop-shadow-lg">★</div>
                <div>
                  <Typography
                    variant="small"
                    className="text-yellow-300 block font-mono font-bold"
                  >
                    SKOR PERFORMA
                  </Typography>
                  <Typography
                    variant="h3"
                    className="text-yellow-300 font-mono font-bold text-3xl"
                  >
                    {result.score}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid with Best Score Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-linear-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-400 rounded-lg p-4 text-center shadow-lg shadow-blue-500/20">
              <Typography
                variant="small"
                className="text-blue-300 block mb-1 font-mono font-bold"
              >
                TOTAL ITEM
              </Typography>
              <Typography
                variant="h3"
                className="text-blue-300 text-2xl font-bold font-mono"
              >
                {totalItems || 0}
              </Typography>
            </div>
            <div className="bg-linear-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-400 rounded-lg p-4 text-center shadow-lg shadow-purple-500/20">
              <Typography
                variant="small"
                className="text-purple-300 block mb-1 font-mono font-bold"
              >
                SKOR SAAT INI
              </Typography>
              <Typography
                variant="h3"
                className="text-purple-300 text-2xl font-bold font-mono"
              >
                {result.score || 0}
              </Typography>
            </div>
            <div className="bg-linear-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-400 rounded-lg p-4 text-center shadow-lg shadow-yellow-500/20">
              <Typography
                variant="small"
                className="text-yellow-300 block mb-1 font-mono font-bold"
              >
                BEST SCORE
              </Typography>
              <Typography
                variant="h3"
                className="text-yellow-300 text-2xl font-bold font-mono"
              >
                {loadingScores
                  ? "..."
                  : highestScore !== null &&
                      highestScore !== undefined &&
                      highestScore > 0
                    ? highestScore
                    : "No Record"}
              </Typography>
            </div>
          </div>

          {/* New Record Alert */}
          {!loadingScores &&
            highestScore !== null &&
            highestScore !== undefined &&
            (result.score > highestScore ||
              (highestScore === 0 && result.score > 0)) && (
              <div className="bg-linear-to-r from-gold-500/30 to-yellow-500/30 border-2 border-yellow-300 rounded-xl p-6 text-center shadow-2xl shadow-yellow-500/50 animate-pulse">
                <Typography
                  variant="h2"
                  className="text-yellow-300 font-mono text-3xl font-bold tracking-wider mb-2"
                >
                  🎉 NEW BEST SCORE! 🎉
                </Typography>
                <Typography
                  variant="p"
                  className="text-yellow-200 font-mono text-lg"
                >
                  Congratulations! You've set a new personal record!
                </Typography>
              </div>
            )}

          {/* First Time Player Alert */}
          {!loadingScores &&
            (highestScore === null || highestScore === undefined) && (
              <div className="bg-linear-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-300 rounded-xl p-6 text-center shadow-2xl shadow-blue-500/50">
                <Typography
                  variant="h2"
                  className="text-blue-300 font-mono text-2xl font-bold tracking-wider mb-2"
                >
                  🌟 FIRST GAME COMPLETED! 🌟
                </Typography>
                <Typography
                  variant="p"
                  className="text-blue-200 font-mono text-lg"
                >
                  Great job! Your first score: {result.score} points
                </Typography>
              </div>
            )}

          {/* Rating */}
          <div className="text-center p-6 bg-linear-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-2 border-purple-400 rounded-xl relative overflow-hidden shadow-2xl shadow-purple-500/40">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            <Typography
              variant="h2"
              className={`${ratingColor} font-mono text-3xl font-bold tracking-wider relative`}
            >
              {rating}
            </Typography>
          </div>

          {/* Loading Scores */}
          {loadingScores && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-3"></div>
              <Typography variant="small" className="text-cyan-400 block">
                Fetching your scores...
              </Typography>
            </div>
          )}

          {/* Hall of Fame - Leaderboard */}
          {!loadingScores && leaderboard && leaderboard.length > 0 && (
            <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 rounded-xl p-6 space-y-4 shadow-2xl shadow-purple-500/30">
              <Typography
                variant="h3"
                className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 font-mono text-center text-3xl tracking-widest font-bold"
              >
                👑 HALL OF FAME 👑
              </Typography>
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-linear-to-r from-gray-900/70 to-gray-800/70 p-4 rounded-lg border-2 border-purple-500/50 hover:border-purple-400 transition-all hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-yellow-300 font-mono text-2xl font-bold w-10 text-center">
                        {idx === 0
                          ? "🥇"
                          : idx === 1
                            ? "🥈"
                            : idx === 2
                              ? "🥉"
                              : `#${idx + 1}`}
                      </span>
                      <div>
                        <Typography
                          variant="p"
                          className="text-cyan-300 font-mono font-bold text-lg"
                        >
                          {entry.username || "Unknown Player"}
                        </Typography>
                        <Typography
                          variant="small"
                          className="text-cyan-400/60 font-mono"
                        >
                          Plays: {entry.total_plays}
                        </Typography>
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography
                        variant="p"
                        className="text-yellow-300 font-mono font-bold text-2xl"
                      >
                        {entry.highest_score || 0}
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-yellow-400/70 font-mono font-bold"
                      >
                        PTS
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Leaderboard Message */}
          {!loadingScores && (!leaderboard || leaderboard.length === 0) && (
            <div className="bg-linear-to-r from-gray-900/50 to-gray-800/50 border-2 border-gray-700 rounded-lg p-4 text-center">
              <Typography variant="p" className="text-gray-400 font-mono">
                Leaderboard kosong - jadilah yang pertama!
              </Typography>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-linear-to-r from-black/80 to-black/80 backdrop-blur-md border-t-2 border-cyan-500/50 -m-8 p-8 pt-6 rounded-b-2xl">
            <Button
              variant="outline"
              className="flex-1 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 font-mono font-bold uppercase hover:shadow-lg hover:shadow-cyan-500/40"
              onClick={async () => {
                await playButtonSound();
                window.location.reload();
              }}
            >
              <Play className="mr-2" size={18} />
              MAIN LAGI
            </Button>
            <Button
              className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-mono font-bold uppercase transition-all duration-300 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60"
              onClick={async () => {
                await playButtonSound();
                handleExit();
              }}
            >
              <ArrowLeft className="mr-2" size={18} />
              KELUAR
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyberpunk Retro Background - Animated Grid & Scanlines */}
      <div className="fixed inset-0 z-0">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-950 via-black to-cyan-950" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "gridFlow 15s linear infinite",
          }}
        />

        {/* Horizontal scanlines effect */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 50%, rgba(0, 255, 255, 0.1) 50%)",
            backgroundSize: "100% 4px",
            animation: "scanlineMove 8s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: [
                  "rgb(0, 255, 255)",
                  "rgb(255, 0, 255)",
                  "rgb(255, 0, 100)",
                ][Math.floor(Math.random() * 3)],
                boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
                animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-purple-500/50 shadow-lg shadow-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={async () => {
              await playButtonSound();
              handleExit();
            }}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 font-mono tracking-wide px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2" />
            Exit
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-cyan-400 font-mono px-3 py-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <Timer size={20} />
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>

            {hints.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await playButtonSound();
                  // Show hints in toast for now
                  toast.success(`Hints: ${hints.join(", ")}`, {
                    duration: 4000,
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
                }}
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 transition-all"
              >
                <Lightbulb size={16} className="mr-1" />
                Hint ({hints.length})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await playButtonSound();
                setIsPaused(!isPaused);
              }}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20 transition-all"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with proper padding for fixed navbar */}
      <div className="relative z-10 pt-24">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          <div className="text-center space-y-3">
            <Typography
              variant="h2"
              className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-500 font-mono text-4xl font-bold tracking-wider"
            >
              {game.name}
            </Typography>
            <div className="h-1 w-32 bg-linear-to-r from-cyan-500 to-purple-500 mx-auto rounded-full opacity-75" />
            <Typography variant="p" className="text-cyan-300 font-mono text-sm">
              {game.description}
            </Typography>
          </div>

          <div
            className="bg-linear-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg p-6 hover:border-cyan-400/80 transition-all shadow-lg shadow-cyan-500/20"
            onDragOver={handleDragOver}
            onDrop={handleDropToPool}
          >
            <Typography
              variant="h4"
              className="text-cyan-400 mb-4 font-mono font-bold text-lg tracking-wide flex items-center gap-2"
            >
              <span className="text-cyan-500">▶</span>
              Available Items ({allItems.length})
            </Typography>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3 cursor-move hover:scale-105 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-500/40 transition-all text-center group"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.text}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                  )}
                  <Typography
                    variant="small"
                    className="text-yellow-300 text-xs"
                  >
                    {item.text}
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {game.game_data.categories.map((category) => (
              <div
                key={category.id}
                className="bg-linear-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border-2 border-purple-500/50 rounded-lg p-6 min-h-[300px] hover:border-purple-400/80 transition-all shadow-lg shadow-purple-500/20"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(category.id)}
              >
                <Typography
                  variant="h4"
                  className="text-purple-300 mb-4 font-mono font-bold text-lg tracking-wide flex items-center gap-2"
                >
                  <span className="text-pink-400">◆</span>
                  {category.name}
                </Typography>
                <div className="grid grid-cols-2 gap-3">
                  {placedItems[category.id]?.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      className="bg-green-500/20 border-2 border-green-400 rounded-lg p-3 cursor-move hover:scale-105 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/40 transition-all text-center group"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.text}
                          className="w-full h-20 object-cover rounded mb-2 group-hover:brightness-110 transition-all"
                        />
                      )}
                      <Typography
                        variant="small"
                        className="text-green-300 text-xs"
                      >
                        {item.text}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Section */}
          <div className="mt-8 mb-6 px-4">
            <div className="relative bg-linear-to-r from-gray-900/60 via-purple-900/40 to-gray-900/60 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20">
              {/* Decorative border elements */}
              <div className="absolute top-0 left-4 w-16 h-0.5 bg-linear-to-r from-cyan-400 to-purple-500"></div>
              <div className="absolute bottom-0 right-4 w-16 h-0.5 bg-linear-to-r from-purple-500 to-cyan-400"></div>

              <div className="text-center space-y-4">
                <Button
                  onClick={async () => {
                    await playButtonSound();
                    handleSubmit();
                  }}
                  disabled={allItems.length > 0}
                  className="bg-linear-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:via-purple-500 hover:to-pink-400 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-600 text-white px-12 py-6 text-xl font-bold font-mono tracking-wider shadow-2xl shadow-cyan-500/60 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-cyan-500/90 disabled:scale-100 disabled:shadow-gray-500/30 border-2 border-cyan-300/50 disabled:border-gray-500/30 rounded-lg uppercase"
                >
                  ▶ SUBMIT ANSWERS ◀
                </Button>

                {allItems.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <Typography
                        variant="small"
                        className="text-orange-300 font-mono font-bold text-sm"
                      >
                        ⚠ LETAKKAN SEMUA ITEM DULU!
                      </Typography>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                    <Typography
                      variant="small"
                      className="text-orange-400/80 font-mono text-xs mt-1"
                    >
                      Tempatkan semua item ke kategori yang sesuai sebelum
                      submit
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time's Up Popup */}
      {showTimeUpPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-linear-to-br from-red-900/90 via-gray-900/90 to-orange-900/90 border-4 border-red-500 rounded-xl p-8 text-center space-y-6 shadow-2xl shadow-red-500/50 max-w-md mx-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-linear-to-br from-red-400/10 via-orange-400/10 to-red-400/10 rounded-xl animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-500 via-orange-400 to-red-500 animate-pulse" />

            <div className="relative z-10 space-y-6">
              {/* Time's Up Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full animate-pulse" />
                  <Timer
                    size={80}
                    className="relative text-red-400 animate-bounce"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Typography
                  variant="h2"
                  className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400 font-mono text-4xl tracking-widest font-bold"
                >
                  TIME'S UP!
                </Typography>
                <div className="h-1 w-32 bg-linear-to-r from-red-500 to-orange-500 mx-auto rounded-full" />
              </div>

              {/* Message */}
              <div className="bg-black/40 border border-red-500/30 rounded-lg p-4 space-y-2">
                <Typography
                  variant="small"
                  className="text-red-300 font-mono text-sm"
                >
                  ⏰ Waktu telah habis!
                </Typography>
                <Typography
                  variant="small"
                  className="text-orange-300 font-mono text-xs"
                >
                  Lihat hasil permainanmu sekarang
                </Typography>
              </div>

              {/* View Score Button */}
              <Button
                onClick={handleTimeUpClose}
                className="w-full bg-linear-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/50 font-mono tracking-wider text-lg border-2 border-red-400/50"
              >
                📊 VIEW SCORE
              </Button>
            </div>
          </div>
        </div>
      )}

      {isPaused && !gameFinished && !showTimeUpPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-linear-to-br from-purple-900 via-gray-900 to-blue-900 border-4 border-cyan-500 rounded-xl p-8 text-center space-y-6 shadow-2xl shadow-purple-500/50 max-w-md">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                <Pause size={80} className="relative text-cyan-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Typography
                variant="h2"
                className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600 font-mono text-4xl tracking-widest"
              >
                PAUSED
              </Typography>
              <div className="h-1 w-24 bg-linear-to-r from-cyan-500 to-purple-500 mx-auto rounded-full" />
            </div>

            <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="small" className="text-gray-400 font-mono">
                  Time:
                </Typography>
                <Typography
                  variant="small"
                  className="text-cyan-300 font-mono font-bold"
                >
                  {formatTime(timeLeft)}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="small" className="text-gray-400 font-mono">
                  Items:
                </Typography>
                <Typography
                  variant="small"
                  className="text-cyan-300 font-mono font-bold"
                >
                  {Object.values(placedItems).reduce(
                    (sum: number, items: Item[]) => sum + items.length,
                    0,
                  )}
                  /
                  {allItems.length +
                    Object.values(placedItems).reduce(
                      (sum: number, items: Item[]) => sum + items.length,
                      0,
                    )}
                </Typography>
              </div>
            </div>

            <Button
              onClick={async () => {
                await playButtonSound();
                setIsPaused(false);
              }}
              className="w-full bg-linear-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/50"
            >
              <Play className="mr-2 inline" size={20} />
              RESUME GAME
            </Button>
          </div>
        </div>
      )}

      {/* CSS Animations for Cyberpunk Retro */}
      <style>{`
        @keyframes gridFlow {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(15px); }
        }
      `}</style>
    </div>
  );
}

export default GroupSort;
