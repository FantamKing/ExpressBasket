/**
 * Face Model Preloader
 * 
 * This utility preloads face-api.js models in the background when the admin
 * login page loads. This eliminates the "Loading AI models..." delay when
 * users click on Face Recognition login.
 * 
 * Models are cached by the browser after first download (~6.8MB total).
 * Once loaded in memory, they persist until the browser tab is closed.
 */

import * as faceapi from 'face-api.js';

// Track loading state globally
let modelsLoadingPromise = null;
let modelsLoaded = false;

/**
 * Check if models are already loaded
 */
export const areModelsLoaded = () => {
    return modelsLoaded || (
        faceapi.nets.tinyFaceDetector.isLoaded &&
        faceapi.nets.faceLandmark68Net.isLoaded &&
        faceapi.nets.faceRecognitionNet.isLoaded
    );
};

/**
 * Preload face recognition models in the background
 * This should be called when the admin login page loads
 * 
 * @returns {Promise<boolean>} true if models loaded successfully
 */
export const preloadFaceModels = async () => {
    // If already loaded, return immediately
    if (areModelsLoaded()) {
        console.log('✅ Face models already loaded in memory');
        modelsLoaded = true;
        return true;
    }

    // If currently loading, wait for the existing promise
    if (modelsLoadingPromise) {
        console.log('⏳ Face models already loading, waiting...');
        return modelsLoadingPromise;
    }

    // Start loading
    console.log('🔄 Preloading face recognition models in background...');

    modelsLoadingPromise = (async () => {
        try {
            const MODEL_URL = '/models';
            const startTime = Date.now();

            // Load all three models in parallel
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);

            const loadTime = Date.now() - startTime;
            console.log(`✅ Face models preloaded in ${loadTime}ms`);

            modelsLoaded = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to preload face models:', error);
            modelsLoadingPromise = null; // Allow retry on failure
            return false;
        }
    })();

    return modelsLoadingPromise;
};

/**
 * Get current loading status
 */
export const getModelStatus = () => ({
    loaded: areModelsLoaded(),
    loading: modelsLoadingPromise !== null && !modelsLoaded
});

export default { preloadFaceModels, areModelsLoaded, getModelStatus };
