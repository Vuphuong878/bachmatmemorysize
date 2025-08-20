import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Settings, ApiKeySource } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        
        // Migration from old format (customApiKey: string) to new format (customApiKeys: string[])
        if (typeof parsed.customApiKey === 'string' && !Array.isArray(parsed.customApiKeys)) {
          return {
            apiKeySource: parsed.apiKeySource || ApiKeySource.DEFAULT,
            customApiKeys: parsed.customApiKey ? [parsed.customApiKey] : [],
            currentApiKeyIndex: 0,
          };
        }

        // Basic validation for new format
        if (parsed.apiKeySource && Array.isArray(parsed.customApiKeys) && typeof parsed.currentApiKeyIndex === 'number') {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    // Default settings
    return {
      apiKeySource: ApiKeySource.DEFAULT,
      customApiKeys: [],
      currentApiKeyIndex: 0,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const setApiKeySource = (source: ApiKeySource) => {
    setSettings(prev => ({ ...prev, apiKeySource: source }));
  };

  const setCustomApiKeys = (keys: string[]) => {
    setSettings(prev => {
        // Ensure the current index is valid after keys are removed.
        const newIndex = Math.max(0, Math.min(prev.currentApiKeyIndex, keys.length - 1));
        return { ...prev, customApiKeys: keys, currentApiKeyIndex: newIndex };
    });
  };

  const rotateApiKey = useCallback(() => {
    setSettings(prev => {
      const validKeys = prev.customApiKeys.filter(k => k.trim() !== '');
      if (prev.apiKeySource !== ApiKeySource.CUSTOM || validKeys.length <= 1) {
        return prev; // No rotation possible or needed.
      }
      const nextIndex = (prev.currentApiKeyIndex + 1) % prev.customApiKeys.length;
      console.log(`Rotating API key from index ${prev.currentApiKeyIndex} to ${nextIndex}`);
      return { ...prev, currentApiKeyIndex: nextIndex };
    });
  }, []);
  
  const effectiveApiKey = useMemo(() => {
    if (settings.apiKeySource === ApiKeySource.CUSTOM) {
        const keys = settings.customApiKeys;
        const index = settings.currentApiKeyIndex;
        if (keys && keys.length > 0 && index >= 0 && index < keys.length) {
            return keys[index];
        }
        return ''; // No custom key available
    }
    return process.env.API_KEY;
  }, [settings]);
  
  const isKeyConfigured = useMemo(() => {
      if (settings.apiKeySource === ApiKeySource.DEFAULT) {
          return !!process.env.API_KEY;
      }
      return settings.customApiKeys.some(key => !!key.trim());
  }, [settings]);

  const geminiService = useMemo(() => {
    if (!effectiveApiKey) {
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: effectiveApiKey });
    } catch (error) {
      console.error("Failed to initialize Gemini AI Client:", error);
      return null;
    }
  }, [effectiveApiKey]);

  return {
    settings,
    setApiKeySource,
    setCustomApiKeys,
    rotateApiKey,
    effectiveApiKey,
    isKeyConfigured,
    geminiService,
  };
}