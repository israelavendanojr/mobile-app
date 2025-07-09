import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import api from "../api/api";
import { useAuth } from "./AuthContext";
import * as SecureStore from 'expo-secure-store';

interface OnboardingPreferences {
  days_per_week: number;
  training_age: number;
  volume: 'low' | 'moderate' | 'high';
  priority_muscles: number[];
  equipment: number[];
  bodyweight_exercises: 'bodyweight' | 'weighted' | 'absent';
}

interface OnboardingState {
  preferences: Partial<OnboardingPreferences>;
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  error: string | null;
  generatedPlan: any | null;
  muscles: any[];
  equipmentOptions: any[];
}

interface OnboardingContextType {
  state: OnboardingState;
  updatePreferences: (preferences: Partial<OnboardingPreferences>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  generatePlan: () => Promise<boolean>;
  savePlan: () => Promise<boolean>;
  resetOnboarding: () => void;
  fetchMuscles: () => Promise<void>;
  fetchEquipment: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    preferences: {},
    currentStep: 0,
    totalSteps: 3,
    loading: false,
    error: null,
    generatedPlan: null,
    muscles: [],
    equipmentOptions: [],
  });

  // Fetch muscles from API
  const fetchMuscles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Debug: Check token before making request
      const token = await SecureStore.getItemAsync('access_token');
      console.log('Token exists:', !!token);
      
      const response = await api.get('/api/muscles/');
      setState(prev => ({ ...prev, muscles: response.data, loading: false }));
    } catch (error: any) {
      console.error('Error fetching muscles:', error.response?.data || error.message);
      setState(prev => ({ ...prev, error: 'Failed to fetch muscles', loading: false }));
    }
  }, []);

  // Fetch equipment from API
  const fetchEquipment = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await api.get('/api/equipment/');
      setState(prev => ({ ...prev, equipmentOptions: response.data, loading: false }));
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setState(prev => ({ ...prev, error: 'Failed to fetch equipment', loading: false }));
    }
  }, []);

  // Initialize by fetching reference data only when user is authenticated
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        
        if (authState.authenticated === true && authState.user && token) {
          
          // Only update state if component is still mounted
          if (isMounted) {
            await Promise.all([
              fetchMuscles(),
              fetchEquipment()
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        if (isMounted) {
          setState(prev => ({ ...prev, error: 'Failed to load data', loading: false }));
        }
      }
    };

    // Only load data if we haven't loaded it yet
    if (authState.authenticated === true && state.muscles.length === 0 && state.equipmentOptions.length === 0) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [authState.authenticated, authState.user, fetchMuscles, fetchEquipment]);
  
  const updatePreferences = useCallback((preferences: Partial<OnboardingPreferences>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
      error: null,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const newStep = Math.min(prev.currentStep + 1, prev.totalSteps - 1);
      return { ...prev, currentStep: newStep };
    });
    
    // Navigate after state update, using setTimeout to avoid render-time navigation
    setTimeout(() => {
      const newStep = Math.min(state.currentStep + 1, state.totalSteps - 1);
      switch (newStep) {
        case 0:
          router.push('/generator/welcome');
          break;
        case 1:
          router.push('/generator/preferences');
          break;
        case 2:
          router.push('/generator/preview');
          break;
        default:
          break;
      }
    }, 0);
  }, [state.currentStep, state.totalSteps]);

  const prevStep = useCallback(() => {
    setState(prev => {
      const newStep = Math.max(prev.currentStep - 1, 0);
      return { ...prev, currentStep: newStep };
    });
    
    // Navigate after state update, using setTimeout to avoid render-time navigation
    setTimeout(() => {
      const newStep = Math.max(state.currentStep - 1, 0);
      switch (newStep) {
        case 0:
          router.push('/generator/welcome');
          break;
        case 1:
          router.push('/generator/preferences');
          break;
        case 2:
          router.push('/generator/preview');
          break;
        default:
          break;
      }
    }, 0);
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
    
    // Navigate after state update, using setTimeout to avoid render-time navigation
    setTimeout(() => {
      switch (step) {
        case 0:
          router.push('/generator/welcome');
          break;
        case 1:
          router.push('/generator/preferences');
          break;
        case 2:
          router.push('/generator/preview');
          break;
        default:
          break;
      }
    }, 0);
  }, []);

  const generatePlan = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Validate preferences
      const { preferences } = state;
      if (!preferences.days_per_week || !preferences.training_age || 
          !preferences.volume || !preferences.bodyweight_exercises) {
        setState(prev => ({ ...prev, error: 'Please complete all required fields', loading: false }));
        return false;
      }

      const response = await api.post('/api/plan/preview/', {
        days_per_week: preferences.days_per_week,
        training_age: preferences.training_age,
        volume: preferences.volume,
        bodyweight_exercises: preferences.bodyweight_exercises,
        equipment: preferences.equipment || [],
      });

      setState(prev => ({ 
        ...prev, 
        generatedPlan: response.data, 
        loading: false,
        error: null 
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error generating plan:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.response?.data?.error || 'Failed to generate plan', 
        loading: false 
      }));
      return false;
    }
  }, [state.preferences]);

  const savePlan = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.generatedPlan) {
        setState(prev => ({ ...prev, error: 'No plan to save', loading: false }));
        return false;
      }

      await api.post('/api/plan/save/', state.generatedPlan);
      
      setState(prev => ({ ...prev, loading: false, error: null }));
      
      // Navigate to main app using setTimeout to avoid render-time navigation
      setTimeout(() => {
        router.replace('/');
      }, 0);
      
      return true;
    } catch (error: any) {
      console.error('Error saving plan:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.response?.data?.error || 'Failed to save plan', 
        loading: false 
      }));
      return false;
    }
  }, [state.generatedPlan]);

  const resetOnboarding = useCallback(() => {
    setState({
      preferences: {},
      currentStep: 0,
      totalSteps: 3,
      loading: false,
      error: null,
      generatedPlan: null,
      muscles: state.muscles,
      equipmentOptions: state.equipmentOptions,
    });
  }, [state.muscles, state.equipmentOptions]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        state,
        updatePreferences,
        nextStep,
        prevStep,
        goToStep,
        generatePlan,
        savePlan,
        resetOnboarding,
        fetchMuscles,
        fetchEquipment,
        setLoading,
        setError,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};