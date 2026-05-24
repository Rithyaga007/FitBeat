import { createContext, useContext, useState, ReactNode } from "react";

export interface ProductRec {
  name: string;
  tag: string;
  color: string;
}

export interface UserProfile {
  // Authentication & User Info
  user_id?: number;
  username?: string;
  password?: string;
  

  // Basic Profile
  name: string;
  age: string;
  gender: string;
  city: string;
  occupation: string;

  // Body Metrics
  height: string;
  weight: string;
  restingHR: string;
  bmi: string;
  bmiStatus: string;

  // Activity
  fitnessLevel: string;
  dailySteps: string;
  weeklyActiveMinutes: string;
  workoutDays: string;
  preferredWorkout: string;
  workoutDuration: string;
  activityPattern: string;

  // Lifestyle
  wakeUpTime: string;
  sleepTime: string;
  sleepQuality: string;
  waterIntake: string;
  dietType: string;
  sedentaryHours: string;
  screenTime: string;
  smokingStatus: string;
  alcoholConsumption: string;

  // Wellness
  stressLevel: number;
  energyLevel: number;
  meditationMinutes: string;
  smartwatchUser: boolean;
  mentalWellness: number;
  productivityScore: number;
  weekendActivity: number;

  // Goals & Scores
  healthGoal: string;
  sleepDuration: number;
  calorieBurn: number;
  hydrationRec: number;
  healthScore: number;
  recoveryScore: number;
  lifestyleScore: number;

  // Recommendations
  recommendations: ProductRec[];
}

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  setProfile: () => {},
  clearProfile: () => {},
});

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfileState] =
    useState<UserProfile | null>(() => {
      try {
        const saved =
          localStorage.getItem("fitbeat_profile");

        return saved
          ? JSON.parse(saved)
          : null;
      } catch {
        return null;
      }
    });

  const setProfile = (p: UserProfile) => {
    localStorage.setItem(
      "fitbeat_profile",
      JSON.stringify(p)
    );

    setProfileState(p);
  };

  const clearProfile = () => {
    localStorage.removeItem(
      "fitbeat_profile"
    );

    setProfileState(null);
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        clearProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}