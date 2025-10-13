package com.myapp.services;

import de.kherud.llama.LlamaModel;
import de.kherud.llama.ModelParameters;
import de.kherud.llama.InferenceParameters;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;

import java.io.File;
import java.util.logging.Logger;

@ApplicationScoped
public class LLMService {

    private static final Logger LOGGER = Logger.getLogger(LLMService.class.getName());
    private static final String MODEL_PATH = "src/main/resources/llama-2-7b-chat.Q4_0.gguf";
    
    private LlamaModel model;

    @PostConstruct
    void init() {
        try {
            LOGGER.info("Initializing LLM model from: " + MODEL_PATH);
            
            File modelFile = new File(MODEL_PATH);
            if (!modelFile.exists()) {
                throw new IllegalStateException("Model file not found at: " + MODEL_PATH);
            }
            
            ModelParameters modelParams = new ModelParameters()
                    .setModelFilePath(modelFile.getAbsolutePath())
                    .setNGpuLayers(0)
                    .setNCtx(4096);
            
            model = new LlamaModel(modelParams);
            LOGGER.info("LLM model loaded successfully");
            
        } catch (Exception e) {
            LOGGER.severe("Failed to initialize LLM model: " + e.getMessage());
            throw new RuntimeException("Failed to initialize LLM model", e);
        }
    }

    public String generateText(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt cannot be null or empty");
        }
        
        if (model == null) {
            throw new IllegalStateException("LLM model is not initialized");
        }
        
        try {
            InferenceParameters inferParams = new InferenceParameters(prompt)
                    .setTemperature(0.7f)
                    .setNPredict(256);
            
            String response = model.complete(inferParams);
            return response.trim();
            
        } catch (Exception e) {
            LOGGER.severe("Error during text generation: " + e.getMessage());
            throw new RuntimeException("Failed to generate text", e);
        }
    }

    @PreDestroy
    void cleanup() {
        if (model != null) {
            try {
                model.close();
                LOGGER.info("LLM model closed successfully");
            } catch (Exception e) {
                LOGGER.warning("Error closing LLM model: " + e.getMessage());
            }
        }
    }
}
