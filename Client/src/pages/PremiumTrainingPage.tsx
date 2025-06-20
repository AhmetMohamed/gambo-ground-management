import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getAllCoaches, savePremiumTeam } from "@/services/apiService";

// Define pricing tiers
const pricingTiers = [
  {
    id: "basic",
    name: "Basic Training",
    price: 100,
    currency: "USD",
    description: "1 session per week for 4 weeks",
    features: [
      "Professional coaching",
      "Basic skill development",
      "Group training sessions",
      "Performance tracking",
    ],
    sessionsPerWeek: 1,
  },
  {
    id: "premium",
    name: "Premium Training",
    price: 200,
    currency: "USD",
    description: "2 sessions per week for 4 weeks",
    features: [
      "Professional coaching",
      "Advanced skill development",
      "Smaller group size",
      "Performance tracking",
      "Video analysis",
    ],
    sessionsPerWeek: 2,
  },
  {
    id: "elite",
    name: "Elite Training",
    price: 300,
    currency: "USD",
    description: "3 sessions per week for 4 weeks",
    features: [
      "Professional coaching",
      "Elite skill development",
      "Personalized training plan",
      "One-on-one sessions",
      "Performance tracking",
      "Video analysis",
      "Nutrition guidance",
    ],
    sessionsPerWeek: 3,
  },
];

// Define training days
const trainingDays = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const PremiumTrainingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [players, setPlayers] = useState([{ name: "", age: "" }]);
  const [coaches, setCoaches] = useState<any[]>([]);

  // Function to generate avatar URL based on coach name
  const generateCoachAvatar = (name: string) => {
    // Convert name to a consistent hash for the same avatar each time
    const nameHash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Use the hash to select avatar style
    const style = [
      "adventurer",
      "avataaars",
      "bottts",
      "jdenticon",
      "identicon",
    ][nameHash % 5];

    // Generate a seed based on the name
    const seed = encodeURIComponent(name.replace(/\s+/g, ""));

    return `https://avatars.dicebear.com/api/${style}/${seed}.svg`;
  };

  useEffect(() => {
    // Fetch coaches from API
    getAllCoaches()
      .then((coachesData) => {
        if (coachesData && coachesData.length > 0) {
          // Add avatar URLs to each coach
          const coachesWithAvatars = coachesData.map((coach) => ({
            ...coach,
            avatarUrl: generateCoachAvatar(coach.name),
          }));
          setCoaches(coachesWithAvatars);
        } else {
          // Fallback to default coaches if API fails
          const defaultCoaches = [
            {
              id: "coach1",
              name: "Coach John",
              specialization: "Technical Skills",
            },
            {
              id: "coach2",
              name: "Coach Sarah",
              specialization: "Tactical Development",
            },
            {
              id: "coach3",
              name: "Coach Mike",
              specialization: "Physical Conditioning",
            },
          ];

          // Add avatar URLs to default coaches
          const defaultCoachesWithAvatars = defaultCoaches.map((coach) => ({
            ...coach,
            avatarUrl: generateCoachAvatar(coach.name),
          }));

          setCoaches(defaultCoachesWithAvatars);
        }
      })
      .catch((error) => {
        console.error("Error fetching coaches:", error);
        // Fallback to default coaches if API fails
        const defaultCoaches = [
          {
            id: "coach1",
            name: "Coach John",
            specialization: "Technical Skills",
          },
          {
            id: "coach2",
            name: "Coach Sarah",
            specialization: "Tactical Development",
          },
          {
            id: "coach3",
            name: "Coach Mike",
            specialization: "Physical Conditioning",
          },
        ];

        // Add avatar URLs to default coaches
        const defaultCoachesWithAvatars = defaultCoaches.map((coach) => ({
          ...coach,
          avatarUrl: generateCoachAvatar(coach.name),
        }));

        setCoaches(defaultCoachesWithAvatars);
      });
  }, []);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  const handleCoachSelect = (coachId: string) => {
    console.log("Coach selected:", coachId);
    // Store the coach ID and log the selected coach object for debugging
    setSelectedCoach(coachId);
    const selectedCoachObj = coaches.find(
      (c) => c.id === coachId || c._id === coachId
    );
    console.log("Selected coach object:", selectedCoachObj);
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((current) => {
      // Get the selected tier to determine how many days can be selected
      const tier = pricingTiers.find((t) => t.id === selectedTier);
      const maxDays = tier ? tier.sessionsPerWeek : 1;

      // If the day is already selected, remove it
      if (current.includes(day)) {
        return current.filter((d) => d !== day);
      }

      // If we've already selected the maximum number of days, remove the first one
      if (current.length >= maxDays) {
        return [...current.slice(1), day];
      }

      // Otherwise, add the day
      return [...current, day];
    });
  };

  const addPlayer = () => {
    setPlayers([...players, { name: "", age: "" }]);
  };

  const removePlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const updatePlayer = (
    index: number,
    field: "name" | "age",
    value: string
  ) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const nextStep = () => {
    if (step === 1 && !selectedTier) {
      toast.error("Please select a training package");
      return;
    }

    if (step === 2) {
      console.log("Checking coach selection:", selectedCoach);
      if (!selectedCoach) {
        toast.error("Please select a coach");
        return;
      }
    }

    if (step === 3) {
      // Check if we have selected enough days based on the tier
      const tier = pricingTiers.find((t) => t.id === selectedTier);
      const requiredDays = tier ? tier.sessionsPerWeek : 1;

      if (selectedDays.length < requiredDays) {
        toast.error(
          `Please select ${requiredDays} training day${
            requiredDays > 1 ? "s" : ""
          }`
        );
        return;
      }
    }

    if (step === 4) {
      // Validate player information
      const isValid = players.every(
        (player) => player.name.trim() && player.age.trim()
      );
      if (!isValid) {
        toast.error("Please fill in all player details");
        return;
      }
    }

    // Add console log to debug
    console.log("Current step:", step, "Selected coach:", selectedCoach);

    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!selectedTier || !selectedCoach || selectedDays.length === 0) {
      toast.error("Please complete all selections");
      return;
    }

    const selectedTierDetails = pricingTiers.find((t) => t.id === selectedTier);
    const selectedCoachDetails = coaches.find(
      (c) => c.id === selectedCoach || c._id === selectedCoach
    );

    console.log("Selected coach ID:", selectedCoach);
    console.log("Available coaches:", coaches);
    console.log("Selected coach details:", selectedCoachDetails);

    if (!selectedTierDetails || !selectedCoachDetails) {
      toast.error("Invalid selection");
      return;
    }

    // Create a date 4 weeks from now for the end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 28); // 4 weeks

    // Ensure we have the coach name before creating the team data
    if (!selectedCoachDetails || !selectedCoachDetails.name) {
      console.error("Coach details missing:", selectedCoach, coaches);
      toast.error(
        "Coach information is missing. Please go back and select a coach again."
      );
      return;
    }

    const teamData = {
      id: `team-${Date.now()}`,
      package: selectedTierDetails.name,
      coach: selectedCoachDetails.name,
      coachImage:
        selectedCoachDetails.avatarUrl ||
        selectedCoachDetails.image ||
        `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
          selectedCoachDetails.name
        )}.svg`,
      trainingDays: selectedDays.map(
        (dayId) => trainingDays.find((d) => d.id === dayId)?.label || ""
      ),
      players: players,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      status: "active",
      userId: JSON.parse(localStorage.getItem("user") || "{}").id, // Add the userId from localStorage
    };

    console.log("Submitting team data:", teamData);

    savePremiumTeam(teamData)
      .then(() => {
        toast.success("Premium training program registered successfully!");
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error saving team:", error);
        toast.error("Failed to register training program. Please try again.");
      });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Premium Training Programs
      </h1>

      {/* Step indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            1
          </div>
          <div
            className={`w-16 h-1 ${step >= 2 ? "bg-gambo" : "bg-gray-200"}`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            2
          </div>
          <div
            className={`w-16 h-1 ${step >= 3 ? "bg-gambo" : "bg-gray-200"}`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            3
          </div>
          <div
            className={`w-16 h-1 ${step >= 4 ? "bg-gambo" : "bg-gray-200"}`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 4 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            4
          </div>
          <div
            className={`w-16 h-1 ${step >= 5 ? "bg-gambo" : "bg-gray-200"}`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 5 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            5
          </div>
        </div>
      </div>

      {/* Step 1: Select Package */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Select a Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTier === tier.id ? "ring-2 ring-gambo" : ""
                }`}
                onClick={() => handleTierSelect(tier.id)}
              >
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gambo mb-4">
                    ${tier.price} {tier.currency}
                  </p>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-gambo mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={nextStep}>Next: Select Coach</Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Coach */}
      {step === 2 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Select a Coach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <Card
                key={coach._id || coach.id} // Handle both MongoDB _id and local id
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCoach === coach._id || selectedCoach === coach.id
                    ? "ring-2 ring-gambo"
                    : ""
                }`}
                onClick={() => {
                  const coachId = coach._id || coach.id;
                  console.log(
                    "Clicked on coach with ID:",
                    coachId,
                    "and name:",
                    coach.name
                  );
                  handleCoachSelect(coachId);
                }}
              >
                <CardContent className="pt-4">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gambo">
                      <img
                        src={coach.image}
                        alt={`Coach ${coach.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-center">
                      {coach.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2 text-center">
                      {coach.specialization}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button
              onClick={() => {
                if (selectedCoach) {
                  console.log("Next step with selected coach:", selectedCoach);
                  nextStep();
                } else {
                  toast.error("Please select a coach before proceeding");
                }
              }}
            >
              Next: Select Training Days
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Training Days */}
      {step === 3 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Select Training Days</h2>
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Training Days</CardTitle>
              <CardDescription>
                {selectedTier &&
                  `Select ${
                    pricingTiers.find((t) => t.id === selectedTier)
                      ?.sessionsPerWeek
                  } day(s) for your weekly training sessions`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trainingDays.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => handleDayToggle(day.id)}
                  >
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={selectedDays.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <label
                      htmlFor={`day-${day.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep}>Next: Player Information</Button>
          </div>
        </div>
      )}

      {/* Step 4: Player Information */}
      {step === 4 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Player Information</h2>
          <Card>
            <CardHeader>
              <CardTitle>Add Players</CardTitle>
              <CardDescription>
                Enter details for all players who will participate in the
                training program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {players.map((player, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Player {index + 1}</h3>
                      {players.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`player-name-${index}`}>Name</Label>
                        <Input
                          id={`player-name-${index}`}
                          value={player.name}
                          onChange={(e) =>
                            updatePlayer(index, "name", e.target.value)
                          }
                          placeholder="Player name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`player-age-${index}`}>Age</Label>
                        <Input
                          id={`player-age-${index}`}
                          value={player.age}
                          onChange={(e) =>
                            updatePlayer(index, "age", e.target.value)
                          }
                          placeholder="Player age"
                          type="number"
                          min="5"
                          max="50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addPlayer}
                >
                  Add Another Player
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep}>Next: Review & Confirm</Button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Confirm */}
      {step === 5 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Review & Confirm</h2>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Package:</span>
                  <span className="font-medium">
                    {pricingTiers.find((t) => t.id === selectedTier)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coach:</span>
                  <span className="font-medium">
                    {coaches.find(
                      (c) => c.id === selectedCoach || c._id === selectedCoach
                    )?.name || "No coach selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Training Days:</span>
                  <span className="font-medium text-right">
                    {selectedDays
                      .map(
                        (dayId) =>
                          trainingDays.find((d) => d.id === dayId)?.label
                      )
                      .join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-medium text-gambo">
                    ${pricingTiers.find((t) => t.id === selectedTier)?.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Players:</span>
                  <span className="font-medium">{players.length}</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Player Details:</h4>
                  <ul className="space-y-2">
                    {players.map((player, index) => (
                      <li key={index}>
                        {player.name} (Age: {player.age})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                By confirming, you agree to our terms and conditions for premium
                training programs.
              </p>
            </CardFooter>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gambo hover:bg-gambo/90"
            >
              Confirm Registration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumTrainingPage;
